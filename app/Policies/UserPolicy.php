<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine whether the user can list users.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('user.view');
    }

    /**
     * Determine whether the user can view a user.
     */
    public function view(User $user, User $model): bool
    {
        return $user->isSuperAdmin() || $user->society_id === $model->society_id;
    }

    /**
     * Determine whether the user can create users.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('user.create');
    }

    /**
     * Determine whether the user can update a user.
     */
    public function update(User $user, User $model): bool
    {
        return $this->view($user, $model)
            && $user->hasPermissionTo('user.update');
    }

    /**
     * Determine whether the user can delete a user.
     *
     * Users cannot remove their own account, and only users with the
     * user.delete permission (super admins) may remove accounts.
     */
    public function delete(User $user, User $model): bool
    {
        if ($user->id === $model->id) {
            return false;
        }

        if (! $user->hasPermissionTo('user.delete')) {
            return false;
        }

        return $this->update($user, $model);
    }

    /**
     * Determine whether the user can invite new users.
     */
    public function invite(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasPermissionTo('user.invite');
    }

    /**
     * Determine whether the user can restore a soft-deleted user.
     */
    public function restore(User $user, User $model): bool
    {
        return $user->isSuperAdmin() || ($user->society_id === $model->society_id && $user->hasPermissionTo('user.restore'));
    }

    /**
     * Determine whether the user can toggle a user's active status.
     */
    public function toggleStatus(User $user, User $model): bool
    {
        if ($user->id === $model->id) {
            return false;
        }

        return $this->update($user, $model) || $user->hasPermissionTo('user.toggle-status');
    }
}
