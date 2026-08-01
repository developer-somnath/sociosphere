<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            'SuperAdmin' => 'System administrator with unrestricted access.',
            'SocietyAdmin' => 'Manages one society: residents, towers, flats, users and day-to-day operations.',
            'Treasurer' => 'Handles invoicing and collections for the society.',
            'Resident' => 'A resident of the society; views notices and manages personal complaints.',
            'SecurityGuard' => 'Manages gate visitors and their passes.',
            'MaintenanceStaff' => 'Handles maintenance requests and complaints.',
        ];

        foreach ($roles as $role => $description) {
            Role::firstOrCreate(
                [
                    'name' => $role,
                    'guard_name' => 'web',
                ],
                [
                    'description' => $description,
                ]
            );
        }

        // The seeded roles are system roles: they cannot be deleted and
        // the SuperAdmin role itself cannot be edited.
        Role::query()
            ->whereIn('name', array_keys($roles))
            ->update(['is_system' => true]);
    }
}
