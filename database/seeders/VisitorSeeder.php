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
            ->limit(6)
            ->get();

        if ($flats->isEmpty()) {
            return;
        }

        $creator = User::query()->first();
        $approvedBy = User::query()
            ->whereNotNull('society_id')
            ->first();

        $visitors = [
            ['name' => 'Rahul Sharma', 'phone' => '9876543210', 'email' => 'rahul.sharma@example.com', 'notes' => 'Family friend of Tower A residents.'],
            ['name' => 'Priya Patel', 'phone' => '9812345670', 'email' => 'priya.patel@example.com', 'notes' => null],
            ['name' => 'Mohammed Ansari', 'phone' => '9700001122', 'email' => null, 'notes' => 'AC repair technician.'],
            ['name' => 'Sneha Iyer', 'phone' => '9600112233', 'email' => 'sneha.iyer@example.com', 'notes' => null],
            ['name' => 'Vikram Singh', 'phone' => '9550011223', 'email' => null, 'notes' => 'Interior decorator.'],
        ];

        foreach ($visitors as $index => $visitorData) {
            $visitor = Visitor::create([
                'society_id' => $society->id,
                'name' => $visitorData['name'],
                'phone' => $visitorData['phone'],
                'email' => $visitorData['email'],
                'notes' => $visitorData['notes'],
                'created_by' => $creator?->id,
            ]);

            VisitorPass::create([
                'society_id' => $society->id,
                'visitor_id' => $visitor->id,
                'flat_id' => $flats->get($index % $flats->count())->id,
                'purpose' => ['Meeting resident', 'Delivery', 'Service / repair', 'Guest visit', 'House help'][$index % 5],
                'vehicle_number' => $index % 2 === 0 ? ['MH-01-AB-1234', 'GJ-05-CD-5678', 'DL-08-EF-9012'][intdiv($index, 2) % 3] : null,
                'status' => ['pending', 'approved', 'checked_in', 'checked_out', 'rejected'][$index],
                'scheduled_for' => match ($index) {
                    0 => now()->addHours(2),
                    1 => now()->addDay(),
                    4 => now()->subDay(),
                    default => null,
                },
                'check_in_at' => in_array($index, [2, 3], true) ? now()->subHours(3) : null,
                'check_out_at' => $index === 3 ? now()->subHour() : null,
                'approved_by' => in_array($index, [1, 2, 3], true) ? $approvedBy?->id : null,
                'approved_at' => in_array($index, [1, 2, 3], true) ? now()->subHours(4) : null,
                'created_by' => $creator?->id,
            ]);
        }
    }
}
