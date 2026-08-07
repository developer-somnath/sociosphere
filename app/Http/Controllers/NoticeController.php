<?php

namespace App\Http\Controllers;

use App\Http\Requests\NoticeRequest;
use App\Models\Notice;
use App\Models\NoticeAcknowledgement;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NoticeController extends Controller
{
    /**
     * Display a paginated, filterable list of notices.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Notice::class);

        $search = trim((string) $request->query('search', ''));
        $category = $request->query('category');
        $targetAudience = $request->query('target_audience');
        $status = $request->query('status');
        $sortBy = in_array($request->query('sort_by'), ['title', 'category', 'is_pinned', 'publish_from', 'created_at'], true)
            ? $request->query('sort_by')
            : null;
        $sortDir = strtolower((string) $request->query('sort_dir')) === 'asc' ? 'asc' : 'desc';

        $query = Notice::query()
            ->with(['author:id,name', 'acknowledgements'])
            ->withCount('acknowledgements')
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('title', 'ilike', "%{$search}%")
                        ->orWhere('description', 'ilike', "%{$search}%");
                });
            })
            ->when($category !== null && $category !== '', function ($q) use ($category) {
                $q->where('category', $category);
            })
            ->when($targetAudience !== null && $targetAudience !== '', function ($q) use ($targetAudience) {
                $q->where('target_audience', $targetAudience);
            })
            ->when($status === 'published', function ($q) {
                $q->published();
            })
            ->when($status === 'scheduled', function ($q) {
                $q->where('publish_from', '>', now());
            })
            ->when($status === 'expired', function ($q) {
                $q->where('publish_to', '<', now());
            });

        $notices = $query
            ->when($sortBy !== null, function ($q) use ($sortBy, $sortDir) {
                $q->orderBy($sortBy, $sortDir);
            })
            ->when($sortBy === null, function ($q) {
                $q->orderByRaw('is_pinned DESC')->latest('id');
            })
            ->paginate(12)
            ->withQueryString();

        // Annotate each notice with whether the current user has acknowledged it.
        $userId = $request->user()->id;
        $notices->getCollection()->transform(function (Notice $notice) use ($userId) {
            $notice->setAttribute(
                'acknowledged',
                $notice->acknowledgements->contains('user_id', $userId)
            );
            return $notice;
        });

        $stats = [
            'total' => Notice::count(),
            'published' => Notice::published()->count(),
            'pinned' => Notice::where('is_pinned', true)->count(),
            'scheduled' => Notice::where('publish_from', '>', now())->count(),
        ];

        $categories = Notice::query()
            ->whereNotNull('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        return Inertia::render('features/notices/pages/index', [
            'notices' => $notices,
            'stats' => $stats,
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'category' => $category !== '' ? $category : null,
                'target_audience' => $targetAudience !== '' ? $targetAudience : null,
                'status' => $status !== '' ? $status : null,
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
            'can' => [
                'create' => $request->user()->hasPermissionTo('notice.create'),
                'update' => $request->user()->hasPermissionTo('notice.update'),
                'delete' => $request->user()->hasPermissionTo('notice.delete'),
            ],
        ]);
    }

    /**
     * Show the create notice form.
     */
    public function create(): Response
    {
        $this->authorize('create', Notice::class);

        return Inertia::render('features/notices/pages/create');
    }

    /**
     * Store a newly created notice.
     */
    public function store(NoticeRequest $request): RedirectResponse
    {
        $this->authorize('create', Notice::class);

        $societyId = $request->user()->society_id ?? society_id();

        if (! $societyId) {
            return redirect()
                ->back()
                ->with('error', 'Please select a society before creating a notice.');
        }

        $notice = Notice::create([
            ...$request->validated(),
            'society_id' => $societyId,
            'is_pinned' => $request->boolean('is_pinned'),
            'created_by' => $request->user()->id,
        ]);

        app(ActivityLogger::class)->log(
            action: 'create',
            module: 'Notice',
            entityType: Notice::class,
            entityId: (string) $notice->id,
            remarks: "Notice created: {$notice->title}"
        );

        return redirect()
            ->route('notices.index')
            ->with('success', 'Notice published successfully.');
    }

    /**
     * Show the edit notice form.
     */
    public function edit(Notice $notice): Response
    {
        $this->authorize('update', $notice);

        return Inertia::render('features/notices/pages/edit', [
            'notice' => $notice,
        ]);
    }

    /**
     * Update the specified notice.
     */
    public function update(NoticeRequest $request, Notice $notice): RedirectResponse
    {
        $this->authorize('update', $notice);

        $notice->update([
            ...$request->validated(),
            'is_pinned' => $request->boolean('is_pinned'),
        ]);

        app(ActivityLogger::class)->log(
            action: 'update',
            module: 'Notice',
            entityType: Notice::class,
            entityId: (string) $notice->id,
            remarks: "Notice updated: {$notice->title}"
        );

        return redirect()
            ->route('notices.index')
            ->with('success', 'Notice updated successfully.');
    }

    /**
     * Remove the specified notice.
     */
    public function destroy(Notice $notice): RedirectResponse
    {
        $this->authorize('delete', $notice);

        $title = $notice->title;
        $notice->delete();

        app(ActivityLogger::class)->log(
            action: 'delete',
            module: 'Notice',
            entityType: Notice::class,
            entityId: (string) $notice->id,
            remarks: "Notice deleted: {$title}"
        );

        return redirect()
            ->route('notices.index')
            ->with('success', 'Notice deleted.');
    }

    /**
     * Toggle the pinned state of a notice.
     */
    public function togglePin(Request $request, Notice $notice): RedirectResponse
    {
        $this->authorize('update', $notice);

        $notice->update(['is_pinned' => ! $notice->is_pinned]);

        app(ActivityLogger::class)->log(
            action: 'update',
            module: 'Notice',
            entityType: Notice::class,
            entityId: (string) $notice->id,
            remarks: ($notice->is_pinned ? 'Pinned' : 'Unpinned') . " notice: {$notice->title}"
        );

        return redirect()
            ->route('notices.index')
            ->with('success', $notice->is_pinned ? 'Notice pinned.' : 'Notice unpinned.');
    }

    /**
     * Acknowledge a notice for the current user.
     */
    public function acknowledge(Request $request, Notice $notice): RedirectResponse
    {
        $this->authorize('acknowledge', $notice);

        NoticeAcknowledgement::updateOrCreate(
            [
                'notice_id' => $notice->id,
                'user_id' => $request->user()->id,
            ],
            [
                'acknowledged_at' => now(),
            ]
        );

        return redirect()
            ->route('notices.index')
            ->with('success', 'Notice acknowledged.');
    }
}
