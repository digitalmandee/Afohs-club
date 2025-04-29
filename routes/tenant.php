<?php

declare(strict_types=1);

use App\Http\Controllers\App\AddressTypeController;
use App\Http\Controllers\App\CategoryController;
use App\Http\Controllers\App\MembersController;
use App\Http\Controllers\App\MemberTypeController;
use App\Http\Controllers\FloorController;
use App\Http\Controllers\TableController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\OrderController;
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

            Route::get('/new/order', [OrderController::class, 'index'])->name('order.index');


            Route::get('/transaction', function () {
                return Inertia::render('App/Transaction/Dashboard');
            });

            Route::get('/settings', function () {
                return Inertia::render('App/Settings/Dashboard');
            });

            Route::get('/kitchen', function () {
                return Inertia::render('App/Kitchen/Dashboard');
            });

            Route::get('/add/information', function () {
                return Inertia::render('App/Member/AddInfo');
            });

            Route::get('/customers/list', function () {
                return Inertia::render('App/Member/Customer');
            });


            Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index');

            Route::get('/add/product', function () {
                return Inertia::render('App/Inventory/Product');
            })->name('product.create');

            // Route::get('/table/management', function () {
            //     return Inertia::render('App/Table/Dashboard');
            // })->name('table.management');

            // Inventory Category
            Route::get('/inventory/category', [CategoryController::class, 'index'])->name('inventory.category');
            Route::post('/inventory/category', [CategoryController::class, 'store'])->name('inventory.category.store');
            Route::put('/inventory/category/{category}', [CategoryController::class, 'update'])->name('category.update');
            Route::delete('/inventory/category/{category}', [CategoryController::class, 'destroy'])->name('category.destroy');

            // Floors & Table Routes
            Route::get('/floors', [FloorController::class, 'index'])->name('floors.index');
            Route::post('/floors', [FloorController::class, 'store'])->name('floors.store');
            Route::put('/floors/{id}', [FloorController::class, 'update'])->name('floors.update');
            Route::delete('/floors/{floor}', [FloorController::class, 'destroy'])->name('floors.destroy');

            Route::get('/floors/{id}/edit', [FloorController::class, 'edit'])->name('floors.edit');
            Route::put('/floors/{id}/status', [FloorController::class, 'toggleStatus'])->name('floors.toggleStatus');
            Route::get('/table/management', [FloorController::class, 'floorTable'])->name('table.management');

            // Combined create/edit route
            Route::get('/add/newfloor/{id?}', [FloorController::class, 'createOrEdit'])->name('floors.createOrEdit');

            Route::get('/floors/get-floors', [FloorController::class, 'getFloors'])->name('floors.getFloors');

            // End of floors routes

            // Inventory Items
            Route::post('/inventory/create', [InventoryController::class, 'store'])->name('inventory.store');
            Route::get('/inventory/categories', [CategoryController::class, 'getCategories'])->name('inventory.categories');

            Route::get('/admin/dashboard', function () {
                return Inertia::render('App/Admin/Dashboard');
            });

            Route::get('/admin/booking/dashboard', function () {
                return Inertia::render('App/Admin/Booking/Dashboard');
            });

            Route::get('/admin/booking/details', function () {
                return Inertia::render('App/Admin/Booking/Detail');
            });

            Route::get('/admin/room/booking', function () {
                return Inertia::render('App/Admin/Booking/RoomBooking');
            });

            // Members
            Route::resource('members', MembersController::class)->except('show', 'edit');
            Route::resource('/members/member-types', MemberTypeController::class)->except('show', 'edit');
            Route::get('/members/member-types', [MemberTypeController::class, 'index'])->name('member-types.index');
            Route::post('/members/member-types', [MemberTypeController::class, 'store'])->name('member-types.store');
            Route::put('/members/member-types/{id}', [MemberTypeController::class, 'update'])->name('member.update');
            Route::delete('/members/member-types/{id}', [MemberTypeController::class, 'destroy'])->name('member.destroy');
            // address
            Route::resource('/members/address-types', AddressTypeController::class)->except('show', 'edit');
            Route::get('/members/address-types', [AddressTypeController::class, 'index'])->name('address-types.index');
            Route::post('/members/address-types', [AddressTypeController::class, 'store'])->name('address-types.store');
            Route::put('/members/address-types/{id}', [AddressTypeController::class, 'update'])->name('address.update');
            Route::delete('/members/address-types/{id}', [AddressTypeController::class, 'destroy'])->name('address.destroy');
            // users
            // Route::get('members/create', [MembersController::class, 'index'])->name('members');
            // Route::get('members/create', [MembersController::class, 'create'])->name('members.create');
            // List all members (dashboard)
            Route::get('/members', [MembersController::class, 'index'])->name('members.index');

            // Show create form
            Route::get('/members/create', [MembersController::class, 'create'])->name('members.create');

            // Store new member
            Route::post('/members', [MembersController::class, 'store'])->name('members.store');

            // Update existing member
            Route::put('/members/{id}', [MembersController::class, 'update'])->name('members.update');



            // Route::resource('members/create', MembersController::class)->except('show', 'edit');
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
