<?php

namespace Database\Seeders;

use App\Models\Society;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $society = Society::first();

        if (! $society) {
            $this->command->error('No society found. Run SocietySeeder first.');
            return;
        }

        User::factory()
            ->superAdmin()
            ->create();

        User::factory()
            ->societyAdmin($society->id)
            ->create();

        User::factory()
            ->treasurer($society->id)
            ->create();

        User::factory()
            ->securityGuard($society->id)
            ->create();

        User::factory()
            ->maintenanceStaff($society->id)
            ->create();

        User::factory()
            ->resident($society->id)
            ->count(20)
            ->create();
    }
}
