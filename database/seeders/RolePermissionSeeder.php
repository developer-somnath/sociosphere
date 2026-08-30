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

                'billing.configure',
                'billing.run',

                'subscription.view',
                'usage.view',

                'notice.view',
                'notice.create',
                'notice.update',
                'notice.delete',

                'document.view',
                'document.create',
                'document.update',
                'document.delete',

                'complaint.view',
                'complaint.create',
                'complaint.update',
                'complaint.delete',

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

                'amenity.view',
                'amenity.create',
                'amenity.update',
                'amenity.delete',
                'amenity.book',
                'amenity.approve',

                'poll.view',
                'poll.create',
                'poll.update',
                'poll.delete',
                'poll.vote',

                'event.view',
                'event.create',
                'event.update',
                'event.delete',
                'event.rsvp',

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

                'billing.configure',
                'billing.run',

                'subscription.view',
                'usage.view',
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

                'document.view',

                'invoice.view',

                'complaint.create',
                'complaint.view',

                'amenity.view',
                'amenity.book',

                'poll.view',
                'poll.vote',

                'event.view',
                'event.rsvp',
            ]);
    }
}
