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
                'society.view',
                'society.update',
                'dashboard.view',

                'resident.view',
                'resident.create',
                'resident.update',
                'resident.delete',

                'tower.view',
                'tower.create',
                'tower.update',
                'tower.delete',

                'flat.view',
                'flat.create',
                'flat.update',
                'flat.delete',

                'user.view',
                'user.create',
                'user.update',
                'user.invite',
                'user.restore',
                'user.toggle-status',

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

                'parking.view',
                'parking.create',
                'parking.update',
                'parking.delete',
                'parking.allocate',

                'cctv.view',
                'cctv.create',
                'cctv.update',
                'cctv.delete',
                'security_log.view',
                'security_log.create',

                // Audit trail: society admins can browse their own society's logs.
                'activity-log.view',
            ]);

        Role::findByName('Treasurer')
            ->syncPermissions([
                'dashboard.view',

                'resident.view',

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

                'cctv.view',
                'security_log.view',
                'security_log.create',
                'parking.view',
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
