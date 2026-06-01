<?php

namespace Database\Factories;

use App\Models\Society;
use App\Models\Tower;
use Illuminate\Database\Eloquent\Factories\Factory;

class FlatFactory extends Factory
{
    public function definition(): array
    {
        return [

            'society_id' => Society::inRandomOrder()->value('id'),

            'tower_id' => Tower::inRandomOrder()->value('id'),

            'flat_no' => fake()->unique()->numerify('A-###'),

            'floor_no' => fake()->numberBetween(1, 20),

            'flat_type' => fake()->randomElement([
                '1BHK',
                '2BHK',
                '3BHK',
                '4BHK',
                '5BHK',
                'Penthouse',
                'Duplex',
                'Villa',
            ]),

            'area_sqft' => fake()->numberBetween(800, 2500),

            'ownership_type' => fake()->randomElement([
                'Owner',
                'Tenant',
            ]),

            'occupancy_status' => fake()->randomElement([
                'Occupied',
                'Vacant',
                'Self-Occupied',
            ]),
        ];
    }
}
