<?php

namespace App\Policies;

use App\Models\Role;
use App\Models\User;

class RolePolicy
{
    /**
     * Determine whether the user can list roles.
     */
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasPermissionTo('role.view');
    }

    /**
     * Determine whether the user can view a role.
     */
    public function view(User $user, Role $role): bool
    {
        return $this->viewAny($user);
    }

    /**
     * Determine whether the user can create roles.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('role.create');
    }

    /**
     * Determine whether the user can update a role.
     *
     * The built-in SuperAdmin role is immutable: it always carries every
     * permission and is the safety net for the whole system.
     */
    public function update(User $user, Role $role): bool
    {
        if ($role->name === 'SuperAdmin') {
            return false;
        }

        return $user->hasPermissionTo('role.update');
    }

    /**
     * Determine whether the user can delete a role.
     *
     * System roles (the seeded built-ins) cannot be removed.
     */
    public function delete(User $user, Role $role): bool
    {
        if ($role->isSystem()) {
            return false;
        }

        return $user->hasPermissionTo('role.delete');
    }
}
