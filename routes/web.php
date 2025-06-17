<?php

use App\Http\Controllers\App\AddressTypeController;
use App\Http\Controllers\App\MembersController;
use App\Http\Controllers\App\MemberTypeController;
use App\Http\Controllers\CardController;
use App\Http\Controllers\MemberCategoryController;
use App\Http\Controllers\MembershipController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\UserMemberController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\FinancialController;
use Faker\Provider\ar_EG\Payment;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/members/{id}', [MembershipController::class, 'viewProfile'])->name('member.profile');

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



    // Admin Room Booking Routes
    Route::get('/rooms/dashboard', [RoomController::class, 'index'])->name('rooms.manage');
    Route::get('/rooms/manage', [RoomController::class, 'allRooms'])->name('rooms.all');
    Route::get('/booking/add/room', [RoomController::class, 'create'])->name('rooms.add');
    Route::post('/booking/room/store', [RoomController::class, 'store'])->name('rooms.store');
    Route::get('/rooms/edit/{id}', [RoomController::class, 'edit'])->name('rooms.edit');
    Route::put('/rooms/{id}', [RoomController::class, 'update'])->name('rooms.update');
    Route::delete('/rooms/{id}', [RoomController::class, 'destroy'])->name('rooms.destroy');

    // Route::get('/events/dashboard', function () {
    //         return Inertia::render('App/Admin/Booking/EventManage');
    //     })->name('events.manage');

    //Admin Events Booking Routes
    Route::get('/events/dashboard', [EventController::class, 'index'])->name('events.manage');
    Route::get('/events/manage', [EventController::class, 'allEvents'])->name('events.all');
    Route::get('/events/add', [EventController::class, 'create'])->name('events.add');
    Route::post('/events', [EventController::class, 'store'])->name('events.store');
    // Add routes for edit and delete
    Route::get('/events/edit/{id}', [EventController::class, 'edit'])->name('events.edit');
    Route::put('/events/{id}', [EventController::class, 'update'])->name('events.update');
    Route::delete('/events/{id}', [EventController::class, 'destroy'])->name('events.destroy');


    // location
    Route::get('/events/locations', [EventController::class, 'locations'])->name('events.locations');
    Route::post('/events/locations', [EventController::class, 'storeLocation'])->name('events.locations.store');
    Route::put('/events/locations/{id}', [EventController::class, 'updateLocation'])->name('events.locations.update');
    Route::delete('/events/locations/{id}', [EventController::class, 'deleteLocation'])->name('events.locations.delete');

    //Admin Booking Routes
    Route::get('/booking/dashboard', [BookingController::class, 'index'])->name('rooms.dashboard');
    Route::get('/booking/roomsAndEvents', [BookingController::class, 'roomsAndEvents'])->name('rooms.roomsAndEvents');
    Route::get('/booking/new', [BookingController::class, 'booking'])->name('rooms.booking');
    Route::post('booking/payment/store', [BookingController::class, 'paymentStore'])->name('booking.payment.store');
    Route::post('/room/booking', [BookingController::class, 'store'])->name('rooms.booking.store');

    // Booking Search
    Route::get('/booking/search', [BookingController::class, 'search'])->name('booking.search');


    Route::get('/booking/details', function () {
        return Inertia::render('App/Admin/Booking/Detail');
    })->name('rooms.details');





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

    Route::get('/employee/monthly/attendance/report', function () {
        return Inertia::render('App/Admin/Employee/MonthlyReport');
    })->name('employee.monthlyreport');

    Route::get('/employee/payroll/dashboard', function () {
        return Inertia::render('App/Admin/Employee/Payroll/Dashboard');
    })->name('employee.payroll');

    Route::get('/employee/payroll/monthly/summary', function () {
        return Inertia::render('App/Admin/Employee/Payroll/Summary');
    })->name('employee.summary');

    Route::get('/employee/payroll/salary/component', function () {
        return Inertia::render('App/Admin/Employee/Payroll/Component');
    })->name('employee.component');

    Route::get('/employee/payroll/add/salary/component', function () {
        return Inertia::render('App/Admin/Employee/Payroll/AddSalary');
    })->name('employee.addsalary');

    Route::get('/employee/payroll/runpayroll/dashboard', function () {
        return Inertia::render('App/Admin/Employee/Payroll/RunPayroll');
    })->name('employee.runpayroll');

    Route::get('/employee/payroll/salary/revision', function () {
        return Inertia::render('App/Admin/Employee/Payroll/Revision');
    })->name('employee.salaryrevision');

    Route::get('/employee/payroll/holed/salary', function () {
        return Inertia::render('App/Admin/Employee/Payroll/Holed');
    })->name('employee.holedsalary');

    Route::get('/employee/payroll/add/holed/employee', function () {
        return Inertia::render('App/Admin/Employee/Payroll/AddHoled');
    })->name('employee.addholed');

    Route::get('/employee/payroll/deduction/list', function () {
        return Inertia::render('App/Admin/Employee/Payroll/Deduction');
    })->name('employee.deduction');

    Route::get('/employee/payroll/add/deduction', function () {
        return Inertia::render('App/Admin/Employee/Payroll/AddDeduction');
    })->name('employee.adddeduction');

    Route::get('/employee/payroll/reimbursements', function () {
        return Inertia::render('App/Admin/Employee/Payroll/Reimbursement');
    })->name('employee.reimbursement');

    Route::get('/employee/payroll/add/reimbursements', function () {
        return Inertia::render('App/Admin/Employee/Payroll/AddReimbursement');
    })->name('employee.addreimbursement');

    Route::get('/employee/payroll/leaves/list', function () {
        return Inertia::render('App/Admin/Employee/Payroll/Leave');
    })->name('employee.leave');

    Route::get('/employee/payroll/leaves/Initialize', function () {
        return Inertia::render('App/Admin/Employee/Payroll/Initialize');
    })->name('employee.initialize');

    Route::get('/employee/payroll/cheque/list', function () {
        return Inertia::render('App/Admin/Employee/Payroll/Cheque');
    })->name('employee.cheque');

    Route::get('/employee/payroll/add/cheque', function () {
        return Inertia::render('App/Admin/Employee/Payroll/AddCheque');
    })->name('employee.addcheque');

    //Subscription Routes
    Route::get('/admin/subscription/dashboard', [SubscriptionController::class, 'index'])->name('subscription.dashboard');
    Route::get('/admin/subscription/payment', [SubscriptionController::class, 'payment'])->name('subscriptions.payment');
    Route::post('/admin/subscription/payment/store', [SubscriptionController::class, 'paymentStore'])->name('subscriptions.payment.store');
    Route::get('/admin/subscription/add', [SubscriptionController::class, 'create'])->name('subscriptions.create');
    Route::post('/admin/subscription/store', [SubscriptionController::class, 'store'])->name('subscriptions.store');

    Route::get('/admin/manage/subscription', [SubscriptionController::class, 'management'])->name('subscription.management');


     //Financial Routes
    Route::get('/finance/dashboard', [FinancialController::class, 'index'])->name('finance.dashboard');
    Route::get('/finance/add/transaction', [FinancialController::class, 'create'])->name('finance.addtransaction');
    Route::post('/finance/add/transaction', [FinancialController::class, 'store'])->name('finance.addtransaction');

    // Route::get('/finance/dashboard', function () {
    //     return Inertia::render('App/Admin/Finance/Dashboard');
    // })->name('finance.dashboard');

    // Route::get('/finance/add/transaction', function () {
    //     return Inertia::render('App/Admin/Finance/AddTransaction');
    // })->name('finance.addtransaction');

    Route::get('/finance/transaction', function () {
        return Inertia::render('App/Admin/Finance/Transaction');
    })->name('finance.transaction');
    Route::get('/admin/manage/monthly/fee', function () {
        return Inertia::render('App/Admin/Subscription/Monthly');
    })->name('subscription.monthly');

    Route::get('/admin/subscription/sports/category', function () {
        return Inertia::render('App/Admin/Subscription/Sports');
    })->name('subscription.sports');

    Route::get('/admin/subscription/add/sports/category', function () {
        return Inertia::render('App/Admin/Subscription/AddSports');
    })->name('subscription.addsports');

    //Kitchen Routes
    Route::get('/kitchen/category/dashboard', function () {
        return Inertia::render('App/Admin/Kitchen/Dashboard');
    })->name('kitchen.dashboard');

    Route::get('/kitchen/category/add/new/kitchen', function () {
        return Inertia::render('App/Admin/Kitchen/AddKitchen');
    })->name('kitchen.addkitchen');

    Route::get('/kitchen/category/customer/history', function () {
        return Inertia::render('App/Admin/Kitchen/History');
    })->name('kitchen.history');






    Route::get('/card/dashboard', [CardController::class, 'index'])->name('cards.dashboard');



    Route::get('/membership/filter', [MembershipController::class, 'filterMember'])->name('membership.filter');

    Route::get('/membership/booking/dashboard', [MembershipController::class, 'index'])->name('membership.dashboard');
    Route::get('/membership/all/members', [MembershipController::class, 'allMembers'])->name('membership.members');
    Route::get('membership/history', [MembershipController::class, 'membershipHistory'])->name('membership.history');
    Route::post('/membership/store', [MembershipController::class, 'store'])->name('membership.store');

    // get member invoice
    Route::get('member-invoices/{id}', [MembershipController::class, 'getMemberInvoices'])->name('member-invoices');
    // Route::get('/member-types', [MembershipController::class, 'getAllMemberTypes']);


    // Members types
    Route::get('/admin/members/member-types', [MemberTypeController::class, 'index'])->name('member-types.index');
    Route::post('/members/member-types/store', [MemberTypeController::class, 'store'])->name('member-types.store');
    Route::post('/members/member-types/{id}/update2', [MemberTypeController::class, 'update'])->name('member-types.update2');
    Route::delete('/members/member-types/{id}/delete', [MemberTypeController::class, 'destroy'])->name('member-types.destroy');
    Route::get('/members/member-types/edit/{member_type}', [MemberTypeController::class, 'edit'])->name('member-types.edit');
    Route::put('/members/{id}/status', [MembershipController::class, 'updateMemberStatus']);

    // Member Categories
    Route::resource('/admin/members/member-categories', MemberCategoryController::class)->except('show');

    //payment
    Route::get('/admin/membership/all/payments', [PaymentController::class, 'index'])->name('membership.allpayment');
    Route::post('/admin/membership/payments/store', [PaymentController::class, 'store'])->name('membership.payment.store');


    //Membership Booking Routes

    Route::get('/admin/add/personal/information', [MembershipController::class, 'create'])->name('membership.add');

    Route::get('/admin/add/contact/information', function () {
        return Inertia::render('App/Admin/Membership/AddForm-2');
    })->name('membership.add2');

    Route::get('/admin/add/membership/information', function () {
        return Inertia::render('App/Admin/Membership/AddForm-3');
    })->name('membership.add3');


    Route::get('/admin/membership/guest/history', function () {
        return Inertia::render('App/Admin/Membership/Guest');
    })->name('membership.guest');

    Route::get('/admin/membership/add/guest', function () {
        return Inertia::render('App/Admin/Membership/AddGuest');
    })->name('membership.addguest');

    Route::get('/admin/guest/visit/detail', function () {
        return Inertia::render('App/Admin/Membership/Checkout');
    })->name('membership.checkout');



    Route::get('/admin/membership/visit/detail', function () {
        return Inertia::render('App/Admin/Membership/Detail');
    })->name('membership.detail');



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
