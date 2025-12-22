<?php

use App\Http\Controllers\Admin\PartnerAffiliateController;
use App\Http\Controllers\App\MembersController;
use App\Http\Controllers\App\MemberTypeController;
use App\Http\Controllers\App\SubscriptionTypeController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AdminPosReportController;
use App\Http\Controllers\AppliedMemberController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\CardController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DataMigrationController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EmployeeDepartmentController;
use App\Http\Controllers\EmployeeSubdepartmentController;
use App\Http\Controllers\EventBookingController;
use App\Http\Controllers\EventChargesTypeController;
use App\Http\Controllers\EventMenuAddOnsController;
use App\Http\Controllers\EventMenuCategoryController;
use App\Http\Controllers\EventMenuController;
use App\Http\Controllers\EventMenuTypeController;
use App\Http\Controllers\EventVenueController;
use App\Http\Controllers\FamilyMembersArchiveConroller;
use App\Http\Controllers\FinancialController;
use App\Http\Controllers\LeaveApplicationController;
use App\Http\Controllers\LeaveCategoryController;
use App\Http\Controllers\MemberCategoryController;
use App\Http\Controllers\MemberFeeRevenueController;
use App\Http\Controllers\MembershipController;
use App\Http\Controllers\MemberTransactionController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PayrollApiController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\RoleManagementController;
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
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\UserMemberController;
use App\Http\Controllers\VoucherController;
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
    Route::get('dashboard', [AdminController::class, 'index'])->name('dashboard')->middleware('super.admin:dashboard.view');
    Route::get('activity-log', [App\Http\Controllers\Admin\ActivityController::class, 'index'])->name('activity-log');
    Route::post('notifications/{id}/read', [AdminController::class, 'markNotificationRead'])->name('notifications.read');
    Route::get('dashboard/print', [AdminController::class, 'printDashboard'])->name('dashboard.print')->middleware('super.admin:dashboard.view');

    // Employeee Management
    Route::prefix('admin/employees')->middleware('super.admin:employees.view')->group(function () {
        Route::get('/dashboard', [EmployeeController::class, 'dashboard'])->name('employees.dashboard');
        Route::get('/create', [EmployeeController::class, 'create'])->name('employees.create');
        Route::get('/edit/{employeeId}', [EmployeeController::class, 'edit'])->name('employees.edit');
        Route::get('/departments', [EmployeeDepartmentController::class, 'index'])->name('employees.departments');
        Route::get('/subdepartments', [EmployeeSubdepartmentController::class, 'index'])->name('employees.subdepartments');
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

        Route::prefix('payroll')->group(function () {
            // Payroll Dashboard
            Route::get('dashboard', [PayrollController::class, 'dashboard'])->name('employees.payroll.dashboard');

            // Payroll Settings
            Route::get('settings', [PayrollController::class, 'settings'])->name('employees.payroll.settings');

            // Employee Salary Management
            Route::get('salaries', [PayrollController::class, 'employeeSalaries'])->name('employees.payroll.salaries');
            Route::get('salaries/create/{employeeId}', [PayrollController::class, 'createSalaryStructure'])->name('employees.payroll.salaries.create');
            Route::get('salaries/edit/{employeeId}', [PayrollController::class, 'editSalaryStructure'])->name('employees.payroll.salaries.edit');
            Route::get('salaries/view/{employeeId}', [PayrollController::class, 'viewSalaryStructure'])->name('employees.payroll.salaries.view');

            // Allowance & Deduction Types Management
            Route::get('allowance-types', [PayrollController::class, 'allowanceTypes'])->name('employees.payroll.allowance-types');
            Route::get('deduction-types', [PayrollController::class, 'deductionTypes'])->name('employees.payroll.deduction-types');

            // Payroll Processing
            Route::get('process', [PayrollController::class, 'processPayroll'])->name('employees.payroll.process');
            // Payroll Preview (full page)
            Route::get('preview', [PayrollController::class, 'previewPayrollPage'])->name('employees.payroll.preview');
            Route::get('periods', [PayrollController::class, 'payrollPeriods'])->name('employees.payroll.periods');
            Route::get('periods/create', [PayrollController::class, 'createPeriod'])->name('employees.payroll.periods.create');
            Route::get('periods/{periodId}/edit', [PayrollController::class, 'editPeriod'])->name('employees.payroll.periods.edit');
            Route::get('periods/{periodId}/payslips', [PayrollController::class, 'periodPayslips'])->name('employees.payroll.periods.payslips');

            // Payslips Management
            Route::get('payslips', [PayrollController::class, 'payslips'])->name('employees.payroll.payslips');
            Route::get('payslips/{periodId}', [PayrollController::class, 'periodPayslips'])->name('employees.payroll.payslips.period');
            Route::get('payslip/{payslipId}', [PayrollController::class, 'viewPayslip'])->name('employees.payroll.payslip.view');
            Route::get('payslips/{payslipId}/print', [PayrollController::class, 'printPayslip'])->name('employees.payroll.payslips.print');

            // Reports
            Route::get('reports', [PayrollController::class, 'reports'])->name('employees.payroll.reports');
            Route::get('reports/summary/{periodId?}', [PayrollController::class, 'summaryReport'])->name('employees.payroll.reports.summary');
            Route::get('reports/summary/{periodId}/print', [PayrollController::class, 'summaryReportPrint'])->name('employees.payroll.reports.summary.print');
            Route::get('reports/detailed/{periodId?}', [PayrollController::class, 'detailedReport'])->name('employees.payroll.reports.detailed');
            Route::get('reports/detailed/{periodId}/print', [PayrollController::class, 'detailedReportPrint'])->name('employees.payroll.reports.detailed.print');
        });
    });

    // Admin Room Booking Routes
    Route::group(['prefix' => 'booking-management'], function () {
        Route::resource('guests', CustomerController::class)->except(['show']);

        Route::group(['prefix' => 'rooms'], function () {
            Route::get('/', [RoomController::class, 'allRooms'])->name('rooms.all')->middleware('super.admin:rooms.view');

            Route::get('/create-booking', [RoomBookingController::class, 'booking'])->name('rooms.create.booking')->middleware('super.admin:rooms.booking.create');
            Route::get('/edit-booking/{id}', [RoomBookingController::class, 'editbooking'])->name('rooms.edit.booking')->middleware('super.admin:rooms.booking.edit');
            Route::post('/update-booking/{id}', [RoomBookingController::class, 'update'])->name('rooms.update.booking')->middleware('permission:rooms.booking.edit');
            Route::post('/create-booking', [RoomBookingController::class, 'store'])->name('rooms.store.booking')->middleware('permission:rooms.booking.create');

            Route::get('dashboard', [RoomController::class, 'dashboard'])->name('rooms.dashboard')->middleware('super.admin:rooms.bookings.view');
            Route::get('manage', [RoomController::class, 'index'])->name('rooms.manage')->middleware('super.admin:rooms.view');
            Route::get('check-in', [RoomController::class, 'checkInIndex'])->name('rooms.checkin')->middleware('super.admin:rooms.bookings.checkin');
            Route::get('check-out', [RoomController::class, 'checkOutIndex'])->name('rooms.checkout')->middleware('super.admin:rooms.bookings.checkout');
            Route::post('store', [RoomController::class, 'store'])->name('rooms.store')->middleware('permission:rooms.create');
            Route::get('booking/invoice/{id}', [RoomController::class, 'bookingInvoice'])->name('rooms.invoice')->middleware('permission:rooms.bookings.view');
            Route::put('booking/update-status/{id}', [RoomController::class, 'updateStatus'])->name('rooms.update.status')->middleware('permission:rooms.bookings.edit');
            Route::get('add', [RoomController::class, 'create'])->name('rooms.add')->middleware('super.admin:rooms.create');
            Route::get('edit/{id}', [RoomController::class, 'edit'])->name('rooms.edit')->middleware('super.admin:rooms.edit');
            Route::post('{id}', [RoomController::class, 'update'])->name('rooms.update')->middleware('permission:rooms.edit');
            Route::delete('{id}', [RoomController::class, 'destroy'])->name('rooms.destroy')->middleware('permission:rooms.delete');
            // Room Calendar
            Route::get('booking/calendar', [RoomBookingController::class, 'calendar'])->name('rooms.booking.calendar')->middleware('super.admin:rooms.bookings.calendar');

            // get room booking data
            Route::get('api/bookings/{id}', [RoomBookingController::class, 'showRoomBooking'])->name('api.room.booking.show')->middleware('permission:rooms.bookings.view');
            Route::get('api/bookings/{id}/orders', [RoomBookingController::class, 'getOrders'])->name('api.room.booking.orders')->middleware('permission:rooms.bookings.view');
            Route::post('api/bookings/check-in', [RoomBookingController::class, 'checkIn'])->name('api.room.booking.checkin')->middleware('permission:rooms.bookings.checkin');
            // Route::get('/types', [RoomController::class, 'mamageTypes'])->name('rooms.types');
            Route::group(['prefix' => 'requests', 'middleware' => 'super.admin:rooms.bookings.requests'], function () {
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
            Route::get('dashboard', [EventBookingController::class, 'index'])->name('events.dashboard')->middleware('super.admin:events.bookings.view');
            Route::get('calendar', function () {
                return inertia('App/Admin/Events/Calendar');
            })->name('events.calendar')->middleware('super.admin:events.bookings.calendar');
            Route::get('manage', [EventBookingController::class, 'manage'])->name('events.manage')->middleware('super.admin:events.bookings.view');
            Route::get('completed', [EventBookingController::class, 'completed'])->name('events.completed')->middleware('super.admin:events.bookings.completed');
            Route::get('cancelled', [EventBookingController::class, 'cancelled'])->name('events.cancelled')->middleware('super.admin:events.bookings.cancelled');
            Route::get('create', [EventBookingController::class, 'create'])->name('events.booking.create')->middleware('super.admin:events.bookings.create');
            Route::post('booking', [EventBookingController::class, 'store'])->name('events.booking.store')->middleware('permission:events.bookings.create');
            Route::get('booking/{id}/invoice', [EventBookingController::class, 'showInvoice'])->name('events.booking.invoice')->middleware('permission:events.bookings.view');
            Route::put('booking/{id}/status', [EventBookingController::class, 'updateStatus'])->name('events.booking.update.status')->middleware('permission:events.bookings.edit');
            Route::get('booking/{id}/edit', [EventBookingController::class, 'edit'])->name('events.booking.edit')->middleware('super.admin:events.bookings.edit');
            Route::post('booking/{id}', [EventBookingController::class, 'update'])->name('events.booking.update')->middleware('permission:events.bookings.edit');
        });
        Route::resource('event-venues', EventVenueController::class)->except(['create', 'edit', 'show']);
        Route::resource('event-menu', EventMenuController::class)->except(['show']);
        Route::resource('event-menu-category', EventMenuCategoryController::class)->except(['create', 'edit', 'show']);
        Route::resource('event-menu-type', EventMenuTypeController::class)->except(['create', 'edit', 'show']);
        Route::resource('event-menu-addon', EventMenuAddOnsController::class)->except(['create', 'edit', 'show']);
        Route::resource('event-charges-type', EventChargesTypeController::class)->except(['create', 'edit', 'show']);
    });

    // Admin Booking Routes
    Route::get('/api/room-bookings/calendar', [RoomBookingController::class, 'getCalendar'])->name('api.bookings.calendar');
    Route::get('/api/events/calendar', [EventBookingController::class, 'calendarData'])->name('api.events.calendar');
    Route::get('/api/events/venues', [EventBookingController::class, 'getVenues'])->name('api.events.venues');
    Route::get('/booking/payment', [BookingController::class, 'payNow'])->name('booking.payment');
    Route::post('booking/payment/store', [BookingController::class, 'paymentStore'])->name('booking.payment.store');

    //
    Route::get('/admin/family-members/{id}', [BookingController::class, 'familyMembers'])->name('admin.family-members');

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
    Route::get('/employee/payroll/add/salary/component', function () {
        return Inertia::render('App/Admin/Employee/Payroll/AddSalary');
    })->name('employee.addsalary');

    Route::get('/employee/payroll/salary/component', function () {
        return Inertia::render('App/Admin/Employee/Payroll/Component');
    })->name('employee.component');

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

    Route::group(['prefix' => 'admin/subscription'], function () {
        // Subscription Routes
        Route::get('dashboard', [SubscriptionController::class, 'index'])->name('subscription.dashboard')->middleware('permission:subscriptions.dashboard.view');
        Route::get('manage', [SubscriptionController::class, 'management'])->name('subscriptions.management')->middleware('permission:subscriptions.view');
        // Subscription categories
        Route::resource('subscription-categories', SubscriptionCategoryController::class)->except('show');
        // Subscription types
        Route::get('subscription-types', [SubscriptionTypeController::class, 'index'])->name('subscription-types.index');
        Route::post('subscription-types/store', [SubscriptionTypeController::class, 'store'])->name('subscription-types.store');
        Route::post('subscription-types/{id}/update2', [SubscriptionTypeController::class, 'update'])->name('subscription-types.update2');
        Route::delete('subscription-types/{id}/delete', [SubscriptionTypeController::class, 'destroy'])->name('subscription-types.destroy');
    });

    // Subscription details route (public access for QR code scanning)
    Route::get('subscription/details/{id}', [SubscriptionController::class, 'showDetails'])->name('subscription.details');

    Route::get('/api/customers/search', [SubscriptionController::class, 'search']);

    Route::get('api/customer-invoices/{userId}', [SubscriptionController::class, 'customerInvoices']);
    Route::get('api/subscriptions/by-user/{user}', [SubscriptionController::class, 'byUser']);
    Route::get('api/members/by-user/{user}', [MembersController::class, 'byUser']);
    Route::post('api/pay-multiple-invoices', [SubscriptionController::class, 'payMultipleInvoices']);
    Route::post('api/create-and-pay-invoice', [SubscriptionController::class, 'createAndPay']);
    Route::post('api/check-duplicate-cnic', [MembersController::class, 'checkDuplicateCnic'])->name('api.check-duplicate-cnic');
    Route::post('api/check-duplicate-membership-no', [MembersController::class, 'checkDuplicateMembershipNo'])->name('api.check-duplicate-membership-no');
    Route::post('api/check-duplicate-barcode', [MembersController::class, 'checkDuplicateBarcode'])->name('api.check-duplicate-barcode');
    Route::get('api/get-next-membership-number', [MembersController::class, 'getNextMembershipNumber'])->name('api.get-next-membership-number');
    Route::get('api/members/search', [MembersController::class, 'search'])->name('api.members.search');

    // Financial Routes
    Route::group(['prefix' => 'admin/finance'], function () {
        // Main Finance Dashboard & Manage
        Route::get('dashboard', [FinancialController::class, 'index'])->name('finance.dashboard')->middleware('permission:financial.dashboard.view');
        Route::get('manage', [FinancialController::class, 'getAllTransactions'])->name('finance.transaction')->middleware('permission:financial.view');

        // Transaction Management Routes
        Route::get('create', [MemberTransactionController::class, 'create'])->name('finance.transaction.create')->middleware('permission:financial.create');
        Route::post('store', [MemberTransactionController::class, 'store'])->name('finance.transaction.store')->middleware('permission:financial.create');
        Route::get('search', [MemberTransactionController::class, 'searchMembers'])->name('finance.transaction.search')->middleware('permission:financial.create');
        Route::get('member/{memberId}', [MemberTransactionController::class, 'getMemberTransactions'])->name('finance.transaction.member')->middleware('permission:financial.create');
        Route::post('/finance/transaction/update-status/{id}', [MemberTransactionController::class, 'updateStatus'])->name('finance.transaction.update-status');
    });

    // Route for business developers, outside the 'admin/finance' group as per user's snippet structure
    Route::get('/employees/business-developers', [EmployeeController::class, 'getBusinessDevelopers'])->name('employees.business-developers')->middleware('permission:financial.edit');

    Route::get('/api/finance/totalRevenue', [FinancialController::class, 'fetchRevenue'])->name('api.finance.totalRevenue');

    // Payroll API Routes
    Route::prefix('api/payroll')->group(function () {
        // Dashboard Stats
        Route::get('/dashboard/stats', [PayrollApiController::class, 'getDashboardStats'])->name('api.payroll.dashboard.stats');

        // Settings
        Route::get('/settings', [PayrollApiController::class, 'getSettings'])->name('api.payroll.settings');
        Route::post('/settings', [PayrollApiController::class, 'updateSettings'])->name('api.payroll.settings.update');

        // Allowance Types
        Route::get('/allowance-types', [PayrollApiController::class, 'getAllowanceTypes'])->name('api.payroll.allowance-types');
        Route::post('/allowance-types', [PayrollApiController::class, 'storeAllowanceType'])->name('api.payroll.allowance-types.store');
        Route::put('/allowance-types/{id}', [PayrollApiController::class, 'updateAllowanceType'])->name('api.payroll.allowance-types.update');
        Route::delete('/allowance-types/{id}', [PayrollApiController::class, 'deleteAllowanceType'])->name('api.payroll.allowance-types.delete');

        // Deduction Types
        Route::get('/deduction-types', [PayrollApiController::class, 'getDeductionTypes'])->name('api.payroll.deduction-types');
        Route::post('/deduction-types', [PayrollApiController::class, 'storeDeductionType'])->name('api.payroll.deduction-types.store');
        Route::put('/deduction-types/{id}', [PayrollApiController::class, 'updateDeductionType'])->name('api.payroll.deduction-types.update');
        Route::delete('/deduction-types/{id}', [PayrollApiController::class, 'deleteDeductionType'])->name('api.payroll.deduction-types.delete');

        // Employee Salaries
        Route::get('/employees/salaries', [PayrollApiController::class, 'getEmployeeSalaries'])->name('api.payroll.employees.salaries');
        Route::post('/employees/{employeeId}/salary-structure', [PayrollApiController::class, 'storeSalaryStructure'])->name('api.payroll.employees.salary-structure.store');
        Route::put('/employees/{employeeId}/salary-structure', [PayrollApiController::class, 'updateSalaryStructure'])->name('api.payroll.employees.salary-structure.update');
        Route::get('/employees/{employeeId}/salary-details', [PayrollApiController::class, 'getEmployeeSalaryDetails'])->name('api.payroll.employees.salary-details');

        // Payroll Periods
        Route::get('/periods', [PayrollApiController::class, 'getPayrollPeriods'])->name('api.payroll.periods');
        Route::post('/periods', [PayrollApiController::class, 'storePayrollPeriod'])->name('api.payroll.periods.store');
        Route::put('/periods/{id}', [PayrollApiController::class, 'updatePayrollPeriod'])->name('api.payroll.periods.update');
        Route::delete('/periods/{id}', [PayrollApiController::class, 'deletePayrollPeriod'])->name('api.payroll.periods.delete');
        Route::post('/periods/{id}/mark-as-paid', [PayrollApiController::class, 'markPeriodAsPaid'])->name('api.payroll.periods.mark-as-paid');

        // Payroll Processing
        Route::post('/periods/{periodId}/process', [PayrollApiController::class, 'processPayroll'])->name('api.payroll.periods.process');
        Route::get('/periods/{periodId}/preview', [PayrollApiController::class, 'previewPayroll'])->name('api.payroll.periods.preview');
        // Create a short-lived preview session token to avoid long query strings
        Route::post('/preview-session', [PayrollApiController::class, 'createPreviewSession'])->name('api.payroll.preview.session');

        // Payslips
        Route::get('/periods/{periodId}/payslips', [PayrollApiController::class, 'getPeriodPayslips'])->name('api.payroll.periods.payslips');
        Route::get('/payslips/{payslipId}', [PayrollApiController::class, 'getPayslip'])->name('api.payroll.payslips.show');
        Route::post('/payslips/{payslipId}/approve', [PayrollApiController::class, 'approvePayslip'])->name('api.payroll.payslips.approve');
        Route::post('/payslips/{payslipId}/reject', [PayrollApiController::class, 'rejectPayslip'])->name('api.payroll.payslips.reject');
        Route::post('/payslips/{payslipId}/revert-to-draft', [PayrollApiController::class, 'revertPayslipToDraft'])->name('api.payroll.payslips.revert-to-draft');
        Route::post('/payslips/bulk-approve', [PayrollApiController::class, 'bulkApprovePayslips'])->name('api.payroll.payslips.bulk-approve');

        // Reports
        Route::get('/reports/summary/{periodId}', [PayrollApiController::class, 'getSummaryReport'])->name('api.payroll.reports.summary');
        Route::get('/reports/detailed/{periodId}', [PayrollApiController::class, 'getDetailedReport'])->name('api.payroll.reports.detailed');
        Route::get('/reports/employee/{employeeId}', [PayrollApiController::class, 'getEmployeePayrollHistory'])->name('api.payroll.reports.employee');
    });

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

    Route::group(['prefix' => 'admin/membership'], function () {
        Route::get('partners-affiliates/search', [PartnerAffiliateController::class, 'search'])->name('admin.membership.partners-affiliates.search');
        Route::get('partners-affiliates/trashed', [PartnerAffiliateController::class, 'trashed'])->name('admin.membership.partners-affiliates.trashed');
        Route::post('partners-affiliates/restore/{id}', [PartnerAffiliateController::class, 'restore'])->name('admin.membership.partners-affiliates.restore');
        Route::resource('partners-affiliates', PartnerAffiliateController::class)->names('admin.membership.partners-affiliates');
        Route::get('dashboard', [MembershipController::class, 'index'])->name('membership.dashboard')->middleware('permission:members.view');
        Route::get('all', [MembershipController::class, 'allMembers'])->name('membership.members')->middleware('permission:members.view');
        Route::get('trashed', [MembershipController::class, 'trashed'])->name('membership.trashed')->middleware('permission:members.delete');
        Route::post('restore/{id}', [MembershipController::class, 'restore'])->name('membership.restore')->middleware('permission:members.delete');
        Route::delete('/{id}', [MembershipController::class, 'destroy'])->name('membership.destroy')->middleware('permission:members.delete');
        Route::get('create', [MembershipController::class, 'create'])->name('membership.add')->middleware('permission:members.create');
        Route::get('edit/{id}', [MembershipController::class, 'edit'])->name('membership.edit')->middleware('permission:members.edit');
        Route::get('profile/{id}', [MembershipController::class, 'showMemberProfile'])->name('membership.profile')->middleware('permission:members.view');
        Route::get('profile/{id}/family-members', [MembershipController::class, 'getMemberFamilyMembers'])->name('membership.profile.family-members')->middleware('permission:members.view');
        Route::get('profile/{id}/order-history', [MembershipController::class, 'getMemberOrderHistory'])->name('membership.profile.order-history')->middleware('permission:members.view');
        Route::get('/payment-order-data/{invoiceId}', [TransactionController::class, 'PaymentOrderData'])->name('member.orderhistory.invoice');
        Route::post('update/{id}', [MembershipController::class, 'updateMember'])->name('membership.update')->middleware('permission:members.edit');
        Route::post('store', [MembershipController::class, 'store'])->name('membership.store')->middleware('permission:members.create');
        Route::post('store-step-4', [MembershipController::class, 'storeStep4'])->name('membership.store-step-4')->middleware('permission:members.create');
        Route::post('update-status', [MembershipController::class, 'updateStatus'])->name('membership.update-status')->middleware('permission:members.edit');
        Route::post('profession-info', [MembershipController::class, 'saveProfessionInfo'])->name('membership.profession-info')->middleware('permission:members.create');
        Route::get('profession-info/{id}', [MembershipController::class, 'getProfessionInfo'])->name('membership.profession-info.get')->middleware('permission:members.view');
        // Card Routes
        Route::get('/cards', [CardController::class, 'index'])->name('cards.dashboard');

        // Reports Index - Dashboard with all reports
        Route::get('reports', [MemberFeeRevenueController::class, 'reportsIndex'])->name('membership.reports')->middleware('permission:reports.view');

        // Membership Maintanance Revenue
        Route::get('maintanance-fee-revenue', [MemberFeeRevenueController::class, 'maintenanceFeeRevenue'])->name('membership.maintanance-fee-revenue')->middleware('permission:reports.view');
        Route::get('maintanance-fee-revenue/print', [MemberFeeRevenueController::class, 'maintenanceFeeRevenuePrint'])->name('membership.maintanance-fee-revenue.print')->middleware('permission:reports.view');

        // Pending Maintenance Report
        Route::get('pending-maintenance-report', [MemberFeeRevenueController::class, 'pendingMaintenanceReport'])->name('membership.pending-maintenance-report')->middleware('permission:reports.view');
        Route::get('pending-maintenance-report/print', [MemberFeeRevenueController::class, 'pendingMaintenanceReportPrint'])->name('membership.pending-maintenance-report.print')->middleware('permission:reports.view');

        // Supplementary Card Report
        Route::get('supplementary-card-report', [MemberFeeRevenueController::class, 'supplementaryCardReport'])->name('membership.supplementary-card-report')->middleware('permission:reports.view');
        Route::get('supplementary-card-report/print', [MemberFeeRevenueController::class, 'supplementaryCardReportPrint'])->name('membership.supplementary-card-report.print')->middleware('permission:reports.view');

        // Sleeping Members Report
        Route::get('sleeping-members-report', [MemberFeeRevenueController::class, 'sleepingMembersReport'])->name('membership.sleeping-members-report')->middleware('permission:reports.view');
        Route::get('sleeping-members-report/print', [MemberFeeRevenueController::class, 'sleepingMembersReportPrint'])->name('membership.sleeping-members-report.print')->middleware('permission:reports.view');

        // Member Card Detail Report
        Route::get('member-card-detail-report', [MemberFeeRevenueController::class, 'memberCardDetailReport'])->name('membership.member-card-detail-report')->middleware('permission:reports.view');
        Route::get('member-card-detail-report/print', [MemberFeeRevenueController::class, 'memberCardDetailReportPrint'])->name('membership.member-card-detail-report.print')->middleware('permission:reports.view');

        // Monthly Maintenance Fee Report
        Route::get('monthly-maintenance-fee-report', [MemberFeeRevenueController::class, 'monthlyMaintenanceFeeReport'])->name('membership.monthly-maintenance-fee-report')->middleware('permission:reports.view');
        Route::get('monthly-maintenance-fee-report/print', [MemberFeeRevenueController::class, 'monthlyMaintenanceFeeReportPrint'])->name('membership.monthly-maintenance-fee-report.print')->middleware('permission:reports.view');

        // New Year Eve Report
        Route::get('new-year-eve-report', [MemberFeeRevenueController::class, 'newYearEveReport'])->name('membership.new-year-eve-report')->middleware('permission:reports.view');
        Route::get('new-year-eve-report/print', [MemberFeeRevenueController::class, 'newYearEveReportPrint'])->name('membership.new-year-eve-report.print')->middleware('permission:reports.view');

        // Reinstating Fee Report
        Route::get('reinstating-fee-report', [MemberFeeRevenueController::class, 'reinstatingFeeReport'])->name('membership.reinstating-fee-report')->middleware('permission:reports.view');
        Route::get('reinstating-fee-report/print', [MemberFeeRevenueController::class, 'reinstatingFeeReportPrint'])->name('membership.reinstating-fee-report.print')->middleware('permission:reports.view');

        // Sports Subscriptions Report
        Route::get('sports-subscriptions-report', [MemberFeeRevenueController::class, 'sportsSubscriptionsReport'])->name('membership.sports-subscriptions-report')->middleware('permission:reports.view');
        Route::get('sports-subscriptions-report/print', [MemberFeeRevenueController::class, 'sportsSubscriptionsReportPrint'])->name('membership.sports-subscriptions-report.print')->middleware('permission:reports.view');

        // Subscriptions & Maintenance Summary Report
        Route::get('subscriptions-maintenance-summary', [MemberFeeRevenueController::class, 'subscriptionsMaintenanceSummary'])->name('membership.subscriptions-maintenance-summary')->middleware('permission:reports.view');
        Route::get('subscriptions-maintenance-summary/print', [MemberFeeRevenueController::class, 'subscriptionsMaintenanceSummaryPrint'])->name('membership.subscriptions-maintenance-summary.print')->middleware('permission:reports.view');

        // Pending Maintenance Quarters Report
        Route::get('pending-maintenance-quarters-report', [MemberFeeRevenueController::class, 'pendingMaintenanceQuartersReport'])->name('membership.pending-maintenance-quarters-report')->middleware('permission:reports.view');
        Route::get('pending-maintenance-quarters-report/print', [MemberFeeRevenueController::class, 'pendingMaintenanceQuartersReportPrint'])->name('membership.pending-maintenance-quarters-report.print')->middleware('permission:reports.view');

        // Family Members Archive route
        Route::get('family-members-archive', [FamilyMembersArchiveConroller::class, 'index'])->name('membership.family-members')->middleware('permission:family-members.view');
        Route::get('family-members-archive/trashed', [FamilyMembersArchiveConroller::class, 'trashed'])->name('membership.family-members.trashed');
        Route::post('family-members-archive/restore/{id}', [FamilyMembersArchiveConroller::class, 'restore'])->name('membership.family-members.restore');
        Route::get('family-members-archive/search', [FamilyMembersArchiveConroller::class, 'search'])->name('membership.family-members.search');

        // Family Applied Member
        Route::get('applied-member', [AppliedMemberController::class, 'index'])->name('applied-member.index');
        Route::get('applied-member/trashed', [AppliedMemberController::class, 'trashed'])->name('applied-member.trashed');
        Route::post('applied-member/restore/{id}', [AppliedMemberController::class, 'restore'])->name('applied-member.restore');
        Route::get('api/applied-members/search', [AppliedMemberController::class, 'search'])->name('api.applied-members.search');
        Route::post('applied-member', [AppliedMemberController::class, 'store'])->name('applied-member.store');
        Route::put('applied-member/{id}', [AppliedMemberController::class, 'update'])->name('applied-member.update');
        Route::delete('applied-member/{id}', [AppliedMemberController::class, 'destroy'])->name('applied-member.destroy');

        // Member Categories
        Route::get('member-categories/trashed', [MemberCategoryController::class, 'trashed'])->name('member-categories.trashed');
        Route::post('member-categories/restore/{id}', [MemberCategoryController::class, 'restore'])->name('member-categories.restore');
        Route::resource('member-categories', MemberCategoryController::class)->except('show');

        // Members types
        Route::get('member-types', [MemberTypeController::class, 'index'])->name('member-types.index');
        Route::get('member-types/trashed', [MemberTypeController::class, 'trashed'])->name('member-types.trashed');
        Route::post('member-types/restore/{id}', [MemberTypeController::class, 'restore'])->name('member-types.restore');
        Route::post('member-types/store', [MemberTypeController::class, 'store'])->name('member-types.store');
        Route::post('member-types/{id}/update2', [MemberTypeController::class, 'update'])->name('member-types.update2');
        Route::delete('member-types/{id}/delete', [MemberTypeController::class, 'destroy'])->name('member-types.destroy');

        // payment
        Route::get('payments', [PaymentController::class, 'index'])->name('membership.allpayment');
        Route::post('payments/store', [PaymentController::class, 'store'])->name('membership.payment.store');

        // Membership Finance
        Route::get('finance', function () {
            return Inertia::render('App/Admin/Membership/Finance');
        })->name('membership.finance');

        // Family Member Expiry Management (integrated with Family Members Archive)
        Route::group(['prefix' => 'family-members-archive', 'middleware' => 'role:super-admin'], function () {
            Route::get('member/{member}/extend', [FamilyMembersArchiveConroller::class, 'show'])->name('membership.family-expiry.show');
            Route::post('member/{member}/extend', [FamilyMembersArchiveConroller::class, 'extendExpiry'])->name('membership.family-expiry.extend');
            Route::post('bulk-expire', [FamilyMembersArchiveConroller::class, 'bulkExpire'])->name('membership.family-expiry.bulk-expire');
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
        Route::post('/migrate-invoices', [DataMigrationController::class, 'migrateInvoices'])->name('data-migration.migrate-invoices');
        Route::post('/migrate-media', [DataMigrationController::class, 'migrateMedia'])->name('data-migration.migrate-media');
        Route::post('/reset', [DataMigrationController::class, 'resetMigration'])->name('data-migration.reset');
        Route::post('/reset-families', [DataMigrationController::class, 'resetFamiliesOnly'])->name('data-migration.reset-families');
        Route::post('/delete-profile-photos', [DataMigrationController::class, 'deleteProfilePhotos'])->name('data-migration.delete-profile-photos');
        Route::post('/generate-qr-codes', [DataMigrationController::class, 'generateQrCodes'])->name('data-migration.generate-qr-codes');
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
    Route::group(['prefix' => 'admin/kitchen'], function () {
        Route::get('', [TenantController::class, 'index'])->name('locations.index')->middleware('super.admin:locations.view');
        Route::get('register', [TenantController::class, 'create'])->name('locations.create')->middleware('super.admin:locations.create');
        Route::post('store', [TenantController::class, 'store'])->name('locations.store')->middleware('super.admin:locations.create');
        Route::get('{tenant}/edit', [TenantController::class, 'edit'])->name('locations.edit')->middleware('super.admin:locations.edit');
        Route::put('{tenant}', [TenantController::class, 'update'])->name('locations.update')->middleware('super.admin:locations.edit');
    });

    // Admin POS Reports Routes
    Route::prefix('admin/reports')->middleware('super.admin:reports.view')->group(function () {
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

    // Voucher Management Routes
    Route::prefix('admin/vouchers')->middleware('super.admin:vouchers.view')->group(function () {
        Route::get('/', [VoucherController::class, 'dashboard'])->name('vouchers.dashboard');
        Route::get('/create', [VoucherController::class, 'create'])->name('vouchers.create');
        Route::post('/', [VoucherController::class, 'store'])->name('vouchers.store');
        Route::get('/{voucher}', [VoucherController::class, 'show'])->name('vouchers.show');
        Route::get('/{voucher}/edit', [VoucherController::class, 'edit'])->name('vouchers.edit');
        Route::put('/{voucher}', [VoucherController::class, 'update'])->name('vouchers.update');
        Route::delete('/{voucher}', [VoucherController::class, 'destroy'])->name('vouchers.destroy');
        Route::post('/{voucher}/mark-used', [VoucherController::class, 'markAsUsed'])->name('vouchers.mark-used');
        Route::post('/update-status', [VoucherController::class, 'updateStatus'])->name('vouchers.update-status');
    });

    Route::prefix('api')->group(function () {
        // Dashboard Stats API
        Route::get('dashboard/stats', [AdminController::class, 'getDashboardStats'])->name('api.dashboard.stats');

        Route::resource('departments', EmployeeDepartmentController::class)->except(['create', 'show', 'edit']);
        // Replace index with your own custom function
        Route::get('departments', [EmployeeDepartmentController::class, 'listAll'])->name('api.departments.listAll');

        // Subdepartment API routes
        Route::resource('subdepartments', EmployeeSubdepartmentController::class)->except(['create', 'show', 'edit']);
        Route::get('subdepartments', [EmployeeSubdepartmentController::class, 'listAll'])->name('api.subdepartments.listAll');

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

        // Leave Applications List API route (with search)
        Route::get('employees/leaves/applications', [LeaveApplicationController::class, 'getApplications'])->name('api.leave-applications.list');

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

        // Voucher API routes
        Route::prefix('vouchers')->group(function () {
            Route::get('/', [VoucherController::class, 'getVouchers'])->name('api.vouchers.index');
            Route::get('/{voucher}', [VoucherController::class, 'show'])->name('api.vouchers.show');
            Route::post('/{voucher}/mark-used', [VoucherController::class, 'markAsUsed'])->name('api.vouchers.mark-used');
        });
    });
});

// Central guest-only auth routes
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
