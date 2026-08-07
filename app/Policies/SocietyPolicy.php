<?php

namespace App\Policies;

use App\Models\Society;
use App\Models\User;

class SocietyPolicy
{
    /**
     * Determine whether the user can view any societies.
     */
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasPermissionTo('society.view');
    }

    /**
     * Determine whether the user can view the specific society.
     */
    public function view(User $user, Society $society): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->hasPermissionTo('society.view') && $user->society_id === $society->id;
    }

    /**
     * Determine whether the user can create a society.
     */
    public function create(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasPermissionTo('society.create');
    }

    /**
     * Determine whether the user can update the society.
     */
    public function update(User $user, Society $society): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->hasPermissionTo('society.update') && $user->society_id === $society->id;
    }

    /**
     * Determine whether the user can delete the society.
     */
    public function delete(User $user, Society $society): bool
    {
        return $user->isSuperAdmin() || $user->hasPermissionTo('society.delete');
    }

    /**
     * Determine whether the user can restore the society.
     */
    public function restore(User $user, Society $society): bool
    {
        return $user->isSuperAdmin();
    }
}
