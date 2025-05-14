<?php

use App\Http\Controllers\App\Auth\AuthController;
use App\Http\Controllers\App\Auth\AuthenticatedSessionController;
use App\Http\Controllers\App\Auth\NewPasswordController;
use App\Http\Controllers\App\Auth\PasswordResetLinkController;
use App\Http\Controllers\App\Auth\RegisteredUserController;
use App\Http\Middleware\AuthenticateTenant;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Stancl\Tenancy\Middleware\InitializeTenancyByPath;

Route::group([
    'prefix' => '/{tenant}',
    'middleware' => ['web', InitializeTenancyByPath::class],
], function () {
    Route::get('/', function () {
        return 'Tenant ID: ' . tenant('id');
    });

    // Tenant auth-protected routes
    Route::middleware([\App\Http\Middleware\AuthenticateTenant::class, 'auth:tenant'])->group(function () {
        Route::get('/test', function () {
            return Inertia::render('App/Dashboard/Dashboardm');
        })->name('tenant.dashboard');

        Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('tenant.logout');
    });

    // Tenant guest-only auth routes
    Route::middleware(\App\Http\Middleware\RedirectIfTenantAuthenticated::class)->group(function () {
        Route::get('/register', [RegisteredUserController::class, 'create'])->name('tenant.register');
        Route::post('/register', [RegisteredUserController::class, 'store']);

        Route::post('/check-user-id', [AuthController::class, 'checkUserId'])->name('tenant.check-user-id');

        Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('tenant.login');
        Route::post('/login', [AuthenticatedSessionController::class, 'store']);

        Route::get('/forgot-password', [PasswordResetLinkController::class, 'create'])->name('tenant.password.request');
        Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])->name('tenant.password.email');

        Route::get('/reset-password/{token}', [NewPasswordController::class, 'create'])->name('tenant.password.reset');
        Route::post('/reset-password', [NewPasswordController::class, 'store'])->name('tenant.password.store');
    });
});