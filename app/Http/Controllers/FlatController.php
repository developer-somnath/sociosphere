<?php

namespace App\Http\Controllers;

use App\Http\Requests\FlatRequest;
use App\Models\Flat;
use App\Models\Tower;
use App\Services\ModuleQueryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FlatController extends Controller
{
    public function __construct(private readonly ModuleQueryService $moduleQueryService)
    {
    }
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
        $type = $request->query('type');
        $sortBy = in_array($request->query('sort_by'), ['flat_no', 'floor_no', 'occupancy_status', 'created_at'], true) ? $request->query('sort_by') : 'id';
        $sortDir = strtolower((string) $request->query('sort_dir')) === 'asc' ? 'asc' : 'desc';

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
            ->when(in_array($status, ['Occupied', 'Vacant', 'Self-Occupied', 'Owner Occupied', 'Rented'], true), function ($query) use ($status) {
                $query->where('occupancy_status', $status);
            })
            ->when($type !== null && $type !== '', function ($query) use ($type) {
                $query->where('flat_type', $type);
            })
            ->orderBy($sortBy, $sortDir)
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('features/flats/pages/index', [
            'flats' => $flats,
            'filters' => [
                'search' => $search,
                'tower_id' => $towerId !== null && $towerId !== '' ? (int) $towerId : null,
                'status' => in_array($status, ['Occupied', 'Vacant', 'Self-Occupied', 'Owner Occupied', 'Rented'], true) ? $status : null,
                'type' => $type,
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
            'towers' => $this->moduleQueryService->towerOptions($request->user()),
            'stats' => $this->moduleQueryService->occupancyStats($request->user()),
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
            'towers' => $this->moduleQueryService->towerOptions($request->user()),
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
            'towers' => $this->moduleQueryService->towerOptions($request->user()),
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
     * Restore a soft-deleted flat.
     */
    public function restore(Request $request, int $id): RedirectResponse
    {
        $flat = Flat::withTrashed()->findOrFail($id);
        $this->authorize('restore', $flat);

        $flat->restore();

        return redirect()
            ->route('flats.index')
            ->with('success', 'Flat restored successfully.');
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
}
