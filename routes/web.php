<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AmenityBookingController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\AmenityController;
use App\Http\Controllers\CctvCameraController;
use App\Http\Controllers\ComplaintCategoryController;
use App\Http\Controllers\ComplaintController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentRepositoryController;
use App\Http\Controllers\FlatController;
use App\Http\Controllers\PaymentWebhookController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\NoticeController;
use App\Http\Controllers\ParkingSlotController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ResidentController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SecurityLogController;
use App\Http\Controllers\SocietyController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\SubscriptionPlanController;
use App\Http\Controllers\SubscriptionUsageController;
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

// Payment gateway webhooks (S4-2 / Phase 18) — public, signature-verified.
Route::post('/api/payments/webhook/{gateway}', [PaymentWebhookController::class, 'handle'])
    ->middleware('throttle:60,1')
    ->name('payments.webhook');

use App\Http\Controllers\UserInvitationController;

Route::get('/register/invitation/{token}', [UserInvitationController::class, 'showRegistrationForm'])
    ->name('invitations.register');
Route::post('/register/invitation/{token}', [UserInvitationController::class, 'acceptInvitation'])
    ->name('invitations.accept');

Route::middleware(['auth', 'society'])->group(function () {

    Route::get('/overview', [DashboardController::class, 'index'])
        ->middleware('permission:dashboard.view')
        ->name('overview');

    Route::post('users/invite', [UserController::class, 'invite'])
        ->middleware('permission:user.invite')
        ->name('users.invite');

    Route::post('users/{user}/toggle-status', [UserController::class, 'toggleStatus'])
        ->middleware('permission:user.toggle-status')
        ->name('users.toggle-status');

    Route::post('users/{user}/restore', [UserController::class, 'restore'])
        ->middleware('permission:user.restore')
        ->name('users.restore');

    Route::resource('societies', SocietyController::class)
        ->only(['index', 'create', 'store', 'show', 'edit', 'update', 'destroy'])
        ->middleware('permission:society.view')
        ->names([
            'index' => 'societies.index',
            'create' => 'societies.create',
            'store' => 'societies.store',
            'show' => 'societies.show',
            'edit' => 'societies.edit',
            'update' => 'societies.update',
            'destroy' => 'societies.destroy',
        ]);

    Route::post('towers/{tower}/restore', [TowerController::class, 'restore'])
        ->middleware('permission:tower.update')
        ->name('towers.restore');

    Route::post('flats/{flat}/restore', [FlatController::class, 'restore'])
        ->middleware('permission:flat.update')
        ->name('flats.restore');

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

    Route::post('parking-slots/{parking_slot}/deallocate', [ParkingSlotController::class, 'deallocate'])
        ->middleware('permission:parking.allocate')
        ->name('parking-slots.deallocate');

    Route::post('parking-slots/{parking_slot}/allocate', [ParkingSlotController::class, 'allocate'])
        ->middleware('permission:parking.allocate')
        ->name('parking-slots.allocate');

    Route::resource('parking-slots', ParkingSlotController::class)
        ->only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
        ->middleware('permission:parking.view')
        ->names([
            'index' => 'parking-slots.index',
            'create' => 'parking-slots.create',
            'store' => 'parking-slots.store',
            'edit' => 'parking-slots.edit',
            'update' => 'parking-slots.update',
            'destroy' => 'parking-slots.destroy',
        ]);

    Route::resource('cctv-cameras', CctvCameraController::class)
        ->only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
        ->middleware('permission:cctv.view')
        ->names([
            'index' => 'cctv-cameras.index',
            'create' => 'cctv-cameras.create',
            'store' => 'cctv-cameras.store',
            'edit' => 'cctv-cameras.edit',
            'update' => 'cctv-cameras.update',
            'destroy' => 'cctv-cameras.destroy',
        ]);

    Route::resource('security-logs', SecurityLogController::class)
        ->only(['index', 'store'])
        ->middleware('permission:security_log.view')
        ->names([
            'index' => 'security-logs.index',
            'store' => 'security-logs.store',
        ]);

    Route::resource('invoices', InvoiceController::class)
        ->only(['index', 'create', 'store', 'show', 'edit', 'update', 'destroy'])
        ->middleware('permission:invoice.view')
        ->names([
            'index' => 'invoices.index',
            'create' => 'invoices.create',
            'store' => 'invoices.store',
            'show' => 'invoices.show',
            'edit' => 'invoices.edit',
            'update' => 'invoices.update',
            'destroy' => 'invoices.destroy',
        ]);

    Route::resource('payments', PaymentController::class)
        ->only(['index', 'store'])
        ->middleware('permission:collection.view')
        ->names([
            'index' => 'payments.index',
            'store' => 'payments.store',
        ]);

    // Digital receipt (S4-2 / Phase 18) — downloadable for a recorded payment.
    Route::get('payments/{payment}/receipt', [PaymentController::class, 'receipt'])
        ->middleware('permission:collection.view')
        ->name('payments.receipt');

    // Phase 13: Auto-Billing & Financial Invariants Engine
    Route::get('billing/preview', [BillingController::class, 'preview'])
        ->middleware('permission:billing.configure')
        ->name('billing.preview');

    Route::post('billing/run', [BillingController::class, 'run'])
        ->middleware('permission:billing.run')
        ->name('billing.run');

    Route::get('billing/settings', [BillingController::class, 'settings'])
        ->middleware('permission:billing.configure')
        ->name('billing.settings');

    Route::put('billing/settings', [BillingController::class, 'updateSettings'])
        ->middleware('permission:billing.configure')
        ->name('billing.settings.update');

    Route::get('billing/runs', [BillingController::class, 'runs'])
        ->middleware('permission:billing.configure')
        ->name('billing.runs');

    Route::get('billing/ledger', [BillingController::class, 'ledger'])
        ->middleware('permission:invoice.view')
        ->name('billing.ledger');

    Route::get('billing/verify', [BillingController::class, 'verify'])
        ->middleware('permission:billing.configure')
        ->name('billing.verify');

    // Phase 14: Dynamic SaaS Subscription & Resource Entitlement Engine (Eagle)
    Route::get('subscription', [SubscriptionController::class, 'show'])
        ->middleware('permission:subscription.view')
        ->name('subscription.show');

    Route::get('subscription/usage', [SubscriptionUsageController::class, 'index'])
        ->middleware('permission:usage.view')
        ->name('subscription.usage');

    // Platform-only: plan catalog & subscription administration
    Route::middleware('role:SuperAdmin')->group(function () {
        Route::resource('plans', SubscriptionPlanController::class)
            ->only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
            ->middleware('permission:plan.view')
            ->names([
                'index' => 'plans.index',
                'create' => 'plans.create',
                'store' => 'plans.store',
                'edit' => 'plans.edit',
                'update' => 'plans.update',
                'destroy' => 'plans.destroy',
            ]);

        Route::get('subscriptions', [SubscriptionController::class, 'index'])
            ->middleware('permission:subscription.assign')
            ->name('subscriptions.index');

        Route::post('subscriptions/{society}/assign', [SubscriptionController::class, 'assign'])
            ->middleware('permission:subscription.assign')
            ->name('subscriptions.assign');

        Route::post('subscriptions/{subscription}/cancel', [SubscriptionController::class, 'cancel'])
            ->middleware('permission:subscription.assign')
            ->name('subscriptions.cancel');

        Route::post('subscriptions/{subscription}/resume', [SubscriptionController::class, 'resume'])
            ->middleware('permission:subscription.assign')
            ->name('subscriptions.resume');
    });

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

    Route::post('complaints/{complaint}/assign', [ComplaintController::class, 'assign'])
        ->middleware('permission:complaint.update')
        ->name('complaints.assign');

    Route::prefix('residents/{resident}')->group(function () {
        Route::post('family-members', [FamilyMemberController::class, 'store'])
            ->middleware('permission:resident.update')
            ->name('residents.family-members.store');
        Route::put('family-members/{familyMember}', [FamilyMemberController::class, 'update'])
            ->middleware('permission:resident.update')
            ->name('residents.family-members.update');
        Route::delete('family-members/{familyMember}', [FamilyMemberController::class, 'destroy'])
            ->middleware('permission:resident.update')
            ->name('residents.family-members.destroy');

        Route::post('vehicles', [VehicleController::class, 'store'])
            ->middleware('permission:resident.update')
            ->name('residents.vehicles.store');
        Route::put('vehicles/{vehicle}', [VehicleController::class, 'update'])
            ->middleware('permission:resident.update')
            ->name('residents.vehicles.update');
        Route::delete('vehicles/{vehicle}', [VehicleController::class, 'destroy'])
            ->middleware('permission:resident.update')
            ->name('residents.vehicles.destroy');
    });

    Route::post('complaints/{complaint}/transition', [ComplaintController::class, 'transition'])
        ->middleware('permission:complaint.update')
        ->name('complaints.transition');

    Route::resource('complaints', ComplaintController::class)
        ->only(['index', 'create', 'store', 'show', 'edit', 'update', 'destroy'])
        ->middleware('permission:complaint.view')
        ->names([
            'index' => 'complaints.index',
            'create' => 'complaints.create',
            'store' => 'complaints.store',
            'show' => 'complaints.show',
            'edit' => 'complaints.edit',
            'update' => 'complaints.update',
            'destroy' => 'complaints.destroy',
        ]);

    Route::resource('complaint-categories', ComplaintCategoryController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->middleware('permission:complaint.view')
        ->names([
            'index' => 'complaint-categories.index',
            'store' => 'complaint-categories.store',
            'update' => 'complaint-categories.update',
            'destroy' => 'complaint-categories.destroy',
        ]);

    Route::post('amenity-bookings/{booking}/approve', [AmenityBookingController::class, 'approve'])
        ->middleware('permission:amenity.approve')
        ->name('amenity-bookings.approve');

    Route::post('amenity-bookings/{booking}/reject', [AmenityBookingController::class, 'reject'])
        ->middleware('permission:amenity.approve')
        ->name('amenity-bookings.reject');

    Route::post('amenity-bookings/{booking}/cancel', [AmenityBookingController::class, 'cancel'])
        ->middleware('permission:amenity.book')
        ->name('amenity-bookings.cancel');

    Route::resource('amenity-bookings', AmenityBookingController::class)
        ->only(['index', 'store'])
        ->middleware('permission:amenity.view')
        ->names([
            'index' => 'amenity-bookings.index',
            'store' => 'amenity-bookings.store',
        ]);

    Route::resource('amenities', AmenityController::class)
        ->only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
        ->middleware('permission:amenity.view')
        ->names([
            'index' => 'amenities.index',
            'create' => 'amenities.create',
            'store' => 'amenities.store',
            'edit' => 'amenities.edit',
            'update' => 'amenities.update',
            'destroy' => 'amenities.destroy',
        ]);

    Route::post('notices/{notice}/toggle-pin', [NoticeController::class, 'togglePin'])
        ->middleware('permission:notice.update')
        ->name('notices.toggle-pin');

    Route::post('notices/{notice}/acknowledge', [NoticeController::class, 'acknowledge'])
        ->middleware('permission:notice.view')
        ->name('notices.acknowledge');

    Route::resource('notices', NoticeController::class)
        ->only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
        ->middleware('permission:notice.view')
        ->names([
            'index' => 'notices.index',
            'create' => 'notices.create',
            'store' => 'notices.store',
            'edit' => 'notices.edit',
            'update' => 'notices.update',
            'destroy' => 'notices.destroy',
        ]);

    Route::get('documents/{document}/download', [DocumentRepositoryController::class, 'download'])
        ->middleware('permission:document.view')
        ->name('documents.download');

    Route::resource('documents', DocumentRepositoryController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->middleware('permission:document.view')
        ->names([
            'index' => 'documents.index',
            'store' => 'documents.store',
            'update' => 'documents.update',
            'destroy' => 'documents.destroy',
        ]);

    Route::get('/activity-logs', [ActivityLogController::class, 'index'])
        ->middleware('permission:activity-log.view')
        ->name('activity-logs.index');

    Route::get('/activity-logs/export', [ActivityLogController::class, 'export'])
        ->middleware('permission:activity-log.view')
        ->name('activity-logs.export');
});

use App\Http\Controllers\SocietySwitchController;

Route::middleware('auth')->group(function () {
    Route::post('/society/switch', SocietySwitchController::class)
    ->middleware(['auth', 'role:SuperAdmin'])
    ->name('society.switch');

    Route::post('/language/switch', LocaleController::class)
    ->name('language.switch');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Bell notification center (blueprint §2) — user-scoped, no society tenancy needed
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markRead'])
        ->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead'])
        ->name('notifications.read-all');

    // WebPush subscription management (PWA — S4-1)
    Route::post('/push/subscribe', [PushSubscriptionController::class, 'subscribe'])
        ->name('push.subscribe');
    Route::post('/push/unsubscribe', [PushSubscriptionController::class, 'unsubscribe'])
        ->name('push.unsubscribe');

    // Reporting engine (S4-3 / Phases 21-22)
    Route::get('/reports', [ReportController::class, 'index'])
        ->middleware('permission:collection.view')
        ->name('reports.index');
    Route::get('/reports/export', [ReportController::class, 'export'])
        ->middleware('permission:collection.view')
        ->name('reports.export');
});

require __DIR__.'/auth.php';
