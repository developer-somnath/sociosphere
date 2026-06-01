<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ResidentController;
use App\Http\Controllers\FlatController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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

    Route::get('/overview', function () {

        return Inertia::render(
            'Features/Dashboard/Pages/Dashboard'
        );
    })->name('overview');

    Route::resource('property-units', FlatController::class)->only(['create', 'index', "{flat}/edit"])->names([
        'index' => 'property-units.index',
        'create' => 'property-units.create',
        'edit' => 'property-units.edit',
    ]);

    Route::get('/residents', [ResidentController::class, 'index'])
        ->name('residents.index');
});


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
