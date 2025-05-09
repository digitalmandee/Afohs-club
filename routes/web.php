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

        // tenant route
        Route::get('tenants', [TenantController::class, 'index'])->name('tenant.index');
        Route::get('tenant/register', [TenantController::class, 'create'])->name('tenant.create');
        Route::post('tenant/store', [TenantController::class, 'store'])->name('tenant.store');
    });

    require __DIR__ . '/settings.php';
    require __DIR__ . '/auth.php';
}
