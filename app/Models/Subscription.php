<?php

namespace App\Models;

use App\Models\Traits\HasPublicUuid;
use App\Models\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * A society's subscription record (Phase 14 — Eagle).
 *
 * NOTE: deliberately does NOT use BelongsToSociety. Subscriptions are keyed to
 * an explicit society_id and are read both from the society context (overview
 * page) and the SuperAdmin platform context (subscriptions administration),
 * so a global society scope would leak across those views.
 */
class Subscription extends Model
{
    use HasFactory, HasPublicUuid, LogsActivity, SoftDeletes;

    protected $fillable = [
        'society_id',
        'plan_id',
        'status',        // trialing | active | past_due | cancelled | expired
        'billing_cycle', // monthly | yearly
        'price',
        'currency',
        'starts_at',
        'trial_ends_at',
        'ends_at',
        'cancelled_at',
        'meta',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'starts_at' => 'date',
        'trial_ends_at' => 'date',
        'ends_at' => 'date',
        'cancelled_at' => 'datetime',
        'meta' => 'array',
    ];

    /**
     * The lifecycle statuses supported by the engine.
     *
     * @return array<int, string>
     */
    public static function statuses(): array
    {
        return ['trialing', 'active', 'past_due', 'cancelled', 'expired'];
    }

    /**
     * Statuses that still grant entitlements.
     */
    public static function liveStatuses(): array
    {
        return ['trialing', 'active', 'past_due'];
    }

    public function society(): BelongsTo
    {
        return $this->belongsTo(Society::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'plan_id')->withTrashed();
    }

    /**
     * Filter to non-terminal (still-entitled) subscriptions.
     */
    public function scopeLive(Builder $query): Builder
    {
        return $query->whereIn('status', self::liveStatuses());
    }
}
