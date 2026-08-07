<?php

namespace App\Policies;

use App\Models\CctvCamera;
use App\Models\User;

class CctvCameraPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasPermissionTo('cctv.view');
    }

    public function view(User $user, CctvCamera $camera): bool
    {
        return $user->isSuperAdmin() || ($user->society_id === $camera->society_id && $user->hasPermissionTo('cctv.view'));
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasPermissionTo('cctv.create');
    }

    public function update(User $user, CctvCamera $camera): bool
    {
        return $user->isSuperAdmin() || ($user->society_id === $camera->society_id && $user->hasPermissionTo('cctv.update'));
    }

    public function delete(User $user, CctvCamera $camera): bool
    {
        return $user->isSuperAdmin() || ($user->society_id === $camera->society_id && $user->hasPermissionTo('cctv.delete'));
    }
}
