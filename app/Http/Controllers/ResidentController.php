<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\EnforcesEntitlements;
use App\Http\Requests\ResidentRequest;
use App\Models\Flat;
use App\Models\Resident;
use App\Services\ModuleQueryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ResidentController extends Controller
{
    use EnforcesEntitlements;

    public function __construct(private readonly ModuleQueryService $moduleQueryService)
    {
    }
    /**
     * Display a paginated, searchable list of residents.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Resident::class);

        $search = trim((string) $request->query('search', ''));

        $sortBy = in_array($request->string('sort_by', 'id'), ['name', 'created_at'], true)
            ? (string) $request->string('sort_by')
            : 'id';
        $sortDir = $request->string('sort_dir', 'desc') === 'asc' ? 'asc' : 'desc';

        $residents = Resident::query()
            ->with(['flat', 'flat.tower'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->whereLike('name', $search)
                        ->orWhereLike('email', $search)
                        ->orWhereLike('phone', $search)
                        ->orWhereHas('flat', fn ($query) => $query->whereLike('flat_no', $search));
                });
            })
            ->orderBy($sortBy, $sortDir)
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('features/residents/pages/index', [
            'residents' => $residents,
            'filters' => [
                'search' => $search,
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
            'can' => [
                'create' => $request->user()->hasPermissionTo('resident.create'),
                'delete' => $request->user()->hasPermissionTo('resident.delete'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resident.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', Resident::class);

        return Inertia::render('features/residents/pages/create', [
            'flats' => $this->moduleQueryService->flatOptions($request->user()),
        ]);
    }

    /**
     * Store a newly created resident.
     */
    public function store(ResidentRequest $request): RedirectResponse
    {
        $this->authorize('create', Resident::class);

        $this->enforceEntitlement('residents');

        $flat = Flat::findOrFail($request->integer('flat_id'));

        Resident::create([
            ...$request->validated(),
            'society_id' => $request->user()->society_id ?? $flat->society_id,
            'is_primary_contact' => $request->boolean('is_primary_contact'),
        ]);

        return redirect()
            ->route('residents.index')
            ->with('success', 'Resident added successfully.');
    }

    /**
     * Show the form for editing a resident.
     */
    public function edit(Request $request, Resident $resident): Response
    {
        $this->authorize('update', $resident);

        return Inertia::render('features/residents/pages/edit', [
            'resident' => $resident->load('flat', 'flat.tower'),
            'flats' => $this->moduleQueryService->flatOptions($request->user()),
        ]);
    }

    /**
     * Update the specified resident.
     */
    public function update(ResidentRequest $request, Resident $resident): RedirectResponse
    {
        $this->authorize('update', $resident);

        $resident->update([
            ...$request->validated(),
            'is_primary_contact' => $request->boolean('is_primary_contact'),
        ]);

        return redirect()
            ->route('residents.index')
            ->with('success', 'Resident updated successfully.');
    }

    /**
     * Remove (soft-delete) the specified resident.
     */
    public function destroy(Request $request, Resident $resident): RedirectResponse
    {
        $this->authorize('delete', $resident);

        $resident->delete();

        return redirect()
            ->route('residents.index')
            ->with('success', 'Resident removed successfully.');
    }

}
