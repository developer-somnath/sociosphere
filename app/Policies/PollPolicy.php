<?php

namespace App\Policies;

use App\Models\Poll;
use App\Models\User;

class PollPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasPermissionTo('poll.view');
    }

    public function view(User $user, Poll $poll): bool
    {
        return $user->isSuperAdmin()
            || ($user->society_id === $poll->society_id && $user->hasPermissionTo('poll.view'));
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasPermissionTo('poll.create');
    }

    public function update(User $user, Poll $poll): bool
    {
        return $user->isSuperAdmin()
            || ($user->society_id === $poll->society_id && $user->hasPermissionTo('poll.update'));
    }

    public function delete(User $user, Poll $poll): bool
    {
        return $user->isSuperAdmin()
            || ($user->society_id === $poll->society_id && $user->hasPermissionTo('poll.delete'));
    }

    public function vote(User $user, Poll $poll): bool
    {
        if ($poll->isClosed()) {
            return false;
        }

        return $user->isSuperAdmin()
            || ($user->society_id === $poll->society_id && $user->hasPermissionTo('poll.vote'));
    }
}
