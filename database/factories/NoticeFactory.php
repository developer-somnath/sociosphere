<?php

namespace Database\Factories;

use App\Models\Notice;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class NoticeFactory extends Factory
{
    protected $model = Notice::class;

    public function definition(): array
    {
        return [
            'society_id' => 1,
            'title' => fake()->sentence(),
            'category' => fake()->randomElement(['General', 'Maintenance', 'Event', 'Security', 'Billing']),
            'is_pinned' => fake()->boolean(20),
            'target_audience' => fake()->randomElement(['All', 'Owners', 'Tenants']),
            'description' => fake()->paragraph(),
            'attachments' => null,
            'publish_from' => now(),
            'publish_to' => now()->addDays(30),
            'created_by' => User::factory(),
        ];
    }
}
