<?php

namespace Database\Seeders;

use App\Models\FamilyMember;
use App\Models\Flat;
use App\Models\FlatOccupancy;
use App\Models\FlatOwnership;
use App\Models\Resident;
use App\Models\Society;
use App\Models\Vehicle;
use Illuminate\Database\Seeder;

class ResidentSeeder extends Seeder
{
    public function run(): void
    {
        $society = Society::first();
        if (! $society) {
            return;
        }

        $flats = Flat::where('society_id', $society->id)
            ->whereIn('occupancy_status', ['Occupied', 'Self-Occupied'])
            ->orderBy('id')
            ->get();

        $residentProfiles = [
            [
                'name' => 'Aarav Sharma',
                'email' => 'aarav.sharma@gmail.com',
                'phone' => '+91 98111 22334',
                'gender' => 'Male',
                'occupation' => 'Senior Director - Infosys Ltd',
                'family' => [
                    ['name' => 'Ritu Sharma', 'relation' => 'Spouse', 'gender' => 'Female', 'phone' => '+91 98111 22335'],
                    ['name' => 'Aditya Sharma', 'relation' => 'Son', 'gender' => 'Male', 'phone' => null],
                ],
                'vehicles' => [
                    ['number' => 'MH-02-DN-4521', 'model' => 'Hyundai Creta SX', 'type' => '4-Wheeler', 'slot' => 'P-A101'],
                    ['number' => 'MH-02-EZ-8812', 'model' => 'Honda Activa 6G', 'type' => '2-Wheeler', 'slot' => 'P-2W-01'],
                ],
            ],
            [
                'name' => 'Priya Patel',
                'email' => 'priya.patel@outlook.com',
                'phone' => '+91 98222 33445',
                'gender' => 'Female',
                'occupation' => 'Chartered Accountant & Tax Consultant',
                'family' => [
                    ['name' => 'Jignesh Patel', 'relation' => 'Spouse', 'gender' => 'Male', 'phone' => '+91 98222 33446'],
                    ['name' => 'Ananya Patel', 'relation' => 'Daughter', 'gender' => 'Female', 'phone' => null],
                ],
                'vehicles' => [
                    ['number' => 'MH-03-CC-9011', 'model' => 'Honda City ZX', 'type' => '4-Wheeler', 'slot' => 'P-A102'],
                ],
            ],
            [
                'name' => 'Vikramaditya Roy',
                'email' => 'vikram.roy@yahoo.in',
                'phone' => '+91 98333 44556',
                'gender' => 'Male',
                'occupation' => 'Vice President - HDFC Bank',
                'family' => [
                    ['name' => 'Debolina Roy', 'relation' => 'Spouse', 'gender' => 'Female', 'phone' => '+91 98333 44557'],
                    ['name' => 'Subhash Roy', 'relation' => 'Father', 'gender' => 'Male', 'phone' => '+91 98333 44558'],
                ],
                'vehicles' => [
                    ['number' => 'MH-01-BK-3344', 'model' => 'Toyota Fortuner 4x4', 'type' => '4-Wheeler', 'slot' => 'P-A103'],
                ],
            ],
            [
                'name' => 'Dr. Sanjay Kulkarni',
                'email' => 'dr.kulkarni@apollo.org',
                'phone' => '+91 98555 66778',
                'gender' => 'Male',
                'occupation' => 'Senior Cardiologist - Apollo Hospitals',
                'family' => [
                    ['name' => 'Dr. Sunita Kulkarni', 'relation' => 'Spouse', 'gender' => 'Female', 'phone' => '+91 98555 66779'],
                ],
                'vehicles' => [
                    ['number' => 'MH-02-BM-0007', 'model' => 'Mercedes-Benz C200', 'type' => '4-Wheeler', 'slot' => 'P-EV-01'],
                ],
            ],
            [
                'name' => 'Neha Agarwal',
                'email' => 'neha.agarwal@gmail.com',
                'phone' => '+91 98666 77889',
                'gender' => 'Female',
                'occupation' => 'Architect & Interior Designer',
                'family' => [
                    ['name' => 'Vivek Agarwal', 'relation' => 'Spouse', 'gender' => 'Male', 'phone' => '+91 98666 77890'],
                ],
                'vehicles' => [
                    ['number' => 'MH-43-AK-9920', 'model' => 'Tata Nexon EV Max', 'type' => '4-Wheeler', 'slot' => 'P-EV-02'],
                    ['number' => 'MH-43-BK-1100', 'model' => 'Ather 450X', 'type' => '2-Wheeler', 'slot' => 'P-2W-05'],
                ],
            ],
            [
                'name' => 'Kavita Menon',
                'email' => 'kavita.menon@hotmail.com',
                'phone' => '+91 98777 88990',
                'gender' => 'Female',
                'occupation' => 'Professor - St. Xavier’s College',
                'family' => [
                    ['name' => 'Gopalkrishnan Menon', 'relation' => 'Father', 'gender' => 'Male', 'phone' => null],
                ],
                'vehicles' => [
                    ['number' => 'MH-01-DE-5566', 'model' => 'Maruti Suzuki Baleno', 'type' => '4-Wheeler', 'slot' => 'P-B201'],
                ],
            ],
            [
                'name' => 'Rohan Gupta',
                'email' => 'rohan.gupta@techcorp.in',
                'phone' => '+91 98888 99001',
                'gender' => 'Male',
                'occupation' => 'Principal Software Architect',
                'family' => [
                    ['name' => 'Megha Gupta', 'relation' => 'Spouse', 'gender' => 'Female', 'phone' => '+91 98888 99002'],
                ],
                'vehicles' => [
                    ['number' => 'KA-03-MG-1029', 'model' => 'Skoda Octavia L&K', 'type' => '4-Wheeler', 'slot' => 'P-B202'],
                ],
            ],
            [
                'name' => 'Arjun Nambiar',
                'email' => 'arjun.nambiar@gmail.com',
                'phone' => '+91 99000 11223',
                'gender' => 'Male',
                'occupation' => 'Commercial Pilot - Air India',
                'family' => [
                    ['name' => 'Maya Nambiar', 'relation' => 'Spouse', 'gender' => 'Female', 'phone' => null],
                ],
                'vehicles' => [
                    ['number' => 'MH-02-FL-8899', 'model' => 'Volkswagen Taigun GT', 'type' => '4-Wheeler', 'slot' => 'P-C301'],
                ],
            ],
        ];

        foreach ($flats as $index => $flat) {
            $data = $residentProfiles[$index % count($residentProfiles)];

            // Suffix name if flat index exceeds initial profile set to ensure uniqueness
            $residentName = ($index < count($residentProfiles))
                ? $data['name']
                : $data['name'] . ' ' . (intdiv($index, count($residentProfiles)) + 1);

            $residentEmail = ($index < count($residentProfiles))
                ? $data['email']
                : str_replace('@', "+flat{$flat->flat_no}@", $data['email']);

            $resident = Resident::firstOrCreate(
                [
                    'society_id' => $society->id,
                    'flat_id' => $flat->id,
                ],
                [
                    'name' => $residentName,
                    'email' => $residentEmail,
                    'phone' => $data['phone'],
                    'gender' => $data['gender'],
                    'occupation' => $data['occupation'],
                    'is_primary_contact' => true,
                ]
            );

            // Record Ownership & Occupancy Ledger
            FlatOwnership::firstOrCreate(
                [
                    'society_id' => $society->id,
                    'flat_id' => $flat->id,
                    'owner_name' => $resident->name,
                ],
                [
                    'owner_email' => $resident->email,
                    'owner_phone' => $resident->phone,
                    'ownership_start' => now()->subYears(3)->format('Y-m-d'),
                    'is_current' => true,
                ]
            );

            FlatOccupancy::firstOrCreate(
                [
                    'society_id' => $society->id,
                    'flat_id' => $flat->id,
                    'resident_id' => $resident->id,
                ],
                [
                    'occupancy_type' => $flat->ownership_type === 'Tenant' ? 'Tenant' : 'Owner Occupied',
                    'move_in_date' => now()->subYears(2)->format('Y-m-d'),
                    'is_active' => true,
                ]
            );

            // Seed Family Members
            if ($index < count($residentProfiles) && ! empty($data['family'])) {
                foreach ($data['family'] as $f) {
                    FamilyMember::firstOrCreate(
                        [
                            'society_id' => $society->id,
                            'resident_id' => $resident->id,
                            'name' => $f['name'],
                        ],
                        [
                            'relation' => $f['relation'],
                            'gender' => $f['gender'],
                            'phone' => $f['phone'],
                            'is_dependent' => true,
                        ]
                    );
                }
            }

            // Seed Vehicles
            if ($index < count($residentProfiles) && ! empty($data['vehicles'])) {
                foreach ($data['vehicles'] as $v) {
                    Vehicle::firstOrCreate(
                        [
                            'society_id' => $society->id,
                            'resident_id' => $resident->id,
                            'vehicle_number' => $v['number'],
                        ],
                        [
                            'vehicle_model' => $v['model'],
                            'vehicle_type' => $v['type'],
                            'parking_slot' => $v['slot'],
                            'is_active' => true,
                        ]
                    );
                }
            }
        }
    }
}
