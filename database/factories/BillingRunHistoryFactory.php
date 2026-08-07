<?php

namespace Database\Factories;

use App\Models\Society;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BillingRunHistoryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'society_id' => Society::factory(),
            'billing_period' => now()->format('Y-m'),
            'total_flats' => 0,
            'billed_flats' => 0,
            'excluded_flats' => 0,
            'skipped_flats' => 0,
            'subtotal' => 0,
            'tax_amount' => 0,
            'total_amount' => 0,
            'invoices_generated' => 0,
            'status' => 'Completed',
            'run_by' => User::factory(),
            'notes' => null,
        ];
    }
}
