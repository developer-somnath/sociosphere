<?php

namespace App\Policies;

use App\Models\Amenity;
use App\Models\User;

class AmenityPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasPermissionTo('amenity.view');
    }

    public function view(User $user, Amenity $amenity): bool
    {
        return $user->isSuperAdmin()
            || ($user->society_id === $amenity->society_id && $user->hasPermissionTo('amenity.view'));
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasPermissionTo('amenity.create');
    }

    public function update(User $user, Amenity $amenity): bool
    {
        return $user->isSuperAdmin()
            || ($user->society_id === $amenity->society_id && $user->hasPermissionTo('amenity.update'));
    }

    public function delete(User $user, Amenity $amenity): bool
    {
        return $user->isSuperAdmin()
            || ($user->society_id === $amenity->society_id && $user->hasPermissionTo('amenity.delete'));
    }
}
