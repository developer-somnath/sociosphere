<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Society;
use App\Models\Role;
use App\Models\Flat;
use App\Models\Tower;
use App\Models\Resident;
use Illuminate\Support\Facades\Hash;

$society = Society::first();
if (!$society) {
    $society = Society::create([
        'name' => 'Green Valley Residency',
        'address' => 'Main Road, Sector 1',
        'city' => 'Mumbai',
        'country' => 'India',
        'is_active' => true,
    ]);
}

$user = User::firstOrNew(['email' => 'resident@sociosphere.com']);
$user->name = 'Somnath Resident';
$user->phone = '9876543210';
$user->society_id = $society->id;
$user->password = 'Password123!';
$user->is_active = true;
$user->email_verified_at = now();
$user->save();

$role = Role::where('name', 'Resident')->first();
if ($role) {
    $user->syncRoles([$role]);
}

$tower = Tower::firstOrCreate(['society_id' => $society->id, 'name' => 'Tower A'], ['floors' => 10]);
$flat = Flat::firstOrCreate(
    ['society_id' => $society->id, 'flat_no' => '101'],
    [
        'tower_id' => $tower->id,
        'flat_type' => '2BHK',
        'floor_no' => 1,
        'area_sqft' => 1200,
        'ownership_type' => 'Owner',
        'occupancy_status' => 'Occupied',
    ]
);

Resident::updateOrCreate(
    ['email' => 'resident@sociosphere.com'],
    [
        'society_id' => $society->id,
        'flat_id' => $flat->id,
        'name' => $user->name,
        'phone' => $user->phone,
        'is_primary_contact' => true,
    ]
);

// Verify password check right now
$check = Hash::check('Password123!', $user->password);

echo "========================================\n";
echo "USER CONFIGURED SUCCESSFULLY!\n";
echo "========================================\n";
echo "ID: " . $user->id . "\n";
echo "Email: " . $user->email . "\n";
echo "Society: " . $society->name . " (ID: " . $user->society_id . ")\n";
echo "Flat: " . $flat->flat_no . "\n";
echo "Is Active: " . ($user->is_active ? 'YES' : 'NO') . "\n";
echo "Roles: " . implode(', ', $user->roles->pluck('name')->toArray()) . "\n";
echo "Password Check for 'Password123!': " . ($check ? 'SUCCESS (MATCHES)' : 'FAILED') . "\n";
echo "========================================\n";
