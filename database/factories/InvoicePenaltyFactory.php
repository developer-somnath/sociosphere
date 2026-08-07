<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\Society;
use Illuminate\Database\Eloquent\Factories\Factory;

class InvoicePenaltyFactory extends Factory
{
    public function definition(): array
    {
        return [
            'society_id' => Society::factory(),
            'invoice_id' => Invoice::factory(),
            'penalty_amount' => 50.00,
            'applied_on' => now(),
            'billing_period' => now()->format('Y-m'),
            'reason' => 'Late payment penalty',
        ];
    }
}
