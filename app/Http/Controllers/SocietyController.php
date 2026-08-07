<?php

namespace App\Http\Controllers;

use App\Http\Requests\SocietyRequest;
use App\Models\Society;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SocietyController extends Controller
{
    /**
     * Display a listing of societies.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Society::class);

        $search = trim((string) $request->query('search', ''));
        $sortBy = in_array($request->query('sort_by'), ['name', 'registration_no', 'city', 'status', 'created_at'], true)
            ? $request->query('sort_by')
            : null;
        $sortDir = strtolower((string) $request->query('sort_dir')) === 'asc' ? 'asc' : 'desc';

        $societies = Society::query()
            ->withCount(['towers', 'users'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->whereLike('name', $search)
                        ->orWhereLike('registration_no', $search)
                        ->orWhereLike('city', $search)
                        ->orWhereLike('email', $search);
                });
            })
            ->when(! $request->user()->isSuperAdmin(), function ($query) use ($request) {
                $query->where('id', $request->user()->society_id);
            })
            ->when($sortBy !== null, function ($query) use ($sortBy, $sortDir) {
                $query->orderBy($sortBy, $sortDir);
            })
            ->when($sortBy === null, function ($query) {
                $query->orderBy('name');
            })
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('features/societies/pages/index', [
            'societies' => $societies,
            'filters' => [
                'search' => $search,
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
            'can' => [
                'create' => $request->user()->hasPermissionTo('society.create') || $request->user()->isSuperAdmin(),
                'update' => $request->user()->hasPermissionTo('society.update') || $request->user()->isSuperAdmin(),
                'delete' => $request->user()->hasPermissionTo('society.delete') || $request->user()->isSuperAdmin(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new society.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', Society::class);

        return Inertia::render('features/societies/pages/create');
    }

    /**
     * Store a newly created society.
     */
    public function store(SocietyRequest $request): RedirectResponse
    {
        $this->authorize('create', Society::class);

        $society = Society::create($request->validated());

        return redirect()
            ->route('societies.show', $society)
            ->with('success', 'Society registered successfully.');
    }

    /**
     * Display the specified society profile.
     */
    public function show(Request $request, Society $society): Response
    {
        $this->authorize('view', $society);

        $society->loadCount(['towers', 'users']);

        return Inertia::render('features/societies/pages/show', [
            'society' => $society,
            'can' => [
                'update' => $request->user()->can('update', $society),
                'delete' => $request->user()->can('delete', $society),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified society.
     */
    public function edit(Request $request, Society $society): Response
    {
        $this->authorize('update', $society);

        return Inertia::render('features/societies/pages/edit', [
            'society' => $society,
        ]);
    }

    /**
     * Update the specified society.
     */
    public function update(SocietyRequest $request, Society $society): RedirectResponse
    {
        $this->authorize('update', $society);

        $society->update($request->validated());

        return redirect()
            ->route('societies.show', $society)
            ->with('success', 'Society profile updated successfully.');
    }

    /**
     * Remove the specified society from storage.
     */
    public function destroy(Request $request, Society $society): RedirectResponse
    {
        $this->authorize('delete', $society);

        if ($society->towers()->exists() || $society->users()->exists()) {
            return redirect()
                ->route('societies.index')
                ->with('error', 'Cannot delete society with active towers or users.');
        }

        $society->delete();

        return redirect()
            ->route('societies.index')
            ->with('success', 'Society removed successfully.');
    }
}
