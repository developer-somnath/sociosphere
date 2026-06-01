<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class TowerFactory extends Factory
{
    public function definition(): array
    {
        return [
            'society_id' => 1,
            'name' => 'Tower '.fake()->randomLetter(),
        ];
    }
}
