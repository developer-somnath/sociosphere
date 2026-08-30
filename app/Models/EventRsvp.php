<?php

namespace App\Models;

use App\Models\Traits\BelongsToSociety;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventRsvp extends Model
{
    use BelongsToSociety, HasFactory;

    protected $fillable = [
        'community_event_id',
        'user_id',
        'society_id',
        'status',
        'guests_count',
        'remarks',
    ];

    protected $casts = [
        'guests_count' => 'integer',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(CommunityEvent::class, 'community_event_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function society(): BelongsTo
    {
        return $this->belongsTo(Society::class);
    }
}
