<?php

namespace Database\Seeders;

use App\Models\InvoiceHead;
use App\Models\Society;
use Illuminate\Database\Seeder;

class InvoiceHeadSeeder extends Seeder
{
    public function run(): void
    {
        $society = Society::first();
        if (! $society) {
            return;
        }

        $heads = [
            [
                'name' => 'Monthly Society Maintenance Charges',
                'amount' => 3500.00,
                'is_recurring' => true,
            ],
            [
                'name' => 'Sinking & Major Repair Reserve Fund',
                'amount' => 500.00,
                'is_recurring' => true,
            ],
            [
                'name' => 'Municipal Water & Sewerage Utility Charge',
                'amount' => 350.00,
                'is_recurring' => true,
            ],
            [
                'name' => 'Covered & EV Parking Slot Fee',
                'amount' => 450.00,
                'is_recurring' => true,
            ],
            [
                'name' => 'Lift AMC & Common Generator Backup Surcharge',
                'amount' => 250.00,
                'is_recurring' => true,
            ],
            [
                'name' => 'Non-Occupancy Surcharge (Tenanted Flats)',
                'amount' => 350.00,
                'is_recurring' => true,
            ],
        ];

        foreach ($heads as $head) {
            InvoiceHead::firstOrCreate(
                [
                    'society_id' => $society->id,
                    'name' => $head['name'],
                ],
                $head
            );
        }
    }
}
