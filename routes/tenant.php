<?php

use App\Http\Controllers\App\AddressTypeController;
use App\Http\Controllers\App\CategoryController;
use App\Http\Controllers\App\CustomerController;
use App\Http\Controllers\App\DashboardController;
use App\Http\Controllers\App\MembersController;
use App\Http\Controllers\App\MemberTypeController;
use App\Http\Controllers\App\WaiterController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\FloorController;
use App\Http\Controllers\IngredientController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\KitchenController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\AuthenticateTenant;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Stancl\Tenancy\Middleware\InitializeTenancyByPath;

Route::group([
    'prefix' => '/{tenant}',
    'middleware' => ['web', InitializeTenancyByPath::class],
], function () {
    Route::get('/', fn() => redirect()->route('tenant.login', ['tenant' => tenant('id')]));

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
        Route::resource('customers', CustomerController::class)->except(['show']);

        Route::get('/members', [MembersController::class, 'index'])->name('members.index');

        // Waiter Dashboard
        // Route::get('/waiters', [WaiterController::class, 'index'])->name('waiters.index');
        // Route::get('/waiters/create', [WaiterController::class, 'create'])->name('waiters.create');
        // Route::post('/waiters', [WaiterController::class, 'store'])->name('waiters.store');
        // Route::put('/waiters/{id}/update', [WaiterController::class, 'update'])->name('waiters.update');

        // Reservations
        Route::get('/reservations', [ReservationController::class, 'index'])->name('reservations.index');
        Route::post('/reservations/{reservation}/cancel', [ReservationController::class, 'cancel'])->name('reservations.cancel');

        // Order Management
        Route::post('/order/reservation', [ReservationController::class, 'orderReservation'])->name('order.reservation');
        Route::get('/order/new', [OrderController::class, 'index'])->name('order.new');
        Route::get('/order/menu', [OrderController::class, 'orderMenu'])->name('order.menu');
        Route::get('/rooms-for-order', [OrderController::class, 'getRoomsForOrder'])->name('rooms.order');
        Route::get('/order/search-products', [OrderController::class, 'searchProducts'])->name('order.search.products');
        Route::get('/order/savedOrder', [OrderController::class, 'savedOrder'])->name('order.savedOrder');
        Route::post('/order/{id}/update', [OrderController::class, 'update'])->name('orders.update');

        // Delivery Rider
        Route::get('/riders/all', [UserController::class, 'riders'])->name('riders.all');

        Route::get('/order/management', [OrderController::class, 'orderManagement'])->name('order.management');
        Route::get('/order/history', [OrderController::class, 'orderHistory'])->name('order.history');
        Route::post('/order/{id}/generate-invoice', [OrderController::class, 'generateInvoice'])->name('order.generate-invoice');
        // Send to kitchen order
        Route::post('/order/send/kitchen', [OrderController::class, 'sendToKitchen'])->name('order.send-to-kitchen');

        Route::get('/product/categories', [OrderController::class, 'getCategories'])->name('products.categories');
        Route::get('/products/{category_id}', [OrderController::class, 'getProducts'])->name('products.bycategory');
        Route::get('/api/orders/search-customers', [OrderController::class, 'searchCustomers'])->name('api.orders.search-customers');

        Route::get('/settings', function () {
            return Inertia::render('App/Settings/Dashboard');
        })->name('settings');

        // Route::get('/kitchen', function () {
        //     return Inertia::render('App/Kitchen/Dashboard');
        // });

        Route::get('/add/information', function () {
            return Inertia::render('App/Member/AddInfo');
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

        // setting
        Route::get('/setting', [SettingController::class, 'index'])->name('setting.index');
        Route::put('/setting', [SettingController::class, 'update'])->name('setting.update');
        Route::get('/setting/showTax', [SettingController::class, 'showTax'])->name('setting.showTax');

        // Inventory Category
        Route::get('/inventory/category', [CategoryController::class, 'index'])->name('inventory.category');
        Route::post('/inventory/category', [CategoryController::class, 'store'])->name('inventory.category.store');
        Route::put('/inventory/category/{category}/update', [CategoryController::class, 'update'])->name('category.update');
        Route::delete('/inventory/category/{category}', [CategoryController::class, 'destroy'])->name('category.destroy');

        // Ingredients Management
        Route::get('/inventory/ingredients', [IngredientController::class, 'index'])->name('ingredients.index');
        Route::get('/inventory/ingredients/create', [IngredientController::class, 'create'])->name('ingredients.create');
        Route::post('/inventory/ingredients', [IngredientController::class, 'store'])->name('ingredients.store');
        Route::get('/inventory/ingredients/{ingredient}', [IngredientController::class, 'show'])->name('ingredients.show');
        Route::get('/inventory/ingredients/{ingredient}/edit', [IngredientController::class, 'edit'])->name('ingredients.edit');
        Route::put('/inventory/ingredients/{ingredient}', [IngredientController::class, 'update'])->name('ingredients.update');
        Route::delete('/inventory/ingredients/{ingredient}', [IngredientController::class, 'destroy'])->name('ingredients.destroy');
        Route::get('/inventory/ingredients/{ingredient}/add-stock', [IngredientController::class, 'showAddStock'])->name('ingredients.add-stock.form');
        Route::post('/inventory/ingredients/{ingredient}/add-stock', [IngredientController::class, 'addStock'])->name('ingredients.add-stock');

        // API Routes for Ingredients
        Route::get('/api/ingredients', [IngredientController::class, 'getIngredients'])->name('api.ingredients');
        Route::post('/api/ingredients/check-availability', [IngredientController::class, 'checkAvailability'])->name('api.ingredients.check-availability');

        // Inventory Items
        Route::get('/inventory/units', [App\Http\Controllers\PosUnitController::class, 'index'])->name('units.index');
        Route::get('/inventory/units/trashed', [App\Http\Controllers\PosUnitController::class, 'trashed'])->name('units.trashed');
        Route::post('/inventory/units', [App\Http\Controllers\PosUnitController::class, 'store'])->name('units.store');
        Route::put('/inventory/units/{id}', [App\Http\Controllers\PosUnitController::class, 'update'])->name('units.update');
        Route::post('/inventory/units/{id}/restore', [App\Http\Controllers\PosUnitController::class, 'restore'])->name('units.restore');
        Route::delete('/inventory/units/{id}', [App\Http\Controllers\PosUnitController::class, 'destroy'])->name('units.destroy');
        Route::delete('/inventory/units/{id}/force-delete', [App\Http\Controllers\PosUnitController::class, 'forceDelete'])->name('units.force-delete');

        // Manufacturers
        Route::get('/inventory/manufacturers', [App\Http\Controllers\PosManufacturerController::class, 'index'])->name('manufacturers.index');
        Route::get('/inventory/manufacturers/trashed', [App\Http\Controllers\PosManufacturerController::class, 'trashed'])->name('manufacturers.trashed');
        Route::post('/inventory/manufacturers', [App\Http\Controllers\PosManufacturerController::class, 'store'])->name('manufacturers.store');
        Route::put('/inventory/manufacturers/{id}', [App\Http\Controllers\PosManufacturerController::class, 'update'])->name('manufacturers.update');
        Route::post('/inventory/manufacturers/{id}/restore', [App\Http\Controllers\PosManufacturerController::class, 'restore'])->name('manufacturers.restore');
        Route::delete('/inventory/manufacturers/{id}', [App\Http\Controllers\PosManufacturerController::class, 'destroy'])->name('manufacturers.destroy');
        Route::delete('/inventory/manufacturers/{id}/force-delete', [App\Http\Controllers\PosManufacturerController::class, 'forceDelete'])->name('manufacturers.force-delete');

        Route::get('/inventory/categories', [CategoryController::class, 'getCategories'])->name('inventory.categories');
        Route::get('/inventory/products', [InventoryController::class, 'index'])->name('inventory.index');
        Route::get('/inventory/products/add', function () {
            return Inertia::render('App/Inventory/Product');
        })->name('product.create');
        Route::get('/inventory/products/edit/{id}', [InventoryController::class, 'show'])->name('inventory.show');
        Route::post('/inventory/products/{id}/update', [InventoryController::class, 'update'])->name('inventory.update');
        Route::delete('/inventory/products/{id}/destroy', [InventoryController::class, 'destroy'])->name('inventory.destroy');
        Route::post('/inventory/products/create', [InventoryController::class, 'store'])->name('inventory.store');
        // Get Single Product
        Route::get('/inventory/product/{id}', [InventoryController::class, 'getProduct'])->name('product.single');
        // API route for product filtering
        Route::get('/api/inventory/products/filter', [InventoryController::class, 'filter'])->name('api.products.filter');

        Route::get('/kitchen', [KitchenController::class, 'index'])->name('kitchen.index');
        Route::post('/kitchen/{order}/update-all', [KitchenController::class, 'updateAll'])->name('kitchen.update-all');
        Route::post('/kitchen/{order}/item/{item}/update-status', [KitchenController::class, 'updateItemStatus'])->name('kitchen.item.update-status');

        // Transaction
        Route::get('/transaction', [TransactionController::class, 'index'])->name('transaction.index');
        Route::get('/transaction/history', [TransactionController::class, 'transactionHistory'])->name('transaction.history');
        Route::get('/payment-order-data/{invoiceId}', [TransactionController::class, 'PaymentOrderData'])->name('transaction.invoice');
        Route::post('/order-payment', [TransactionController::class, 'OrderPayment'])->name('order.payment');

        // Kitchen Dashboard
        // Route::get('/kitchens', [KitchenController::class, 'indexPage'])->name('kitchens.index');
        Route::get('/kitchens/create', [KitchenController::class, 'create'])->name('kitchens.create');
        Route::get('/kitchens/{id}/edit', [KitchenController::class, 'edit'])->name('kitchens.edit');
        Route::post('/kitchens', [KitchenController::class, 'store'])->name('kitchens.store');
        Route::put('/kitchens/{id}/update', [KitchenController::class, 'update'])->name('kitchens.update');

        // Route::get('/test', function () {
        //     return Inertia::render('App/Test');
        // })->name('test');

        // Api Floors with Tables
        Route::get('/api/floors-with-tables', [OrderController::class, 'getFloorsWithTables'])->name('api.floors-with-tables');
        Route::get('/tables/{table}/available-times', [ReservationController::class, 'availableTimes'])->name('tables.available-times');
        // Employee Log
        Route::get('/api/employee-logs', [EmployeeController::class, 'employeeLog'])->name('api.employee-logs');
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
