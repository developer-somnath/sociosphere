<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'society_id' => 1,
            'invoice_id' => 1,
            'amount' => fake()->numberBetween(1000,5000),
            'payment_method' => fake()->randomElement([
                'UPI',
                'Card',
                'Cash',
                'Cheque'
            ]),
            'transaction_reference' => strtoupper(fake()->bothify('TXN######')),
            'gateway_reference' => strtoupper(fake()->bothify('GW######')),
            'paid_at' => now(),
            'status' => 'Success',
        ];
    }
}
