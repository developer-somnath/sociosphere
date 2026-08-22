<?php

namespace App\Policies;

use App\Models\FamilyMember;
use App\Models\User;

class FamilyMemberPolicy
{
    public function viewAny(User $user, ?FamilyMember $familyMember = null): bool
    {
        return $user->hasPermissionTo('resident.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('resident.update');
    }

    public function update(User $user, FamilyMember $familyMember): bool
    {
        return $user->isSuperAdmin() || $user->society_id === $familyMember->society_id;
    }

    public function delete(User $user, FamilyMember $familyMember): bool
    {
        return $user->isSuperAdmin() || $user->society_id === $familyMember->society_id;
    }
}
