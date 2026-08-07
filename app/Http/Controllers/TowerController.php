<?php

namespace App\Http\Controllers;

use App\Http\Requests\TowerRequest;
use App\Models\Society;
use App\Models\Tower;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TowerController extends Controller
{
    /**
     * Display a paginated, searchable list of towers.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Tower::class);

        $search = trim((string) $request->query('search', ''));
        $sortBy = in_array($request->query('sort_by'), ['name', 'created_at'], true) ? $request->query('sort_by') : 'id';
        $sortDir = strtolower((string) $request->query('sort_dir')) === 'asc' ? 'asc' : 'desc';

        $towers = Tower::query()
            ->withCount('flats')
            ->when($search !== '', function ($query) use ($search) {
                $query->whereLike('name', $search);
            })
            ->orderBy($sortBy, $sortDir)
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('features/towers/pages/index', [
            'towers' => $towers,
            'filters' => [
                'search' => $search,
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
            'can' => [
                'create' => $request->user()->hasPermissionTo('tower.create'),
                'delete' => $request->user()->hasPermissionTo('tower.delete'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new tower.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', Tower::class);

        return Inertia::render('features/towers/pages/create', [
            'societies' => $this->societyOptions($request),
        ]);
    }

    /**
     * Store a newly created tower.
     */
    public function store(TowerRequest $request): RedirectResponse
    {
        $this->authorize('create', Tower::class);

        Tower::create([
            'name' => $request->input('name'),
            'society_id' => $request->input('society_id', $request->user()->society_id),
        ]);

        return redirect()
            ->route('towers.index')
            ->with('success', 'Tower added successfully.');
    }

    /**
     * Show the form for editing a tower.
     */
    public function edit(Request $request, Tower $tower): Response
    {
        $this->authorize('update', $tower);

        return Inertia::render('features/towers/pages/edit', [
            'tower' => $tower,
            'societies' => $this->societyOptions($request),
        ]);
    }

    /**
     * Update the specified tower.
     */
    public function update(TowerRequest $request, Tower $tower): RedirectResponse
    {
        $this->authorize('update', $tower);

        $tower->update([
            'name' => $request->input('name'),
            'society_id' => $request->input('society_id', $request->user()->society_id),
        ]);

        return redirect()
            ->route('towers.index')
            ->with('success', 'Tower updated successfully.');
    }

    /**
     * List of society options for super admins to pick from.
     */
    private function societyOptions(Request $request): array
    {
        if (! $request->user()->isSuperAdmin()) {
            return [];
        }

        return Society::query()
            ->orderBy('name')
            ->get()
            ->map(fn (Society $society) => [
                'id' => $society->id,
                'label' => $society->name,
            ])
            ->all();
    }

    /**
     * Remove (soft-delete) the specified tower.
     *
     * Towers with flats attached cannot be removed.
     */
    public function destroy(Request $request, Tower $tower): RedirectResponse
    {
        $this->authorize('delete', $tower);

        $tower->delete();

        return redirect()
            ->route('towers.index')
            ->with('success', 'Tower removed successfully.');
    }

    /**
     * Restore a soft-deleted tower.
     */
    public function restore(Request $request, int $id): RedirectResponse
    {
        $tower = Tower::withTrashed()->findOrFail($id);
        $this->authorize('restore', $tower);

        $tower->restore();

        return redirect()
            ->route('towers.index')
            ->with('success', 'Tower restored successfully.');
    }
}

