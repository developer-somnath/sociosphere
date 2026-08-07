<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;

class PaymentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasPermissionTo('collection.view');
    }

    public function view(User $user, Payment $payment): bool
    {
        return $user->isSuperAdmin() || ($user->society_id === $payment->society_id && $user->hasPermissionTo('collection.view'));
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasPermissionTo('collection.create');
    }
}
