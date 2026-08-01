<?php

namespace Database\Factories;

use App\Models\Flat;
use App\Models\Society;
use App\Models\User;
use App\Models\Visitor;
use App\Models\VisitorPass;
use Illuminate\Database\Eloquent\Factories\Factory;

class VisitorPassFactory extends Factory
{
    public function definition(): array
    {
        $visitor = Visitor::query()->inRandomOrder()->first();

        return [
            'society_id' => $visitor?->society_id ?? Society::inRandomOrder()->value('id') ?? 1,
            'visitor_id' => $visitor?->id ?? Visitor::factory(),
            'flat_id' => Flat::inRandomOrder()->value('id'),
            'purpose' => fake()->randomElement([
                'Meeting resident',
                'Delivery',
                'Service / repair',
                'Guest visit',
                'Interview',
                'House help',
            ]),
            'vehicle_number' => fake()->optional()->regexify('[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}'),
            'status' => fake()->randomElement(VisitorPass::STATUSES),
            'scheduled_for' => fake()->optional()->dateTimeBetween('now', '+7 days'),
            'check_in_at' => null,
            'check_out_at' => null,
            'approved_by' => null,
            'approved_at' => null,
            'created_by' => User::inRandomOrder()->value('id') ?? 1,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn () => [
            'status' => VisitorPass::STATUS_PENDING,
            'check_in_at' => null,
            'check_out_at' => null,
            'approved_by' => null,
            'approved_at' => null,
        ]);
    }

    public function approved(): static
    {
        return $this->state(fn () => [
            'status' => VisitorPass::STATUS_APPROVED,
            'approved_at' => now(),
        ]);
    }

    public function checkedIn(): static
    {
        return $this->state(fn () => [
            'status' => VisitorPass::STATUS_CHECKED_IN,
            'approved_at' => now(),
            'check_in_at' => now(),
        ]);
    }

    public function checkedOut(): static
    {
        return $this->state(fn () => [
            'status' => VisitorPass::STATUS_CHECKED_OUT,
            'approved_at' => now(),
            'check_in_at' => now()->subHours(2),
            'check_out_at' => now(),
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn () => [
            'status' => VisitorPass::STATUS_REJECTED,
        ]);
    }
}
