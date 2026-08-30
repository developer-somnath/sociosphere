<?php

namespace App\Http\Controllers;

use App\Http\Requests\OnboardingRequest;
use App\Models\Role;
use App\Models\Society;
use App\Models\SubscriptionPlan;
use App\Models\TaxProfile;
use App\Models\User;
use App\Services\ActivityLogger;
use App\Services\SubscriptionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Self-Service Customer Onboarding & Pricing Landing Portal (Phase 16 — Leopard v2.3.0).
 */
class OnboardingController extends Controller
{
    public function __construct(
        private readonly SubscriptionService $subscriptions,
    ) {
    }

    /**
     * Public interactive pricing comparison matrix.
     */
    public function pricing(): Response
    {
        $plans = SubscriptionPlan::query()
            ->where('is_active', true)
            ->with(['features'])
            ->orderBy('sort_order')
            ->get()
            ->map(fn (SubscriptionPlan $plan) => [
                'uuid' => $plan->uuid,
                'name' => $plan->name,
                'code' => $plan->code,
                'description' => $plan->description,
                'price_monthly' => (float) $plan->price_monthly,
                'price_yearly' => (float) $plan->price_yearly,
                'currency' => $plan->currency,
                'is_default' => $plan->is_default,
                'features' => $plan->features->map(fn ($f) => [
                    'feature_key' => $f->feature_key,
                    'limit_value' => $f->limit_value,
                ]),
            ]);

        return Inertia::render('features/auth/pages/pricing', [
            'plans' => $plans,
        ]);
    }

    /**
     * Public self-service society registration wizard.
     */
    public function show(Request $request): Response
    {
        $selectedPlanUuid = $request->query('plan');
        $billingCycle = $request->query('cycle', 'monthly');

        $plans = SubscriptionPlan::query()
            ->where('is_active', true)
            ->with(['features'])
            ->orderBy('sort_order')
            ->get()
            ->map(fn (SubscriptionPlan $plan) => [
                'uuid' => $plan->uuid,
                'name' => $plan->name,
                'code' => $plan->code,
                'description' => $plan->description,
                'price_monthly' => (float) $plan->price_monthly,
                'price_yearly' => (float) $plan->price_yearly,
                'currency' => $plan->currency,
                'is_default' => $plan->is_default,
                'features' => $plan->features->map(fn ($f) => [
                    'feature_key' => $f->feature_key,
                    'limit_value' => $f->limit_value,
                ]),
            ]);

        $defaultPlan = $plans->firstWhere('uuid', $selectedPlanUuid)
            ?? $plans->firstWhere('is_default', true)
            ?? $plans->first();

        return Inertia::render('features/auth/pages/onboarding', [
            'plans' => $plans,
            'selectedPlanUuid' => $defaultPlan['uuid'] ?? '',
            'selectedCycle' => in_array($billingCycle, ['monthly', 'yearly'], true) ? $billingCycle : 'monthly',
        ]);
    }

    /**
     * Process self-service registration, provisioning society, admin user & trial subscription.
     */
    public function store(OnboardingRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $plan = SubscriptionPlan::query()
            ->where('uuid', $validated['plan_uuid'])
            ->firstOrFail();

        $user = DB::transaction(function () use ($validated, $plan) {
            // 1. Create the new society
            $society = Society::create([
                'name' => $validated['society_name'],
                'code' => $validated['society_code'] ?? null,
                'address' => $validated['address'],
                'city' => $validated['city'],
                'state' => $validated['state'] ?? null,
                'postal_code' => $validated['postal_code'] ?? null,
                'country' => $validated['country'],
                'is_active' => true,
            ]);

            // 2. Create the society admin user
            $user = User::create([
                'society_id' => $society->id,
                'name' => $validated['admin_name'],
                'email' => $validated['admin_email'],
                'phone' => $validated['admin_phone'] ?? null,
                'password' => Hash::make($validated['password']),
                'is_active' => true,
                'is_super_admin' => false,
            ]);

            // 3. Assign SocietyAdmin role
            $societyAdminRole = Role::where('name', 'SocietyAdmin')->first();
            if ($societyAdminRole) {
                $user->assignRole($societyAdminRole);
            }

            // 4. Activate 14-day free trial subscription
            $this->subscriptions->activate(
                society: $society,
                plan: $plan,
                billingCycle: $validated['billing_cycle'],
                trialDays: 14,
            );

            // 5. Initialize default TaxProfile for the society
            TaxProfile::create([
                'society_id' => $society->id,
                'country' => $validated['country'],
                'region' => $validated['state'] ?? null,
                'tax_scheme' => 'GST',
                'currency_code' => $plan->currency,
                'currency_symbol' => $plan->currency === 'INR' ? '₹' : ($plan->currency === 'USD' ? '$' : $plan->currency),
                'rounding_mode' => 'round',
                'rounding_precision' => 2,
                'is_active' => true,
            ]);

            // 6. Audit log
            app(ActivityLogger::class)->log(
                action: 'create',
                module: 'Onboarding',
                entityType: Society::class,
                entityId: (string) $society->id,
                remarks: "Self-service onboarding completed: {$society->name} on plan {$plan->name}",
            );

            return $user;
        });

        // 7. Log the new user in
        Auth::login($user);

        return redirect()
            ->route('overview')
            ->with('success', 'Welcome to SocioSphere! Your society and 14-day trial have been set up.');
    }
}
