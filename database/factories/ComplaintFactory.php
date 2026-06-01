<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ComplaintFactory extends Factory
{
    public function definition(): array
    {
        return [
            'society_id' => 1,
            'flat_id' => fake()->numberBetween(1,50),
            'resident_id' => fake()->numberBetween(1,50),
            'category_id' => fake()->numberBetween(1,6),
            'title' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'priority' => fake()->randomElement([
                'Low',
                'Medium',
                'High',
                'Critical'
            ]),
            'status' => fake()->randomElement([
                'Open',
                'Assigned',
                'Resolved'
            ]),
        ];
    }
}
