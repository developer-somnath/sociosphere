<?php

namespace App\Policies;

use App\Models\Complaint;
use App\Models\User;

class ComplaintPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasPermissionTo('complaint.view');
    }

    public function view(User $user, Complaint $complaint): bool
    {
        return $user->isSuperAdmin()
            || ($user->society_id === $complaint->society_id && $user->hasPermissionTo('complaint.view'));
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasPermissionTo('complaint.create');
    }

    public function update(User $user, Complaint $complaint): bool
    {
        return $user->isSuperAdmin()
            || ($user->society_id === $complaint->society_id && $user->hasPermissionTo('complaint.update'));
    }

    public function delete(User $user, Complaint $complaint): bool
    {
        return $user->isSuperAdmin()
            || ($user->society_id === $complaint->society_id && $user->hasPermissionTo('complaint.delete'));
    }

    /**
     * Determine if the user can assign a complaint to staff.
     */
    public function assign(User $user, Complaint $complaint): bool
    {
        return $user->isSuperAdmin()
            || ($user->society_id === $complaint->society_id && $user->hasPermissionTo('complaint.update'));
    }
}
