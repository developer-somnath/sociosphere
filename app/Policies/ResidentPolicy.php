<?php

namespace App\Policies;

use App\Models\Resident;
use App\Models\User;

class ResidentPolicy
{
    /**
     * Determine whether the user can list residents.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('resident.view');
    }

    /**
     * Determine whether the user can view a resident.
     */
    public function view(User $user, Resident $resident): bool
    {
        return $user->isSuperAdmin() || $user->society_id === $resident->society_id;
    }

    /**
     * Determine whether the user can create residents.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('resident.create');
    }

    /**
     * Determine whether the user can update a resident.
     */
    public function update(User $user, Resident $resident): bool
    {
        return $this->view($user, $resident)
            && $user->hasPermissionTo('resident.update');
    }

    /**
     * Determine whether the user can delete a resident.
     */
    public function delete(User $user, Resident $resident): bool
    {
        return $this->view($user, $resident)
            && $user->hasPermissionTo('resident.delete');
    }
}
