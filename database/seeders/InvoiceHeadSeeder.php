<?php

namespace Database\Seeders;

use App\Models\InvoiceHead;
use Illuminate\Database\Seeder;

class InvoiceHeadSeeder extends Seeder
{
    public function run(): void
    {
        collect([

            [
                'society_id' => 1,
                'name' => 'Maintenance',
                'amount' => 2000,
                'is_recurring' => true,
            ],

            [
                'society_id' => 1,
                'name' => 'Water Charge',
                'amount' => 300,
                'is_recurring' => true,
            ],

            [
                'society_id' => 1,
                'name' => 'Parking Charge',
                'amount' => 500,
                'is_recurring' => true,
            ],

        ])->each(
            fn($head) =>
            InvoiceHead::create($head)
        );
    }
}
