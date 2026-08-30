<?php

namespace Database\Seeders;

use App\Models\Flat;
use App\Models\Society;
use App\Models\Tower;
use Illuminate\Database\Seeder;

class FlatSeeder extends Seeder
{
    public function run(): void
    {
        $society = Society::first();
        if (! $society) {
            return;
        }

        $towers = Tower::where('society_id', $society->id)->get();

        foreach ($towers as $tower) {
            // Generate flats across 6 floors, 4 units per floor
            for ($floor = 1; $floor <= 6; $floor++) {
                for ($unit = 1; $unit <= 4; $unit++) {
                    $flatNo = sprintf('%d0%d', $floor, $unit);

                    $flatType = match ($unit) {
                        1 => '2BHK',
                        2 => '3BHK',
                        3 => '3BHK',
                        4 => '4BHK',
                    };

                    $areaSqft = match ($unit) {
                        1 => 1150.00,
                        2 => 1480.00,
                        3 => 1550.00,
                        4 => 2100.00,
                    };

                    $occupancy = ($floor <= 5) ? 'Occupied' : ($unit % 2 === 0 ? 'Vacant' : 'Self-Occupied');
                    $ownership = ($unit === 3) ? 'Tenant' : 'Owner';

                    Flat::firstOrCreate(
                        [
                            'society_id' => $society->id,
                            'tower_id' => $tower->id,
                            'flat_no' => $flatNo,
                        ],
                        [
                            'floor_no' => $floor,
                            'flat_type' => $flatType,
                            'area_sqft' => $areaSqft,
                            'ownership_type' => $ownership,
                            'occupancy_status' => $occupancy,
                        ]
                    );
                }
            }
        }
    }
}
