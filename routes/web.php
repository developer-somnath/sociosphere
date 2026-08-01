<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ResidentController;
use App\Http\Controllers\FlatController;
use App\Http\Controllers\TowerController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\VisitorController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\DashboardController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// TEMP DIAGNOSTIC — remove after investigation
Route::get('/__opcache', function () {
    $config = function_exists('opcache_get_configuration') ? opcache_get_configuration() : null;
    $status = function_exists('opcache_get_status') ? opcache_get_status(false) : null;
    $start = microtime(true);

    $cachedBefore = $status['opcache_statistics']['num_cached_scripts'] ?? 0;
    $hitsBefore = $status['opcache_statistics']['hits'] ?? 0;
    $missesBefore = $status['opcache_statistics']['misses'] ?? 0;

    // Touch a small non-cached PHP file to force a compile + observe misses delta
    $tmp = sys_get_temp_dir().'/opc_diag_'.uniqid().'.php';
    file_put_contents($tmp, '<?php $x = 1;');
    include $tmp;
    unlink($tmp);

    $status2 = function_exists('opcache_get_status') ? opcache_get_status(false) : null;

    return response()->json([
        'diag_ms' => round((microtime(true) - $start) * 1000, 1),
        'enabled' => $config['directives']['opcache.enable'] ?? null,
        'enable_cli' => $config['directives']['opcache.enable_cli'] ?? null,
        'validate_timestamps' => $config['directives']['opcache.validate_timestamps'] ?? null,
        'revalidate_freq' => $config['directives']['opcache.revalidate_freq'] ?? null,
        'file_cache_consistency_checks' => $config['directives']['opcache.file_cache_consistency_checks'] ?? null,
        'file_cache_only' => $config['directives']['opcache.file_cache_only'] ?? null,
        'memory_used_mb' => round(($status['memory_usage']['used_memory'] ?? 0) / 1048576, 1),
        'cached_scripts' => $status['opcache_statistics']['num_cached_scripts'] ?? null,
        'hits_total' => $status['opcache_statistics']['hits'] ?? null,
        'misses_total' => $status['opcache_statistics']['misses'] ?? null,
        'hits_delta' => ($status2['opcache_statistics']['hits'] ?? 0) - $hitsBefore,
        'misses_delta' => ($status2['opcache_statistics']['misses'] ?? 0) - $missesBefore,
        'cache_full' => $status['cache_full'] ?? null,
    ]);
});

// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });
Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('overview');
    }
    return redirect()->route('login');
});

Route::middleware(['auth', 'society'])->group(function () {

    Route::get('/overview', [DashboardController::class, 'index'])
        ->middleware('permission:dashboard.view')
        ->name('overview');

    Route::resource('users', UserController::class)
        ->only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
        ->middleware('permission:user.view')
        ->names([
            'index' => 'users.index',
            'create' => 'users.create',
            'store' => 'users.store',
            'edit' => 'users.edit',
            'update' => 'users.update',
            'destroy' => 'users.destroy',
        ]);

    Route::resource('roles', RoleController::class)
        ->only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
        ->middleware('permission:role.view')
        ->names([
            'index' => 'roles.index',
            'create' => 'roles.create',
            'store' => 'roles.store',
            'edit' => 'roles.edit',
            'update' => 'roles.update',
            'destroy' => 'roles.destroy',
        ]);

    Route::resource('visitors', VisitorController::class)
        ->only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
        ->parameters(['visitors' => 'visitor_pass'])
        ->middleware('permission:visitor.view')
        ->names([
            'index' => 'visitors.index',
            'create' => 'visitors.create',
            'store' => 'visitors.store',
            'edit' => 'visitors.edit',
            'update' => 'visitors.update',
            'destroy' => 'visitors.destroy',
        ]);

    Route::post('visitors/{visitor_pass}/approve', [VisitorController::class, 'approve'])
        ->middleware('permission:visitor.update')
        ->name('visitors.approve');

    Route::post('visitors/{visitor_pass}/reject', [VisitorController::class, 'reject'])
        ->middleware('permission:visitor.update')
        ->name('visitors.reject');

    Route::post('visitors/{visitor_pass}/check-in', [VisitorController::class, 'checkIn'])
        ->middleware('permission:visitor.update')
        ->name('visitors.check-in');

    Route::post('visitors/{visitor_pass}/check-out', [VisitorController::class, 'checkOut'])
        ->middleware('permission:visitor.update')
        ->name('visitors.check-out');

    Route::resource('flats', FlatController::class)
        ->only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
        ->middleware('permission:flat.view')
        ->names([
            'index' => 'flats.index',
            'create' => 'flats.create',
            'store' => 'flats.store',
            'edit' => 'flats.edit',
            'update' => 'flats.update',
            'destroy' => 'flats.destroy',
        ]);

    Route::resource('towers', TowerController::class)
        ->only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
        ->middleware('permission:tower.view')
        ->names([
            'index' => 'towers.index',
            'create' => 'towers.create',
            'store' => 'towers.store',
            'edit' => 'towers.edit',
            'update' => 'towers.update',
            'destroy' => 'towers.destroy',
        ]);

    Route::resource('residents', ResidentController::class)
        ->only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
        ->middleware('permission:resident.view')
        ->names([
            'index' => 'residents.index',
            'create' => 'residents.create',
            'store' => 'residents.store',
            'edit' => 'residents.edit',
            'update' => 'residents.update',
            'destroy' => 'residents.destroy',
        ]);

    Route::get('/activity-logs', [ActivityLogController::class, 'index'])
        ->middleware('permission:activity-log.view')
        ->name('activity-logs.index');

    Route::get('/activity-logs/export', [ActivityLogController::class, 'export'])
        ->middleware('permission:activity-log.view')
        ->name('activity-logs.export');
});


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
