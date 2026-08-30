<?php

namespace App\Policies;

use App\Models\CommunityEvent;
use App\Models\User;

class CommunityEventPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasPermissionTo('event.view');
    }

    public function view(User $user, CommunityEvent $event): bool
    {
        return $user->isSuperAdmin()
            || ($user->society_id === $event->society_id && $user->hasPermissionTo('event.view'));
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasPermissionTo('event.create');
    }

    public function update(User $user, CommunityEvent $event): bool
    {
        return $user->isSuperAdmin()
            || ($user->society_id === $event->society_id && $user->hasPermissionTo('event.update'));
    }

    public function delete(User $user, CommunityEvent $event): bool
    {
        return $user->isSuperAdmin()
            || ($user->society_id === $event->society_id && $user->hasPermissionTo('event.delete'));
    }

    public function rsvp(User $user, CommunityEvent $event): bool
    {
        return $user->isSuperAdmin()
            || ($user->society_id === $event->society_id && $user->hasPermissionTo('event.rsvp'));
    }
}
