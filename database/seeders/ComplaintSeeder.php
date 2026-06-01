<?php

namespace Database\Seeders;

use App\Models\Complaint;
use App\Models\ComplaintCategory;
use App\Models\Resident;
use Illuminate\Database\Seeder;

class ComplaintSeeder extends Seeder
{
    public function run(): void
    {
        $categories = ComplaintCategory::pluck('id');

        Resident::take(50)->get()->each(function ($resident) use ($categories) {

            Complaint::factory()->create([
                'society_id' => $resident->society_id,
                'flat_id' => $resident->flat_id,
                'resident_id' => $resident->id,
                'category_id' => $categories->random(),
            ]);
        });
    }
}
