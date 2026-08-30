<?php

namespace Database\Seeders;

use App\Models\Complaint;
use App\Models\ComplaintCategory;
use App\Models\Flat;
use App\Models\Resident;
use App\Models\Society;
use App\Models\User;
use Illuminate\Database\Seeder;

class ComplaintSeeder extends Seeder
{
    public function run(): void
    {
        $society = Society::first();
        if (! $society) {
            return;
        }

        $categories = ComplaintCategory::where('society_id', $society->id)->get()->keyBy('name');
        $flats = Flat::where('society_id', $society->id)->get()->keyBy('flat_no');
        $residents = Resident::where('society_id', $society->id)->get()->keyBy('email');
        $maintenanceLead = User::where('email', 'maintenance@gvr.com')->first();

        $resAarav = $residents->get('aarav.sharma@gmail.com');
        $resPriya = $residents->get('priya.patel@outlook.com');
        $resVikram = $residents->get('vikram.roy@yahoo.in');
        $resNeha = $residents->get('neha.agarwal@gmail.com');

        $complaints = [
            [
                'title' => 'Master Bathroom Concealed Flush Leakage & Seepage',
                'category' => 'Plumbing & Drainage',
                'resident' => $resAarav,
                'flat_no' => '101',
                'description' => 'Continuous water trickling from concealed cistern causing moisture on adjacent bedroom wall. Plumber inspection required urgently.',
                'priority' => 'High',
                'status' => 'In Progress',
                'assigned_to' => $maintenanceLead?->id,
                'resolved_at' => null,
            ],
            [
                'title' => 'Tower A Passenger Lift 2 Jerky Stop on 4th Floor',
                'category' => 'Elevator / Lift Service',
                'resident' => $resPriya,
                'flat_no' => '102',
                'description' => 'Lift #2 produces abnormal grinding noise and stops 2 inches above the floor level on floor 4. AMC technician summoned.',
                'priority' => 'Critical',
                'status' => 'In Progress',
                'assigned_to' => $maintenanceLead?->id,
                'resolved_at' => null,
            ],
            [
                'title' => 'Flickering LED Batten in 3rd Floor Corridor',
                'category' => 'Electrical & Power Backup',
                'resident' => $resVikram,
                'flat_no' => '103',
                'description' => 'Tube light outside flat 301 is flickering since yesterday evening. Replacement tube needed.',
                'priority' => 'Low',
                'status' => 'Resolved',
                'assigned_to' => $maintenanceLead?->id,
                'resolved_at' => now()->subDays(1),
            ],
            [
                'title' => 'Terrace Garden Dripper Pipe Disconnected',
                'category' => 'Housekeeping & Waste Management',
                'resident' => $resNeha,
                'flat_no' => '201',
                'description' => 'Automated drip irrigation line near rooftop gazebo got detached, water pooling near solar inverter panels.',
                'priority' => 'Medium',
                'status' => 'Open',
                'assigned_to' => null,
                'resolved_at' => null,
            ],
        ];

        foreach ($complaints as $cData) {
            $cat = $categories->get($cData['category']);
            $flat = $flats->get($cData['flat_no']);
            $res = $cData['resident'];

            if ($cat && $flat && $res) {
                Complaint::firstOrCreate(
                    [
                        'society_id' => $society->id,
                        'title' => $cData['title'],
                    ],
                    [
                        'flat_id' => $flat->id,
                        'resident_id' => $res->id,
                        'category_id' => $cat->id,
                        'description' => $cData['description'],
                        'priority' => $cData['priority'],
                        'status' => $cData['status'],
                        'assigned_to' => $cData['assigned_to'],
                        'resolved_at' => $cData['resolved_at'],
                    ]
                );
            }
        }
    }
}
