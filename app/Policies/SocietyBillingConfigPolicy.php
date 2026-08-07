<?php

namespace App\Policies;

use App\Models\SocietyBillingConfig;
use App\Models\User;

class SocietyBillingConfigPolicy
{
    /**
     * Anyone with billing.configure (or billing.run for previews) may inspect
     * billing tooling.
     */
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin()
            || $user->hasPermissionTo('billing.configure')
            || $user->hasPermissionTo('billing.run');
    }

    /**
     * Running a billing batch requires the billing.run permission.
     */
    public function create(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasPermissionTo('billing.run');
    }

    /**
     * Updating the billing configuration requires the billing.configure permission.
     */
    public function update(User $user, SocietyBillingConfig $config): bool
    {
        return $user->isSuperAdmin()
            || ($user->society_id === $config->society_id && $user->hasPermissionTo('billing.configure'));
    }
}
