<?php

use App\Http\Controllers\App\AddressTypeController;
use App\Http\Controllers\App\MembersController;
use App\Http\Controllers\App\MemberTypeController;
use App\Http\Controllers\App\SubscriptionTypeController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AppliedMemberController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\CardController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DataMigrationController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\RoleManagementController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\EmployeeDepartmentController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\LeaveCategoryController;
use App\Http\Controllers\LeaveApplicationController;
use App\Http\Controllers\EmployeeTypeController;
use App\Http\Controllers\EventBookingController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\EventMenuAddOnsController;
use App\Http\Controllers\EventChargesTypeController;
use App\Http\Controllers\EventMenuCategoryController;
use App\Http\Controllers\EventMenuController;
use App\Http\Controllers\EventMenuTypeController;
use App\Http\Controllers\EventVenueController;
use App\Http\Controllers\FamilyMembersArchiveConroller;
use App\Http\Controllers\FinancialController;
use App\Http\Controllers\MemberCategoryController;
use App\Http\Controllers\MemberFeeRevenueController;
use App\Http\Controllers\MembershipController;
use App\Http\Controllers\MemberTransactionController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\RoomBookingController;
use App\Http\Controllers\RoomBookingRequestController;
use App\Http\Controllers\RoomCategoryController;
use App\Http\Controllers\RoomChargesTypeController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\RoomMiniBarController;
use App\Http\Controllers\RoomTypeController;
use App\Http\Controllers\SubscriptionCategoryController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserMemberController;
use App\Http\Controllers\AdminPosReportController;
use Faker\Provider\ar_EG\Payment;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return auth()->check() ? redirect()->route('dashboard') : redirect()->route('login');
});
// Route::get('/', function () {
//     return dd(ini_get('post_max_size'), ini_get('upload_max_filesize'));
// });

Route::get('/members/{id}', [MembershipController::class, 'viewProfile'])->name('member.profile');

// Central auth-protected routes
Route::middleware(['auth:web', 'verified'])->group(function () {
    // admin dashboard routes
    Route::get('dashboard', [AdminController::class, 'index'])->name('dashboard');

    // Admin Employee Routes
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

    // Employeee Management
    Route::prefix('admin/employees')->group(function () {
        Route::get('/dashboard', [EmployeeController::class, 'dashboard'])->name('employees.dashboard');
        Route::get('/create', [EmployeeController::class, 'create'])->name('employees.create');
        Route::get('/departments', [EmployeeDepartmentController::class, 'index'])->name('employees.departments');
        Route::get('/types', [EmployeeTypeController::class, 'index'])->name('employees.types');
        Route::get('/details/{employeeId}', [EmployeeController::class, 'details'])->name('employees.details');

        Route::prefix('leaves')->group(function () {
            Route::get('category', [LeaveCategoryController::class, 'index'])->name('employees.leaves.category.index');
            Route::get('category/create', [LeaveCategoryController::class, 'create'])->name('employees.leaves.category.create');
            Route::get('category/edit/{id}', [LeaveCategoryController::class, 'edit'])->name('employees.leaves.category.edit');

            Route::get('application', [LeaveApplicationController::class, 'index'])->name('employees.leaves.application.index');
            Route::get('application/new', [LeaveApplicationController::class, 'create'])->name('employees.leaves.application.create');
            Route::get('application/edit/{id}', [LeaveApplicationController::class, 'edit'])->name('employees.leaves.application.edit');

            Route::get('report', [LeaveApplicationController::class, 'leaveReportPage'])->name('employees.leaves.application.report');
        });

        Route::prefix('attendances')->group(function () {
            // Inertia.js Pages
            Route::get('dashboard', [AttendanceController::class, 'dashboard'])->name('employees.attendances.dashboard');
            Route::get('management', [AttendanceController::class, 'managementPage'])->name('employees.attendances.management');
            Route::get('report', [AttendanceController::class, 'reportPage'])->name('employees.attendances.report');
            Route::get('monthly/report', [AttendanceController::class, 'monthlyReportPage'])->name('employees.attendances.monthly.report');
        });
    });

    Route::prefix('api')->group(function () {
        Route::resource('departments', EmployeeDepartmentController::class)->except(['create', 'show', 'edit']);
        // Replace index with your own custom function
        Route::get('departments', [EmployeeDepartmentController::class, 'listAll'])->name('api.departments.listAll');
        Route::resource('employee-types', EmployeeTypeController::class)->except(['create', 'index', 'show', 'edit']);
        Route::post('employee/create', [EmployeeController::class, 'store'])->name('api.employees.store');
        Route::put('employees/update/{employeeId}', [EmployeeController::class, 'update'])->name('api.employees.update');

        // Leave Category API routes
        Route::prefix('leave-categories')->group(function () {
            Route::get('/', [LeaveCategoryController::class, 'getAll'])->name('api.leave-categories.getAll');
            Route::post('/', [LeaveCategoryController::class, 'store'])->name('api.leave-categories.store');
            Route::get('/{id}', [LeaveCategoryController::class, 'show'])->name('api.leave-categories.show');
            Route::put('/{id}', [LeaveCategoryController::class, 'update'])->name('api.leave-categories.update');
            Route::delete('/{id}', [LeaveCategoryController::class, 'destroy'])->name('api.leave-categories.destroy');
        });

        // Leave Application API routes
        Route::prefix('leave-applications')->group(function () {
            Route::post('/', [LeaveApplicationController::class, 'store'])->name('api.leave-applications.store');
            Route::get('/{id}', [LeaveApplicationController::class, 'show'])->name('api.leave-applications.show');
            Route::put('/{id}', [LeaveApplicationController::class, 'update'])->name('api.leave-applications.update');
            Route::delete('/{id}', [LeaveApplicationController::class, 'destroy'])->name('api.leave-applications.destroy');
        });

        // Leave Report API route
        Route::get('employees/leaves/reports', [LeaveApplicationController::class, 'leaveReport'])->name('api.leave-reports');

        // Attendance API routes
        Route::prefix('attendances')->group(function () {
            Route::get('/', [AttendanceController::class, 'index'])->name('api.attendances.index');
            Route::get('reports', [AttendanceController::class, 'attendanceReport'])->name('api.attendances.reports');
            Route::put('{attendanceId}', [AttendanceController::class, 'updateAttendance'])->name('api.attendances.update');
            Route::get('profile/report/{employeeId}', [AttendanceController::class, 'profileReport'])->name('api.attendances.profile.report');
            Route::post('all/report', [AttendanceController::class, 'allEmployeesReport'])->name('api.attendances.all.report');

            Route::get('leaves/reports/monthly', [LeaveApplicationController::class, 'leaveReportMonthly']);
        });
    });

    // Membership Booking Routes
    Route::get('/admin/membership/finance', function () {
        return Inertia::render('App/Admin/Membership/Finance');
    })->name('membership.finance');

    Route::get('/admin/membership/add/membertype', function () {
        return Inertia::render('App/Admin/Membership/AddMember');
    })->name('membership.addmembertype');

    // Admin Room Booking Routes
    Route::group(['prefix' => 'booking-management'], function () {
        Route::resource('guests', CustomerController::class)->except(['show']);

        Route::group(['prefix' => 'rooms'], function () {
            Route::get('/', [RoomController::class, 'allRooms'])->name('rooms.all');
            Route::get('dashboard', [RoomController::class, 'dashboard'])->name('rooms.dashboard');
            Route::get('booking/invoice/{id}', [RoomController::class, 'bookingInvoice'])->name('rooms.invoice');
            Route::get('manage', [RoomController::class, 'index'])->name('rooms.manage');
            Route::get('add', [RoomController::class, 'create'])->name('rooms.add');
            Route::get('check-in', [RoomController::class, 'checkInIndex'])->name('rooms.checkin');
            Route::get('check-out', [RoomController::class, 'checkOutIndex'])->name('rooms.checkout');
            Route::post('store', [RoomController::class, 'store'])->name('rooms.store');
            Route::get('edit/{id}', [RoomController::class, 'edit'])->name('rooms.edit');
            Route::post('{id}', [RoomController::class, 'update'])->name('rooms.update');
            Route::delete('{id}', [RoomController::class, 'destroy'])->name('rooms.destroy');
            // Room Calendar
            Route::get('booking/calendar', [RoomBookingController::class, 'calendar'])->name('rooms.booking.calendar');

            // get room booking data
            Route::get('api/bookings/{id}', [RoomBookingController::class, 'showRoomBooking'])->name('api.room.booking.show');
            Route::post('api/bookings/check-in', [RoomBookingController::class, 'checkIn'])->name('api.room.booking.checkin');
            // Route::get('/types', [RoomController::class, 'mamageTypes'])->name('rooms.types');
            Route::group(['prefix' => 'requests'], function () {
                Route::get('', [RoomBookingRequestController::class, 'index'])->name('rooms.request');
                Route::get('create', [RoomBookingRequestController::class, 'create'])->name('rooms.request.create');
                Route::post('store', [RoomBookingRequestController::class, 'store'])->name('rooms.request.store');
                Route::put('update/status/{id}', [RoomBookingRequestController::class, 'updateStatus'])->name('rooms.request.update.status');
                Route::get('{id}/edit', [RoomBookingRequestController::class, 'edit'])->name('rooms.request.edit');
                Route::put('{id}', [RoomBookingRequestController::class, 'edit'])->name('rooms.request.update');
            });
        });
        Route::resource('room-types', RoomTypeController::class)->except(['create', 'edit', 'show']);
        Route::resource('room-categories', RoomCategoryController::class)->except(['create', 'edit', 'show']);
        Route::resource('room-charges-type', RoomChargesTypeController::class)->except(['create', 'edit', 'show']);
        Route::resource('room-minibar', RoomMiniBarController::class)->except(['create', 'edit', 'show']);

        // Event Routes
        Route::group(['prefix' => 'events'], function () {
            Route::get('dashboard', [EventBookingController::class, 'index'])->name('events.dashboard');
            Route::get('create', [EventBookingController::class, 'create'])->name('events.create');
            Route::post('booking', [EventBookingController::class, 'store'])->name('events.booking.store');
        });
        Route::resource('event-venues', EventVenueController::class)->except(['create', 'edit', 'show']);
        Route::resource('event-menu', EventMenuController::class)->except(['show']);
        Route::resource('event-menu-category', EventMenuCategoryController::class)->except(['create', 'edit', 'show']);
        Route::resource('event-menu-type', EventMenuTypeController::class)->except(['create', 'edit', 'show']);
        Route::resource('event-menu-addon', EventMenuAddOnsController::class)->except(['create', 'edit', 'show']);
        Route::resource('event-charges-type', EventChargesTypeController::class)->except(['create', 'edit', 'show']);
    });

    // Admin Events Booking Routes
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

    // Admin Booking Routes
    Route::get('/booking/payment', [BookingController::class, 'payNow'])->name('booking.payment');
    Route::get('/booking/new', [BookingController::class, 'booking'])->name('rooms.booking');
    Route::get('/booking/edit/{id}', [BookingController::class, 'editbooking'])->name('rooms.booking.edit');
    Route::post('/booking/update/{id}', [RoomBookingController::class, 'update'])->name('rooms.booking.update');
    Route::get('/admin/family-members/{id}', [BookingController::class, 'familyMembers'])->name('admin.family-members');
    Route::post('booking/payment/store', [BookingController::class, 'paymentStore'])->name('booking.payment.store');
    Route::post('/room/booking', [RoomBookingController::class, 'store'])->name('rooms.booking.store');
    Route::get('/api/room-bookings/calendar', [RoomBookingController::class, 'getCalendar'])->name('api.bookings.calendar');

    // Search
    Route::get('/admin/api/search-users', [UserController::class, 'searchUsers'])->name('admin.api.search-users');
    // Booking Search
    Route::get('/booking/search', [BookingController::class, 'search'])->name('rooms.booking.search');

    Route::get('/booking/details', function () {
        return Inertia::render('App/Admin/Booking/Detail');
    })->name('rooms.details');

    // Admin Employee Routes
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

    // Subscription Routes
    Route::get('/admin/subscription/dashboard', [SubscriptionController::class, 'index'])->name('subscription.dashboard');
    Route::get('/admin/subscription/payment', [SubscriptionController::class, 'payment'])->name('subscriptions.payment');
    Route::post('/admin/subscription/payment/store', [SubscriptionController::class, 'paymentStore'])->name('subscriptions.payment.store');
    Route::get('/admin/subscription/add', [SubscriptionController::class, 'create'])->name('subscriptions.create');
    Route::post('/admin/subscription/store', [SubscriptionController::class, 'store'])->name('subscriptions.store');
    Route::get('/admin/manage/subscription', [SubscriptionController::class, 'management'])->name('subscriptions.management');
    // Subscription categories
    Route::resource('/admin/subscription/subscription-categories', SubscriptionCategoryController::class)->except('show');
    // Subscription types
    Route::get('admin/subscription/subscription-types', [SubscriptionTypeController::class, 'index'])->name('subscription-types.index');
    Route::post('admin/subscription/subscription-types/store', [SubscriptionTypeController::class, 'store'])->name('subscription-types.store');
    Route::post('admin/subscription/subscription-types/{id}/update2', [SubscriptionTypeController::class, 'update'])->name('subscription-types.update2');
    Route::delete('admin/subscription/subscription-types/{id}/delete', [SubscriptionTypeController::class, 'destroy'])->name('subscription-types.destroy');

    Route::get('/api/customers/search', [SubscriptionController::class, 'search']);

    Route::get('api/customer-invoices/{userId}', [SubscriptionController::class, 'customerInvoices']);
    Route::get('api/subscriptions/by-user/{user}', [SubscriptionController::class, 'byUser']);
    Route::get('api/members/by-user/{user}', [MembersController::class, 'byUser']);
    Route::post('api/pay-multiple-invoices', [SubscriptionController::class, 'payMultipleInvoices']);
    Route::post('api/create-and-pay-invoice', [SubscriptionController::class, 'createAndPay']);

    // Financial Routes
    Route::get('/finance/dashboard', [FinancialController::class, 'index'])->name('finance.dashboard');
    Route::get('/finance/transaction', [FinancialController::class, 'getTransaction'])->name('finance.transaction');
    Route::get('/api/finance/totalRevenue', [FinancialController::class, 'fetchRevenue'])->name('api.finance.totalRevenue');

    Route::get('/finance/add/transaction', [FinancialController::class, 'create'])->name('finance.transaction.create');
    Route::post('/finance/add/transaction', [FinancialController::class, 'store'])->name('finance.transaction.post');

    // Member Invoices
    Route::get('/api/member-invoices', [FinancialController::class, 'getMemberInvoices']);
    Route::post('/api/pay-invoices', [FinancialController::class, 'payInvoices']);

    // Route::get('/admin/subscription/sports/category', function () {
    //     return Inertia::render('App/Admin/Subscription/Sports');
    // })->name('subscription.sports');

    // Route::get('/admin/subscription/add/sports/category', function () {
    //     return Inertia::render('App/Admin/Subscription/AddSports');
    // })->name('subscription.addsports');

    // Kitchen Routes
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

    Route::group(['prefix' => 'admin/membership'], function () {
        Route::get('dashboard', [MembershipController::class, 'index'])->name('membership.dashboard');
        Route::get('create', [MembershipController::class, 'create'])->name('membership.add');
        Route::get('all', [MembershipController::class, 'allMembers'])->name('membership.members');
        Route::get('edit/{id}', [MembershipController::class, 'edit'])->name('membership.edit');
        Route::get('profile/{id}', [MembershipController::class, 'showMemberProfile'])->name('membership.profile');
        Route::get('profile/{id}/family-members', [MembershipController::class, 'getMemberFamilyMembers'])->name('membership.profile.family-members');
        Route::post('update/{id}', [MembershipController::class, 'updateMember'])->name('membership.update');
        Route::post('store', [MembershipController::class, 'store'])->name('membership.store');
        Route::post('update-status', [MembershipController::class, 'updateStatus'])->name('membership.update-status');

        // Reports Index - Dashboard with all reports
        Route::get('reports', [MemberFeeRevenueController::class, 'reportsIndex'])->name('membership.reports');

        // Membership Maintanance Revenue
        Route::get('maintanance-fee-revenue', [MemberFeeRevenueController::class, 'maintenanceFeeRevenue'])->name('membership.maintanance-fee-revenue');
        Route::get('maintanance-fee-revenue/print', [MemberFeeRevenueController::class, 'maintenanceFeeRevenuePrint'])->name('membership.maintanance-fee-revenue.print');

        // Pending Maintenance Report
        Route::get('pending-maintenance-report', [MemberFeeRevenueController::class, 'pendingMaintenanceReport'])->name('membership.pending-maintenance-report');
        Route::get('pending-maintenance-report/print', [MemberFeeRevenueController::class, 'pendingMaintenanceReportPrint'])->name('membership.pending-maintenance-report.print');

        // Supplementary Card Report
        Route::get('supplementary-card-report', [MemberFeeRevenueController::class, 'supplementaryCardReport'])->name('membership.supplementary-card-report');

        // Sleeping Members Report
        Route::get('sleeping-members-report', [MemberFeeRevenueController::class, 'sleepingMembersReport'])->name('membership.sleeping-members-report');

        // Member Card Detail Report
        Route::get('member-card-detail-report', [MemberFeeRevenueController::class, 'memberCardDetailReport'])->name('membership.member-card-detail-report');

        // Monthly Maintenance Fee Report
        Route::get('monthly-maintenance-fee-report', [MemberFeeRevenueController::class, 'monthlyMaintenanceFeeReport'])->name('membership.monthly-maintenance-fee-report');

        // New Year Eve Report
        Route::get('new-year-eve-report', [MemberFeeRevenueController::class, 'newYearEveReport'])->name('membership.new-year-eve-report');

        // Reinstating Fee Report
        Route::get('reinstating-fee-report', [MemberFeeRevenueController::class, 'reinstatingFeeReport'])->name('membership.reinstating-fee-report');

        // Sports Subscriptions Report
        Route::get('sports-subscriptions-report', [MemberFeeRevenueController::class, 'sportsSubscriptionsReport'])->name('membership.sports-subscriptions-report');

        // Subscriptions & Maintenance Summary Report
        Route::get('subscriptions-maintenance-summary', [MemberFeeRevenueController::class, 'subscriptionsMaintenanceSummary'])->name('membership.subscriptions-maintenance-summary');

        // Pending Maintenance Quarters Report
        Route::get('pending-maintenance-quarters-report', [MemberFeeRevenueController::class, 'pendingMaintenanceQuartersReport'])->name('membership.pending-maintenance-quarters-report');

        // Family Members Archive route
        Route::get('family-members-archive', [FamilyMembersArchiveConroller::class, 'index'])->name('membership.family-members');

        // Family Applied Member
        Route::get('applied-member', [AppliedMemberController::class, 'index'])->name('applied-member.index');
        Route::post('applied-member', [AppliedMemberController::class, 'store'])->name('applied-member.store');
        Route::put('applied-member/{id}', [AppliedMemberController::class, 'update'])->name('applied-member.update');

        // Member Categories
        Route::resource('member-categories', MemberCategoryController::class)->except('show');

        // Members types
        Route::get('member-types', [MemberTypeController::class, 'index'])->name('member-types.index');
        Route::post('member-types/store', [MemberTypeController::class, 'store'])->name('member-types.store');
        Route::post('member-types/{id}/update2', [MemberTypeController::class, 'update'])->name('member-types.update2');
        Route::delete('member-types/{id}/delete', [MemberTypeController::class, 'destroy'])->name('member-types.destroy');

        // payment
        Route::get('payments', [PaymentController::class, 'index'])->name('membership.allpayment');
        Route::post('payments/store', [PaymentController::class, 'store'])->name('membership.payment.store');

        // Member Transactions
        Route::group(['prefix' => 'transactions'], function () {
            Route::get('dashboard', [MemberTransactionController::class, 'index'])->name('membership.transactions.dashboard');
            Route::get('create', [MemberTransactionController::class, 'create'])->name('membership.transactions.create');
            Route::get('all', [MemberTransactionController::class, 'getAllTransactions'])->name('membership.transactions.index');
            Route::get('search', [MemberTransactionController::class, 'searchMembers'])->name('membership.transactions.search');
            Route::get('member/{memberId}', [MemberTransactionController::class, 'getMemberTransactions'])->name('membership.transactions.member');
            Route::post('store', [MemberTransactionController::class, 'store'])->name('membership.transactions.store');

            // Bulk Migration Routes (Temporary for data migration)
            Route::get('bulk-migration', [MemberTransactionController::class, 'bulkMigration'])->name('membership.transactions.bulk-migration');
        });

        // Family Member Expiry Management (integrated with Family Members Archive)
        Route::group(['prefix' => 'family-members-archive'], function () {
            Route::get('member/{member}/extend', [FamilyMembersArchiveConroller::class, 'show'])->name('membership.family-expiry.show')->middleware('role:super-admin');
            Route::post('member/{member}/extend', [FamilyMembersArchiveConroller::class, 'extendExpiry'])->name('membership.family-expiry.extend')->middleware('role:super-admin');
            Route::post('bulk-expire', [FamilyMembersArchiveConroller::class, 'bulkExpire'])->name('membership.family-expiry.bulk-expire')->middleware('role:super-admin');
        });
    });

    // get member invoice
    Route::get('financial-invoice/{id}', [FinancialController::class, 'getFinancialInvoices'])->name('financial-invoice');

    // Route::get('/member-types', [MembershipController::class, 'getAllMemberTypes']);

    // Membership Booking Routes
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

    // Data Migration Routes
    Route::group(['prefix' => 'admin/data-migration'], function () {
        Route::get('/', [DataMigrationController::class, 'index'])->name('data-migration.index');
        Route::get('/stats', [DataMigrationController::class, 'getMigrationStats'])->name('data-migration.stats');
        Route::post('/migrate-members', [DataMigrationController::class, 'migrateMembers'])->name('data-migration.migrate-members');
        Route::post('/migrate-families', [DataMigrationController::class, 'migrateFamilies'])->name('data-migration.migrate-families');
        Route::post('/reset', [DataMigrationController::class, 'resetMigration'])->name('data-migration.reset');
        Route::get('/validate', [DataMigrationController::class, 'validateMigration'])->name('data-migration.validate');
    });

    // Role Management Routes (Super Admin only - Web Guard)
    Route::group(['prefix' => 'admin/roles', 'middleware' => ['auth:web', 'super.admin:roles.view']], function () {
        Route::get('/', [RoleManagementController::class, 'index'])->name('admin.roles.index');
        Route::get('/create', [RoleManagementController::class, 'create'])->name('admin.roles.create')->middleware('super.admin:roles.create');
        Route::post('/', [RoleManagementController::class, 'store'])->name('admin.roles.store')->middleware('super.admin:roles.create');
        Route::get('/{role}', [RoleManagementController::class, 'show'])->name('admin.roles.show');
        Route::get('/{role}/edit', [RoleManagementController::class, 'edit'])->name('admin.roles.edit')->middleware('super.admin:roles.edit');
        Route::put('/{role}', [RoleManagementController::class, 'update'])->name('admin.roles.update')->middleware('super.admin:roles.edit');
        Route::delete('/{role}', [RoleManagementController::class, 'destroy'])->name('admin.roles.destroy')->middleware('super.admin:roles.delete');

        // API Routes for role management
        Route::get('/api/permissions', [RoleManagementController::class, 'getPermissions'])->name('admin.roles.permissions');
        Route::post('/api/assign-role', [RoleManagementController::class, 'assignRole'])->name('admin.roles.assign')->middleware('super.admin:roles.edit');
        Route::post('/api/remove-role', [RoleManagementController::class, 'removeRole'])->name('admin.roles.remove')->middleware('super.admin:roles.edit');
    });

    // User Management Routes (Super Admin only - Web Guard)
    Route::group(['prefix' => 'admin/users', 'middleware' => ['auth:web', 'super.admin:users.view']], function () {
        Route::get('/', [UserManagementController::class, 'index'])->name('admin.users.index');
        Route::post('/create-super-admin', [UserManagementController::class, 'createSuperAdminUser'])->name('admin.users.create-super-admin')->middleware('super.admin:users.create');
        Route::post('/create-employee-user', [UserManagementController::class, 'createEmployeeUser'])->name('admin.users.create-employee');
        Route::post('/assign-role', [UserManagementController::class, 'assignRole'])->name('admin.users.assign-role')->middleware('super.admin:users.edit');
        Route::post('/remove-role', [UserManagementController::class, 'removeRole'])->name('admin.users.remove-role')->middleware('super.admin:users.edit');
    });

    // tenant route
    Route::get('locations', [TenantController::class, 'index'])->name('locations.index');
    Route::get('locations/register', [TenantController::class, 'create'])->name('locations.create');
    Route::post('locations/store', [TenantController::class, 'store'])->name('locations.store');
    Route::get('locations/{tenant}/edit', [TenantController::class, 'edit'])->name('locations.edit');
    Route::put('locations/{tenant}', [TenantController::class, 'update'])->name('locations.update');

    // Admin POS Reports Routes
    Route::prefix('admin/reports')->group(function () {
        Route::get('pos/all', [AdminPosReportController::class, 'index'])->name('admin.reports.pos.all');
        Route::get('pos/restaurant/{tenantId}', [AdminPosReportController::class, 'singleRestaurant'])->name('admin.reports.pos.single');
        Route::get('pos/all/print', [AdminPosReportController::class, 'printAll'])->name('admin.reports.pos.all.print');
        Route::get('pos/restaurant/{tenantId}/print', [AdminPosReportController::class, 'printSingle'])->name('admin.reports.pos.single.print');
        Route::get('pos/restaurant-wise', [AdminPosReportController::class, 'restaurantWise'])->name('admin.reports.pos.restaurant-wise');
        Route::get('pos/restaurant-wise/print', [AdminPosReportController::class, 'restaurantWisePrint'])->name('admin.reports.pos.restaurant-wise.print');
        Route::get('pos/running-sales-orders', [AdminPosReportController::class, 'runningSalesOrders'])->name('admin.reports.pos.running-sales-orders');
        Route::get('pos/running-sales-orders/print', [AdminPosReportController::class, 'runningSalesOrdersPrint'])->name('admin.reports.pos.running-sales-orders.print');
        Route::get('pos/sales-summary-with-items', [AdminPosReportController::class, 'salesSummaryWithItems'])->name('admin.reports.pos.sales-summary-with-items');
        Route::get('pos/sales-summary-with-items/print', [AdminPosReportController::class, 'salesSummaryWithItemsPrint'])->name('admin.reports.pos.sales-summary-with-items.print');
        Route::get('pos/daily-sales-list-cashier-wise', [AdminPosReportController::class, 'dailySalesListCashierWise'])->name('admin.reports.pos.daily-sales-list-cashier-wise');
        Route::get('pos/daily-sales-list-cashier-wise/print', [AdminPosReportController::class, 'dailySalesListCashierWisePrint'])->name('admin.reports.pos.daily-sales-list-cashier-wise.print');
        Route::get('pos/daily-dump-items-report', [AdminPosReportController::class, 'dailyDumpItemsReport'])->name('admin.reports.pos.daily-dump-items-report');
        Route::get('pos/daily-dump-items-report/print', [AdminPosReportController::class, 'dailyDumpItemsReportPrint'])->name('admin.reports.pos.daily-dump-items-report.print');
    });
});

// Central guest-only auth routes
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
