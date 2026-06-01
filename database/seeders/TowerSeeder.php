<?php

namespace Database\Seeders;

use App\Models\Society;
use App\Models\Tower;
use Illuminate\Database\Seeder;

class TowerSeeder extends Seeder
{
    public function run(): void
    {
        $society = Society::first();

        foreach (['Tower A','Tower B','Tower C'] as $towerName) {

            Tower::create([
                'society_id' => $society->id,
                'name' => $towerName,
            ]);
        }
    }
}
