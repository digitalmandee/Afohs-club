<?php

use App\Http\Controllers\App\AddressTypeController;
use App\Http\Controllers\App\MembersController;
use App\Http\Controllers\App\MemberTypeController;
use App\Http\Controllers\App\WaiterController;
use App\Http\Controllers\MembershipController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\UserMemberController;
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



        // membership routes
        Route::get('/user-details', [MembershipController::class, 'index'])->name('membership');
        Route::get('/user-details/create', [MembershipController::class, 'create'])->name('membership.create');
        Route::post('/user-details', [MembershipController::class, 'store'])->name('membership.store');
        // UserMember routes
        Route::get('/user-member', [UserMemberController::class, 'index'])->name('usermember');
        Route::post('/user-member/store', [UserMemberController::class, 'store'])->name('usermember.store');
    });

    require __DIR__ . '/settings.php';
    require __DIR__ . '/auth.php';
}
