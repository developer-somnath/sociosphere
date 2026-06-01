<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class InvoiceHeadFactory extends Factory
{
    public function definition(): array
    {
        return [
            'society_id' => 1,
            'name' => fake()->randomElement([
                'Maintenance',
                'Water Charge',
                'Parking Charge',
                'Corpus Fund'
            ]),
            'amount' => fake()->numberBetween(200,3000),
            'is_recurring' => true,
        ];
    }
}
