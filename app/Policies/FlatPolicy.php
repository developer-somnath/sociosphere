<?php

namespace App\Policies;

use App\Models\Flat;
use App\Models\User;

class FlatPolicy
{
    /**
     * Determine whether the user can list flats.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('flat.view');
    }

    /**
     * Determine whether the user can view a flat.
     */
    public function view(User $user, Flat $flat): bool
    {
        return $user->isSuperAdmin() || $user->society_id === $flat->society_id;
    }

    /**
     * Determine whether the user can create flats.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('flat.create');
    }

    /**
     * Determine whether the user can update a flat.
     */
    public function update(User $user, Flat $flat): bool
    {
        return $this->view($user, $flat)
            && $user->hasPermissionTo('flat.update');
    }

    /**
     * Determine whether the user can delete a flat.
     *
     * Flats with residents attached cannot be deleted (safeguard).
     */
    public function delete(User $user, Flat $flat): bool
    {
        if ($flat->residents()->exists()) {
            return false;
        }

        return $this->update($user, $flat);
    }

    /**
     * Determine whether the user can restore a soft-deleted flat.
     */
    public function restore(User $user, Flat $flat): bool
    {
        return $user->isSuperAdmin() || ($user->society_id === $flat->society_id && $user->hasPermissionTo('flat.update'));
    }
}
