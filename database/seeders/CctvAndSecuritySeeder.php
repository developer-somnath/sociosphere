<?php

namespace Database\Seeders;

use App\Models\CctvCamera;
use App\Models\SecurityLog;
use App\Models\Society;
use App\Models\Tower;
use App\Models\User;
use Illuminate\Database\Seeder;

class CctvAndSecuritySeeder extends Seeder
{
    public function run(): void
    {
        $society = Society::first();
        if (! $society) {
            return;
        }

        $towerA = Tower::where('society_id', $society->id)->where('name', 'like', '%Tower A%')->first();
        $towerB = Tower::where('society_id', $society->id)->where('name', 'like', '%Tower B%')->first();
        $guard = User::where('email', 'security@gvr.com')->first() ?? User::where('society_id', $society->id)->first();

        // 1. CCTV Cameras
        $cameras = [
            [
                'name' => 'Main Gate Boom Barrier & ANPR Cam',
                'camera_group' => 'Perimeter',
                'stream_url' => 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                'ip_address' => '192.168.10.101',
                'location_details' => 'Entry Gate #1 with Automatic Number Plate Recognition',
                'status' => 'online',
                'is_recording' => true,
                'tower_id' => null,
            ],
            [
                'name' => 'Tower A Ground Floor Reception Lobby',
                'camera_group' => 'Lobby',
                'stream_url' => 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                'ip_address' => '192.168.10.102',
                'location_details' => 'Tower A Elevator Bank & Mailbox area',
                'status' => 'online',
                'is_recording' => true,
                'tower_id' => $towerA?->id,
            ],
            [
                'name' => 'Tower B Ground Floor Reception Lobby',
                'camera_group' => 'Lobby',
                'stream_url' => 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                'ip_address' => '192.168.10.103',
                'location_details' => 'Tower B Elevator Bank & Waiting Lounge',
                'status' => 'online',
                'is_recording' => true,
                'tower_id' => $towerB?->id,
            ],
            [
                'name' => 'Basement Level B1 Parking Deck',
                'camera_group' => 'Parking',
                'stream_url' => 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                'ip_address' => '192.168.10.104',
                'location_details' => 'Basement B1 EV Fast Charging Stations area',
                'status' => 'online',
                'is_recording' => true,
                'tower_id' => null,
            ],
            [
                'name' => 'Clubhouse & Swimming Pool Deck',
                'camera_group' => 'Amenities',
                'stream_url' => 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                'ip_address' => '192.168.10.105',
                'location_details' => 'Clubhouse Entrance & Pool Perimeter',
                'status' => 'online',
                'is_recording' => true,
                'tower_id' => null,
            ],
        ];

        foreach ($cameras as $cam) {
            CctvCamera::firstOrCreate(
                [
                    'society_id' => $society->id,
                    'name' => $cam['name'],
                ],
                $cam
            );
        }

        // 2. Security Logs
        $logs = [
            [
                'event_type' => 'patrol',
                'title' => 'Hourly Night Perimeter Patrol Completed',
                'description' => 'Security Guard Ramesh Shinde conducted full inspection of boundary walls, fire exits, and basement pump rooms. All secured.',
                'severity' => 'info',
            ],
            [
                'event_type' => 'incident',
                'title' => 'Unregistered Delivery Vehicle Turned Back at Gate 2',
                'description' => 'Commercial delivery vehicle entered without resident pre-approval code. Directed to Gate 1 visitor verification bay.',
                'severity' => 'low',
            ],
            [
                'event_type' => 'alert',
                'title' => 'Fire Extinguisher Pressure Gauge Audit Completed',
                'description' => 'Quarterly verification of Tower A & B floor hydrants and dry chemical extinguishers by fire safety vendor.',
                'severity' => 'info',
            ],
            [
                'event_type' => 'sos',
                'title' => 'Emergency Drill & Boom Barrier Manual Release Test',
                'description' => 'Annual disaster preparedness test executed successfully. Total clearance time: 3 mins 20 seconds.',
                'severity' => 'medium',
            ],
        ];

        foreach ($logs as $l) {
            SecurityLog::firstOrCreate(
                [
                    'society_id' => $society->id,
                    'title' => $l['title'],
                ],
                [
                    'guard_id' => $guard?->id,
                    'event_type' => $l['event_type'],
                    'description' => $l['description'],
                    'severity' => $l['severity'],
                ]
            );
        }
    }
}
