<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A single entitlement limit (feature_key => limit_value) on a plan.
 * limit_value = NULL means unlimited. (Phase 14 — Eagle)
 */
class SubscriptionPlanFeature extends Model
{
    protected $fillable = [
        'plan_id',
        'feature_key',
        'limit_value',
        'sort_order',
    ];

    protected $casts = [
        'limit_value' => 'integer',
        'sort_order' => 'integer',
    ];

    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'plan_id');
    }
}
