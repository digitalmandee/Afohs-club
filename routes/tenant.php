<?php

declare(strict_types=1);

use App\Http\Controllers\App\CategoryController;
use App\Http\Controllers\FloorController;
use App\Http\Controllers\TableController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;

/*
 * |--------------------------------------------------------------------------
 * | Tenant Routes
 * |--------------------------------------------------------------------------
 * |
 * | Here you can register the tenant routes for your application.
 * | These routes are loaded by the TenantRouteServiceProvider.
 * |
 * | Feel free to customize them however you want. Good luck!
 * |
 */

Route::middleware([
    'web',
    InitializeTenancyByDomain::class,
    PreventAccessFromCentralDomains::class,
])->group(function () {
    $allowedDomains = config('tenancy.central_domains');
    if (!in_array(request()->getHost(), $allowedDomains)) {
        // Route::get('/', function () {
        //     return 'This is your multi-tenant application. The id of the current tenant is ' . tenant('id');
        // });
        Route::middleware(['auth', 'verified'])->group(function () {
            Route::get('/', function () {
                return Inertia::render('App/Dashboard/Dashboardm');
            })->name('dashboard');

            Route::get('/order/queue', function () {
                return Inertia::render('App/Order/Queue');
            });

            Route::get('/all/order', function () {
                return Inertia::render('App/Order/OrderList');
            });

            Route::get('/new/order', function () {
                return Inertia::render('App/Order/New/Index');
            });

            Route::get('/inventory', function () {
                return Inertia::render('App/Inventory/Dashboard');
            });

            Route::get('/transaction', function () {
                return Inertia::render('App/Transaction/Dashboard');
            });

            Route::get('/settings', function () {
                return Inertia::render('App/Settings/Dashboard');
            });

            // Route::get('/table/management', function () {
            //     return Inertia::render('App/Table/Dashboard');
            // })->name('table.management');

            Route::get('/add/newfloor', function () {
                return Inertia::render('App/Table/NewFloor');
            });






            // Inventory Category

            Route::get('/inventory/category', [CategoryController::class, 'index'])->name('inventory.category');
            Route::post('/inventory/category', [CategoryController::class, 'store'])->name('inventory.category.store');
            Route::put('/inventory/category/{category}', [CategoryController::class, 'update'])->name('category.update');
            Route::delete('/inventory/category/{category}', [CategoryController::class, 'destroy'])->name('category.destroy');

            // floors routes

            Route::get('/floors', [FloorController::class, 'index'])->name('floors.index');
            Route::post('/floors', [FloorController::class, 'store'])->name('floors.store');
            Route::get('/table/management', [FloorController::class, 'floorTable'])->name('table.management');
            Route::put('/floors/{id}/status', [FloorController::class, 'toggleStatus']);

            // End of floors routes
        });
        // End of Tenant Routes

        // Login Authentication Routes
        Route::get('/forget-pin', function () {
            return Inertia::render('App/Auth/ForgetPin');
        });

        Route::get('/reset/pin', function () {
            return Inertia::render('App/Auth/Reset');
        });

        Route::get('/set/new/pin', function () {
            return Inertia::render('App/Auth/NewPin');
        });

        Route::get('/success', function () {
            return Inertia::render('App/Auth/Success');
        });

        // Authentication
        require __DIR__ . '/tenant-auth.php';
    }
});
