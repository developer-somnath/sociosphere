<?php

namespace App\Http\Controllers;

use App\Http\Requests\VisitorRequest;
use App\Models\Flat;
use App\Models\User;
use App\Models\Visitor;
use App\Models\VisitorPass;
use App\Notifications\NewVisitorPassRequest;
use App\Services\ModuleQueryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

class VisitorController extends Controller
{
    public function __construct(private readonly ModuleQueryService $moduleQueryService)
    {
    }
    /**
     * Display a paginated, searchable, filterable list of visitor passes
     * (the gate register).
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', VisitorPass::class);

        $search = trim((string) $request->query('search', ''));
        $status = $request->query('status');
        $sortBy = in_array($request->query('sort_by'), ['visitor_name', 'purpose', 'status', 'scheduled_for', 'created_at'], true)
            ? $request->query('sort_by')
            : 'created_at';
        $sortDir = strtolower((string) $request->query('sort_dir')) === 'asc' ? 'asc' : 'desc';

        $passes = VisitorPass::query()
            ->with(['visitor', 'flat.tower'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->whereLike('purpose', $search)
                        ->orWhereLike('vehicle_number', $search)
                        ->orWhereHas('visitor', function ($query) use ($search) {
                            $query->whereLike('name', $search)
                                ->orWhereLike('phone', $search)
                                ->orWhereLike('email', $search);
                        })
                        ->orWhereHas('flat', fn ($query) => $query->whereLike('flat_no', $search));
                });
            })
            ->when(in_array($status, VisitorPass::STATUSES, true), function ($query) use ($status) {
                $query->where('status', $status);
            })
            ->when($sortBy === 'visitor_name', function ($query) use ($sortDir) {
                $query->orderBy(
                    Visitor::select('name')->whereColumn('visitors.id', 'visitor_passes.visitor_id'),
                    $sortDir
                );
            })
            ->when($sortBy !== 'visitor_name', function ($query) use ($sortBy, $sortDir) {
                $query->orderBy($sortBy, $sortDir);
            })
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('features/visitors/pages/index', [
            'passes' => $passes,
            'filters' => [
                'search' => $search,
                'status' => in_array($status, VisitorPass::STATUSES, true) ? $status : null,
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
            'can' => [
                'create' => $request->user()->hasPermissionTo('visitor.create'),
                'update' => $request->user()->hasPermissionTo('visitor.update'),
                'delete' => $request->user()->hasPermissionTo('visitor.delete'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new visitor pass.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', VisitorPass::class);

        return Inertia::render('features/visitors/pages/create', [
            'flats' => $this->moduleQueryService->flatOptions($request->user()),
        ]);
    }

    /**
     * Store a newly created visitor and a pending gate pass.
     */
    public function store(VisitorRequest $request): RedirectResponse
    {
        $this->authorize('create', VisitorPass::class);

        $societyId = $this->resolvedSocietyId($request);

        $visitor = Visitor::create([
            ...$request->safe(['name', 'phone', 'email', 'notes']),
            'society_id' => $societyId,
            'created_by' => $request->user()->id,
        ]);

        $pass = VisitorPass::create([
            'society_id' => $societyId,
            'visitor_id' => $visitor->id,
            'flat_id' => $request->input('flat_id'),
            'purpose' => $request->input('purpose'),
            'vehicle_number' => $request->input('vehicle_number') ?: null,
            'status' => VisitorPass::STATUS_PENDING,
            'scheduled_for' => $request->input('scheduled_for'),
            'created_by' => $request->user()->id,
        ]);

        // Notify society approvers so the pass can be actioned from the bell.
        $approvers = User::query()
            ->where('society_id', $societyId)
            ->where('is_active', true)
            ->get()
            ->filter(fn (User $user) => $user->hasPermissionTo('visitor.update'));

        if ($approvers->isNotEmpty()) {
            $pass->load('visitor', 'flat');
            Notification::send($approvers, new NewVisitorPassRequest($pass));
        }

        return redirect()
            ->route('visitors.index')
            ->with('success', 'Visitor pass created. Awaiting approval.');
    }

    /**
     * Show the form for editing a visitor pass.
     */
    public function edit(Request $request, VisitorPass $visitorPass): Response
    {
        $this->authorize('update', $visitorPass);

        $visitorPass->load('visitor');

        return Inertia::render('features/visitors/pages/edit', [
            'pass' => $visitorPass,
            'flats' => $this->moduleQueryService->flatOptions($request->user()),
        ]);
    }

    /**
     * Update the visitor and pass details (status is managed through the
     * dedicated lifecycle actions).
     */
    public function update(VisitorRequest $request, VisitorPass $visitorPass): RedirectResponse
    {
        $this->authorize('update', $visitorPass);

        $visitorPass->visitor->update(
            $request->safe(['name', 'phone', 'email', 'notes'])
        );

        $visitorPass->update([
            'flat_id' => $request->input('flat_id'),
            'purpose' => $request->input('purpose'),
            'vehicle_number' => $request->input('vehicle_number') ?: null,
            'scheduled_for' => $request->input('scheduled_for'),
        ]);

        return redirect()
            ->route('visitors.index')
            ->with('success', 'Visitor pass updated successfully.');
    }

    /**
     * Remove a pending visitor pass (audit trail: only pending passes can
     * be removed, and only by users with the visitor.delete permission).
     */
    public function destroy(Request $request, VisitorPass $visitorPass): RedirectResponse
    {
        $this->authorize('delete', $visitorPass);

        if (! $visitorPass->isPending()) {
            return back()->with('error', 'Only pending passes can be removed.');
        }

        $visitorPass->delete();

        return redirect()
            ->route('visitors.index')
            ->with('success', 'Visitor pass removed.');
    }

    /**
     * Approve a pending pass.
     */
    public function approve(Request $request, VisitorPass $visitorPass): RedirectResponse
    {
        $this->authorize('update', $visitorPass);

        if (! $visitorPass->isPending()) {
            return back()->with('error', 'Only pending passes can be approved.');
        }

        $visitorPass->update([
            'status' => VisitorPass::STATUS_APPROVED,
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        return back()->with('success', 'Visitor pass approved.');
    }

    /**
     * Reject a pending pass.
     */
    public function reject(Request $request, VisitorPass $visitorPass): RedirectResponse
    {
        $this->authorize('update', $visitorPass);

        if (! $visitorPass->isPending()) {
            return back()->with('error', 'Only pending passes can be rejected.');
        }

        $visitorPass->update([
            'status' => VisitorPass::STATUS_REJECTED,
        ]);

        return back()->with('success', 'Visitor pass rejected.');
    }

    /**
     * Check a visitor in (only approved passes).
     */
    public function checkIn(Request $request, VisitorPass $visitorPass): RedirectResponse
    {
        $this->authorize('update', $visitorPass);

        if ($visitorPass->status !== VisitorPass::STATUS_APPROVED) {
            return back()->with('error', 'Only approved passes can be checked in.');
        }

        $visitorPass->update([
            'status' => VisitorPass::STATUS_CHECKED_IN,
            'check_in_at' => now(),
        ]);

        return back()->with('success', 'Visitor checked in.');
    }

    /**
     * Check a visitor out (only checked-in passes).
     */
    public function checkOut(Request $request, VisitorPass $visitorPass): RedirectResponse
    {
        $this->authorize('update', $visitorPass);

        if ($visitorPass->status !== VisitorPass::STATUS_CHECKED_IN) {
            return back()->with('error', 'Only checked-in visitors can be checked out.');
        }

        $visitorPass->update([
            'status' => VisitorPass::STATUS_CHECKED_OUT,
            'check_out_at' => now(),
        ]);

        return back()->with('success', 'Visitor checked out.');
    }

    /**
     * Resolve the society for a pass: the user's own society, or the
     * society of the chosen flat for super admins.
     */
    private function resolvedSocietyId(Request $request): int
    {
        $userSocietyId = $request->user()->society_id;

        if ($userSocietyId !== null) {
            return (int) $userSocietyId;
        }

        return (int) Flat::query()
            ->whereKey($request->input('flat_id'))
            ->value('society_id');
    }

}
