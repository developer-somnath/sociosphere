<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FlatController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ResidentController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\TowerController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VisitorController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// TEMP DIAGNOSTIC — remove after investigation
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

require __DIR__.'/auth.php';
