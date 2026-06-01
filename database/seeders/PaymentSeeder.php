<?php

namespace Database\Seeders;

use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Database\Seeder;

class PaymentSeeder extends Seeder
{
    public function run(): void
    {
        Invoice::take(60)->get()->each(function ($invoice) {

            Payment::factory()->create([
                'society_id' => $invoice->society_id,
                'invoice_id' => $invoice->id,
                'amount' => $invoice->total_amount,
            ]);
        });
    }
}
