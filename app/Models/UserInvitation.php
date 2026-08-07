<?php

namespace App\Models;

use App\Models\Traits\BelongsToSociety;
use App\Models\Traits\HasPublicUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserInvitation extends Model
{
    use BelongsToSociety, HasFactory, HasPublicUuid;

    protected $fillable = [
        'society_id',
        'email',
        'role_name',
        'token',
        'invited_by',
        'expires_at',
        'accepted_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'accepted_at' => 'datetime',
    ];

    public function society()
    {
        return $this->belongsTo(Society::class);
    }

    public function inviter()
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isAccepted(): bool
    {
        return $this->accepted_at !== null;
    }
}
