<?php

namespace App\Policies;

use App\Models\AmenityBooking;
use App\Models\User;

class AmenityBookingPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasPermissionTo('amenity.view');
    }

    public function view(User $user, AmenityBooking $booking): bool
    {
        return $user->isSuperAdmin()
            || ($user->society_id === $booking->society_id && $user->hasPermissionTo('amenity.view'));
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasPermissionTo('amenity.book');
    }

    public function approve(User $user, AmenityBooking $booking): bool
    {
        return $user->isSuperAdmin()
            || ($user->society_id === $booking->society_id && $user->hasPermissionTo('amenity.approve'));
    }

    public function cancel(User $user, AmenityBooking $booking): bool
    {
        return $user->isSuperAdmin()
            || ($user->society_id === $booking->society_id && ($user->hasPermissionTo('amenity.approve') || $user->hasPermissionTo('amenity.book')));
    }
}
