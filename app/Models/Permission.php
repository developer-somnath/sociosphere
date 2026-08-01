<?php

namespace App\Models;

use Spatie\Permission\Models\Permission as SpatiePermission;

/**
 * Application permission. Extends the spatie Permission model so the
 * rest of the application can type-hint a first-party model.
 */
class Permission extends SpatiePermission
{
}
