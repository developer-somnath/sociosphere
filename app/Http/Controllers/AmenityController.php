<?php

namespace App\Http\Controllers;

use App\Http\Requests\AmenityRequest;
use App\Models\Amenity;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AmenityController extends Controller
{
    /**
     * Display a listing of amenities.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Amenity::class);

        $search = trim((string) $request->query('search', ''));
        $bookingType = $request->query('booking_type');
        $sortBy = in_array($request->query('sort_by'), ['name', 'booking_type', 'capacity', 'fee_per_slot', 'created_at'], true)
            ? $request->query('sort_by')
            : null;
        $sortDir = strtolower((string) $request->query('sort_dir')) === 'asc' ? 'asc' : 'desc';

        $query = Amenity::query()
            ->withCount('bookings')
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('name', 'ilike', "%{$search}%")
                        ->orWhere('description', 'ilike', "%{$search}%");
                });
            })
            ->when($bookingType !== null && $bookingType !== '', function ($q) use ($bookingType) {
                $q->where('booking_type', $bookingType);
            });

        $amenities = $query
            ->when($sortBy !== null, function ($q) use ($sortBy, $sortDir) {
                $q->orderBy($sortBy, $sortDir);
            })
            ->when($sortBy === null, function ($q) {
                $q->orderBy('name');
            })
            ->paginate(12)
            ->withQueryString();

        $stats = [
            'total' => Amenity::count(),
            'active' => Amenity::where('is_active', true)->count(),
            'slot_based' => Amenity::where('booking_type', 'Slot')->count(),
            'daily_based' => Amenity::where('booking_type', 'Daily')->count(),
        ];

        return Inertia::render('features/amenities/pages/index', [
            'amenities' => $amenities,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'booking_type' => $bookingType !== '' ? $bookingType : null,
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
            'can' => [
                'create' => $request->user()->hasPermissionTo('amenity.create'),
                'update' => $request->user()->hasPermissionTo('amenity.update'),
                'delete' => $request->user()->hasPermissionTo('amenity.delete'),
                'book' => $request->user()->hasPermissionTo('amenity.book'),
            ],
        ]);
    }

    /**
     * Show form for creating a new amenity.
     */
    public function create(): Response
    {
        $this->authorize('create', Amenity::class);

        return Inertia::render('features/amenities/pages/create');
    }

    /**
     * Store a newly created amenity.
     */
    public function store(AmenityRequest $request): RedirectResponse
    {
        $this->authorize('create', Amenity::class);

        $amenity = Amenity::create([
            ...$request->validated(),
            'society_id' => $request->user()->society_id,
            'is_active' => $request->boolean('is_active', true),
        ]);

        app(ActivityLogger::class)->log(
            action: 'create',
            module: 'Amenity',
            entityType: Amenity::class,
            entityId: (string) $amenity->id,
            remarks: "Amenity created: {$amenity->name} ({$amenity->booking_type})"
        );

        return redirect()
            ->route('amenities.index')
            ->with('success', 'Amenity created successfully.');
    }

    /**
     * Show form for editing the amenity.
     */
    public function edit(Amenity $amenity): Response
    {
        $this->authorize('update', $amenity);

        return Inertia::render('features/amenities/pages/edit', [
            'amenity' => $amenity,
        ]);
    }

    /**
     * Update the specified amenity.
     */
    public function update(AmenityRequest $request, Amenity $amenity): RedirectResponse
    {
        $this->authorize('update', $amenity);

        $amenity->update([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active', true),
        ]);

        app(ActivityLogger::class)->log(
            action: 'update',
            module: 'Amenity',
            entityType: Amenity::class,
            entityId: (string) $amenity->id,
            remarks: "Amenity updated: {$amenity->name}"
        );

        return redirect()
            ->route('amenities.index')
            ->with('success', 'Amenity updated successfully.');
    }

    /**
     * Remove the specified amenity.
     */
    public function destroy(Amenity $amenity): RedirectResponse
    {
        $this->authorize('delete', $amenity);

        if ($amenity->bookings()->whereIn('status', ['Pending', 'Approved'])->exists()) {
            return redirect()
                ->route('amenities.index')
                ->with('error', 'Cannot delete an amenity with active or pending bookings.');
        }

        $name = $amenity->name;
        $amenity->delete();

        app(ActivityLogger::class)->log(
            action: 'delete',
            module: 'Amenity',
            entityType: Amenity::class,
            entityId: (string) $amenity->id,
            remarks: "Amenity deleted: {$name}"
        );

        return redirect()
            ->route('amenities.index')
            ->with('success', 'Amenity deleted.');
    }
}
