<?php

namespace Database\Seeders;

use App\Models\Flat;
use App\Models\Resident;
use Illuminate\Database\Seeder;

class ResidentSeeder extends Seeder
{
    public function run(): void
    {
        Flat::all()->each(function ($flat) {

            Resident::factory()->create([
                'society_id' => $flat->society_id,
                'flat_id' => $flat->id,
            ]);
        });
    }
}
