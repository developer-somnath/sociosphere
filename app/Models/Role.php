<?php

namespace App\Models;

use App\Models\Traits\HasPublicUuid;
use App\Models\Traits\LogsActivity;
use Spatie\Permission\Models\Role as SpatieRole;

/**
 * Application role. Extends the spatie Role model with a public uuid
 * (used as the route key) and role-management metadata.
 */
class Role extends SpatieRole
{
    use HasPublicUuid;
    use LogsActivity;

    protected $fillable = [
        'name',
        'guard_name',
        'description',
    ];

    protected $casts = [
        'is_system' => 'boolean',
    ];

    /**
     * Whether this is one of the built-in seeded roles.
     */
    public function isSystem(): bool
    {
        return (bool) $this->is_system;
    }
}
