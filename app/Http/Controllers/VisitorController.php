<?php

namespace App\Http\Controllers;

use App\Http\Requests\VisitorRequest;
use App\Models\Flat;
use App\Models\Visitor;
use App\Models\VisitorPass;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VisitorController extends Controller
{
    /**
     * Display a paginated, searchable, filterable list of visitor passes
     * (the gate register).
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', VisitorPass::class);

        $search = trim((string) $request->query('search', ''));
        $status = $request->query('status');

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
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('features/visitors/pages/index', [
            'passes' => $passes,
            'filters' => [
                'search' => $search,
                'status' => in_array($status, VisitorPass::STATUSES, true) ? $status : null,
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
            'flats' => $this->flatOptions($request),
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

        VisitorPass::create([
            'society_id' => $societyId,
            'visitor_id' => $visitor->id,
            'flat_id' => $request->input('flat_id'),
            'purpose' => $request->input('purpose'),
            'vehicle_number' => $request->input('vehicle_number') ?: null,
            'status' => VisitorPass::STATUS_PENDING,
            'scheduled_for' => $request->input('scheduled_for'),
            'created_by' => $request->user()->id,
        ]);

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
            'flats' => $this->flatOptions($request),
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

    /**
     * Flat options for create/edit forms.
     *
     * Society-bound users only see their own flats; super admins see all
     * flats with the society and tower names in the label.
     *
     * @return array<int, array{id: int, label: string}>
     */
    private function flatOptions(Request $request): array
    {
        $isSuperAdmin = $request->user()->isSuperAdmin();

        return Flat::query()
            ->with(['tower', 'society'])
            ->when(! $isSuperAdmin, function ($query) use ($request) {
                $query->where('society_id', $request->user()->society_id);
            })
            ->orderBy('flat_no')
            ->get()
            ->map(function (Flat $flat) use ($isSuperAdmin) {
                $label = $isSuperAdmin
                    ? trim(($flat->society?->name ?? '').' · '.($flat->tower?->name ?? '').' · '.$flat->flat_no)
                    : trim(($flat->tower?->name ?? '').' · '.$flat->flat_no);

                return [
                    'id' => $flat->id,
                    'label' => $label,
                ];
            })
            ->all();
    }
}
