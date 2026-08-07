<?php

namespace App\Policies;

use App\Models\ParkingSlot;
use App\Models\User;

class ParkingSlotPolicy
{
    /**
     * Determine whether the user can list parking slots.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('parking.view');
    }

    /**
     * Determine whether the user can view a parking slot.
     */
    public function view(User $user, ParkingSlot $slot): bool
    {
        return $user->isSuperAdmin() || $user->society_id === $slot->society_id;
    }

    /**
     * Determine whether the user can create parking slots.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('parking.create');
    }

    /**
     * Determine whether the user can update a parking slot.
     */
    public function update(User $user, ParkingSlot $slot): bool
    {
        return $this->view($user, $slot) && $user->hasPermissionTo('parking.update');
    }

    /**
     * Determine whether the user can delete a parking slot.
     */
    public function delete(User $user, ParkingSlot $slot): bool
    {
        return $this->view($user, $slot) && $user->hasPermissionTo('parking.delete');
    }

    /**
     * Determine whether the user can allocate/deallocate a parking slot.
     */
    public function allocate(User $user, ParkingSlot $slot): bool
    {
        return $this->view($user, $slot) && $user->hasPermissionTo('parking.allocate');
    }
}
