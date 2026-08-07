<?php

namespace App\Policies;

use App\Models\Notice;
use App\Models\User;

class NoticePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasPermissionTo('notice.view');
    }

    public function view(User $user, Notice $notice): bool
    {
        return $user->isSuperAdmin()
            || ($user->society_id === $notice->society_id && $user->hasPermissionTo('notice.view'));
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasPermissionTo('notice.create');
    }

    public function update(User $user, Notice $notice): bool
    {
        return $user->isSuperAdmin()
            || ($user->society_id === $notice->society_id && $user->hasPermissionTo('notice.update'));
    }

    public function delete(User $user, Notice $notice): bool
    {
        return $user->isSuperAdmin()
            || ($user->society_id === $notice->society_id && $user->hasPermissionTo('notice.delete'));
    }

    /**
     * Determine if the user can acknowledge a notice.
     */
    public function acknowledge(User $user, Notice $notice): bool
    {
        return $user->isSuperAdmin()
            || ($user->society_id === $notice->society_id && $user->hasPermissionTo('notice.view'));
    }
}