<?php declare(strict_types=1);

use App\Http\Controllers\App\CategoryController;
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

            Route::get('/table/management', function () {
                return Inertia::render('App/Table/Dashboard');
            });

            Route::get('/add/newfloor', function () {
                return Inertia::render('App/Table/Newfloor');
            });

            // Inventory Category

            Route::post('/inventory/category', [CategoryController::class, 'store']);
            Route::get('/inventory/category', [CategoryController::class, 'index'])->name('category.index');
            Route::post('/inventory/category', [CategoryController::class, 'store'])->name('category.store');
            Route::put('/inventory/category/{category}', [CategoryController::class, 'update'])->name('category.update');
            Route::delete('/inventory/category/{category}', [CategoryController::class, 'destroy'])->name('category.destroy');
        });

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
