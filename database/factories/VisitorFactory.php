<?php

namespace Database\Factories;

use App\Models\Society;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class VisitorFactory extends Factory
{
    public function definition(): array
    {
        return [
            'society_id' => Society::inRandomOrder()->value('id') ?? 1,
            'name' => fake()->name(),
            'phone' => fake()->numerify('9########'),
            'email' => fake()->safeEmail(),
            'notes' => fake()->optional()->sentence(),
            'created_by' => User::inRandomOrder()->value('id') ?? 1,
        ];
    }
}
