<?php

use App\Http\Controllers\App\AddressTypeController;
use App\Http\Controllers\App\CategoryController;
use App\Http\Controllers\App\MembersController;
use App\Http\Controllers\App\MemberTypeController;
use App\Http\Controllers\App\WaiterController;
use App\Http\Controllers\FloorController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\KitchenController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\App\DashboardController;
use App\Http\Controllers\SettingController;
use App\Http\Middleware\AuthenticateTenant;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Stancl\Tenancy\Middleware\InitializeTenancyByPath;

Route::group([
    'prefix' => '/{tenant}',
    'middleware' => ['web', InitializeTenancyByPath::class],
], function () {
    Route::get('/', fn() => redirect()->route('tenant.login'));

    // Tenant auth-protected routes
    Route::middleware([AuthenticateTenant::class, 'auth:tenant'])->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('tenant.dashboard');

        // All Orders
        Route::get('/order/all', [DashboardController::class, 'allOrders'])->name('order.all');
        // Order Reservations
        Route::get('/order/reservations', [DashboardController::class, 'orderReservations'])->name('order.reservations');
        // Order Reservation WeekDays
        Route::get('/weekly-reservation-overview', [DashboardController::class, 'weeklyReservationOverview'])->name('order.weekly-overview');

        Route::get('/order/queue', [OrderController::class, 'orderQueue'])->name('order.queue');

        // for member and waiter
        Route::get('/user/search', [UserController::class, 'searchMember'])->name('user.search');
        Route::get('/waiters/all', [UserController::class, 'waiters'])->name('waiters.all');
        Route::get('/kitchens/all', [UserController::class, 'kitchens'])->name('kitchens.all');
        Route::get('/floor/all', [FloorController::class, 'floorAll'])->name('floor.all');

        // Members
        Route::resource('members', MembersController::class)->except('show', 'edit');

        // address
        Route::resource('/members/address-types', AddressTypeController::class)->except('show', 'edit');
        Route::get('/members/address-types', [AddressTypeController::class, 'index'])->name('address-types.index');
        Route::post('/members/address-types', [AddressTypeController::class, 'store'])->name('address-types.store');
        Route::put('/members/address-types/{id}/update', [AddressTypeController::class, 'update'])->name('address.update');
        Route::delete('/members/address-types/{id}', [AddressTypeController::class, 'destroy'])->name('address.destroy');
        // member
        Route::get('/members', [MembersController::class, 'index'])->name('members.index');
        Route::get('/members/create', [MembersController::class, 'create'])->name('members.create');
        Route::post('/members', [MembersController::class, 'store'])->name('members.store');
        Route::get('/members/{id}/edit', [MembersController::class, 'edit'])->name('members.edit');
        // Route::put('/members/{id}', [MembersController::class, 'update'])->name('members.update');

        // Waiter Dashboard
        Route::get('/waiters', [WaiterController::class, 'index'])->name('waiters.index');
        Route::get('/waiters/create', [WaiterController::class, 'create'])->name('waiters.create');
        Route::post('/waiters', [WaiterController::class, 'store'])->name('waiters.store');
        Route::put('/waiters/{id}/update', [WaiterController::class, 'update'])->name('waiters.update');


        // Order Management
        Route::post('/order/reservation', [OrderController::class, 'orderReservation'])->name('order.reservation');
        Route::get('/new/order', [OrderController::class, 'index'])->name('order.new');
        Route::get('/order/menu', [OrderController::class, 'orderMenu'])->name('order.menu');
        Route::get('/order/savedOrder', [OrderController::class, 'savedOrder'])->name('order.savedOrder');
        Route::post('/order/{id}/update', [OrderController::class, 'update'])->name('orders.update');

        Route::get('/order/management', [OrderController::class, 'orderManagement'])->name('order.management');
        // Send to kitchen order
        Route::post('/order/send/kitchen', [OrderController::class, 'sendToKitchen'])->name('order.send-to-kitchen');

        // get products
        Route::get('/product/categories', [OrderController::class, 'getCategories'])->name('products.categories');
        Route::get('/products/{category_id}', [OrderController::class, 'getProducts'])->name('products.bycategory');

        Route::get('/settings', function () {
            return Inertia::render('App/Settings/Dashboard');
        })->name('settings');

        // Route::get('/kitchen', function () {
        //     return Inertia::render('App/Kitchen/Dashboard');
        // });

        Route::get('/add/information', function () {
            return Inertia::render('App/Member/AddInfo');
        });

        Route::get('/customers/list', function () {
            return Inertia::render('App/Member/Customer');
        });

        // Floors & Table Routes
        Route::get('/floors', [FloorController::class, 'index'])->name('floors.index');
        Route::post('/floors', [FloorController::class, 'store'])->name('floors.store');
        Route::put('/floors/{id}/update', [FloorController::class, 'update'])->name('floors.update');
        Route::delete('/floors/{floor}', [FloorController::class, 'destroy'])->name('floors.destroy');

        Route::get('/floors/{id}/edit', [FloorController::class, 'edit'])->name('floors.edit');
        Route::put('/floors/{id}/status', [FloorController::class, 'toggleStatus'])->name('floors.toggleStatus');
        Route::get('/table/management', [FloorController::class, 'floorTable'])->name('table.management');

        // Combined create/edit route
        Route::get('/add/newfloor/{id?}', [FloorController::class, 'createOrEdit'])->name('floors.createOrEdit');

        Route::get('/floors/get-floors', [FloorController::class, 'getFloors'])->name('floors.getFloors');
        // get Table Order Details
        Route::get('/table/order/{id}', [FloorController::class, 'tableOrderDetails'])->name('table.order.details');

        // End of floors routes

        // Inventory Category
        Route::get('/inventory/category', [CategoryController::class, 'index'])->name('inventory.category');
        Route::post('/inventory/category', [CategoryController::class, 'store'])->name('inventory.category.store');
        Route::put('/inventory/category/{category}/update', [CategoryController::class, 'update'])->name('category.update');
        Route::delete('/inventory/category/{category}', [CategoryController::class, 'destroy'])->name('category.destroy');
        // setting
        Route::get('/setting', [SettingController::class, 'index'])->name('setting.index');
        Route::put('/setting', [SettingController::class, 'update'])->name('setting.update');
        Route::get('/setting/showTax', [SettingController::class, 'showTax'])->name('setting.showTax');
        // Inventory Items
        Route::get('/inventory/categories', [CategoryController::class, 'getCategories'])->name('inventory.categories');
        Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index');
        Route::get('/inventory/{id}', [InventoryController::class, 'show'])->name('inventory.show');
        Route::put('/inventory/{id}/update', [InventoryController::class, 'update'])->name('inventory.update');
        Route::delete('/inventory/{id}/destroy', [InventoryController::class, 'destroy'])->name('inventory.destroy');
        Route::get('/add/product', function () {
            return Inertia::render('App/Inventory/Product');
        })->name('product.create');
        Route::post('/inventory/create', [InventoryController::class, 'store'])->name('inventory.store');
        //
        Route::get('/product/{id}', [InventoryController::class, 'getProduct'])->name('product.single');



        Route::get('/kitchen', [KitchenController::class, 'index'])->name('kitchen.index');
        Route::post('/kitchen/{order}/update-all', [KitchenController::class, 'updateAll'])->name('kitchen.update-all');
        Route::post('/kitchen/{order}/item/{item}/update-status', [KitchenController::class, 'updateItemStatus'])->name('kitchen.item.update-status');

        // Transaction
        Route::get('/transaction', [TransactionController::class, 'Index'])->name('transaction.index');
        Route::get('/payment-order-data/{invoiceId}', [TransactionController::class, 'PaymentOrderData'])->name('transaction.invoice');
        Route::post('/order-payment', [TransactionController::class, 'OrderPayment'])->name('order.payment');

        // Kitchen Dashboard
        Route::get('/kitchens', [KitchenController::class, 'indexPage'])->name('kitchens.index');
        Route::get('/kitchens/create', [KitchenController::class, 'create'])->name('kitchens.create');
        Route::get('/kitchens/{id}/edit', [KitchenController::class, 'edit'])->name('kitchens.edit');
        Route::post('/kitchens', [KitchenController::class, 'store'])->name('kitchens.store');
        Route::put('/kitchens/{id}/update', [KitchenController::class, 'update'])->name('kitchens.update');
    });

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
});