<?php

namespace App\Policies;

use App\Models\Invoice;
use App\Models\User;

class InvoicePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasPermissionTo('invoice.view');
    }

    public function view(User $user, Invoice $invoice): bool
    {
        return $user->isSuperAdmin() || ($user->society_id === $invoice->society_id && $user->hasPermissionTo('invoice.view'));
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasPermissionTo('invoice.create');
    }

    public function update(User $user, Invoice $invoice): bool
    {
        return $user->isSuperAdmin() || ($user->society_id === $invoice->society_id && $user->hasPermissionTo('invoice.update'));
    }

    public function delete(User $user, Invoice $invoice): bool
    {
        return $user->isSuperAdmin() || ($user->society_id === $invoice->society_id && $user->hasPermissionTo('invoice.delete'));
    }
}
