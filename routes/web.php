<?php

use App\Http\Controllers\TenantController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

$allowedDomains = config('tenancy.central_domains');
if (in_array(request()->getHost(), $allowedDomains)) {
    Route::get('/', function () {
        return Inertia::render('welcome');
    })->name('home');
    Route::middleware(['auth', 'verified'])->group(function () {
        Route::get('dashboard', function () {
            return Inertia::render('dashboard');
        })->name('dashboard');

        Route::get('tenants', [TenantController::class, 'index'])->name('tenant.index');
        Route::get('tenant/register', [TenantController::class, 'create'])->name('tenant.create');

        Route::post('tenant/store', [TenantController::class, 'store'])->name('tenant.store');
    });

    require __DIR__ . '/settings.php';
    require __DIR__ . '/auth.php';
}