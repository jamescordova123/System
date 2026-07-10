<?php

use App\Http\Controllers\Admin\BrandingController;
use App\Http\Controllers\Admin\ImpersonateController;
use App\Http\Controllers\Admin\SecurityController as AdminSecurityController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\Settings\ApiTokenController;
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
});

require __DIR__.'/settings.php';
