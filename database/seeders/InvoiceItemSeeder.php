<?php

namespace Database\Seeders;

use App\Models\Invoice;
use App\Models\InvoiceHead;
use App\Models\InvoiceItem;
use Illuminate\Database\Seeder;

class InvoiceItemSeeder extends Seeder
{
    public function run(): void
    {
        $heads = InvoiceHead::all();

        Invoice::all()->each(function ($invoice) use ($heads) {

            foreach ($heads as $head) {

                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'head_id' => $head->id,
                    'description' => $head->name,
                    'amount' => $head->amount,
                ]);
            }
        });
    }
}
