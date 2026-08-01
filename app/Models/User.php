<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use App\Models\Traits\HasPublicUuid;
use App\Models\Traits\LogsActivity;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles, HasPublicUuid, LogsActivity, SoftDeletes;

    protected $fillable = [
        'society_id',
        'name',
        'email',
        'phone',
        'password',
        'last_login_at',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_login_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function society()
    {
        return $this->belongsTo(Society::class);
    }

    /**
     * Determine whether the user holds the global SuperAdmin role.
     */
    public function isSuperAdmin(): bool
    {
        return $this->hasRole('SuperAdmin');
    }

    /**
     * Determine whether the user administers a society.
     */
    public function isSocietyAdmin(): bool
    {
        return $this->hasRole('SocietyAdmin');
    }

    /**
     * The names of all roles assigned to the user.
     *
     * @return array<int, string>
     */
    public function roleNames(): array
    {
        return $this->getRoleNames()->all();
    }

    /**
     * The names of all permissions granted to the user directly or via roles.
     *
     * @return array<int, string>
     */
    public function permissionNames(): array
    {
        return $this->getAllPermissions()->pluck('name')->all();
    }
}
