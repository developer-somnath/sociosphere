<?php

namespace Database\Factories;

use App\Models\AmenityBooking;
use Illuminate\Database\Eloquent\Factories\Factory;

class AmenityBookingFactory extends Factory
{
    protected $model = AmenityBooking::class;

    public function definition(): array
    {
        return [
            'society_id' => 1,
            'amenity_id' => 1,
            'flat_id' => 1,
            'resident_id' => 1,
            'booking_date' => now()->addDays(2)->format('Y-m-d'),
            'start_time' => '10:00:00',
            'end_time' => '12:00:00',
            'total_fee' => 100.00,
            'status' => 'Pending',
            'payment_status' => 'Unpaid',
            'remarks' => fake()->sentence(),
        ];
    }
}
