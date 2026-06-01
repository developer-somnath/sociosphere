<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ComplaintCategoryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'society_id' => 1,
            'name' => fake()->randomElement([
                'Electrical',
                'Plumbing',
                'Lift',
                'Cleaning',
                'Security',
                'Parking'
            ]),
        ];
    }
}
