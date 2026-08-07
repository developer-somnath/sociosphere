<?php

namespace App\Policies;

use App\Models\SecurityLog;
use App\Models\User;

class SecurityLogPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasPermissionTo('security_log.view');
    }

    public function view(User $user, SecurityLog $log): bool
    {
        return $user->isSuperAdmin() || ($user->society_id === $log->society_id && $user->hasPermissionTo('security_log.view'));
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasPermissionTo('security_log.create');
    }
}
