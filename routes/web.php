<?php

use App\Http\Controllers\App\AddressTypeController;
use App\Http\Controllers\App\MembersController;
use App\Http\Controllers\App\MemberTypeController;
use App\Http\Controllers\App\WaiterController;
use App\Http\Controllers\TenantController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

$allowedDomains = config('tenancy.central_domains');
if (in_array(request()->getHost(), $allowedDomains)) {
    Route::get('/', function () {
        return Inertia::render('welcome');
    })->name('home');
    Route::middleware(['auth', 'verified'])->group(function () {
        // Route::get('dashboard', function () {
        //     return Inertia::render('dashboard');
        // })->name('dashboard');

        // admin dashboard routes
        Route::get('dashboard', function () {
            return Inertia::render('App/Admin/Dashboard');
        })->name('dashboard');


        //Admin Booking Routes
        Route::get('/booking/dashboard', function () {
            return Inertia::render('App/Admin/Booking/Dashboard');
        })->name('rooms.dashboard');

        Route::get('/booking/details', function () {
            return Inertia::render('App/Admin/Booking/Detail');
        })->name('rooms.details');

        Route::get('/room/booking', function () {
            return Inertia::render('App/Admin/Booking/RoomBooking');
        })->name('rooms.booking');

        Route::get('/booking/add/room', function () {
            return Inertia::render('App/Admin/Booking/AddRoom');
        })->name('rooms.add');

        Route::get('/rooms/manage', function () {
            return Inertia::render('App/Admin/Booking/RoomManage');
        })->name('rooms.manage');

        Route::get('/events/manage', function () {
            return Inertia::render('App/Admin/Booking/EventManage');
        })->name('events.manage');


        //Admin Employee Routes
        Route::get('/employee/dashboard', function () {
            return Inertia::render('App/Admin/Employee/Dashboard');
        })->name('employee.dashboard');

        Route::get('/add/employee', function () {
            return Inertia::render('App/Admin/Employee/AddEmployee');
        })->name('employee.create');

        Route::get('/employee/list', function () {
            return Inertia::render('App/Admin/Employee/EmployeeList');
        })->name('employee.employeeList');
        // member
        // Route::get('/members', [MembersController::class, 'index'])->name('members.index');
        // Route::resource('/members/member-types', MemberTypeController::class)->except('show', 'edit');
        // Route::resource('/members/address-types', AddressTypeController::class)->except('show', 'edit');

        // tenant route
        Route::get('tenants', [TenantController::class, 'index'])->name('tenant.index');
        Route::get('tenant/register', [TenantController::class, 'create'])->name('tenant.create');
        Route::post('tenant/store', [TenantController::class, 'store'])->name('tenant.store');
        // Members types
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
        // member
        Route::get('/members', [MembersController::class, 'index'])->name('members.index');
        Route::get('/members/create', [MembersController::class, 'create'])->name('members.create');
        Route::post('/members', [MembersController::class, 'store'])->name('members.store');
        Route::get('/members/{id}/edit', [MembersController::class, 'edit'])->name('members.edit');
        Route::put('/members/{id}', [MembersController::class, 'update'])->name('members.update');

        // Waiter
        // Waiter Dashboard
        Route::get('/waiters', [WaiterController::class, 'index'])->name('waiters.index');
        Route::get('/waiters/create', [WaiterController::class, 'create'])->name('waiters.create');
        Route::post('/waiters', [WaiterController::class, 'store'])->name('waiters.store');
        Route::put('/waiters/{id}', [WaiterController::class, 'update'])->name('waiters.update');
    });

    require __DIR__ . '/settings.php';
    require __DIR__ . '/auth.php';
}
