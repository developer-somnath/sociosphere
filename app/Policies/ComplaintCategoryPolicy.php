<?php

namespace App\Policies;

use App\Models\ComplaintCategory;
use App\Models\User;

class ComplaintCategoryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasPermissionTo('complaint.view');
    }

    public function view(User $user, ComplaintCategory $category): bool
    {
        return $user->isSuperAdmin()
            || ($user->society_id === $category->society_id && $user->hasPermissionTo('complaint.view'));
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasPermissionTo('complaint.create');
    }

    public function update(User $user, ComplaintCategory $category): bool
    {
        return $user->isSuperAdmin()
            || ($user->society_id === $category->society_id && $user->hasPermissionTo('complaint.update'));
    }

    public function delete(User $user, ComplaintCategory $category): bool
    {
        return $user->isSuperAdmin()
            || ($user->society_id === $category->society_id && $user->hasPermissionTo('complaint.delete'));
    }
}
