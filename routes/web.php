<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\MembershipController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\UserMemberController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Central auth-protected routes
Route::middleware(['auth:web', 'verified'])->group(function () {
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

    //Membership Booking Routes
    Route::get('/membership/booking/dashboard', function () {
        return Inertia::render('App/Admin/Membership/Dashboard');
    })->name('membership.dashboard');

    Route::get('/admin/add/personal/information', function () {
        return Inertia::render('App/Admin/Membership/AddForm-1');
    })->name('membership.add');

    Route::get('/admin/add/contact/information', function () {
        return Inertia::render('App/Admin/Membership/AddForm-2');
    })->name('membership.add');

    Route::get('/admin/add/membership/information', function () {
        return Inertia::render('App/Admin/Membership/AddForm-3');
    })->name('membership.add');

    Route::get('/admin/membership/history', function () {
        return Inertia::render('App/Admin/Membership/History');
    })->name('membership.history');

    Route::get('/admin/membership/guest/history', function () {
        return Inertia::render('App/Admin/Membership/Guest');
    })->name('membership.guest');

    Route::get('/admin/membership/add/guest', function () {
        return Inertia::render('App/Admin/Membership/AddGuest');
    })->name('membership.addguest');

    Route::get('/admin/guest/visit/detail', function () {
        return Inertia::render('App/Admin/Membership/Checkout');
    })->name('membership.checkout');

    Route::get('/admin/all/members', function () {
        return Inertia::render('App/Admin/Membership/Members');
    })->name('membership.members');

    Route::get('/admin/membership/visit/detail', function () {
        return Inertia::render('App/Admin/Membership/Detail');
    })->name('membership.detail');

    Route::get('/admin/membership/all.members', function () {
        return Inertia::render('App/Admin/Membership/MemberType');
    })->name('membership.membertype');

    Route::get('/admin/membership/full/detail', function () {
        return Inertia::render('App/Admin/Membership/CompleteDetail');
    })->name('membership.detail');

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

// Central guest-only auth routes
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
