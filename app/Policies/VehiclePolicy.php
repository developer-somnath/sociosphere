<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Vehicle;

class VehiclePolicy
{
    public function viewAny(User $user, ?Vehicle $vehicle = null): bool
    {
        return $user->hasPermissionTo('resident.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('resident.update');
    }

    public function update(User $user, Vehicle $vehicle): bool
    {
        return $user->isSuperAdmin() || $user->society_id === $vehicle->society_id;
    }

    public function delete(User $user, Vehicle $vehicle): bool
    {
        return $user->isSuperAdmin() || $user->society_id === $vehicle->society_id;
    }
}
