<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class SocietyFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->company().' Residency',
            'registration_no' => strtoupper(fake()->bothify('SOC###')),
            'address' => fake()->address(),
            'city' => fake()->city(),
            'state' => fake()->state(),
            'country' => 'India',
            'postal_code' => fake()->postcode(),
            'phone' => fake()->numerify('9#########'),
            'email' => fake()->companyEmail(),
            'status' => true,
        ];
    }
}
