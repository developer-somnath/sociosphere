<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Services\EntitlementService;
use App\Services\SubscriptionService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Society-facing entitlement usage breakdown (Phase 14 — Eagle).
 */
class SubscriptionUsageController extends Controller
{
    public function __construct(
        private readonly SubscriptionService $subscriptions,
        private readonly EntitlementService $entitlements,
    ) {
    }

    public function index(): Response
    {
        $societyId = (int) (Auth::user()?->society_id ?? society_id() ?? 0);

        abort_if($societyId <= 0, 403);

        $this->authorize('view', [Subscription::class, $this->subscriptions->currentFor($societyId)]);

        $subscription = $this->subscriptions->currentFor($societyId);

        return Inertia::render('features/subscription/pages/usage', [
            'subscription' => $subscription === null ? null : [
                'uuid' => $subscription->uuid,
                'status' => $subscription->status,
                'billing_cycle' => $subscription->billing_cycle,
                'price' => (float) $subscription->price,
                'currency' => $subscription->currency,
                'plan' => $subscription->plan === null ? null : [
                    'uuid' => $subscription->plan->uuid,
                    'name' => $subscription->plan->name,
                    'code' => $subscription->plan->code,
                ],
            ],
            'usage' => $this->entitlements->snapshot($societyId),
            'can' => [
                'manage' => Auth::user()->hasPermissionTo('subscription.assign'),
            ],
        ]);
    }
}
