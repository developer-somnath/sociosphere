<?php

namespace Database\Seeders;

use App\Models\Society;
use App\Models\Tower;
use Illuminate\Database\Seeder;

class TowerSeeder extends Seeder
{
    public function run(): void
    {
        $societies = Society::all();

        foreach ($societies as $society) {
            $towers = [
                ['name' => 'Tower A (Amber Wing)', 'total_floors' => 14],
                ['name' => 'Tower B (Emerald Wing)', 'total_floors' => 14],
                ['name' => 'Tower C (Sapphire Wing)', 'total_floors' => 12],
                ['name' => 'Tower D (Diamond Wing)', 'total_floors' => 10],
            ];

            foreach ($towers as $t) {
                Tower::firstOrCreate(
                    [
                        'society_id' => $society->id,
                        'name' => $t['name'],
                    ]
                );
            }
        }
    }
}
