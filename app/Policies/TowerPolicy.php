<?php

namespace App\Policies;

use App\Models\Tower;
use App\Models\User;

class TowerPolicy
{
    /**
     * Determine whether the user can list towers.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('tower.view');
    }

    /**
     * Determine whether the user can view a tower.
     */
    public function view(User $user, Tower $tower): bool
    {
        return $user->isSuperAdmin() || $user->society_id === $tower->society_id;
    }

    /**
     * Determine whether the user can create towers.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('tower.create');
    }

    /**
     * Determine whether the user can update a tower.
     */
    public function update(User $user, Tower $tower): bool
    {
        return $this->view($user, $tower)
            && $user->hasPermissionTo('tower.update');
    }

    /**
     * Determine whether the user can delete a tower.
     *
     * Towers with flats attached cannot be deleted (safeguard).
     */
    public function delete(User $user, Tower $tower): bool
    {
        if ($tower->flats()->exists()) {
            return false;
        }

        return $this->update($user, $tower);
    }
}
