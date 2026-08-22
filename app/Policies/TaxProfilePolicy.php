<?php

namespace App\Policies;

use App\Models\TaxProfile;
use App\Models\User;

class TaxProfilePolicy
{
    /**
     * Determine whether the user can view tax settings.
     */
    public function view(User $user, TaxProfile $profile): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->society_id === $profile->society_id
            && ($user->hasPermissionTo('tax.view') || $user->hasRole(['SocietyAdmin', 'Treasurer']));
    }

    /**
     * Determine whether the user can update tax settings.
     */
    public function update(User $user, TaxProfile $profile): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->society_id === $profile->society_id
            && ($user->hasPermissionTo('tax.update') || $user->hasRole(['SocietyAdmin', 'Treasurer']));
    }
}
