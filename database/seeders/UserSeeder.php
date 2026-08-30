<?php

namespace Database\Seeders;

use App\Models\Society;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $society = Society::first();

        if (! $society) {
            $this->command->error('No society found. Run SocietySeeder first.');
            return;
        }

        // 1. Super Admin
        $superAdmin = User::firstOrCreate(
            ['email' => 'admin@sociosphere.com'],
            [
                'name' => 'Super Administrator',
                'phone' => '+91 98000 00001',
                'password' => Hash::make('password'),
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $superAdmin->syncRoles(['SuperAdmin']);

        // 2. Society Admin
        $societyAdmin = User::firstOrCreate(
            ['email' => 'societyadmin@gvr.com'],
            [
                'society_id' => $society->id,
                'name' => 'Somnath Mukherjee',
                'phone' => '+91 98200 11223',
                'password' => Hash::make('password'),
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $societyAdmin->syncRoles(['SocietyAdmin']);

        // 3. Treasurer
        $treasurer = User::firstOrCreate(
            ['email' => 'treasurer@gvr.com'],
            [
                'society_id' => $society->id,
                'name' => 'Rajesh K. Mehta (Treasurer)',
                'phone' => '+91 98200 44556',
                'password' => Hash::make('password'),
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $treasurer->syncRoles(['Treasurer']);

        // 4. Security Guard
        $guard = User::firstOrCreate(
            ['email' => 'security@gvr.com'],
            [
                'society_id' => $society->id,
                'name' => 'Ramesh Shinde (Head Guard)',
                'phone' => '+91 98200 77889',
                'password' => Hash::make('password'),
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $guard->syncRoles(['SecurityGuard']);

        // 5. Maintenance Staff
        $staff = User::firstOrCreate(
            ['email' => 'maintenance@gvr.com'],
            [
                'society_id' => $society->id,
                'name' => 'Santosh Vishwakarma (Facility Lead)',
                'phone' => '+91 98200 99001',
                'password' => Hash::make('password'),
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $staff->syncRoles(['MaintenanceStaff']);

        // 6. Realistic Indian Residents
        $residents = [
            ['name' => 'Resident Demo', 'email' => 'resident@sociosphere.com', 'phone' => '+91 98000 11111'],
            ['name' => 'Aarav Sharma', 'email' => 'aarav.sharma@gmail.com', 'phone' => '+91 98111 22334'],
            ['name' => 'Priya Patel', 'email' => 'priya.patel@outlook.com', 'phone' => '+91 98222 33445'],
            ['name' => 'Vikramaditya Roy', 'email' => 'vikram.roy@yahoo.in', 'phone' => '+91 98333 44556'],
            ['name' => 'Ananya Deshmukh', 'email' => 'ananya.deshmukh@gmail.com', 'phone' => '+91 98444 55667'],
            ['name' => 'Dr. Sanjay Kulkarni', 'email' => 'dr.kulkarni@apollo.org', 'phone' => '+91 98555 66778'],
            ['name' => 'Neha Agarwal', 'email' => 'neha.agarwal@gmail.com', 'phone' => '+91 98666 77889'],
            ['name' => 'Kavita Menon', 'email' => 'kavita.menon@hotmail.com', 'phone' => '+91 98777 88990'],
            ['name' => 'Rohan Gupta', 'email' => 'rohan.gupta@techcorp.in', 'phone' => '+91 98888 99001'],
            ['name' => 'Sunita Rao', 'email' => 'sunita.rao@gmail.com', 'phone' => '+91 98999 00112'],
            ['name' => 'Arjun Nambiar', 'email' => 'arjun.nambiar@gmail.com', 'phone' => '+91 99000 11223'],
            ['name' => 'Deepak Verma', 'email' => 'deepak.verma@tcs.com', 'phone' => '+91 99111 22334'],
            ['name' => 'Meera Sen', 'email' => 'meera.sen@gmail.com', 'phone' => '+91 99222 33445'],
            ['name' => 'Alok Kumar Tiwari', 'email' => 'alok.tiwari@gmail.com', 'phone' => '+91 99333 44556'],
            ['name' => 'Pooja Hegde', 'email' => 'pooja.hegde@infosys.com', 'phone' => '+91 99444 55667'],
            ['name' => 'Nitin Bansal', 'email' => 'nitin.bansal@gmail.com', 'phone' => '+91 99555 66778'],
            ['name' => 'Shreya Ghoshal', 'email' => 'shreya.ghoshal@gmail.com', 'phone' => '+91 99666 77889'],
            ['name' => 'Karthik Ramanathan', 'email' => 'karthik.r@wipro.com', 'phone' => '+91 99777 88990'],
            ['name' => 'Tanya Singhania', 'email' => 'tanya.singhania@gmail.com', 'phone' => '+91 99888 99001'],
            ['name' => 'Manish Chawla', 'email' => 'manish.chawla@gmail.com', 'phone' => '+91 99999 00112'],
            ['name' => 'Divya Nair', 'email' => 'divya.nair@gmail.com', 'phone' => '+91 98123 45678'],
        ];

        foreach ($residents as $r) {
            $user = User::firstOrCreate(
                ['email' => $r['email']],
                [
                    'society_id' => $society->id,
                    'name' => $r['name'],
                    'phone' => $r['phone'],
                    'password' => Hash::make('password'),
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]
            );
            $user->syncRoles(['Resident']);
        }
    }
}
