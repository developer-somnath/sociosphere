<?php

namespace App\Policies;

use App\Models\SubscriptionPlan;
use App\Models\User;

class SubscriptionPlanPolicy
{
    /**
     * Plans are a platform-wide catalog — anyone with the plan.view
     * permission can list them; SuperAdmin always can.
     */
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasPermissionTo('plan.view');
    }

    public function view(User $user, SubscriptionPlan $plan): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasPermissionTo('plan.create');
    }

    public function update(User $user, SubscriptionPlan $plan): bool
    {
        return $user->isSuperAdmin() || $user->hasPermissionTo('plan.update');
    }

    public function delete(User $user, SubscriptionPlan $plan): bool
    {
        // The default plan cannot be deleted — it is the fallback for
        // societies without a live subscription.
        return ! $plan->is_default && ($user->isSuperAdmin() || $user->hasPermissionTo('plan.delete'));
    }
}
