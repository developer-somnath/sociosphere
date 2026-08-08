<?php

namespace App\Services;

use App\Models\Society;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use Carbon\Carbon;
use Illuminate\Support\Collection;

/**
 * Subscription lifecycle engine (Phase 14 — Eagle).
 *
 * Owns creation, plan changes, cancellation, resumption and status
 * synchronisation for a society's subscription records.
 */
class SubscriptionService
{
    /**
     * The current (live, newest) subscription for a society, if any.
     */
    public function currentFor(int $societyId): ?Subscription
    {
        return Subscription::query()
            ->live()
            ->where('society_id', $societyId)
            ->with('plan')
            ->orderByDesc('id')
            ->first();
    }

    /**
     * All live subscriptions across the platform.
     */
    public function liveSubscriptions(): Collection
    {
        return Subscription::query()
            ->live()
            ->with('plan')
            ->orderByDesc('id')
            ->get();
    }

    /**
     * Activate a plan for a society. Cancels any live subscription (kept for
     * history) and creates a new record reflecting the chosen cycle.
     */
    public function activate(Society $society, SubscriptionPlan $plan, string $billingCycle = 'monthly', ?int $trialDays = null): Subscription
    {
        $today = self::today();

        // Cancel any existing live subscription so only one is ever live.
        $this->liveSubscriptions()
            ->where('society_id', $society->id)
            ->each(function (Subscription $current) use ($today) {
                $current->update([
                    'status' => 'cancelled',
                    'cancelled_at' => now(),
                    'ends_at' => $today,
                ]);
            });

        $price = $billingCycle === 'yearly' ? $plan->price_yearly : $plan->price_monthly;

        $subscription = Subscription::create([
            'society_id' => $society->id,
            'plan_id' => $plan->id,
            'status' => $trialDays !== null && $trialDays > 0 ? 'trialing' : 'active',
            'billing_cycle' => $billingCycle,
            'price' => $price,
            'currency' => $plan->currency,
            'starts_at' => $today,
            'trial_ends_at' => $trialDays !== null && $trialDays > 0 ? $today->copy()->addDays($trialDays) : null,
            'ends_at' => $billingCycle === 'yearly' ? $today->copy()->addYear() : $today->copy()->addMonth(),
            'meta' => ['activated_via' => 'platform'],
        ]);

        return $subscription;
    }

    /**
     * Move a subscription onto a different plan, recording the change in meta.
     */
    public function changePlan(Subscription $subscription, SubscriptionPlan $plan): Subscription
    {
        $meta = $subscription->meta ?? [];

        $meta['last_change'] = [
            'from_plan' => $subscription->plan_id,
            'to_plan' => $plan->id,
            'at' => now()->toISOString(),
        ];

        $price = $subscription->billing_cycle === 'yearly' ? $plan->price_yearly : $plan->price_monthly;

        $subscription->update([
            'plan_id' => $plan->id,
            'price' => $price,
            'currency' => $plan->currency,
            'meta' => $meta,
        ]);

        return $subscription;
    }

    /**
     * Cancel a subscription. Entitlements end when the current period ends.
     */
    public function cancel(Subscription $subscription): Subscription
    {
        $subscription->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'ends_at' => $subscription->ends_at ?? self::today(),
        ]);

        return $subscription;
    }

    /**
     * Resume a cancelled subscription for another cycle.
     */
    public function resume(Subscription $subscription): Subscription
    {
        $trialEndsAt = $subscription->trial_ends_at;

        $subscription->update([
            'status' => $trialEndsAt !== null && $trialEndsAt->isFuture() ? 'trialing' : 'active',
            'cancelled_at' => null,
            'ends_at' => $subscription->billing_cycle === 'yearly'
                ? now()->addYear()
                : now()->addMonth(),
        ]);

        return $subscription;
    }

    /**
     * Move a single subscription to its next lifecycle status when due.
     *
     * @return bool Whether the status changed.
     */
    public function syncStatus(Subscription $subscription): bool
    {
        $now = now();

        if ($subscription->status === 'trialing' && $subscription->trial_ends_at !== null && $subscription->trial_ends_at->lt($now)) {
            $subscription->update(['status' => 'active']);

            return true;
        }

        if ($subscription->status === 'active' && $subscription->ends_at !== null && $subscription->ends_at->lt($now)) {
            $subscription->update(['status' => 'expired']);

            return true;
        }

        return false;
    }

    /**
     * Sweep all live subscriptions and transition those that are due.
     *
     * @return array{checked: int, updated: int}
     */
    public function syncStatuses(): array
    {
        $checked = 0;
        $updated = 0;

        foreach ($this->liveSubscriptions() as $subscription) {
            $checked++;
            if ($this->syncStatus($subscription)) {
                $updated++;
            }
        }

        return ['checked' => $checked, 'updated' => $updated];
    }

    /**
     * Today's date (Carbon), centralised for consistent date handling.
     */
    public static function today(): Carbon
    {
        return Carbon::today();
    }
}
