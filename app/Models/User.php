<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use App\Models\Traits\HasPublicUuid;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles, HasPublicUuid;

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

    public function isSuperAdmin(): bool
    {
        return $this->role === 'SuperAdmin';
    }
}
