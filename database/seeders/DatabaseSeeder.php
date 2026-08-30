<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            PermissionSeeder::class,
            RolePermissionSeeder::class,
            LanguageSeeder::class,
            SocietySeeder::class,
            UserSeeder::class,
            SubscriptionPlanSeeder::class,
            TowerSeeder::class,
            FlatSeeder::class,
            ResidentSeeder::class,
            ParkingSeeder::class,
            CctvAndSecuritySeeder::class,
            AmenitySeeder::class,
            NoticeSeeder::class,
            ComplaintCategorySeeder::class,
            ComplaintSeeder::class,
            PollAndEventSeeder::class,
            InvoiceHeadSeeder::class,
            BillingAndTaxSeeder::class,
            VisitorSeeder::class,
        ]);
    }
}
