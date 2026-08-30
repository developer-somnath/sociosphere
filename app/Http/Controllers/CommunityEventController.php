<?php

namespace App\Http\Controllers;

use App\Http\Requests\CommunityEventRequest;
use App\Http\Requests\EventRsvpRequest;
use App\Models\Amenity;
use App\Models\CommunityEvent;
use App\Models\EventRsvp;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CommunityEventController extends Controller
{
    /**
     * Display a listing of community events with RSVPs.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', CommunityEvent::class);

        $search = trim((string) $request->query('search', ''));
        $timeframe = $request->query('timeframe', 'upcoming'); // upcoming, past, all
        $user = $request->user();

        $query = CommunityEvent::query()
            ->with(['creator:id,name', 'amenity:id,name', 'rsvps.user:id,name'])
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('title', 'ilike', "%{$search}%")
                        ->orWhere('description', 'ilike', "%{$search}%")
                        ->orWhere('venue_name', 'ilike', "%{$search}%");
                });
            })
            ->when($timeframe === 'upcoming', function ($q) {
                $q->where('start_time', '>=', now()->startOfDay());
            })
            ->when($timeframe === 'past', function ($q) {
                $q->where('start_time', '<', now()->startOfDay());
            });

        $events = $query
            ->orderBy($timeframe === 'past' ? 'start_time' : 'start_time', $timeframe === 'past' ? 'desc' : 'asc')
            ->paginate(12)
            ->withQueryString();

        // Transform events to calculate attendee totals and user's specific RSVP
        $events->getCollection()->transform(function ($event) use ($user) {
            $userRsvp = $event->rsvps->firstWhere('user_id', $user->id);
            $event->user_rsvp = $userRsvp ? [
                'status' => $userRsvp->status,
                'guests_count' => $userRsvp->guests_count,
                'remarks' => $userRsvp->remarks,
            ] : null;

            $event->attending_count = $event->rsvps->where('status', 'attending')->count();
            $event->maybe_count = $event->rsvps->where('status', 'maybe')->count();
            $event->declined_count = $event->rsvps->where('status', 'declined')->count();
            $event->total_attendees = $event->attending_count + (int) $event->rsvps->where('status', 'attending')->sum('guests_count');

            return $event;
        });

        $stats = [
            'total' => CommunityEvent::count(),
            'upcoming' => CommunityEvent::where('start_time', '>=', now()->startOfDay())->count(),
            'past' => CommunityEvent::where('start_time', '<', now()->startOfDay())->count(),
        ];

        $amenities = Amenity::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('features/events/pages/index', [
            'events' => $events,
            'stats' => $stats,
            'amenities' => $amenities,
            'filters' => [
                'search' => $search,
                'timeframe' => $timeframe,
            ],
            'can' => [
                'create' => $user->hasPermissionTo('event.create'),
                'rsvp' => $user->hasPermissionTo('event.rsvp'),
                'manage' => $user->hasPermissionTo('event.update') || $user->hasPermissionTo('event.delete'),
            ],
        ]);
    }

    /**
     * Store a newly created community event.
     */
    public function store(CommunityEventRequest $request): RedirectResponse
    {
        $this->authorize('create', CommunityEvent::class);

        $validated = $request->validated();
        $user = $request->user();

        $event = CommunityEvent::create([
            'society_id' => $user->society_id ?? society_id(),
            'creator_id' => $user->id,
            'amenity_id' => $validated['amenity_id'] ?? null,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'venue_name' => $validated['venue_name'] ?? null,
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'] ?? null,
            'max_attendees' => $validated['max_attendees'] ?? null,
            'is_published' => $validated['is_published'] ?? true,
        ]);

        app(ActivityLogger::class)->log(
            action: 'create',
            module: 'CommunityEvent',
            entityType: CommunityEvent::class,
            entityId: (string) $event->id,
            remarks: "Created community event: {$event->title}"
        );

        return redirect()
            ->route('community-events.index')
            ->with('success', 'Event created successfully.');
    }

    /**
     * Update the specified community event.
     */
    public function update(CommunityEventRequest $request, CommunityEvent $event): RedirectResponse
    {
        $this->authorize('update', $event);

        $validated = $request->validated();

        $event->update([
            'amenity_id' => $validated['amenity_id'] ?? null,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'venue_name' => $validated['venue_name'] ?? null,
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'] ?? null,
            'max_attendees' => $validated['max_attendees'] ?? null,
            'is_published' => $validated['is_published'] ?? true,
        ]);

        app(ActivityLogger::class)->log(
            action: 'update',
            module: 'CommunityEvent',
            entityType: CommunityEvent::class,
            entityId: (string) $event->id,
            remarks: "Updated community event: #{$event->id}"
        );

        return redirect()
            ->route('community-events.index')
            ->with('success', 'Event updated successfully.');
    }

    /**
     * Submit or update an RSVP for the event.
     */
    public function rsvp(EventRsvpRequest $request, CommunityEvent $event): RedirectResponse
    {
        $this->authorize('rsvp', $event);

        $validated = $request->validated();
        $user = $request->user();

        EventRsvp::updateOrCreate(
            [
                'community_event_id' => $event->id,
                'user_id' => $user->id,
            ],
            [
                'society_id' => $event->society_id,
                'status' => $validated['status'],
                'guests_count' => $validated['guests_count'] ?? 0,
                'remarks' => $validated['remarks'] ?? null,
            ]
        );

        app(ActivityLogger::class)->log(
            action: 'rsvp',
            module: 'CommunityEvent',
            entityType: CommunityEvent::class,
            entityId: (string) $event->id,
            remarks: "User submitted RSVP ({$validated['status']}) for event #{$event->id}"
        );

        return redirect()
            ->route('community-events.index')
            ->with('success', 'Your RSVP response has been saved.');
    }

    /**
     * Remove the specified community event from storage.
     */
    public function destroy(Request $request, CommunityEvent $event): RedirectResponse
    {
        $this->authorize('delete', $event);

        $event->delete();

        app(ActivityLogger::class)->log(
            action: 'delete',
            module: 'CommunityEvent',
            entityType: CommunityEvent::class,
            entityId: (string) $event->id,
            remarks: "Deleted community event: #{$event->id}"
        );

        return redirect()
            ->route('community-events.index')
            ->with('success', 'Event deleted successfully.');
    }
}
