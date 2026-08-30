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
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->society_id !== $invoice->society_id || ! $user->hasPermissionTo('invoice.view')) {
            return false;
        }

        // If user is solely a resident, verify invoice belongs to their assigned flat(s)
        if ($user->hasRole('Resident') && ! $user->hasAnyRole(['SuperAdmin', 'SocietyAdmin', 'Treasurer', 'Accountant'])) {
            $userFlatIds = \App\Models\Resident::query()
                ->where('email', $user->email)
                ->pluck('flat_id')
                ->filter()
                ->toArray();

            return in_array($invoice->flat_id, $userFlatIds, true);
        }

        return true;
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
