<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [

            // Dashboard
            'dashboard.view',

            // Residents
            'resident.view',
            'resident.create',
            'resident.update',
            'resident.delete',

            // Towers
            'tower.view',
            'tower.create',
            'tower.update',
            'tower.delete',

            // Flats
            'flat.view',
            'flat.create',
            'flat.update',
            'flat.delete',

            // Users
            'user.view',
            'user.create',
            'user.update',
            'user.delete',

            // Visitors
            'visitor.view',
            'visitor.create',
            'visitor.update',
            'visitor.delete',

            // Maintenance
            'maintenance.view',
            'maintenance.create',
            'maintenance.update',
            'maintenance.delete',

            // Invoices
            'invoice.view',
            'invoice.create',
            'invoice.update',
            'invoice.delete',

            // Collections
            'collection.view',
            'collection.create',

            // Notices
            'notice.view',
            'notice.create',
            'notice.update',
            'notice.delete',

            // Complaints
            'complaint.view',
            'complaint.create',
            'complaint.update',
            'complaint.delete',

            // Amenities
            'amenity.view',
            'amenity.create',
            'amenity.update',
            'amenity.delete',

            // Documents
            'document.view',
            'document.create',
            'document.update',
            'document.delete',

            // Activity Logs (audit trail)
            'activity-log.view',

            // Roles & Permissions
            'role.view',
            'role.create',
            'role.update',
            'role.delete',

            'permission.view',
            'permission.assign',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }
    }
}
