<?php

namespace App\Http\Controllers;

use App\Models\Society;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Services\ActivityLogger;
use App\Services\EntitlementService;
use App\Services\SubscriptionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Society subscription overview + SuperAdmin platform administration
 * (Phase 14 — Eagle).
 */
class SubscriptionController extends Controller
{
    public function __construct(
        private readonly SubscriptionService $subscriptions,
        private readonly EntitlementService $entitlements,
    ) {
    }

    /**
     * Society-facing overview: current plan, price and entitlement usage.
     */
    public function show(): Response
    {
        $societyId = (int) (Auth::user()?->society_id ?? society_id() ?? 0);

        abort_if($societyId <= 0, 403);

        $this->authorize('view', [Subscription::class, $this->currentFor($societyId)]);

        return Inertia::render('features/subscription/pages/overview', [
            'subscription' => $this->present($this->currentFor($societyId)),
            'usage' => $this->entitlements->snapshot($societyId),
            'can' => [
                'manage' => Auth::user()->hasPermissionTo('subscription.assign'),
            ],
        ]);
    }

    /**
     * SuperAdmin platform administration: societies and their subscriptions.
     */
    public function index(): Response
    {
        $this->authorize('manage', Subscription::class);

        $search = request()->string('search')->trim()->toString();

        $societies = Society::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where('name', 'ilike', "%{$search}%")
                    ->orWhere('city', 'ilike', "%{$search}%");
            })
            ->orderBy('name')
            ->paginate(12)
            ->withQueryString();

        $societies->getCollection()->transform(function (Society $society) {
            $subscription = $this->currentFor($society->id);
            $usage = $this->entitlements->usage($society->id);

            return [
                'id' => $society->id,
                'uuid' => $society->uuid,
                'name' => $society->name,
                'city' => $society->city,
                'subscription' => $subscription === null ? null : [
                    'uuid' => $subscription->uuid,
                    'status' => $subscription->status,
                    'billing_cycle' => $subscription->billing_cycle,
                    'plan' => [
                        'uuid' => $subscription->plan?->uuid,
                        'name' => $subscription->plan?->name,
                        'code' => $subscription->plan?->code,
                    ],
                ],
                'usage_summary' => [
                    'flats' => ['used' => $usage['flats'], 'limit' => $this->entitlements->limits($society->id)['flats']],
                    'users' => ['used' => $usage['users'], 'limit' => $this->entitlements->limits($society->id)['users']],
                    'towers' => ['used' => $usage['towers'], 'limit' => $this->entitlements->limits($society->id)['towers']],
                ],
            ];
        });

        return Inertia::render('features/subscription/pages/admin', [
            'societies' => $societies,
            'plans' => SubscriptionPlan::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get()
                ->map(fn (SubscriptionPlan $plan) => [
                    'uuid' => $plan->uuid,
                    'name' => $plan->name,
                    'code' => $plan->code,
                    'price_monthly' => (float) $plan->price_monthly,
                    'price_yearly' => (float) $plan->price_yearly,
                    'currency' => $plan->currency,
                ]),
            'filters' => ['search' => $search],
            'can' => [
                'assign' => Auth::user()->hasPermissionTo('subscription.assign'),
            ],
        ]);
    }

    /**
     * Assign (or change) a plan for a society.
     */
    public function assign(Request $request, Society $society): RedirectResponse
    {
        $this->authorize('manage', Subscription::class);

        $validated = $request->validate([
            'plan_uuid' => ['required', 'exists:subscription_plans,uuid'],
            'billing_cycle' => ['required', 'in:monthly,yearly'],
            'trial_days' => ['nullable', 'integer', 'min:0', 'max:90'],
        ]);

        $plan = SubscriptionPlan::query()
            ->where('uuid', $validated['plan_uuid'])
            ->firstOrFail();

        $current = $this->currentFor($society->id);

        if ($current !== null && $current->plan_id !== $plan->id) {
            $this->subscriptions->changePlan($current, $plan);
        } elseif ($current === null) {
            $this->subscriptions->activate(
                $society,
                $plan,
                $validated['billing_cycle'],
                isset($validated['trial_days']) ? (int) $validated['trial_days'] : null,
            );
        }

        app(ActivityLogger::class)->log(
            action: 'assign',
            module: 'Subscription',
            entityType: Subscription::class,
            entityId: $society->id,
            remarks: "Assigned plan {$plan->name} to society {$society->name}",
        );

        return redirect()
            ->route('subscriptions.index')
            ->with('success', __('Plan assigned successfully.'));
    }

    /**
     * Cancel a live subscription.
     */
    public function cancel(Subscription $subscription): RedirectResponse
    {
        $this->authorize('manage', Subscription::class);

        if (! in_array($subscription->status, Subscription::liveStatuses(), true)) {
            throw ValidationException::withMessages([
                'subscription' => __('Only live subscriptions can be cancelled.'),
            ]);
        }

        $this->subscriptions->cancel($subscription);

        app(ActivityLogger::class)->log(
            action: 'cancel',
            module: 'Subscription',
            entityType: Subscription::class,
            entityId: $subscription->id,
            remarks: "Cancelled subscription #{$subscription->id}",
        );

        return redirect()
            ->route('subscriptions.index')
            ->with('success', __('Subscription cancelled successfully.'));
    }

    /**
     * Resume a cancelled subscription.
     */
    public function resume(Subscription $subscription): RedirectResponse
    {
        $this->authorize('manage', Subscription::class);

        if ($subscription->status !== 'cancelled') {
            throw ValidationException::withMessages([
                'subscription' => __('Only cancelled subscriptions can be resumed.'),
            ]);
        }

        $this->subscriptions->resume($subscription);

        app(ActivityLogger::class)->log(
            action: 'resume',
            module: 'Subscription',
            entityType: Subscription::class,
            entityId: $subscription->id,
            remarks: "Resumed subscription #{$subscription->id}",
        );

        return redirect()
            ->route('subscriptions.index')
            ->with('success', __('Subscription resumed successfully.'));
    }

    private function currentFor(int $societyId): ?Subscription
    {
        return $this->subscriptions->currentFor($societyId);
    }

    /**
     * Shape a subscription for the overview page.
     *
     * @return array<string, mixed>|null
     */
    private function present(?Subscription $subscription): ?array
    {
        if ($subscription === null) {
            return null;
        }

        return [
            'uuid' => $subscription->uuid,
            'status' => $subscription->status,
            'billing_cycle' => $subscription->billing_cycle,
            'price' => (float) $subscription->price,
            'currency' => $subscription->currency,
            'starts_at' => $subscription->starts_at?->toDateString(),
            'trial_ends_at' => $subscription->trial_ends_at?->toDateString(),
            'ends_at' => $subscription->ends_at?->toDateString(),
            'cancelled_at' => $subscription->cancelled_at?->toISOString(),
            'plan' => $subscription->plan === null ? null : [
                'uuid' => $subscription->plan->uuid,
                'name' => $subscription->plan->name,
                'code' => $subscription->plan->code,
                'description' => $subscription->plan->description,
                'price_monthly' => (float) $subscription->plan->price_monthly,
                'price_yearly' => (float) $subscription->plan->price_yearly,
                'currency' => $subscription->plan->currency,
                'is_default' => $subscription->plan->is_default,
                'features' => $subscription->plan->features
                    ->map(fn ($feature) => [
                        'feature_key' => $feature->feature_key,
                        'limit_value' => $feature->limit_value,
                    ]),
            ],
        ];
    }
}
