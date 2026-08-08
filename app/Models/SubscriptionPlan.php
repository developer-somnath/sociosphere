<?php

namespace App\Models;

use App\Models\Traits\HasPublicUuid;
use App\Models\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * A SaaS subscription tier offered to societies (Phase 14 — Eagle).
 *
 * Global catalog, NOT society-scoped — managed by SuperAdmin only.
 * Per-resource limits live in subscription_plan_features.
 */
class SubscriptionPlan extends Model
{
    use HasFactory, HasPublicUuid, LogsActivity, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'description',
        'price_monthly',
        'price_yearly',
        'currency',
        'is_active',
        'is_default',
        'sort_order',
    ];

    protected $casts = [
        'price_monthly' => 'decimal:2',
        'price_yearly' => 'decimal:2',
        'is_active' => 'boolean',
        'is_default' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Entitlement limits defined for this plan.
     */
    public function features(): HasMany
    {
        return $this->hasMany(SubscriptionPlanFeature::class, 'plan_id')->orderBy('sort_order');
    }

    /**
     * Subscriptions that reference this plan.
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class, 'plan_id');
    }
}
