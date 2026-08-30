<?php

namespace Database\Seeders;

use App\Models\Flat;
use App\Models\ParkingSlot;
use App\Models\Society;
use App\Models\Tower;
use Illuminate\Database\Seeder;

class ParkingSeeder extends Seeder
{
    public function run(): void
    {
        $society = Society::first();
        if (! $society) {
            return;
        }

        $towers = Tower::where('society_id', $society->id)->get();
        $flats = Flat::where('society_id', $society->id)->get()->keyBy('flat_no');

        $slots = [
            ['slot' => 'P-A101', 'tower' => 'Tower A (Amber Wing)', 'flat_no' => '101', 'type' => 'Four Wheeler', 'status' => 'Allocated', 'vehicle' => 'MH-02-DN-4521', 'model' => 'Hyundai Creta SX', 'rfid' => 'RFID-98421'],
            ['slot' => 'P-A102', 'tower' => 'Tower A (Amber Wing)', 'flat_no' => '102', 'type' => 'Four Wheeler', 'status' => 'Allocated', 'vehicle' => 'MH-03-CC-9011', 'model' => 'Honda City ZX', 'rfid' => 'RFID-98422'],
            ['slot' => 'P-A103', 'tower' => 'Tower A (Amber Wing)', 'flat_no' => '103', 'type' => 'Four Wheeler', 'status' => 'Allocated', 'vehicle' => 'MH-01-BK-3344', 'model' => 'Toyota Fortuner 4x4', 'rfid' => 'RFID-98423'],
            ['slot' => 'P-EV-01', 'tower' => 'Tower A (Amber Wing)', 'flat_no' => '104', 'type' => 'Four Wheeler', 'status' => 'Allocated', 'vehicle' => 'MH-02-BM-0007', 'model' => 'Mercedes-Benz C200', 'rfid' => 'RFID-98424'],
            ['slot' => 'P-EV-02', 'tower' => 'Tower B (Emerald Wing)', 'flat_no' => '201', 'type' => 'Four Wheeler', 'status' => 'Allocated', 'vehicle' => 'MH-43-AK-9920', 'model' => 'Tata Nexon EV Max', 'rfid' => 'RFID-98425'],
            ['slot' => 'P-B201', 'tower' => 'Tower B (Emerald Wing)', 'flat_no' => '202', 'type' => 'Four Wheeler', 'status' => 'Allocated', 'vehicle' => 'MH-01-DE-5566', 'model' => 'Maruti Suzuki Baleno', 'rfid' => 'RFID-98426'],
            ['slot' => 'P-B202', 'tower' => 'Tower B (Emerald Wing)', 'flat_no' => '203', 'type' => 'Four Wheeler', 'status' => 'Allocated', 'vehicle' => 'KA-03-MG-1029', 'model' => 'Skoda Octavia L&K', 'rfid' => 'RFID-98427'],
            ['slot' => 'P-C301', 'tower' => 'Tower C (Sapphire Wing)', 'flat_no' => '301', 'type' => 'Four Wheeler', 'status' => 'Allocated', 'vehicle' => 'MH-02-FL-8899', 'model' => 'Volkswagen Taigun GT', 'rfid' => 'RFID-98428'],
            ['slot' => 'P-VIS-01', 'tower' => 'Tower A (Amber Wing)', 'flat_no' => null, 'type' => 'Visitor', 'status' => 'Available', 'vehicle' => null, 'model' => null, 'rfid' => null],
            ['slot' => 'P-VIS-02', 'tower' => 'Tower B (Emerald Wing)', 'flat_no' => null, 'type' => 'Visitor', 'status' => 'Available', 'vehicle' => null, 'model' => null, 'rfid' => null],
            ['slot' => 'P-2W-01', 'tower' => 'Tower A (Amber Wing)', 'flat_no' => '101', 'type' => 'Two Wheeler', 'status' => 'Allocated', 'vehicle' => 'MH-02-EZ-8812', 'model' => 'Honda Activa 6G', 'rfid' => 'RFID-2W-101'],
            ['slot' => 'P-2W-02', 'tower' => 'Tower B (Emerald Wing)', 'flat_no' => '201', 'type' => 'Two Wheeler', 'status' => 'Allocated', 'vehicle' => 'MH-43-BK-1100', 'model' => 'Ather 450X', 'rfid' => 'RFID-2W-201'],
        ];

        foreach ($slots as $s) {
            $tower = $towers->firstWhere('name', $s['tower']);
            $flat = $s['flat_no'] ? ($flats[$s['flat_no']] ?? null) : null;

            ParkingSlot::firstOrCreate(
                [
                    'society_id' => $society->id,
                    'slot_number' => $s['slot'],
                ],
                [
                    'tower_id' => $tower?->id,
                    'flat_id' => $flat?->id,
                    'type' => $s['type'],
                    'status' => $s['status'],
                    'vehicle_number' => $s['vehicle'],
                    'vehicle_model' => $s['model'],
                    'rfid_tag' => $s['rfid'],
                ]
            );
        }
    }
}
