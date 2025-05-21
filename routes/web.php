<?php

use App\Http\Controllers\App\AddressTypeController;
use App\Http\Controllers\App\MembersController;
use App\Http\Controllers\App\MemberTypeController;
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

    //Admin Employee Routes
    Route::get('/employee/department/list', function () {
        return Inertia::render('App/Admin/Employee/Department');
    })->name('employee.departmentlist');

    Route::get('/employee/attendance/dashboard', function () {
        return Inertia::render('App/Admin/Employee/Attendance');
    })->name('employee.attendance');

    Route::get('/employee/attendance/add/leave/application', function () {
        return Inertia::render('App/Admin/Employee/AddLeave');
    })->name('employee.addleave');

    Route::get('/employee/all/attendance', function () {
        return Inertia::render('App/Admin/Employee/AllAttendance');
    })->name('employee.allattendance');

    Route::get('/employee/leave/category', function () {
        return Inertia::render('App/Admin/Employee/Category');
    })->name('employee.leavecategory');

    Route::get('/employee/add/leave/category', function () {
        return Inertia::render('App/Admin/Employee/LeaveCategory');
    })->name('employee.addleavecategory');

    Route::get('/employee/leave/application/management', function () {
        return Inertia::render('App/Admin/Employee/LeaveManage');
    })->name('employee.leavemanagement');

    Route::get('/employee/leave/report', function () {
        return Inertia::render('App/Admin/Employee/Report');
    })->name('employee.leavereport');

    Route::get('/employee/attendance/report', function () {
        return Inertia::render('App/Admin/Employee/AttendanceReport');
    })->name('employee.attendancereport');

    //Membership Booking Routes
    Route::get('/admin/membership/finance', function () {
        return Inertia::render('App/Admin/Membership/Finance');
    })->name('membership.finance');

    Route::get('/admin/membership/add/membertype', function () {
        return Inertia::render('App/Admin/Membership/AddMember');
    })->name('membership.addmembertype');

    Route::get('/admin/membership/all/payments', function () {
        return Inertia::render('App/Admin/Membership/AllPayment');
    })->name('membership.allpayment');

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

    // UserMember routes
    Route::get('/user-member', [UserMemberController::class, 'index'])->name('usermember');
    Route::post('/user-member/store', [UserMemberController::class, 'store'])->name('usermember.store');

    // membership routes
    Route::get('/user-details', [MembershipController::class, 'index'])->name('membership');
    Route::get('/user-details/create', [MembershipController::class, 'create'])->name('membership.create');
    // Route::post('/user-details', [MembershipController::class, 'store'])->name('membership.store');

    Route::get('/membership/booking/dashboard', [MembershipController::class, 'index'])->name('membership.dashboard');
    Route::get('/membership/all/members', [MembershipController::class, 'allMembers'])->name('membership.members');
    Route::get('membership/history', [MembershipController::class, 'membershipHistory'])->name('membership.history');
    Route::post('/membership/store', [MembershipController::class, 'store'])->name('membership.store');
    // Route::get('/member-types', [MembershipController::class, 'getAllMemberTypes']);
    Route::put('/members/{id}/status', [MembershipController::class, 'updateMemberStatus']);


    // Route::get('/admin/membership/all.members', function () {
    //     return Inertia::render('App/Admin/Membership/MemberType');
    // })->name('membership.membertype');
    // Members types
    Route::resource('/members/member-types', MemberTypeController::class)->except('show', 'edit');
    Route::get('/members/member-types', [MemberTypeController::class, 'index'])->name('member-types.index');
    Route::post('/members/member-types', [MemberTypeController::class, 'store'])->name('member-types.store');
    Route::put('/members/member-types/{id}/update', [MemberTypeController::class, 'update'])->name('member.update');
    Route::delete('/members/member-types/{id}', [MemberTypeController::class, 'destroy'])->name('member.destroy');


    //Membership Booking Routes

    Route::get('/admin/add/personal/information', function () {
        return Inertia::render('App/Admin/Membership/MembershipForm');
    })->name('membership.add');

    Route::get('/admin/add/contact/information', function () {
        return Inertia::render('App/Admin/Membership/AddForm-2');
    })->name('membership.add2');

    Route::get('/admin/add/membership/information', function () {
        return Inertia::render('App/Admin/Membership/AddForm-3');
    })->name('membership.add3');

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

    // Route::get('/admin/all/members', function () {
    //     return Inertia::render('App/Admin/Membership/Members');
    // })->name('membership.members');

    Route::get('/admin/membership/visit/detail', function () {
        return Inertia::render('App/Admin/Membership/Detail');
    })->name('membership.detail');

    // Route::get('/admin/membership/all.members', function () {
    //     return Inertia::render('App/Admin/Membership/MemberType');
    // })->name('membership.membertype');

    Route::get('/admin/membership/full/detail', function () {
        return Inertia::render('App/Admin/Membership/CompleteDetail');
    })->name('membership.detail2');

    // tenant route
    Route::get('tenant', [TenantController::class, 'index'])->name('tenant.index');
    Route::get('tenant/register', [TenantController::class, 'create'])->name('tenant.create');
    Route::post('tenant/store', [TenantController::class, 'store'])->name('tenant.store');
});

// Central guest-only auth routes
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
