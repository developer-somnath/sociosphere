<?php

namespace App\Models;

use App\Models\Traits\BelongsToSociety;
use App\Models\Traits\HasPublicUuid;
use App\Models\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PushSubscription extends Model
{
    use BelongsToSociety, HasFactory, HasPublicUuid, LogsActivity;

    protected $fillable = [
        'society_id',
        'user_id',
        'endpoint',
        'p256dh',
        'auth',
        'payload',
    ];

    protected $casts = [
        'payload' => 'array',
    ];

    public function society()
    {
        return $this->belongsTo(Society::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
