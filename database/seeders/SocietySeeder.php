<?php

namespace Database\Seeders;

use App\Models\Society;
use Illuminate\Database\Seeder;

class SocietySeeder extends Seeder
{
    public function run(): void
    {
        $societies = [
            [
                'name' => 'Green Valley Residency CHS',
                'registration_no' => 'GVR001',
                'address' => 'Plot 42, Palm Beach Road, Sector 14, Sanpada',
                'city' => 'Navi Mumbai',
                'state' => 'Maharashtra',
                'postal_code' => '400705',
                'email' => 'admin@gvr.com',
                'phone' => '+91 98201 12233',
            ],
            [
                'name' => 'Prestige Palms Heights Co-op Housing Society',
                'registration_no' => 'PPH002',
                'address' => 'Survey No. 88, Sarjapur Main Road, Bellandur',
                'city' => 'Bengaluru',
                'state' => 'Karnataka',
                'postal_code' => '560103',
                'email' => 'management@prestigepalms.in',
                'phone' => '+91 99800 44556',
            ],
            [
                'name' => 'Godrej Woods Residency',
                'registration_no' => 'GWR003',
                'address' => 'Golf Course Extension Road, Sector 63',
                'city' => 'Gurugram',
                'state' => 'Haryana',
                'postal_code' => '122002',
                'email' => 'office@godrejwoods.org',
                'phone' => '+91 97110 77889',
            ],
        ];

        foreach ($societies as $data) {
            Society::firstOrCreate(
                ['registration_no' => $data['registration_no']],
                $data
            );
        }
    }
}
