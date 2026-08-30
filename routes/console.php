<?php

use App\Jobs\CalculateOverduePenaltiesJob;
use App\Console\Commands\DeliverReportCommand;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Phase 13: Daily overdue penalty engine (grace period expiration & late fees).
Schedule::job(new CalculateOverduePenaltiesJob)->dailyAt('02:00');

// Phase 14: Daily subscription lifecycle sync (trials expire, terms end).
Schedule::command('subscriptions:sync')->dailyAt('03:00');

// S4-3: Scheduled report delivery — email the monthly invoices report to each
// society's administrators at the start of every month.
Schedule::command(DeliverReportCommand::class, ['invoices', '--format=pdf'])
    ->monthlyOn(1, '06:00')
    ->name('report:deliver:invoices')
    ->withoutOverlapping();

// Helper to provision or update a Resident / Flat Owner user account
Artisan::command('user:set-resident {email} {password} {--name=Resident User} {--phone=9876543210} {--society_id=1}', function ($email, $password) {
    $societyId = (int) $this->option('society_id');
    $society = \App\Models\Society::find($societyId) ?? \App\Models\Society::first();
    if (! $society) {
        $this->error('No society found! Please seed or create a society first.');
        return;
    }

    $user = \App\Models\User::firstOrNew(['email' => $email]);
    $user->name = $this->option('name');
    $user->phone = $this->option('phone');
    $user->society_id = $society->id;
    $user->password = $password;
    $user->is_active = true;
    $user->save();

    $role = \App\Models\Role::where('name', 'Resident')->first();
    if ($role) {
        $user->syncRoles([$role]);
    }

    $flat = \App\Models\Flat::where('society_id', $society->id)->first();
    if (! $flat) {
        $tower = \App\Models\Tower::firstOrCreate(['society_id' => $society->id, 'name' => 'Tower A'], ['floors' => 10]);
        $flat = \App\Models\Flat::firstOrCreate(
            ['society_id' => $society->id, 'flat_no' => '101'],
            [
                'tower_id' => $tower->id,
                'flat_type' => '2BHK',
                'floor_no' => 1,
                'area_sqft' => 1200,
                'ownership_type' => 'Owner',
                'occupancy_status' => 'Occupied',
            ]
        );
    }

    \App\Models\Resident::updateOrCreate(
        ['email' => $email],
        [
            'society_id' => $society->id,
            'flat_id' => $flat->id,
            'name' => $user->name,
            'phone' => $user->phone,
            'is_primary_contact' => true,
        ]
    );

    $this->info("Resident user successfully configured!");
    $this->info("Login Email: {$user->email}");
    $this->info("Password: {$password}");
    $this->info("Society: {$society->name} (ID: {$society->id})");
    $this->info("Assigned Flat: {$flat->flat_no}");
})->purpose('Create or update a Resident / Flat Owner user account');
