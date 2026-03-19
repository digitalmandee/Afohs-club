<?php

use App\Http\Controllers\PaymentAccountController;
use App\Models\PosLocation;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('pos')->middleware('web')->group(function () {
    Route::get('/', function (\Illuminate\Http\Request $request) {
        $posLocationId = (int) $request->session()->get('active_pos_location_id');
        $hasActivePosLocation = $posLocationId && PosLocation::where('id', $posLocationId)->where('status', 'active')->exists();

        $webUser = Auth::guard('web')->user();
        if ($webUser) {
            if ($webUser->can('pos.view')) {
                Auth::guard('tenant')->login($webUser);
                $request->session()->regenerate();
                return redirect()->route($hasActivePosLocation ? 'pos.dashboard' : 'pos.select-pos-location');
            }

            return redirect()->route('pos.login');
        }

        $tenantUser = Auth::guard('tenant')->user();
        if ($tenantUser) {
            if ($tenantUser->can('pos.view')) {
                return redirect()->route($hasActivePosLocation ? 'pos.dashboard' : 'pos.select-pos-location');
            }

            Auth::guard('tenant')->logout();
            $request->session()->forget('active_pos_location_id');
            return redirect()->route('pos.login');
        }

        return redirect()->route('pos.login');
    });
    Route::get('login', [\App\Http\Controllers\App\Auth\AuthenticatedSessionController::class, 'createPos'])->name('pos.login');
    Route::post('login', [\App\Http\Controllers\App\Auth\AuthenticatedSessionController::class, 'storePos']);
    Route::post('check-user-id', [\App\Http\Controllers\App\Auth\AuthController::class, 'checkUserId'])->name('pos.check-user-id');

    Route::middleware('auth:tenant')->group(function () {
        Route::get('select-pos-location', [\App\Http\Controllers\App\Auth\AuthenticatedSessionController::class, 'selectPosLocation'])->name('pos.select-pos-location');
        Route::post('select-pos-location', [\App\Http\Controllers\App\Auth\AuthenticatedSessionController::class, 'setPosLocation'])->name('pos.set-pos-location');
        Route::post('logout', [\App\Http\Controllers\App\Auth\AuthenticatedSessionController::class, 'destroyPos'])->name('pos.logout');
    });

    Route::middleware(['auth:tenant', 'pos.tenancy'])->group(function () {
        Route::get('dashboard', [\App\Http\Controllers\App\DashboardController::class, 'index'])->name('pos.dashboard');

        Route::get('order/all', [\App\Http\Controllers\App\DashboardController::class, 'allOrders'])->name('pos.order.all');
        Route::get('order/{id}/details', [\App\Http\Controllers\OrderController::class, 'orderDetails'])->name('pos.order.details');
        Route::get('order/new', [\App\Http\Controllers\OrderController::class, 'index'])->name('pos.order.new');
        Route::get('order/menu', [\App\Http\Controllers\OrderController::class, 'orderMenu'])->name('pos.order.menu');
        Route::get('order/queue', [\App\Http\Controllers\OrderController::class, 'orderQueue'])->name('pos.order.queue');
        Route::get('order/management', [\App\Http\Controllers\OrderController::class, 'orderManagement'])->name('pos.order.management');
        Route::get('order/history', [\App\Http\Controllers\OrderController::class, 'orderHistory'])->name('pos.order.history');
        Route::get('order/reservations', [\App\Http\Controllers\App\DashboardController::class, 'orderReservations'])->name('pos.order.reservations');
        Route::get('weekly-reservation-overview', [\App\Http\Controllers\App\DashboardController::class, 'weeklyReservationOverview'])->name('pos.order.weekly-overview');

        Route::post('order/reservation', [\App\Http\Controllers\ReservationController::class, 'orderReservation'])->name('pos.order.reservation');
        Route::get('rooms-for-order', [\App\Http\Controllers\OrderController::class, 'getRoomsForOrder'])->name('pos.rooms.order');
        Route::get('order/search-products', [\App\Http\Controllers\OrderController::class, 'searchProducts'])->name('pos.order.search.products');
        Route::get('order/savedOrder', [\App\Http\Controllers\OrderController::class, 'savedOrder'])->name('pos.order.savedOrder');
        Route::post('order/{id}/update', [\App\Http\Controllers\OrderController::class, 'update'])->name('pos.orders.update');
        Route::post('order/{id}/move-table', [\App\Http\Controllers\OrderController::class, 'moveTable'])->name('pos.orders.move-table');
        Route::post('order/{id}/generate-invoice', [\App\Http\Controllers\OrderController::class, 'generateInvoice'])->name('pos.order.generate-invoice');
        Route::post('order/send/kitchen', [\App\Http\Controllers\OrderController::class, 'sendToKitchen'])->name('pos.order.send-to-kitchen');

        Route::get('product/categories', [\App\Http\Controllers\OrderController::class, 'getCategories'])->name('pos.products.categories');
        Route::get('products/{category_id}', [\App\Http\Controllers\OrderController::class, 'getProducts'])->name('pos.products.bycategory');
        Route::get('api/orders/search-customers', [\App\Http\Controllers\OrderController::class, 'searchCustomers'])->name('pos.api.orders.search-customers');

        Route::get('api/users/global-search', [\App\Http\Controllers\UserController::class, 'searchUsers'])->name('pos.api.users.global-search');
        Route::get('api/employee-logs', [\App\Http\Controllers\EmployeeController::class, 'employeeLog'])->name('pos.api.employee-logs');
        Route::get('api/payment-accounts', [PaymentAccountController::class, 'apiIndex'])->name('pos.api.payment-accounts');
        Route::get('api/floors-with-tables', [\App\Http\Controllers\OrderController::class, 'getFloorsWithTables'])->name('pos.api.floors-with-tables');
        Route::get('api/cake-bookings/search', [\App\Http\Controllers\PosCakeBookingController::class, 'search'])->name('pos.api.cake-bookings.search');
        Route::get('api/members/{id}/family', [\App\Http\Controllers\PosCakeBookingController::class, 'getFamilyMembers'])->name('pos.api.members.family');

        Route::resource('customers', \App\Http\Controllers\PosCustomerController::class)->except(['show'])->names('pos.customers');

        Route::get('setting', [\App\Http\Controllers\SettingController::class, 'index'])->name('pos.setting.index');
        Route::put('setting', [\App\Http\Controllers\SettingController::class, 'update'])->name('pos.setting.update');

        Route::get('reservations', [\App\Http\Controllers\ReservationController::class, 'index'])->name('pos.reservations.index');
        Route::get('tables/{table}/available-times', [\App\Http\Controllers\ReservationController::class, 'availableTimes'])->name('pos.tables.available-times');

        Route::get('inventory/category', [\App\Http\Controllers\CategoryController::class, 'index'])->name('pos.inventory.category');
        Route::get('inventory/category/trashed', [\App\Http\Controllers\CategoryController::class, 'trashed'])->name('pos.category.trashed');
        Route::post('inventory/category', [\App\Http\Controllers\CategoryController::class, 'store'])->name('pos.inventory.category.store');
        Route::put('inventory/category/{category}/update', [\App\Http\Controllers\CategoryController::class, 'update'])->name('pos.category.update');
        Route::post('inventory/category/{id}/restore', [\App\Http\Controllers\CategoryController::class, 'restore'])->name('pos.category.restore');
        Route::delete('inventory/category/{category}', [\App\Http\Controllers\CategoryController::class, 'destroy'])->name('pos.category.destroy');
        Route::delete('inventory/category/{id}/force-delete', [\App\Http\Controllers\CategoryController::class, 'forceDelete'])->name('pos.category.force-delete');

        Route::get('inventory/ingredients', [\App\Http\Controllers\IngredientController::class, 'index'])->name('pos.ingredients.index');
        Route::get('inventory/ingredients/create', [\App\Http\Controllers\IngredientController::class, 'create'])->name('pos.ingredients.create');
        Route::post('inventory/ingredients', [\App\Http\Controllers\IngredientController::class, 'store'])->name('pos.ingredients.store');
        Route::get('inventory/ingredients/{ingredient}', [\App\Http\Controllers\IngredientController::class, 'show'])->name('pos.ingredients.show');
        Route::get('inventory/ingredients/{ingredient}/edit', [\App\Http\Controllers\IngredientController::class, 'edit'])->name('pos.ingredients.edit');
        Route::put('inventory/ingredients/{ingredient}', [\App\Http\Controllers\IngredientController::class, 'update'])->name('pos.ingredients.update');
        Route::delete('inventory/ingredients/{ingredient}', [\App\Http\Controllers\IngredientController::class, 'destroy'])->name('pos.ingredients.destroy');
        Route::get('inventory/ingredients/{ingredient}/add-stock', [\App\Http\Controllers\IngredientController::class, 'showAddStock'])->name('pos.ingredients.add-stock.form');
        Route::post('inventory/ingredients/{ingredient}/add-stock', [\App\Http\Controllers\IngredientController::class, 'addStock'])->name('pos.ingredients.add-stock');

        Route::get('api/ingredients', [\App\Http\Controllers\IngredientController::class, 'getIngredients'])->name('pos.api.ingredients');
        Route::post('api/ingredients/check-availability', [\App\Http\Controllers\IngredientController::class, 'checkAvailability'])->name('pos.api.ingredients.check-availability');

        Route::get('inventory/units', [\App\Http\Controllers\PosUnitController::class, 'index'])->name('pos.units.index');
        Route::get('inventory/units/trashed', [\App\Http\Controllers\PosUnitController::class, 'trashed'])->name('pos.units.trashed');
        Route::post('inventory/units', [\App\Http\Controllers\PosUnitController::class, 'store'])->name('pos.units.store');
        Route::put('inventory/units/{id}', [\App\Http\Controllers\PosUnitController::class, 'update'])->name('pos.units.update');
        Route::post('inventory/units/{id}/restore', [\App\Http\Controllers\PosUnitController::class, 'restore'])->name('pos.units.restore');
        Route::delete('inventory/units/{id}', [\App\Http\Controllers\PosUnitController::class, 'destroy'])->name('pos.units.destroy');
        Route::delete('inventory/units/{id}/force-delete', [\App\Http\Controllers\PosUnitController::class, 'forceDelete'])->name('pos.units.force-delete');

        Route::get('inventory/manufacturers', [\App\Http\Controllers\PosManufacturerController::class, 'index'])->name('pos.manufacturers.index');
        Route::get('inventory/manufacturers/trashed', [\App\Http\Controllers\PosManufacturerController::class, 'trashed'])->name('pos.manufacturers.trashed');
        Route::post('inventory/manufacturers', [\App\Http\Controllers\PosManufacturerController::class, 'store'])->name('pos.manufacturers.store');
        Route::put('inventory/manufacturers/{id}', [\App\Http\Controllers\PosManufacturerController::class, 'update'])->name('pos.manufacturers.update');
        Route::post('inventory/manufacturers/{id}/restore', [\App\Http\Controllers\PosManufacturerController::class, 'restore'])->name('pos.manufacturers.restore');
        Route::delete('inventory/manufacturers/{id}', [\App\Http\Controllers\PosManufacturerController::class, 'destroy'])->name('pos.manufacturers.destroy');
        Route::delete('inventory/manufacturers/{id}/force-delete', [\App\Http\Controllers\PosManufacturerController::class, 'forceDelete'])->name('pos.manufacturers.force-delete');

        Route::get('inventory/sub-categories', [\App\Http\Controllers\PosSubCategoryController::class, 'index'])->name('pos.sub-categories.index');
        Route::get('inventory/sub-categories/trashed', [\App\Http\Controllers\PosSubCategoryController::class, 'trashed'])->name('pos.sub-categories.trashed');
        Route::post('inventory/sub-categories', [\App\Http\Controllers\PosSubCategoryController::class, 'store'])->name('pos.sub-categories.store');
        Route::put('inventory/sub-categories/{id}', [\App\Http\Controllers\PosSubCategoryController::class, 'update'])->name('pos.sub-categories.update');
        Route::post('inventory/sub-categories/{id}/restore', [\App\Http\Controllers\PosSubCategoryController::class, 'restore'])->name('pos.sub-categories.restore');
        Route::delete('inventory/sub-categories/{id}', [\App\Http\Controllers\PosSubCategoryController::class, 'destroy'])->name('pos.sub-categories.destroy');
        Route::delete('inventory/sub-categories/{id}/force-delete', [\App\Http\Controllers\PosSubCategoryController::class, 'forceDelete'])->name('pos.sub-categories.force-delete');

        Route::get('inventory/products/trashed', [\App\Http\Controllers\InventoryController::class, 'trashed'])->name('pos.inventory.trashed');
        Route::post('inventory/products/{id}/restore', [\App\Http\Controllers\InventoryController::class, 'restore'])->name('pos.inventory.restore');
        Route::delete('inventory/products/{id}/force-delete', [\App\Http\Controllers\InventoryController::class, 'forceDelete'])->name('pos.inventory.force-delete');
        Route::get('inventory/products', [\App\Http\Controllers\InventoryController::class, 'index'])->name('pos.inventory.index');
        Route::get('inventory/products/create', [\App\Http\Controllers\InventoryController::class, 'create'])->name('pos.product.create');
        Route::get('inventory/products/{id}', [\App\Http\Controllers\InventoryController::class, 'show'])->name('pos.inventory.show');
        Route::put('inventory/products/{id}', [\App\Http\Controllers\InventoryController::class, 'update'])->name('pos.inventory.update');
        Route::delete('inventory/products/{id}', [\App\Http\Controllers\InventoryController::class, 'destroy'])->name('pos.inventory.destroy');
        Route::post('inventory/products', [\App\Http\Controllers\InventoryController::class, 'store'])->name('pos.inventory.store');
        Route::get('inventory/products/{id}/single', [\App\Http\Controllers\InventoryController::class, 'singleProduct'])->name('pos.product.single');

        Route::get('api/sub-categories/{category_id}', [\App\Http\Controllers\InventoryController::class, 'getSubCategoriesByCategory'])->name('pos.api.sub-categories.by-category');
        Route::get('api/manufacturers', [\App\Http\Controllers\InventoryController::class, 'getManufacturerList'])->name('pos.api.manufacturers.list');
        Route::get('api/units', [\App\Http\Controllers\InventoryController::class, 'getUnitList'])->name('pos.api.units.list');
        Route::get('api/products/filter', [\App\Http\Controllers\InventoryController::class, 'filterProducts'])->name('pos.api.products.filter');

        Route::get('inventory/categories', [\App\Http\Controllers\InventoryController::class, 'getCategories'])->name('pos.inventory.categories');

        Route::get('waiters/all', [\App\Http\Controllers\UserController::class, 'waiters'])->name('pos.waiters.all');
        Route::get('riders/all', [\App\Http\Controllers\UserController::class, 'riders'])->name('pos.riders.all');
        Route::get('floor/all', [\App\Http\Controllers\FloorController::class, 'floorAll'])->name('pos.floor.all');
        Route::post('reservations/{reservation}/cancel', [\App\Http\Controllers\ReservationController::class, 'cancel'])->name('pos.reservations.cancel');

        Route::get('floors', [\App\Http\Controllers\FloorController::class, 'index'])->name('pos.floors.index');
        Route::post('floors', [\App\Http\Controllers\FloorController::class, 'store'])->name('pos.floors.store');
        Route::put('floors/{id}/update', [\App\Http\Controllers\FloorController::class, 'update'])->name('pos.floors.update');
        Route::put('tables/no-floor/update', [\App\Http\Controllers\FloorController::class, 'updateNoFloor'])->name('pos.tables.no-floor.update');
        Route::delete('floors/{floor}', [\App\Http\Controllers\FloorController::class, 'destroy'])->name('pos.floors.destroy');
        Route::get('floors/{id}/edit', [\App\Http\Controllers\FloorController::class, 'edit'])->name('pos.floors.edit');
        Route::put('floors/{id}/status', [\App\Http\Controllers\FloorController::class, 'toggleStatus'])->name('pos.floors.toggleStatus');
        Route::get('table/management', [\App\Http\Controllers\FloorController::class, 'floorTable'])->name('pos.table.management');
        Route::get('add/newfloor/{id?}', [\App\Http\Controllers\FloorController::class, 'createOrEdit'])->name('pos.floors.createOrEdit');
        Route::get('floors/get-floors', [\App\Http\Controllers\FloorController::class, 'getFloors'])->name('pos.floors.getFloors');
        Route::get('table/order/{id}', [\App\Http\Controllers\FloorController::class, 'tableOrderDetails'])->name('pos.table.order.details');

        Route::get('settings/printer-test', [\App\Http\Controllers\PrinterTestController::class, 'index'])->name('pos.printer.index');
        Route::post('settings/printer-test', [\App\Http\Controllers\PrinterTestController::class, 'testPrint'])->name('pos.printer.test');
        Route::get('settings/print-devices', [\App\Http\Controllers\PosPrintDeviceManagementController::class, 'index'])->name('pos.printer.devices.index');
        Route::post('settings/print-devices', [\App\Http\Controllers\PosPrintDeviceManagementController::class, 'store'])->name('pos.printer.devices.store');
        Route::put('settings/print-devices/{device}', [\App\Http\Controllers\PosPrintDeviceManagementController::class, 'update'])->name('pos.printer.devices.update');
        Route::post('settings/print-devices/{device}/rotate', [\App\Http\Controllers\PosPrintDeviceManagementController::class, 'rotate'])->name('pos.printer.devices.rotate');
        Route::delete('settings/print-devices/{device}', [\App\Http\Controllers\PosPrintDeviceManagementController::class, 'destroy'])->name('pos.printer.devices.destroy');
        Route::get('settings/print-jobs', [\App\Http\Controllers\PosPrintJobManagementController::class, 'index'])->name('pos.printer.jobs.index');
        Route::post('settings/print-jobs/{job}/retry', [\App\Http\Controllers\PosPrintJobManagementController::class, 'retry'])->name('pos.printer.jobs.retry');

        Route::get('kitchen', [\App\Http\Controllers\KitchenController::class, 'index'])->name('pos.kitchen.index');
        Route::post('kitchen/{order}/update-all', [\App\Http\Controllers\KitchenController::class, 'updateAll'])->name('pos.kitchen.update-all');
        Route::post('kitchen/{order}/item/{item}/update-status', [\App\Http\Controllers\KitchenController::class, 'updateItemStatus'])->name('pos.kitchen.item.update-status');

        Route::get('transaction', [\App\Http\Controllers\TransactionController::class, 'index'])->name('pos.transaction.index');
        Route::get('transaction/history', [\App\Http\Controllers\TransactionController::class, 'transactionHistory'])->name('pos.transaction.history');
        Route::get('payment-order-data/{invoiceId}', [\App\Http\Controllers\TransactionController::class, 'PaymentOrderData'])->name('pos.transaction.invoice');

        Route::resource('cake-bookings', \App\Http\Controllers\PosCakeBookingController::class)->names('pos.cake-bookings');
        Route::get('cake-bookings/{id}/print', [\App\Http\Controllers\PosCakeBookingController::class, 'printInvoice'])->name('pos.cake-bookings.print');

        Route::get('cake-types/trashed', [\App\Http\Controllers\CakeTypeController::class, 'trashed'])->name('pos.cake-types.trashed');
        Route::post('cake-types/{id}/restore', [\App\Http\Controllers\CakeTypeController::class, 'restore'])->name('pos.cake-types.restore');
        Route::delete('cake-types/{id}/force-delete', [\App\Http\Controllers\CakeTypeController::class, 'forceDelete'])->name('pos.cake-types.force-delete');
        Route::resource('cake-types', \App\Http\Controllers\CakeTypeController::class)->names('pos.cake-types');

        Route::get('pos-shifts/history', [\App\Http\Controllers\PosShiftController::class, 'history'])->name('pos.pos-shifts.history');
        Route::get('pos-shifts/status', [\App\Http\Controllers\PosShiftController::class, 'status'])->name('pos.pos-shifts.status');
        Route::post('pos-shifts/start', [\App\Http\Controllers\PosShiftController::class, 'start'])->name('pos.pos-shifts.start');
        Route::post('pos-shifts/end', [\App\Http\Controllers\PosShiftController::class, 'end'])->name('pos.pos-shifts.end');

        Route::get('setting/showTax', [\App\Http\Controllers\SettingController::class, 'showTax'])->name('pos.setting.showTax');
        Route::get('setting/financial', [\App\Http\Controllers\SettingController::class, 'getFinancialSettings'])->name('pos.setting.financial');

        Route::post('order-payment', [\App\Http\Controllers\TransactionController::class, 'OrderPayment'])->name('pos.order.payment');
    });
});
?>
