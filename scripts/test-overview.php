<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Services\DashboardService;

$user = User::where('email', 'resident@sociosphere.com')->first();
$service = new DashboardService();
$stats = $service->stats(1, $user);

echo "========================================\n";
echo "OVERVIEW STATS FOR RESIDENT:\n";
echo "========================================\n";
print_r($stats);
echo "========================================\n";
