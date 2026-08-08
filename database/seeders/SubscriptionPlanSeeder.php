<?php

namespace Database\Seeders;

use App\Models\Society;
use App\Models\SubscriptionPlan;
use App\Services\SubscriptionService;
use Illuminate\Database\Seeder;

/**
 * Seeds the SaaS plan catalog (Phase 14 — Eagle) and assigns the default
 * plan to every existing society so tenants start entitled.
 */
class SubscriptionPlanSeeder extends Seeder
{
    /**
     * @return array<int, array{name: string, code: string, description: string, price_monthly: int, price_yearly: int, currency: string, is_active: bool, is_default: bool, sort_order: int, features: array<string, int|null>}>
     */
    public static function planDefinitions(): array
    {
        return [
            [
                'name' => 'Starter',
                'code' => 'starter',
                'description' => 'For small societies getting started with the platform.',
                'price_monthly' => 0,
                'price_yearly' => 0,
                'currency' => 'INR',
                'is_active' => true,
                'is_default' => true,
                'sort_order' => 1,
                'features' => [
                    'towers' => 1,
                    'flats' => 10,
                    'residents' => 25,
                    'users' => 5,
                    'amenities' => 3,
                    'documents' => 5,
                    'notices' => 10,
                    'cctv_cameras' => 2,
                    'parking_slots' => 5,
                    'complaints' => 20,
                ],
            ],
            [
                'name' => 'Professional',
                'code' => 'professional',
                'description' => 'For growing societies with multiple towers and higher activity.',
                'price_monthly' => 499,
                'price_yearly' => 4990,
                'currency' => 'INR',
                'is_active' => true,
                'is_default' => false,
                'sort_order' => 2,
                'features' => [
                    'towers' => 5,
                    'flats' => 50,
                    'residents' => 150,
                    'users' => 15,
                    'amenities' => 10,
                    'documents' => 25,
                    'notices' => 50,
                    'cctv_cameras' => 8,
                    'parking_slots' => 25,
                    'complaints' => 100,
                ],
            ],
            [
                'name' => 'Enterprise',
                'code' => 'enterprise',
                'description' => 'Unlimited resources for large residential complexes.',
                'price_monthly' => 999,
                'price_yearly' => 9990,
                'currency' => 'INR',
                'is_active' => true,
                'is_default' => false,
                'sort_order' => 3,
                'features' => [
                    'towers' => null,
                    'flats' => null,
                    'residents' => null,
                    'users' => null,
                    'amenities' => null,
                    'documents' => null,
                    'notices' => null,
                    'cctv_cameras' => null,
                    'parking_slots' => null,
                    'complaints' => null,
                ],
            ],
        ];
    }

    public function run(): void
    {
        $service = app(SubscriptionService::class);
        $defaultPlan = null;

        foreach (self::planDefinitions() as $definition) {
            $features = $definition['features'];
            unset($definition['features']);

            $plan = SubscriptionPlan::firstOrCreate(
                ['code' => $definition['code']],
                $definition,
            );

            if (! $plan->wasRecentlyCreated) {
                $plan->update($definition);
            }

            if ($plan->features()->count() === 0) {
                $rows = [];
                $sort = 0;
                foreach ($features as $key => $limit) {
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
                    $plan->features()->insert($rows);
                }
            }

            if ($plan->is_default) {
                $defaultPlan = $plan;
            }
        }

        // Ensure every existing society has a live subscription (default plan).
        if ($defaultPlan !== null) {
            Society::query()
                ->whereDoesntHave('subscriptions')
                ->get()
                ->each(function (Society $society) use ($service, $defaultPlan) {
                    $service->activate(
                        society: $society,
                        plan: $defaultPlan,
                        billingCycle: 'monthly',
                        trialDays: 14,
                    );
                });
        }
    }
}
