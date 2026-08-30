<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Http\Controllers\DashboardController;
use App\Services\DashboardService;

$user = User::where('email', 'resident@sociosphere.com')->first();
Auth::login($user);

$controller = new DashboardController(new DashboardService());
$request = Request::create('/overview', 'GET');
$request->setUserResolver(fn() => $user);

$response = $controller->index($request);

echo "STATUS: Inertia render successful!\n";
echo "Component: " . $response->toResponse($request)->original->getComponent() . "\n";
