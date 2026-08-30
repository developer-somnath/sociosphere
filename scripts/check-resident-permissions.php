<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Role;
use App\Models\User;

$role = Role::findByName('Resident');
$permissions = $role->permissions->pluck('name')->sort()->values()->toArray();

$residentUser = User::where('email', 'resident@sociosphere.com')->first();
$userPermissions = $residentUser ? $residentUser->getAllPermissions()->pluck('name')->sort()->values()->toArray() : [];

echo "========================================\n";
echo "ROLE: Resident\n";
echo "PERMISSIONS (" . count($permissions) . " total):\n";
foreach ($permissions as $p) {
    echo "  - {$p}\n";
}
echo "\nUSER: resident@sociosphere.com\n";
echo "PERMISSIONS (" . count($userPermissions) . " total):\n";
foreach ($userPermissions as $p) {
    echo "  - {$p}\n";
}
echo "========================================\n";
