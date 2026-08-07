<?php

namespace Database\Factories;

use App\Models\Society;
use Illuminate\Database\Eloquent\Factories\Factory;

class SocietyBillingConfigFactory extends Factory
{
    public function definition(): array
    {
        return [
            'society_id' => Society::factory(),
            'billing_mode' => 'per_sqft',
            'base_rate' => 2.50,
            'tax_rate' => 18.00,
            'due_day' => 10,
            'grace_days' => 7,
            'penalty_rate' => 2.00,
            'penalty_cap' => 500.00,
            'is_active' => true,
        ];
    }

    public function fixed(): static
    {
        return $this->state(fn () => [
            'billing_mode' => 'fixed',
            'base_rate' => 1500.00,
        ]);
    }
}
