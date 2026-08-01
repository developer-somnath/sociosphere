<?php

namespace App\Policies;

use App\Models\User;
use App\Models\VisitorPass;

class VisitorPassPolicy
{
    /**
     * Determine whether the user can list visitor passes.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('visitor.view');
    }

    /**
     * Determine whether the user can view a visitor pass.
     */
    public function view(User $user, VisitorPass $visitorPass): bool
    {
        return $user->isSuperAdmin() || $user->society_id === $visitorPass->society_id;
    }

    /**
     * Determine whether the user can create visitor passes.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('visitor.create');
    }

    /**
     * Determine whether the user can update a visitor pass (including
     * lifecycle actions such as approve / reject / check-in / check-out).
     */
    public function update(User $user, VisitorPass $visitorPass): bool
    {
        return $this->view($user, $visitorPass)
            && $user->hasPermissionTo('visitor.update');
    }

    /**
     * Determine whether the user can delete a visitor pass.
     *
     * Restricted to users holding the visitor.delete permission (super
     * admins); passes that have left the pending state cannot be removed.
     */
    public function delete(User $user, VisitorPass $visitorPass): bool
    {
        if (! $visitorPass->isPending()) {
            return false;
        }

        return $this->view($user, $visitorPass)
            && $user->hasPermissionTo('visitor.delete');
    }
}
