<?php

namespace Database\Seeders;

use App\Models\Society;
use Illuminate\Database\Seeder;

class SocietySeeder extends Seeder
{
    public function run(): void
    {
        Society::factory()->create([
            'name' => 'Green Valley Residency',
            'registration_no' => 'GVR001',
            'city' => 'Kolkata',
            'state' => 'West Bengal',
        ]);
    }
}
