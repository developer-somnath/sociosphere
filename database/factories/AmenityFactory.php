<?php

namespace Database\Factories;

use App\Models\Amenity;
use Illuminate\Database\Eloquent\Factories\Factory;

class AmenityFactory extends Factory
{
    protected $model = Amenity::class;

    public function definition(): array
    {
        return [
            'society_id' => 1,
            'name' => fake()->randomElement(['Clubhouse', 'Swimming Pool', 'Tennis Court', 'Banquet Hall', 'Community Gym']),
            'description' => fake()->sentence(),
            'booking_type' => fake()->randomElement(['Slot', 'Hourly', 'Daily']),
            'capacity' => fake()->numberBetween(10, 100),
            'fee_per_slot' => fake()->randomElement([0, 50, 100, 250, 500]),
            'rules' => fake()->paragraph(),
            'is_active' => true,
        ];
    }
}
