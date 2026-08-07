<?php

namespace Database\Factories;

use App\Models\Notice;
use App\Models\NoticeAcknowledgement;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class NoticeAcknowledgementFactory extends Factory
{
    protected $model = NoticeAcknowledgement::class;

    public function definition(): array
    {
        return [
            'notice_id' => Notice::factory(),
            'user_id' => User::factory(),
            'acknowledged_at' => now(),
        ];
    }
}