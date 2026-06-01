<?php

namespace Database\Seeders;

use App\Models\Flat;
use App\Models\Invoice;
use Illuminate\Database\Seeder;

class InvoiceSeeder extends Seeder
{
    public function run(): void
    {
        Flat::all()->each(function ($flat) {

            Invoice::factory()->create([
                'society_id' => $flat->society_id,
                'flat_id' => $flat->id,
            ]);
        });
    }
}
