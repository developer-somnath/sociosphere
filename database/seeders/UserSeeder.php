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

        $this->firstOrCreate('Super Admin', 'admin@sociosphere.com', fn () => User::factory()->superAdmin());
        $this->firstOrCreate('Society Admin', 'societyadmin@gvr.com', fn () => User::factory()->societyAdmin($society->id));
        $this->firstOrCreate('Treasurer', 'treasurer@gvr.com', fn () => User::factory()->treasurer($society->id));
        $this->firstOrCreate('Security Guard', 'security@gvr.com', fn () => User::factory()->securityGuard($society->id));
        $this->firstOrCreate('Maintenance Staff', 'maintenance@gvr.com', fn () => User::factory()->maintenanceStaff($society->id));

        $residentCount = User::whereNotNull('society_id')->count() - 5;
        if ($residentCount < 20) {
            User::factory()
                ->resident($society->id)
                ->count(20 - $residentCount)
                ->create();
        }
    }

    private function firstOrCreate(string $name, string $email, callable $factory): void
    {
        if (User::where('email', $email)->exists()) {
            return;
        }

        $factory()->create([
            'name' => $name,
            'email' => $email,
        ]);
    }
}
