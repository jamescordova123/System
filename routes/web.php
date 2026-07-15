<?php

use App\Http\Controllers\Admin\BrandingController;
use App\Http\Controllers\Admin\ImpersonateController;
use App\Http\Controllers\Admin\SchoolOverviewController;
use App\Http\Controllers\Admin\SecurityController as AdminSecurityController;
use App\Http\Controllers\Cashier\CashierController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Registrar\RegistrarController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\Settings\ApiTokenController;
use App\Http\Controllers\Student\StudentPortalController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PublicPropertyController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::get('/buy', [PublicPropertyController::class, 'buy'])->name('public.buy');
Route::get('/rent', [PublicPropertyController::class, 'rent'])->name('public.rent');
Route::post('/properties/inquire', [PublicPropertyController::class, 'inquire'])->name('public.inquire');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('api/search', [SearchController::class, 'search'])->name('api.search');
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::resource('roles', RoleController::class);
    Route::resource('admin/users', UserController::class);
    Route::post('admin/impersonate/leave', [ImpersonateController::class, 'leave'])->name('admin.impersonate.leave');
    Route::post('admin/impersonate/{user}', [ImpersonateController::class, 'impersonate'])->name('admin.impersonate');

    // Security Settings — Overview
    Route::get('admin/security', [AdminSecurityController::class, 'index'])->name('admin.security.index');

    // Security Settings — Sub-pages
    Route::get('admin/security/password', [AdminSecurityController::class, 'password'])->name('admin.security.password');
    Route::get('admin/security/sessions', [AdminSecurityController::class, 'sessions'])->name('admin.security.sessions');
    Route::get('admin/security/access', [AdminSecurityController::class, 'access'])->name('admin.security.access');
    Route::get('admin/security/accounts', [AdminSecurityController::class, 'accounts'])->name('admin.security.accounts');
    Route::get('admin/security/audit', [AdminSecurityController::class, 'audit'])->name('admin.security.audit');

    // Security Settings — Unified update with section param
    Route::put('admin/security/{section}', [AdminSecurityController::class, 'update'])->name('admin.security.update');

    // Branding Settings
    Route::post('admin/branding', [BrandingController::class, 'update'])->name('admin.branding.update');
    Route::delete('admin/branding/{type}', [BrandingController::class, 'destroy'])->name('admin.branding.destroy');

    // Personal Access Tokens (API Keys) settings
    Route::get('settings/api-tokens', [ApiTokenController::class, 'index'])->name('api-tokens.index');
    Route::post('settings/api-tokens', [ApiTokenController::class, 'store'])->name('api-tokens.store');
    Route::delete('settings/api-tokens/{token}', [ApiTokenController::class, 'destroy'])->name('api-tokens.destroy');

    // Chat System Routes
    Route::get('chat', [ChatController::class, 'fallback'])->name('chat.fallback');
    Route::get('chat/{receiver}', [ChatController::class, 'index'])->name('chat.index');
    Route::post('chat/{receiver}', [ChatController::class, 'store'])->name('chat.store');

    // Transaction Notification Routes
    Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::post('notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');

    // Action Center Routes
    Route::get('action-center', [\App\Http\Controllers\ActionCenterController::class, 'index'])->name('action-center.index');
    Route::post('action-center/requests', [\App\Http\Controllers\ActionCenterController::class, 'store'])->name('action-center.requests.store');
    Route::put('action-center/requests/{actionRequest}', [\App\Http\Controllers\ActionCenterController::class, 'update'])->name('action-center.requests.update');
    Route::delete('action-center/requests/{actionRequest}', [\App\Http\Controllers\ActionCenterController::class, 'destroy'])->name('action-center.requests.destroy');

    // Registrar Module
    Route::prefix('registrar')->name('registrar.')->group(function () {
        Route::get('/', [RegistrarController::class, 'dashboard'])->name('dashboard')->middleware('permission:manage students');
        Route::get('/students', [RegistrarController::class, 'students'])->name('students')->middleware('permission:manage students');
        Route::post('/students', [RegistrarController::class, 'storeStudent'])->name('students.store')->middleware('permission:manage students');
        Route::put('/students/{student}', [RegistrarController::class, 'updateStudent'])->name('students.update')->middleware('permission:manage students');
        Route::delete('/students/{student}', [RegistrarController::class, 'destroyStudent'])->name('students.destroy')->middleware('permission:manage students');
        Route::get('/sections', [RegistrarController::class, 'sections'])->name('sections')->middleware('permission:manage sections');
        Route::post('/sections', [RegistrarController::class, 'storeSection'])->name('sections.store')->middleware('permission:manage sections');
        Route::put('/sections/{section}', [RegistrarController::class, 'updateSection'])->name('sections.update')->middleware('permission:manage sections');
        Route::delete('/sections/{section}', [RegistrarController::class, 'destroySection'])->name('sections.destroy')->middleware('permission:manage sections');
        Route::get('/enrollments', [RegistrarController::class, 'enrollments'])->name('enrollments')->middleware('permission:manage enrollments');
        Route::post('/enrollments', [RegistrarController::class, 'storeEnrollment'])->name('enrollments.store')->middleware('permission:manage enrollments');
        Route::put('/enrollments/{enrollment}', [RegistrarController::class, 'updateEnrollment'])->name('enrollments.update')->middleware('permission:manage enrollments');
        Route::delete('/enrollments/{enrollment}', [RegistrarController::class, 'destroyEnrollment'])->name('enrollments.destroy')->middleware('permission:manage enrollments');
    });

    // Cashier Module
    Route::prefix('cashier')->name('cashier.')->group(function () {
        Route::get('/', [CashierController::class, 'dashboard'])->name('dashboard')->middleware('permission:manage billing');
        Route::get('/billing', [CashierController::class, 'billing'])->name('billing')->middleware('permission:manage billing');
        Route::post('/billing', [CashierController::class, 'storeBilling'])->name('billing.store')->middleware('permission:manage billing');
        Route::put('/billing/{billing}', [CashierController::class, 'updateBilling'])->name('billing.update')->middleware('permission:manage billing');
        Route::delete('/billing/{billing}', [CashierController::class, 'destroyBilling'])->name('billing.destroy')->middleware('permission:manage billing');
        Route::get('/payments', [CashierController::class, 'payments'])->name('payments')->middleware('permission:manage payments');
        Route::post('/payments', [CashierController::class, 'storePayment'])->name('payments.store')->middleware('permission:manage payments');
        Route::get('/receipts', [CashierController::class, 'receipts'])->name('receipts')->middleware('permission:view receipts');
        Route::get('/payment-history', [CashierController::class, 'paymentHistory'])->name('payment-history')->middleware('permission:manage payments');
    });

    // Student Portal
    Route::prefix('student')->name('student.')->group(function () {
        Route::get('/', [StudentPortalController::class, 'dashboard'])->name('dashboard')->middleware('permission:view student portal');
        Route::get('/enrollments', [StudentPortalController::class, 'enrollments'])->name('enrollments')->middleware('permission:view student portal');
        Route::get('/billing', [StudentPortalController::class, 'billing'])->name('billing')->middleware('permission:view student portal');
        Route::get('/announcements', [StudentPortalController::class, 'announcements'])->name('announcements')->middleware('permission:view announcements');
        Route::get('/notifications', [StudentPortalController::class, 'notifications'])->name('notifications')->middleware('permission:view notifications');
        Route::post('/notifications/read-all', [StudentPortalController::class, 'markAllNotificationsRead'])->name('notifications.read-all')->middleware('permission:view notifications');
        Route::post('/notifications/{notification}/read', [StudentPortalController::class, 'markNotificationRead'])->name('notifications.read')->middleware('permission:view notifications');
    });

    // Admin School Modules
    Route::prefix('admin')->name('admin.school.')->group(function () {
        Route::get('/overview', [SchoolOverviewController::class, 'overview'])->name('overview')->middleware('permission:view school overview');
        Route::get('/announcements', [SchoolOverviewController::class, 'announcements'])->name('announcements')->middleware('permission:manage announcements');
        Route::post('/announcements', [SchoolOverviewController::class, 'storeAnnouncement'])->name('announcements.store')->middleware('permission:manage announcements');
        Route::put('/announcements/{announcement}', [SchoolOverviewController::class, 'updateAnnouncement'])->name('announcements.update')->middleware('permission:manage announcements');
        Route::delete('/announcements/{announcement}', [SchoolOverviewController::class, 'destroyAnnouncement'])->name('announcements.destroy')->middleware('permission:manage announcements');
        Route::get('/risk-analytics', [SchoolOverviewController::class, 'riskAnalytics'])->name('risk-analytics')->middleware('permission:view risk analytics');
        Route::post('/risk-analytics', [SchoolOverviewController::class, 'storeRiskPrediction'])->name('risk-analytics.store')->middleware('permission:view risk analytics');
        Route::put('/risk-analytics/{riskPrediction}', [SchoolOverviewController::class, 'updateRiskPrediction'])->name('risk-analytics.update')->middleware('permission:view risk analytics');
        Route::delete('/risk-analytics/{riskPrediction}', [SchoolOverviewController::class, 'destroyRiskPrediction'])->name('risk-analytics.destroy')->middleware('permission:view risk analytics');
    });
});

require __DIR__.'/settings.php';
