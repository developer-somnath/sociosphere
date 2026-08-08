<?php

namespace App\Policies;

use App\Models\Subscription;
use App\Models\User;

class SubscriptionPolicy
{
    /**
     * Platform admins see everything. Otherwise the society context matters:
     * the viewer must belong to the same society as the subscription.
     */
    public function view(?User $user, ?Subscription $subscription = null): bool
    {
        if ($user === null) {
            return false;
        }

        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($subscription !== null && $user->society_id !== $subscription->society_id) {
            return false;
        }

        return $user->hasPermissionTo('subscription.view');
    }

    /**
     * Assigning / managing plans is a platform-level capability.
     */
    public function manage(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasPermissionTo('subscription.assign');
    }
}
