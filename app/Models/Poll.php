<?php

namespace App\Models;

use App\Models\Traits\BelongsToSociety;
use App\Models\Traits\HasPublicUuid;
use App\Models\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Poll extends Model
{
    use BelongsToSociety, HasFactory, HasPublicUuid, LogsActivity, SoftDeletes;

    protected $fillable = [
        'society_id',
        'creator_id',
        'title',
        'description',
        'status',
        'is_anonymous',
        'allow_multiple',
        'expires_at',
    ];

    protected $casts = [
        'is_anonymous' => 'boolean',
        'allow_multiple' => 'boolean',
        'expires_at' => 'datetime',
    ];

    public function society(): BelongsTo
    {
        return $this->belongsTo(Society::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function options(): HasMany
    {
        return $this->hasMany(PollOption::class)->orderBy('sort_order');
    }

    public function votes(): HasMany
    {
        return $this->hasMany(PollVote::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public function isClosed(): bool
    {
        return $this->status === 'closed' || $this->isExpired();
    }

    public function totalVotes(): int
    {
        return $this->votes()->count();
    }
}
