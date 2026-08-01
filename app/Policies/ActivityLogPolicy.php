<?php

namespace App\Policies;

use App\Models\ActivityLog;
use App\Models\User;

class ActivityLogPolicy
{
    /**
     * Determine whether the user can view the audit trail.
     *
     * Audit logs are sensitive; only users explicitly granted the
     * activity-log.view permission (super admins, society admins) may
     * browse or export them.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('activity-log.view');
    }

    /**
     * Determine whether the user can view a single log record.
     */
    public function view(User $user, ActivityLog $activityLog): bool
    {
        return $this->viewAny($user);
    }
}
