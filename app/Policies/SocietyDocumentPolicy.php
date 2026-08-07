<?php

namespace App\Policies;

use App\Models\SocietyDocument;
use App\Models\User;

class SocietyDocumentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasPermissionTo('document.view');
    }

    public function view(User $user, SocietyDocument $document): bool
    {
        return $user->isSuperAdmin()
            || ($user->society_id === $document->society_id && $user->hasPermissionTo('document.view'));
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasPermissionTo('document.create');
    }

    public function update(User $user, SocietyDocument $document): bool
    {
        return $user->isSuperAdmin()
            || ($user->society_id === $document->society_id && $user->hasPermissionTo('document.update'));
    }

    public function delete(User $user, SocietyDocument $document): bool
    {
        return $user->isSuperAdmin()
            || ($user->society_id === $document->society_id && $user->hasPermissionTo('document.delete'));
    }

    /**
     * Determine if the user can download a document.
     */
    public function download(User $user, SocietyDocument $document): bool
    {
        if ($document->is_public) {
            return true;
        }

        return $user->isSuperAdmin()
            || ($user->society_id === $document->society_id && $user->hasPermissionTo('document.view'));
    }
}