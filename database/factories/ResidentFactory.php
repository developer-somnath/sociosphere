<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ResidentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'society_id' => 1,
            'flat_id' => 1,
            'name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'phone' => fake()->numerify('9#########'),
            'date_of_birth' => fake()->date(),
            'gender' => fake()->randomElement([
                'Male',
                'Female'
            ]),
            'occupation' => fake()->jobTitle(),
            'is_primary_contact' => true,
        ];
    }
}
