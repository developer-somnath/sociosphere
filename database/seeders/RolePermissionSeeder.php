<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $allPermissions = Permission::pluck('name')->toArray();

        Role::findByName('SuperAdmin')
            ->syncPermissions($allPermissions);

        Role::findByName('SocietyAdmin')
            ->syncPermissions([
                'dashboard.view',

                'resident.view',
                'resident.create',
                'resident.update',
                'resident.delete',

                'flat.view',
                'flat.create',
                'flat.update',
                'flat.delete',

                'user.view',
                'user.create',
                'user.update',

                'invoice.view',
                'invoice.create',
                'invoice.update',

                'collection.view',
                'collection.create',

                'notice.view',
                'notice.create',
                'notice.update',
                'notice.delete',

                'complaint.view',
                'complaint.update',

                'visitor.view',
                'visitor.create',
                'visitor.update',
            ]);

        Role::findByName('Treasurer')
            ->syncPermissions([
                'dashboard.view',

                'invoice.view',
                'invoice.create',
                'invoice.update',

                'collection.view',
                'collection.create',
            ]);

        Role::findByName('SecurityGuard')
            ->syncPermissions([
                'dashboard.view',

                'visitor.view',
                'visitor.create',
                'visitor.update',
            ]);

        Role::findByName('MaintenanceStaff')
            ->syncPermissions([
                'dashboard.view',

                'complaint.view',
                'complaint.update',

                'maintenance.view',
                'maintenance.update',
            ]);

        Role::findByName('Resident')
            ->syncPermissions([
                'dashboard.view',

                'notice.view',

                'invoice.view',

                'complaint.create',
                'complaint.view',
            ]);
    }
}
