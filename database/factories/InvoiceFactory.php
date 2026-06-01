<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class InvoiceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'society_id' => 1,
            'flat_id' => fake()->numberBetween(1,50),
            'invoice_no' => 'INV'.fake()->unique()->numberBetween(1000,9999),
            'billing_month' => now()->month,
            'billing_year' => now()->year,
            'due_date' => now()->addDays(10),
            'subtotal' => fake()->numberBetween(1000,5000),
            'penalty' => 0,
            'total_amount' => fake()->numberBetween(1000,5000),
            'status' => fake()->randomElement([
                'Pending',
                'Paid',
                'Overdue'
            ]),
        ];
    }
}
