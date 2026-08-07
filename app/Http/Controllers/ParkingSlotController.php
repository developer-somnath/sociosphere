<?php

namespace App\Http\Controllers;

use App\Http\Requests\AllocateParkingSlotRequest;
use App\Http\Requests\ParkingSlotRequest;
use App\Models\Flat;
use App\Models\ParkingSlot;
use App\Models\Tower;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ParkingSlotController extends Controller
{
    /**
     * Display the parking overview: stats, category counts, the visual slot
     * map (all slots), and the flats available for allocation.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ParkingSlot::class);

        $slots = ParkingSlot::query()
            ->with(['tower', 'flat.resident'])
            ->orderByRaw("CASE type WHEN 'Four Wheeler' THEN 0 WHEN 'Two Wheeler' THEN 1 WHEN 'Visitor' THEN 2 ELSE 3 END")
            ->orderBy('slot_number')
            ->get();

        $stats = [
            'total' => $slots->count(),
            'four_wheeler' => $slots->where('type', 'Four Wheeler')->count(),
            'two_wheeler' => $slots->where('type', 'Two Wheeler')->count(),
            'visitor' => $slots->where('type', 'Visitor')->count(),
            'allocated' => $slots->where('status', 'Allocated')->count(),
            'available' => $slots->where('status', 'Available')->count(),
            'reserved' => $slots->where('status', 'Reserved')->count(),
            'maintenance' => $slots->where('status', 'Maintenance')->count(),
        ];

        $flats = Flat::query()
            ->with(['tower', 'resident'])
            ->orderBy('flat_no')
            ->get(['id', 'flat_no', 'tower_id', 'society_id'])
            ->map(fn (Flat $flat) => [
                'id' => $flat->id,
                'flat_no' => $flat->flat_no,
                'tower_name' => $flat->tower?->name,
                'resident_name' => $flat->resident?->name,
            ])
            ->values();

        return Inertia::render('features/parking/pages/index', [
            'slots' => $slots,
            'flats' => $flats,
            'stats' => $stats,
            'can' => [
                'create' => $request->user()->hasPermissionTo('parking.create'),
                'delete' => $request->user()->hasPermissionTo('parking.delete'),
                'allocate' => $request->user()->hasPermissionTo('parking.allocate'),
            ],
        ]);
    }

    /**
     * Show form for creating a new parking slot.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', ParkingSlot::class);

        return Inertia::render('features/parking/pages/create', [
            'towers' => Tower::orderBy('name')->get(['id', 'name']),
            'flats' => Flat::orderBy('flat_no')->get(['id', 'flat_no', 'tower_id']),
        ]);
    }

    /**
     * Store a newly created parking slot.
     */
    public function store(ParkingSlotRequest $request): RedirectResponse
    {
        $this->authorize('create', ParkingSlot::class);

        $societyId = $request->user()->society_id ?? society_id();

        if (! $societyId) {
            return redirect()
                ->back()
                ->with('error', 'Please select a society before creating a parking slot.');
        }

        ParkingSlot::create([
            ...$request->validated(),
            'society_id' => $societyId,
        ]);

        return redirect()
            ->route('parking-slots.index')
            ->with('success', 'Parking slot added successfully.');
    }

    /**
     * Show form for editing a parking slot.
     */
    public function edit(Request $request, ParkingSlot $parkingSlot): Response
    {
        $this->authorize('update', $parkingSlot);

        $parkingSlot->load(['tower', 'flat']);

        return Inertia::render('features/parking/pages/edit', [
            'slot' => $parkingSlot,
            'towers' => Tower::orderBy('name')->get(['id', 'name']),
            'flats' => Flat::orderBy('flat_no')->get(['id', 'flat_no', 'tower_id']),
        ]);
    }

    /**
     * Update the specified parking slot.
     */
    public function update(ParkingSlotRequest $request, ParkingSlot $parkingSlot): RedirectResponse
    {
        $this->authorize('update', $parkingSlot);

        $parkingSlot->update($request->validated());

        return redirect()
            ->route('parking-slots.index')
            ->with('success', 'Parking slot updated successfully.');
    }

    /**
     * Deallocate the parking slot.
     */
    public function deallocate(Request $request, ParkingSlot $parkingSlot): RedirectResponse
    {
        $this->authorize('allocate', $parkingSlot);

        $parkingSlot->update([
            'flat_id' => null,
            'status' => 'Available',
            'vehicle_number' => null,
            'vehicle_model' => null,
            'rfid_tag' => null,
            'expires_at' => null,
            'notes' => null,
        ]);

        return redirect()
            ->route('parking-slots.index')
            ->with('success', 'Parking slot deallocated successfully.');
    }

    /**
     * Allocate a parking slot to a flat (allocation drawer flow).
     */
    public function allocate(AllocateParkingSlotRequest $request, ParkingSlot $parkingSlot): RedirectResponse
    {
        $this->authorize('allocate', $parkingSlot);

        $parkingSlot->update([
            ...$request->validated(),
            'status' => 'Allocated',
        ]);

        return redirect()
            ->route('parking-slots.index')
            ->with('success', "Parking slot {$parkingSlot->slot_number} allocated successfully.");
    }

    /**
     * Remove (soft-delete) the specified parking slot.
     */
    public function destroy(Request $request, ParkingSlot $parkingSlot): RedirectResponse
    {
        $this->authorize('delete', $parkingSlot);

        $parkingSlot->delete();

        return redirect()
            ->route('parking-slots.index')
            ->with('success', 'Parking slot removed successfully.');
    }
}
