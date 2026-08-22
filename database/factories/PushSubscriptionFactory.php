<?php

namespace Database\Factories;

use App\Models\PushSubscription;
use App\Models\Society;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PushSubscription>
 */
class PushSubscriptionFactory extends Factory
{
    protected $model = PushSubscription::class;

    public function definition(): array
    {
        return [
            'society_id' => Society::factory(),
            'user_id' => User::factory(),
            'endpoint' => 'https://push.example.com/'.fake()->uuid(),
            'p256dh' => fake()->sha256(),
            'auth' => fake()->sha256(),
            'payload' => [],
        ];
    }
}
