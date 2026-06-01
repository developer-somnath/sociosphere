<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class NoticeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'society_id' => 1,
            'title' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'publish_from' => now(),
            'publish_to' => now()->addDays(30),
            'created_by' => 1,
        ];
    }
}
