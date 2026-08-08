<?php

namespace Database\Factories;

use App\Models\Society;
use App\Models\SubscriptionPlan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Subscription>
 */
class SubscriptionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'society_id' => Society::factory(),
            'plan_id' => SubscriptionPlan::factory(),
            'status' => 'active',
            'billing_cycle' => 'monthly',
            'price' => 499.00,
            'currency' => 'INR',
            'starts_at' => now()->toDateString(),
            'trial_ends_at' => null,
            'ends_at' => now()->addMonth()->toDateString(),
            'cancelled_at' => null,
            'meta' => null,
        ];
    }

    public function trialing(?int $daysLeft = 10): static
    {
        return $this->state(fn () => [
            'status' => 'trialing',
            'trial_ends_at' => now()->addDays($daysLeft)->toDateString(),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn () => [
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn () => [
            'status' => 'expired',
            'ends_at' => now()->subDay()->toDateString(),
        ]);
    }

    public function yearly(): static
    {
        return $this->state(fn () => [
            'billing_cycle' => 'yearly',
            'ends_at' => now()->addYear()->toDateString(),
        ]);
    }
}
