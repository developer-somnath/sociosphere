<?php

namespace Database\Seeders;

use App\Models\Amenity;
use App\Models\AmenityBooking;
use App\Models\AmenitySlot;
use App\Models\Flat;
use App\Models\Resident;
use App\Models\Society;
use Illuminate\Database\Seeder;

class AmenitySeeder extends Seeder
{
    public function run(): void
    {
        $society = Society::first();
        if (! $society) {
            return;
        }

        $flats = Flat::where('society_id', $society->id)->get()->keyBy('flat_no');
        $residents = Resident::where('society_id', $society->id)->get()->keyBy('email');

        // 1. Amenities
        $amenities = [
            [
                'name' => 'Grand Banquet & Party Hall',
                'description' => 'Air-conditioned community banquet hall equipped with sound system, buffet counters, and banquet chairs for family gatherings & birthday parties.',
                'booking_type' => 'Slot',
                'capacity' => 150,
                'fee_per_slot' => 3500.00,
                'rules' => 'No loud music after 10:00 PM. Outside catering allowed with prior intimation. Society security deposit refundable.',
                'is_active' => true,
                'slots' => [
                    ['start_time' => '10:00:00', 'end_time' => '15:00:00', 'capacity' => 1, 'is_active' => true],
                    ['start_time' => '17:00:00', 'end_time' => '22:30:00', 'capacity' => 1, 'is_active' => true],
                ],
            ],
            [
                'name' => 'Olympic Half-Size Swimming Pool',
                'description' => 'Temperature-regulated swimming pool with dedicated kids splash pool and certified lifeguard on duty.',
                'booking_type' => 'Daily',
                'capacity' => 25,
                'fee_per_slot' => 0.00,
                'rules' => 'Appropriate swimwear mandatory. Children below 10 years must be accompanied by an adult. Shower before entering.',
                'is_active' => true,
                'slots' => [],
            ],
            [
                'name' => 'Indoor Wooden Badminton Court',
                'description' => 'Two international standard wooden courts with anti-glare LED illumination.',
                'booking_type' => 'Slot',
                'capacity' => 4,
                'fee_per_slot' => 200.00,
                'rules' => 'Non-marking badminton shoes mandatory. Maximum 60 minutes per resident per day during peak hours.',
                'is_active' => true,
                'slots' => [
                    ['start_time' => '06:00:00', 'end_time' => '07:00:00', 'capacity' => 4, 'is_active' => true],
                    ['start_time' => '07:00:00', 'end_time' => '08:00:00', 'capacity' => 4, 'is_active' => true],
                    ['start_time' => '18:00:00', 'end_time' => '19:00:00', 'capacity' => 4, 'is_active' => true],
                    ['start_time' => '19:00:00', 'end_time' => '20:00:00', 'capacity' => 4, 'is_active' => true],
                ],
            ],
            [
                'name' => 'Fully Equipped Fitness Gymnasium',
                'description' => 'State-of-the-art gym with LifeFitness treadmills, ellipticals, free weights, and crossfit functional training zone.',
                'booking_type' => 'Daily',
                'capacity' => 30,
                'fee_per_slot' => 0.00,
                'rules' => 'Gym towel and clean sports footwear mandatory. Sanitize equipment after use.',
                'is_active' => true,
                'slots' => [],
            ],
            [
                'name' => 'Rooftop Sky Lounge & Barbecue Deck',
                'description' => 'Scenic rooftop deck overlooking palm gardens with barbecue grill stations and ambient evening seating.',
                'booking_type' => 'Slot',
                'capacity' => 40,
                'fee_per_slot' => 1500.00,
                'rules' => 'Residents must bring their own charcoal and skewers. Clean the barbecue station post-event.',
                'is_active' => true,
                'slots' => [
                    ['start_time' => '18:00:00', 'end_time' => '22:00:00', 'capacity' => 1, 'is_active' => true],
                ],
            ],
            [
                'name' => 'Synthetic Turf Tennis Court',
                'description' => 'Floodlit synthetic tennis court with professional net and seating pavilion.',
                'booking_type' => 'Slot',
                'capacity' => 4,
                'fee_per_slot' => 300.00,
                'rules' => 'Tennis shoes required. Booking cancellations allowed up to 4 hours in advance.',
                'is_active' => true,
                'slots' => [
                    ['start_time' => '06:30:00', 'end_time' => '07:30:00', 'capacity' => 4, 'is_active' => true],
                    ['start_time' => '17:30:00', 'end_time' => '18:30:00', 'capacity' => 4, 'is_active' => true],
                ],
            ],
        ];

        foreach ($amenities as $aData) {
            $slots = $aData['slots'];
            unset($aData['slots']);

            $amenity = Amenity::firstOrCreate(
                [
                    'society_id' => $society->id,
                    'name' => $aData['name'],
                ],
                $aData
            );

            foreach ($slots as $sData) {
                AmenitySlot::firstOrCreate(
                    [
                        'amenity_id' => $amenity->id,
                        'start_time' => $sData['start_time'],
                        'end_time' => $sData['end_time'],
                    ],
                    [
                        'max_bookings' => $sData['capacity'] ?? 1,
                        'is_active' => $sData['is_active'],
                    ]
                );
            }
        }

        // 2. Demo Bookings
        $banquet = Amenity::where('society_id', $society->id)->where('name', 'like', '%Banquet%')->first();
        $badminton = Amenity::where('society_id', $society->id)->where('name', 'like', '%Badminton%')->first();
        $rooftop = Amenity::where('society_id', $society->id)->where('name', 'like', '%Rooftop%')->first();

        $residentAarav = $residents->get('aarav.sharma@gmail.com');
        $residentPriya = $residents->get('priya.patel@outlook.com');
        $residentVikram = $residents->get('vikram.roy@yahoo.in');

        if ($banquet && $residentAarav) {
            AmenityBooking::firstOrCreate(
                [
                    'society_id' => $society->id,
                    'amenity_id' => $banquet->id,
                    'booking_date' => now()->addDays(5)->format('Y-m-d'),
                ],
                [
                    'flat_id' => $residentAarav->flat_id,
                    'resident_id' => $residentAarav->id,
                    'start_time' => '17:00:00',
                    'end_time' => '22:30:00',
                    'total_fee' => 3500.00,
                    'status' => 'Approved',
                    'payment_status' => 'Paid',
                    'remarks' => 'Family birthday celebration for Aditya Sharma',
                ]
            );
        }

        if ($badminton && $residentPriya) {
            AmenityBooking::firstOrCreate(
                [
                    'society_id' => $society->id,
                    'amenity_id' => $badminton->id,
                    'booking_date' => now()->addDays(1)->format('Y-m-d'),
                ],
                [
                    'flat_id' => $residentPriya->flat_id,
                    'resident_id' => $residentPriya->id,
                    'start_time' => '07:00:00',
                    'end_time' => '08:00:00',
                    'total_fee' => 200.00,
                    'status' => 'Approved',
                    'payment_status' => 'Paid',
                    'remarks' => 'Morning singles practice match',
                ]
            );
        }

        if ($rooftop && $residentVikram) {
            AmenityBooking::firstOrCreate(
                [
                    'society_id' => $society->id,
                    'amenity_id' => $rooftop->id,
                    'booking_date' => now()->subDays(2)->format('Y-m-d'),
                ],
                [
                    'flat_id' => $residentVikram->flat_id,
                    'resident_id' => $residentVikram->id,
                    'start_time' => '18:00:00',
                    'end_time' => '22:00:00',
                    'total_fee' => 1500.00,
                    'status' => 'Cancelled',
                    'payment_status' => 'Paid',
                    'refunded_at' => now()->subDays(2),
                    'refund_reference' => 'REF-AMN-984210',
                    'remarks' => 'Cancelled due to unseasonal rain. 100% refund issued to resident wallet.',
                ]
            );
        }
    }
}
