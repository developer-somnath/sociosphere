<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SubscriptionPlan>
 */
class SubscriptionPlanFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(2, true),
            'code' => fake()->unique()->lexify('plan-????'),
            'description' => fake()->sentence(),
            'price_monthly' => fake()->randomFloat(2, 0, 1000),
            'price_yearly' => fake()->randomFloat(2, 0, 10000),
            'currency' => 'INR',
            'is_active' => true,
            'is_default' => false,
            'sort_order' => fake()->numberBetween(0, 100),
        ];
    }

    public function default(): static
    {
        return $this->state(fn () => [
            'is_default' => true,
        ]);
    }

    /**
     * Seed entitlement feature rows for this plan.
     *
     * @param  array<string, int|null>  $limits
     */
    public function withFeatures(array $limits): static
    {
        return $this->afterCreating(function ($plan) use ($limits) {
            $sort = 0;
            foreach ($limits as $key => $value) {
                \App\Models\SubscriptionPlanFeature::create([
                    'plan_id' => $plan->id,
                    'feature_key' => $key,
                    'limit_value' => $value,
                    'sort_order' => $sort++,
                ]);
            }
        });
    }
}
