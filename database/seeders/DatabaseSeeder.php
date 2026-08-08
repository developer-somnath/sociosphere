<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            SocietySeeder::class,
             PermissionSeeder::class,
            RolePermissionSeeder::class,
            UserSeeder::class,

            SubscriptionPlanSeeder::class,

            TowerSeeder::class,
            FlatSeeder::class,
            ResidentSeeder::class,

            InvoiceHeadSeeder::class,
            ComplaintCategorySeeder::class,

            InvoiceSeeder::class,
            InvoiceItemSeeder::class,
            PaymentSeeder::class,

            ComplaintSeeder::class,
            NoticeSeeder::class,
            VisitorSeeder::class,
        ]);
    }
}
