<?php

namespace App\Http\Controllers;

use App\Http\Requests\VehicleRequest;
use App\Models\Resident;
use App\Models\Vehicle;
use Illuminate\Http\RedirectResponse;

class VehicleController extends Controller
{
    /**
     * Store a new vehicle for the given resident.
     */
    public function store(VehicleRequest $request, Resident $resident): RedirectResponse
    {
        $this->authorize('create', Vehicle::class);
        $this->authorize('update', $resident);

        $resident->vehicles()->create([
            ...$request->validated(),
            'society_id' => $resident->society_id,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()
            ->route('residents.edit', $resident->uuid)
            ->with('success', 'Vehicle added successfully.');
    }

    /**
     * Update the specified vehicle.
     */
    public function update(VehicleRequest $request, Resident $resident, Vehicle $vehicle): RedirectResponse
    {
        $this->authorize('update', $vehicle);

        $vehicle->update([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active', $vehicle->is_active),
        ]);

        return redirect()
            ->route('residents.edit', $resident->uuid)
            ->with('success', 'Vehicle updated successfully.');
    }

    /**
     * Remove the specified vehicle.
     */
    public function destroy(Request $request, Resident $resident, Vehicle $vehicle): RedirectResponse
    {
        $this->authorize('delete', $vehicle);

        $vehicle->delete();

        return redirect()
            ->route('residents.edit', $resident->uuid)
            ->with('success', 'Vehicle removed successfully.');
    }
}
