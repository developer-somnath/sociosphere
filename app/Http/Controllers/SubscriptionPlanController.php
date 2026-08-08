<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\EnforcesEntitlements;
use App\Http\Requests\SubscriptionPlanRequest;
use App\Models\SubscriptionPlan;
use App\Models\SubscriptionPlanFeature;
use App\Services\ActivityLogger;
use App\Services\EntitlementService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Platform management of the SaaS plan catalog (Phase 14 — Eagle).
 *
 * SuperAdmin-only routes (routes/web.php wraps these in role:SuperAdmin).
 */
class SubscriptionPlanController extends Controller
{
    use EnforcesEntitlements;

    public function __construct(private readonly EntitlementService $entitlements)
    {
    }

    public function index(): Response
    {
        $this->authorize('viewAny', SubscriptionPlan::class);

        $search = request()->string('search')->trim()->toString();

        $plans = SubscriptionPlan::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where('name', 'ilike', "%{$search}%")
                    ->orWhere('code', 'ilike', "%{$search}%");
            })
            ->orderBy('sort_order')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('features/subscription/pages/plans/index', [
            'plans' => $plans,
            'filters' => ['search' => $search],
            'can' => [
                'create' => Auth::user()->hasPermissionTo('plan.create'),
                'update' => Auth::user()->hasPermissionTo('plan.update'),
                'delete' => Auth::user()->hasPermissionTo('plan.delete'),
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', SubscriptionPlan::class);

        return Inertia::render('features/subscription/pages/plans/create', [
            'feature_keys' => $this->entitlements->featureKeys(),
        ]);
    }

    public function store(SubscriptionPlanRequest $request): RedirectResponse
    {
        $this->authorize('create', SubscriptionPlan::class);

        $plan = SubscriptionPlan::create([
            'name' => $request->input('name'),
            'code' => $request->input('code'),
            'description' => $request->input('description'),
            'price_monthly' => $request->input('price_monthly'),
            'price_yearly' => $request->input('price_yearly'),
            'currency' => $request->input('currency'),
            'is_active' => $request->boolean('is_active'),
            'is_default' => $request->boolean('is_default'),
            'sort_order' => $request->input('sort_order', 0),
        ]);

        $this->syncFeatures($plan, $request->input('features', []));

        app(ActivityLogger::class)->log(
            action: 'create',
            module: 'SubscriptionPlan',
            entityType: SubscriptionPlan::class,
            entityId: $plan->id,
            remarks: "Created plan {$plan->name}",
        );

        return redirect()
            ->route('plans.index')
            ->with('success', __('Plan created successfully.'));
    }

    public function edit(SubscriptionPlan $plan): Response
    {
        $this->authorize('update', $plan);

        return Inertia::render('features/subscription/pages/plans/edit', [
            'plan' => $plan->load('features'),
            'feature_keys' => $this->entitlements->featureKeys(),
        ]);
    }

    public function update(SubscriptionPlanRequest $request, SubscriptionPlan $plan): RedirectResponse
    {
        $this->authorize('update', $plan);

        $plan->update([
            'name' => $request->input('name'),
            'code' => $request->input('code'),
            'description' => $request->input('description'),
            'price_monthly' => $request->input('price_monthly'),
            'price_yearly' => $request->input('price_yearly'),
            'currency' => $request->input('currency'),
            'is_active' => $request->boolean('is_active'),
            'is_default' => $request->boolean('is_default'),
            'sort_order' => $request->input('sort_order', 0),
        ]);

        $this->syncFeatures($plan, $request->input('features', []));

        app(ActivityLogger::class)->log(
            action: 'update',
            module: 'SubscriptionPlan',
            entityType: SubscriptionPlan::class,
            entityId: $plan->id,
            remarks: "Updated plan {$plan->name}",
        );

        return redirect()
            ->route('plans.index')
            ->with('success', __('Plan updated successfully.'));
    }

    public function destroy(SubscriptionPlan $plan): RedirectResponse
    {
        $this->authorize('delete', $plan);

        $plan->delete();

        app(ActivityLogger::class)->log(
            action: 'delete',
            module: 'SubscriptionPlan',
            entityType: SubscriptionPlan::class,
            entityId: $plan->id,
            remarks: "Deleted plan {$plan->name}",
        );

        return redirect()
            ->route('plans.index')
            ->with('success', __('Plan deleted successfully.'));
    }

    /**
     * Replace a plan's entitlement rows with the submitted set.
     *
     * @param  array<int, array{feature_key?: string, limit_value?: string|int|null}>  $features
     */
    private function syncFeatures(SubscriptionPlan $plan, array $features): void
    {
        $plan->features()->delete();

        $rows = [];
        $sort = 0;

        foreach ($features as $feature) {
            $key = trim((string) ($feature['feature_key'] ?? ''));
            if ($key === '') {
                continue;
            }

            $rawLimit = $feature['limit_value'] ?? null;
            $limit = ($rawLimit === null || $rawLimit === '' || $rawLimit === 'null')
                ? null
                : max(0, (int) $rawLimit);

            $rows[] = [
                'plan_id' => $plan->id,
                'feature_key' => $key,
                'limit_value' => $limit,
                'sort_order' => $sort++,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        if ($rows !== []) {
            SubscriptionPlanFeature::insert($rows);
        }
    }
}
