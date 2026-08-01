<?php

namespace App\Http\Controllers;

use App\Http\Requests\FlatRequest;
use App\Models\Flat;
use App\Models\Tower;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FlatController extends Controller
{
    /**
     * Display a paginated, searchable, filterable list of flats with
     * occupancy stats.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Flat::class);

        $search = trim((string) $request->query('search', ''));
        $towerId = $request->query('tower_id');
        $status = $request->query('status');

        $flats = Flat::query()
            ->with(['tower', 'resident'])
            ->withCount('residents')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->whereLike('flat_no', $search)
                        ->orWhereHas('tower', fn ($query) => $query->whereLike('name', $search))
                        ->orWhereHas('resident', fn ($query) => $query->whereLike('name', $search));
                });
            })
            ->when($towerId !== null && $towerId !== '', function ($query) use ($towerId) {
                $query->where('tower_id', (int) $towerId);
            })
            ->when(in_array($status, ['Occupied', 'Vacant', 'Self-Occupied'], true), function ($query) use ($status) {
                $query->where('occupancy_status', $status);
            })
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('features/flats/pages/index', [
            'flats' => $flats,
            'filters' => [
                'search' => $search,
                'tower_id' => $towerId !== null && $towerId !== '' ? (int) $towerId : null,
                'status' => in_array($status, ['Occupied', 'Vacant', 'Self-Occupied'], true) ? $status : null,
            ],
            'towers' => $this->towerOptions($request),
            'stats' => $this->occupancyStats(),
            'can' => [
                'create' => $request->user()->hasPermissionTo('flat.create'),
                'delete' => $request->user()->hasPermissionTo('flat.delete'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new flat.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', Flat::class);

        return Inertia::render('features/flats/pages/create', [
            'towers' => $this->towerOptions($request),
        ]);
    }

    /**
     * Store a newly created flat.
     */
    public function store(FlatRequest $request): RedirectResponse
    {
        $this->authorize('create', Flat::class);

        Flat::create([
            ...$request->validated(),
            'society_id' => $this->resolvedSocietyId($request),
        ]);

        return redirect()
            ->route('flats.index')
            ->with('success', 'Flat added successfully.');
    }

    /**
     * Show the form for editing a flat.
     */
    public function edit(Request $request, Flat $flat): Response
    {
        $this->authorize('update', $flat);

        $flat->load(['tower', 'resident']);

        return Inertia::render('features/flats/pages/edit', [
            'flat' => $flat,
            'towers' => $this->towerOptions($request),
        ]);
    }

    /**
     * Update the specified flat.
     */
    public function update(FlatRequest $request, Flat $flat): RedirectResponse
    {
        $this->authorize('update', $flat);

        $flat->update([
            ...$request->validated(),
            'society_id' => $this->resolvedSocietyId($request),
        ]);

        return redirect()
            ->route('flats.index')
            ->with('success', 'Flat updated successfully.');
    }

    /**
     * Remove (soft-delete) the specified flat.
     *
     * Flats with residents attached cannot be removed.
     */
    public function destroy(Request $request, Flat $flat): RedirectResponse
    {
        $this->authorize('delete', $flat);

        $flat->delete();

        return redirect()
            ->route('flats.index')
            ->with('success', 'Flat removed successfully.');
    }

    /**
     * Resolve the society for a flat: the user's own society, or the
     * society of the chosen tower for super admins.
     */
    private function resolvedSocietyId(Request $request): int
    {
        $userSocietyId = $request->user()->society_id;

        if ($userSocietyId !== null) {
            return (int) $userSocietyId;
        }

        return (int) Tower::query()
            ->whereKey($request->input('tower_id'))
            ->value('society_id');
    }

    /**
     * Tower options for create/edit forms and the index filter.
     *
     * Society-bound users only see their own towers; super admins see all
     * towers with the society name in the label.
     *
     * @return array<int, array{id: int, label: string}>
     */
    private function towerOptions(Request $request): array
    {
        $isSuperAdmin = $request->user()->isSuperAdmin();

        return Tower::query()
            ->with('society')
            ->when(! $isSuperAdmin, function ($query) use ($request) {
                $query->where('society_id', $request->user()->society_id);
            })
            ->orderBy('name')
            ->get()
            ->map(function (Tower $tower) use ($isSuperAdmin) {
                return [
                    'id' => $tower->id,
                    'label' => $isSuperAdmin
                        ? trim(($tower->society?->name ?? '').' · '.$tower->name)
                        : $tower->name,
                ];
            })
            ->all();
    }

    /**
     * Tenant-scoped occupancy stats (the global society scope applies).
     *
     * @return array{total_units: int, occupied_units: int, vacant_units: int, occupancy_rate: float}
     */
    private function occupancyStats(): array
    {
        $totalUnits = Flat::count();

        $occupiedUnits = Flat::whereIn('occupancy_status', ['Occupied', 'Self-Occupied'])->count();

        $vacantUnits = Flat::where('occupancy_status', 'Vacant')->count();

        return [
            'total_units' => $totalUnits,
            'occupied_units' => $occupiedUnits,
            'vacant_units' => $vacantUnits,
            'occupancy_rate' => $totalUnits > 0
                ? round(($occupiedUnits / $totalUnits) * 100, 1)
                : 0.0,
        ];
    }
}
