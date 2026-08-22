<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\EnforcesEntitlements;
use App\Http\Requests\ComplaintRequest;
use App\Models\Complaint;
use App\Models\ComplaintCategory;
use App\Models\Flat;
use App\Models\Resident;
use App\Models\User;
use App\Services\ActivityLogger;
use App\Services\WebPushService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ComplaintController extends Controller
{
    use EnforcesEntitlements;

    /**
     * Display a paginated, filterable list of complaints.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Complaint::class);

        $search = trim((string) $request->query('search', ''));
        $status = $request->query('status');
        $priority = $request->query('priority');
        $categoryId = $request->query('category_id');
        $sortBy = in_array($request->query('sort_by'), ['title', 'priority', 'status', 'created_at'], true)
            ? $request->query('sort_by')
            : null;
        $sortDir = strtolower((string) $request->query('sort_dir')) === 'asc' ? 'asc' : 'desc';

        $query = Complaint::query()
            ->with(['flat', 'resident', 'category', 'assignee'])
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('title', 'ilike', "%{$search}%")
                        ->orWhere('description', 'ilike', "%{$search}%");
                });
            })
            ->when($status !== null && $status !== '', function ($q) use ($status) {
                $q->where('status', $status);
            })
            ->when($priority !== null && $priority !== '', function ($q) use ($priority) {
                $q->where('priority', $priority);
            })
            ->when($categoryId !== null && $categoryId !== '', function ($q) use ($categoryId) {
                $q->where('category_id', $categoryId);
            });

        $complaints = $query
            ->when($sortBy !== null, function ($q) use ($sortBy, $sortDir) {
                $q->orderBy($sortBy, $sortDir);
            })
            ->when($sortBy === null, function ($q) {
                $q->latest('id');
            })
            ->paginate(15)
            ->withQueryString();

        $stats = [
            'total' => Complaint::count(),
            'open' => Complaint::where('status', 'Open')->count(),
            'in_progress' => Complaint::whereIn('status', ['Assigned', 'In Progress'])->count(),
            'resolved' => Complaint::whereIn('status', ['Resolved', 'Closed'])->count(),
        ];

        $categories = ComplaintCategory::orderBy('name')->get(['id', 'name']);

        return Inertia::render('features/complaints/pages/index', [
            'complaints' => $complaints,
            'stats' => $stats,
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'status' => $status !== '' ? $status : null,
                'priority' => $priority !== '' ? $priority : null,
                'category_id' => $categoryId !== '' ? $categoryId : null,
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
            'can' => [
                'create' => $request->user()->hasPermissionTo('complaint.create'),
                'update' => $request->user()->hasPermissionTo('complaint.update'),
                'delete' => $request->user()->hasPermissionTo('complaint.delete'),
            ],
        ]);
    }

    /**
     * Show the create complaint form.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', Complaint::class);

        $categories = ComplaintCategory::orderBy('name')->get(['id', 'name']);
        $flats = Flat::orderBy('flat_no')->get(['id', 'flat_no', 'tower_id'])->load('tower:id,name');
        $residents = Resident::orderBy('name')->get(['id', 'name', 'flat_id']);

        return Inertia::render('features/complaints/pages/create', [
            'categories' => $categories,
            'flats' => $flats,
            'residents' => $residents,
        ]);
    }

    /**
     * Store a newly created complaint.
     */
    public function store(ComplaintRequest $request): RedirectResponse
    {
        $this->authorize('create', Complaint::class);

        $this->enforceEntitlement('complaints');

        $flatId = $request->input('flat_id');
        $societyId = $request->user()->society_id
            ?? society_id()
            ?? ($flatId ? Flat::where('id', $flatId)->value('society_id') : null);

        if (! $societyId) {
            return redirect()
                ->back()
                ->with('error', 'Please select a society before raising a complaint.');
        }

        $complaint = Complaint::create([
            ...$request->validated(),
            'society_id' => $societyId,
            'status' => 'Open',
        ]);

        app(ActivityLogger::class)->log(
            action: 'create',
            module: 'Complaint',
            entityType: Complaint::class,
            entityId: (string) $complaint->id,
            remarks: "Complaint raised: {$complaint->title} (Priority: {$complaint->priority})"
        );

        return redirect()
            ->route('complaints.index')
            ->with('success', 'Complaint submitted successfully.');
    }

    /**
     * Display a specific complaint with full details.
     */
    public function show(Complaint $complaint): Response
    {
        $this->authorize('view', $complaint);

        $complaint->load(['flat.tower', 'resident', 'category', 'assignee']);

        $staffUsers = User::where('society_id', $complaint->society_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('features/complaints/pages/show', [
            'complaint' => $complaint,
            'staffUsers' => $staffUsers,
            'can' => [
                'update' => request()->user()->hasPermissionTo('complaint.update'),
                'delete' => request()->user()->hasPermissionTo('complaint.delete'),
            ],
        ]);
    }

    /**
     * Show the edit complaint form.
     */
    public function edit(Complaint $complaint): Response
    {
        $this->authorize('update', $complaint);

        $complaint->load(['flat.tower', 'resident', 'category', 'assignee']);

        $categories = ComplaintCategory::orderBy('name')->get(['id', 'name']);
        $staffUsers = User::where('society_id', $complaint->society_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('features/complaints/pages/edit', [
            'complaint' => $complaint,
            'categories' => $categories,
            'staffUsers' => $staffUsers,
        ]);
    }

    /**
     * Update the specified complaint.
     */
    public function update(ComplaintRequest $request, Complaint $complaint): RedirectResponse
    {
        $this->authorize('update', $complaint);

        $oldStatus = $complaint->status;
        $data = $request->validated();

        // Auto-set resolved_at when status changes to Resolved
        if (isset($data['status']) && $data['status'] === 'Resolved' && $oldStatus !== 'Resolved') {
            $data['resolved_at'] = now();
        }

        // Auto-set status to Assigned when assigning to a user
        if (isset($data['assigned_to']) && $data['assigned_to'] && $complaint->status === 'Open') {
            $data['status'] = 'Assigned';
        }

        $complaint->update($data);

        app(ActivityLogger::class)->log(
            action: 'update',
            module: 'Complaint',
            entityType: Complaint::class,
            entityId: (string) $complaint->id,
            remarks: "Complaint updated: {$complaint->title} (Status: {$oldStatus} → {$complaint->status})"
        );

        return redirect()
            ->route('complaints.show', $complaint)
            ->with('success', 'Complaint updated successfully.');
    }

    /**
     * Assign complaint to a staff member.
     */
    public function assign(Request $request, Complaint $complaint): RedirectResponse
    {
        $this->authorize('update', $complaint);

        $request->validate([
            'assigned_to' => ['required', 'exists:users,id'],
        ]);

        $oldStatus = $complaint->status;

        $complaint->update([
            'assigned_to' => $request->input('assigned_to'),
            'status' => $complaint->status === 'Open' ? 'Assigned' : $complaint->status,
        ]);

        $assignee = User::find($request->input('assigned_to'));

        app(ActivityLogger::class)->log(
            action: 'assign',
            module: 'Complaint',
            entityType: Complaint::class,
            entityId: (string) $complaint->id,
            remarks: "Complaint assigned to {$assignee->name}: {$complaint->title}"
        );

        // Notify the assignee via web push if they have subscriptions.
        if ($assignee->pushSubscriptions->isNotEmpty()) {
            app(WebPushService::class)->sendToUser($assignee, [
                'type' => 'complaint.assigned',
                'title' => 'Complaint assigned to you',
                'body' => "{$complaint->title} was assigned to you.",
                'url' => "/complaints/{$complaint->id}",
            ]);
        }

        return redirect()
            ->route('complaints.show', $complaint)
            ->with('success', "Complaint assigned to {$assignee->name}.");
    }

    /**
     * Transition complaint status.
     */
    public function transition(Request $request, Complaint $complaint): RedirectResponse
    {
        $this->authorize('update', $complaint);

        $request->validate([
            'status' => ['required', 'in:Open,Assigned,In Progress,Resolved,Closed'],
        ]);

        $oldStatus = $complaint->status;
        $newStatus = $request->input('status');

        $data = ['status' => $newStatus];

        if ($newStatus === 'Resolved' && $oldStatus !== 'Resolved') {
            $data['resolved_at'] = now();
        }

        $complaint->update($data);

        app(ActivityLogger::class)->log(
            action: 'status_transition',
            module: 'Complaint',
            entityType: Complaint::class,
            entityId: (string) $complaint->id,
            remarks: "Complaint status changed: {$oldStatus} → {$newStatus}"
        );

        return redirect()
            ->route('complaints.show', $complaint)
            ->with('success', "Complaint status changed to {$newStatus}.");
    }

    /**
     * Remove the specified complaint.
     */
    public function destroy(Complaint $complaint): RedirectResponse
    {
        $this->authorize('delete', $complaint);

        $title = $complaint->title;
        $complaint->delete();

        app(ActivityLogger::class)->log(
            action: 'delete',
            module: 'Complaint',
            entityType: Complaint::class,
            entityId: (string) $complaint->id,
            remarks: "Complaint deleted: {$title}"
        );

        return redirect()
            ->route('complaints.index')
            ->with('success', 'Complaint deleted.');
    }
}
