<?php

namespace Database\Seeders;

use App\Models\Flat;
use App\Models\Society;
use App\Models\User;
use App\Models\Visitor;
use App\Models\VisitorPass;
use Illuminate\Database\Seeder;

class VisitorSeeder extends Seeder
{
    /**
     * Seed demo visitors and gate passes for development.
     */
    public function run(): void
    {
        $society = Society::query()->first();

        if (! $society) {
            return;
        }

        $flats = Flat::query()
            ->where('society_id', $society->id)
            ->whereIn('occupancy_status', ['Occupied', 'Self-Occupied'])
            ->limit(10)
            ->get();

        if ($flats->isEmpty()) {
            return;
        }

        $guard = User::where('email', 'security@gvr.com')->first() ?? User::where('society_id', $society->id)->first();
        $admin = User::where('email', 'societyadmin@gvr.com')->first();

        $visitors = [
            [
                'name' => 'Mukesh Kumar (Swiggy Food Delivery)',
                'phone' => '+91 98765 43210',
                'email' => null,
                'purpose' => 'Delivery',
                'notes' => 'Swiggy order #SWG-984210 from Mainland China',
                'vehicle' => 'MH-02-EQ-4412',
                'status' => 'checked_in',
            ],
            [
                'name' => 'Satish Yadav (Zomato Delivery)',
                'phone' => '+91 98123 45670',
                'email' => null,
                'purpose' => 'Delivery',
                'notes' => 'Zomato food parcel from Punjab Grill',
                'vehicle' => 'MH-03-DF-8811',
                'status' => 'checked_out',
            ],
            [
                'name' => 'Mohammed Ansari (Urban Company AC Tech)',
                'phone' => '+91 97000 01122',
                'email' => 'm.ansari@urbancompany.com',
                'purpose' => 'Service / repair',
                'notes' => 'Split AC deep cleaning and gas top-up service',
                'vehicle' => 'MH-43-AK-5501',
                'status' => 'approved',
            ],
            [
                'name' => 'Kamala Bai (Domestic Helper)',
                'phone' => '+91 96001 12233',
                'email' => null,
                'purpose' => 'House help',
                'notes' => 'Daily registered domestic help pass for Flat 101 & 102',
                'vehicle' => null,
                'status' => 'checked_in',
            ],
            [
                'name' => 'Rajeev Malhotra (Family Guest)',
                'phone' => '+91 95500 11223',
                'email' => 'rajeev.malhotra@gmail.com',
                'purpose' => 'Guest visit',
                'notes' => 'Weekend family dinner guests of Dr. Sanjay Kulkarni',
                'vehicle' => 'DL-01-AB-7744',
                'status' => 'pending',
            ],
            [
                'name' => 'Blinkit Instant Grocery Delivery',
                'phone' => '+91 98450 12345',
                'email' => null,
                'purpose' => 'Delivery',
                'notes' => '10-minute grocery delivery packet',
                'vehicle' => 'MH-02-CA-9988',
                'status' => 'checked_out',
            ],
        ];

        foreach ($visitors as $index => $vData) {
            $flat = $flats->get($index % $flats->count());

            $visitor = Visitor::firstOrCreate(
                [
                    'society_id' => $society->id,
                    'phone' => $vData['phone'],
                ],
                [
                    'name' => $vData['name'],
                    'email' => $vData['email'],
                    'notes' => $vData['notes'],
                    'created_by' => $guard?->id,
                ]
            );

            VisitorPass::firstOrCreate(
                [
                    'society_id' => $society->id,
                    'visitor_id' => $visitor->id,
                    'flat_id' => $flat->id,
                ],
                [
                    'purpose' => $vData['purpose'],
                    'vehicle_number' => $vData['vehicle'],
                    'status' => $vData['status'],
                    'scheduled_for' => $vData['status'] === 'pending' ? now()->addHours(2) : null,
                    'check_in_at' => in_array($vData['status'], ['checked_in', 'checked_out'], true) ? now()->subHours(2) : null,
                    'check_out_at' => $vData['status'] === 'checked_out' ? now()->subMinutes(30) : null,
                    'approved_by' => in_array($vData['status'], ['approved', 'checked_in', 'checked_out'], true) ? $admin?->id : null,
                    'approved_at' => in_array($vData['status'], ['approved', 'checked_in', 'checked_out'], true) ? now()->subHours(3) : null,
                    'created_by' => $guard?->id,
                ]
            );
        }
    }
}
