<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Flat;
use App\Models\Tower;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class FlatController extends Controller
{
    /**
     * Flats Listing Page
     */
    public function index(Request $request)
    {

        $query = Flat::query()
            ->with([
                'tower',
                'resident',
                'society'
            ]);

        /**
         * Search
         */
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('flat_no', 'ILIKE', "%{$search}%")
                    ->orWhereHas('tower', function ($tower) use ($search) {
                        $tower->where('name', 'ILIKE', "%{$search}%");
                    })
                    ->orWhereHas('resident', function ($resident) use ($search) {
                        $resident->where('name', 'ILIKE', "%{$search}%");
                    });
            });
        }

        /**
         * Tower Filter
         */
        if ($request->filled('tower_id')) {
            $query->whereHas('tower', function ($tower) use ($request) {
                $tower->where('uuid', $request->tower_id);
            });
        }

        /**
         * Status Filter
         */
        if ($request->filled('status') && in_array($request->status, ['Occupied', 'Vacant', 'Self-Occupied'])) {
            $query->where('occupancy_status', $request->status);
        }
        $flats = $query
            ->latest()
            ->paginate(10)
            ->withQueryString();
        /**
         * Stats
         */
        $totalUnits = Flat::count();

        $occupiedUnits = Flat::where('occupancy_status', 'Occupied')->count();

        $vacantUnits = Flat::where('occupancy_status', 'Vacant')->count();

        $occupancyRate = $totalUnits > 0
            ? round(($occupiedUnits / $totalUnits) * 100, 1)
            : 0;

        return Inertia::render('Features/Flats/Pages/Index', [
            'flats' => $flats,

            'filters' => [
                'search' => $request->search,
                'tower_id' => $request->tower_id,
                'status' => $request->status,
            ],

            'towers' => Tower::select(
                'id',
                'uuid',
                'name'
            )->get(),

            'stats' => [
                'total_units' => $totalUnits,
                'occupied_units' => $occupiedUnits,
                'vacant_units' => $vacantUnits,
                'occupancy_rate' => $occupancyRate,
            ]
        ]);
    }

    /**
     * Create Page
     */
    public function create()
    {
        return Inertia::render('Features/Flats/Pages/Create', [
            'towers' => Tower::select(
                'id',
                'name'
            )->get()
        ]);
    }

    /**
     * Store Flat
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'flat_number' => [
                'required',
                'string',
                'max:50'
            ],

            'tower_id' => [
                'nullable',
                'exists:towers,id'
            ],

            'floor' => [
                'nullable',
                'string',
                'max:50'
            ],

            'type' => [
                'required',
                'string'
            ],

            'status' => [
                'required',
                'string'
            ],

            'area_sqft' => [
                'nullable',
                'numeric'
            ],
        ]);

        Flat::create($validated);

        return redirect()
            ->route('flats.index')
            ->with('success', 'Flat created successfully.');
    }

    /**
     * Edit Page
     */
    public function edit(Flat $flat)
    {
        $flat->load([
            'tower',
            'resident'
        ]);

        return Inertia::render('Features/Flats/Pages/Edit', [
            'flat' => $flat,

            'towers' => Tower::select(
                'id',
                'name'
            )->get()
        ]);
    }

    /**
     * Update Flat
     */
    public function update(
        Request $request,
        Flat $flat
    ) {
        $validated = $request->validate([
            'flat_number' => [
                'required',
                'string',
                'max:50'
            ],

            'tower_id' => [
                'nullable',
                'exists:towers,id'
            ],

            'floor' => [
                'nullable',
                'string',
                'max:50'
            ],

            'type' => [
                'required',
                'string'
            ],

            'status' => [
                'required',
                'string'
            ],

            'area_sqft' => [
                'nullable',
                'numeric'
            ],
        ]);

        $flat->update($validated);

        return redirect()
            ->route('flats.index')
            ->with('success', 'Flat updated successfully.');
    }

    /**
     * Delete Flat
     */
    public function destroy(Flat $flat)
    {
        $flat->delete();

        return redirect()
            ->route('flats.index')
            ->with('success', 'Flat deleted successfully.');
    }
}
