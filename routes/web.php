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
use App\Http\Controllers\CorporateCompanyController;
use App\Http\Controllers\CorporateMembershipController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DataMigrationController;
use App\Http\Controllers\EmployeeAssetAttachmentController;
use App\Http\Controllers\EmployeeAssetController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EmployeeDepartmentController;
use App\Http\Controllers\EmployeeReportController;
use App\Http\Controllers\EmployeeSubdepartmentController;
use App\Http\Controllers\EventBookingController;
use App\Http\Controllers\EventChargesTypeController;
use App\Http\Controllers\EventMenuAddOnsController;
use App\Http\Controllers\EventMenuCategoryController;
use App\Http\Controllers\EventMenuController;
use App\Http\Controllers\EventMenuTypeController;
use App\Http\Controllers\EventVenueController;
use App\Http\Controllers\FamilyMembersArchiveConroller;
use App\Http\Controllers\FinancialChargeTypeController;
use App\Http\Controllers\FinancialController;
use App\Http\Controllers\GuestTypeController;
use App\Http\Controllers\LeaveApplicationController;
use App\Http\Controllers\LeaveCategoryController;
use App\Http\Controllers\MaintenanceFeePostingController;
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
use App\Http\Controllers\SettingController;
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
    return \Illuminate\Support\Facades\Auth::check() ? redirect()->route('dashboard') : redirect()->route('login');
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
    Route::prefix('admin/employees')->middleware('permission:employees.view')->group(function () {
        Route::get('/dashboard', [EmployeeController::class, 'dashboard'])->name('employees.dashboard');
        Route::get('/create', [EmployeeController::class, 'create'])->name('employees.create')->middleware('permission:employees.create');
        Route::get('/edit/{employeeId}', [EmployeeController::class, 'edit'])->name('employees.edit')->middleware('permission:employees.edit');
        // Departments
        Route::get('/departments', [EmployeeDepartmentController::class, 'index'])->name('employees.departments')->middleware('permission:employees.departments.view');
        Route::get('/departments/trashed', [EmployeeDepartmentController::class, 'trashed'])->name('employees.departments.trashed')->middleware('permission:employees.departments.delete');
        Route::post('/departments/{id}/restore', [EmployeeDepartmentController::class, 'restore'])->name('employees.departments.restore')->middleware('permission:employees.departments.delete');
        Route::delete('/departments/{id}/force-delete', [EmployeeDepartmentController::class, 'forceDelete'])->name('employees.departments.force-delete')->middleware('permission:employees.departments.delete');
        Route::post('/departments/{id}/change-status', [EmployeeDepartmentController::class, 'changeStatus'])->name('employees.departments.change-status')->middleware('permission:employees.departments.edit');

        // Subdepartments (Using Department permissions)
        Route::get('/subdepartments', [EmployeeSubdepartmentController::class, 'index'])->name('employees.subdepartments')->middleware('permission:employees.departments.view');
        Route::get('/subdepartments/trashed', [EmployeeSubdepartmentController::class, 'trashed'])->name('employees.subdepartments.trashed')->middleware('permission:employees.departments.delete');
        Route::post('/subdepartments/{id}/restore', [EmployeeSubdepartmentController::class, 'restore'])->name('employees.subdepartments.restore')->middleware('permission:employees.departments.delete');
        Route::delete('/subdepartments/{id}/force-delete', [EmployeeSubdepartmentController::class, 'forceDelete'])->name('employees.subdepartments.force-delete')->middleware('permission:employees.departments.delete');
        Route::post('/subdepartments/{id}/change-status', [EmployeeSubdepartmentController::class, 'changeStatus'])->name('employees.subdepartments.change-status')->middleware('permission:employees.departments.edit');

        Route::get('/details/{employeeId}', [EmployeeController::class, 'details'])->name('employees.details')->middleware('permission:employees.view');
        Route::get('/trashed', [EmployeeController::class, 'trashed'])->name('employees.trashed')->middleware('permission:employees.delete');
        Route::post('/{id}/restore', [EmployeeController::class, 'restore'])->name('employees.restore')->middleware('permission:employees.delete');
        Route::delete('/{id}/force-delete', [EmployeeController::class, 'forceDelete'])->name('employees.force-delete')->middleware('permission:employees.delete');
        Route::delete('/{id}', [EmployeeController::class, 'destroy'])->name('employees.destroy')->middleware('permission:employees.delete');

        // Designations
        Route::get('designations/list', [App\Http\Controllers\DesignationController::class, 'list'])->name('designations.list');
        Route::get('designations/data', [App\Http\Controllers\DesignationController::class, 'fetchData'])->name('designations.data');
        Route::get('designations/trashed', [App\Http\Controllers\DesignationController::class, 'trashed'])->name('designations.trashed')->middleware('permission:employees.designations.delete');
        Route::post('designations/{id}/restore', [App\Http\Controllers\DesignationController::class, 'restore'])->name('designations.restore')->middleware('permission:employees.designations.delete');
        Route::delete('designations/{id}/force-delete', [App\Http\Controllers\DesignationController::class, 'forceDelete'])->name('designations.force-delete')->middleware('permission:employees.designations.delete');
        Route::resource('designations', App\Http\Controllers\DesignationController::class)->middleware([
            'index' => 'permission:employees.designations.view',
            'create' => 'permission:employees.designations.create',
            'store' => 'permission:employees.designations.create',
            'edit' => 'permission:employees.designations.edit',
            'update' => 'permission:employees.designations.edit',
            'destroy' => 'permission:employees.designations.delete',
        ]);

        // Assets
        Route::get('assets/list', [EmployeeAssetController::class, 'getAssets'])->name('employees.assets.list')->middleware('permission:employees.assets.view');
        Route::resource('assets', EmployeeAssetController::class)->middleware([
            'index' => 'permission:employees.assets.view',
            'create' => 'permission:employees.assets.create',
            'store' => 'permission:employees.assets.create',
            'edit' => 'permission:employees.assets.edit',
            'update' => 'permission:employees.assets.edit',
            'destroy' => 'permission:employees.assets.delete',
        ]);

        // Shifts
        Route::get('shifts/list', [App\Http\Controllers\ShiftController::class, 'list'])->name('shifts.list');
        Route::get('shifts/trashed', [App\Http\Controllers\ShiftController::class, 'trashed'])->name('shifts.trashed')->middleware('permission:employees.shifts.delete');
        Route::post('shifts/{id}/restore', [App\Http\Controllers\ShiftController::class, 'restore'])->name('shifts.restore')->middleware('permission:employees.shifts.delete');
        Route::delete('shifts/{id}/force-delete', [App\Http\Controllers\ShiftController::class, 'forceDelete'])->name('shifts.force-delete')->middleware('permission:employees.shifts.delete');
        Route::resource('shifts', App\Http\Controllers\ShiftController::class)->middleware([
            'index' => 'permission:employees.shifts.view',
            'create' => 'permission:employees.shifts.create',
            'store' => 'permission:employees.shifts.create',
            'edit' => 'permission:employees.shifts.edit',
            'update' => 'permission:employees.shifts.edit',
            'destroy' => 'permission:employees.shifts.delete',
        ]);

        // Employee Transfers
        Route::get('transfers', [App\Http\Controllers\EmployeeTransferController::class, 'index'])->name('employees.transfers.index')->middleware('permission:employees.transfers.view');
        Route::post('transfers', [App\Http\Controllers\EmployeeTransferController::class, 'store'])->name('employees.transfers.store')->middleware('permission:employees.transfers.create');

        // Branches
        Route::get('branches/list', [App\Http\Controllers\BranchController::class, 'list'])->name('branches.list');
        Route::get('branches/trashed', [App\Http\Controllers\BranchController::class, 'trashed'])->name('branches.trashed')->middleware('permission:employees.branches.delete');
        Route::post('branches/{id}/restore', [App\Http\Controllers\BranchController::class, 'restore'])->name('branches.restore')->middleware('permission:employees.branches.delete');
        Route::delete('branches/{id}/force-delete', [App\Http\Controllers\BranchController::class, 'forceDelete'])->name('branches.force-delete')->middleware('permission:employees.branches.delete');
        Route::resource('branches', App\Http\Controllers\BranchController::class)->middleware([
            'index' => 'permission:employees.branches.view',
            'create' => 'permission:employees.branches.create',
            'store' => 'permission:employees.branches.create',
            'edit' => 'permission:employees.branches.edit',
            'update' => 'permission:employees.branches.edit',
            'destroy' => 'permission:employees.branches.delete',
        ]);
        Route::post('assets/{asset}/assign', [EmployeeAssetController::class, 'assign'])->name('assets.assign');
        Route::post('assets/{asset}/return', [EmployeeAssetController::class, 'returnAsset'])->name('assets.return');
        Route::post('assets/{asset}/upload-attachment', [EmployeeAssetController::class, 'uploadAttachment'])->name('assets.upload-attachment');
        Route::delete('asset-attachments/{attachment}', [EmployeeAssetController::class, 'deleteAttachment'])->name('assets.delete-attachment');

        Route::prefix('leaves')->middleware('permission:employees.leaves.view')->group(function () {
            Route::get('category', [LeaveCategoryController::class, 'index'])->name('employees.leaves.category.index');
            Route::get('category/create', [LeaveCategoryController::class, 'create'])->name('employees.leaves.category.create')->middleware('permission:employees.leaves.approve');
            Route::get('category/edit/{id}', [LeaveCategoryController::class, 'edit'])->name('employees.leaves.category.edit')->middleware('permission:employees.leaves.approve');

            Route::get('application', [LeaveApplicationController::class, 'index'])->name('employees.leaves.application.index');
            Route::get('application/new', [LeaveApplicationController::class, 'create'])->name('employees.leaves.application.create')->middleware('permission:employees.leaves.approve');
            Route::get('application/edit/{id}', [LeaveApplicationController::class, 'edit'])->name('employees.leaves.application.edit')->middleware('permission:employees.leaves.approve');

            Route::get('report', [LeaveApplicationController::class, 'leaveReportPage'])->name('employees.leaves.application.report');
            Route::get('report/print', [LeaveApplicationController::class, 'leaveReportPrint'])->name('employees.leaves.application.report.print');
        });

        // Employee Advances
        Route::prefix('advances')->middleware('permission:employees.advances.view')->group(function () {
            Route::get('/', [\App\Http\Controllers\EmployeeAdvanceController::class, 'index'])->name('employees.advances.index');
            Route::get('/create', [\App\Http\Controllers\EmployeeAdvanceController::class, 'create'])->name('employees.advances.create')->middleware('permission:employees.advances.create');
            Route::post('/', [\App\Http\Controllers\EmployeeAdvanceController::class, 'store'])->name('employees.advances.store')->middleware('permission:employees.advances.create');
            Route::get('/edit/{id}', [\App\Http\Controllers\EmployeeAdvanceController::class, 'edit'])->name('employees.advances.edit')->middleware('permission:employees.advances.edit');
            Route::put('/{id}', [\App\Http\Controllers\EmployeeAdvanceController::class, 'update'])->name('employees.advances.update')->middleware('permission:employees.advances.edit');
            Route::delete('/{id}', [\App\Http\Controllers\EmployeeAdvanceController::class, 'destroy'])->name('employees.advances.destroy')->middleware('permission:employees.advances.delete');
            Route::post('/{id}/approve', [\App\Http\Controllers\EmployeeAdvanceController::class, 'approve'])->name('employees.advances.approve')->middleware('permission:employees.advances.edit');
            Route::post('/{id}/reject', [\App\Http\Controllers\EmployeeAdvanceController::class, 'reject'])->name('employees.advances.reject')->middleware('permission:employees.advances.edit');
            Route::post('/{id}/mark-paid', [\App\Http\Controllers\EmployeeAdvanceController::class, 'markPaid'])->name('employees.advances.mark-paid')->middleware('permission:employees.advances.edit');
            Route::get('/employee/{employeeId}', [\App\Http\Controllers\EmployeeAdvanceController::class, 'getEmployeeAdvances'])->name('employees.advances.employee');
            Route::get('/employee/{employeeId}/salary', [\App\Http\Controllers\EmployeeAdvanceController::class, 'getEmployeeSalary'])->name('employees.advances.salary');
        });

        // Employee Assets (Inventory)
        Route::prefix('assets')->middleware('permission:employees.assets.view')->group(function () {
            Route::get('/', [EmployeeAssetController::class, 'index'])->name('employees.assets.index');
            Route::get('/list', [EmployeeAssetController::class, 'getAssets'])->name('employees.assets.list');
            Route::get('/options', [EmployeeAssetController::class, 'getOptions'])->name('employees.assets.options');
            Route::get('/trashed', [EmployeeAssetController::class, 'trashed'])->name('employees.assets.trashed')->middleware('permission:employees.assets.delete');  // Moved up
            Route::post('/', [EmployeeAssetController::class, 'store'])->name('employees.assets.store')->middleware('permission:employees.assets.create');

            // Routes with {id} must come last or after specific routes
            Route::delete('/media/{id}', [EmployeeAssetController::class, 'deleteMedia'])->name('employees.assets.media.delete')->middleware('permission:employees.assets.delete');  // Specific delete
            Route::post('/{id}/restore', [EmployeeAssetController::class, 'restore'])->name('employees.assets.restore')->middleware('permission:employees.assets.delete');
            Route::delete('/{id}/force-delete', [EmployeeAssetController::class, 'forceDelete'])->name('employees.assets.force-delete')->middleware('permission:employees.assets.delete');

            Route::get('/{id}', [EmployeeAssetController::class, 'show'])->name('employees.assets.show');
            Route::put('/{id}', [EmployeeAssetController::class, 'update'])->name('employees.assets.update')->middleware('permission:employees.assets.edit');
            Route::delete('/{id}', [EmployeeAssetController::class, 'destroy'])->name('employees.assets.destroy')->middleware('permission:employees.assets.delete');
        });

        // Employee Asset Attachments (Assignments)
        Route::prefix('asset-attachments')->middleware('permission:employees.assets.view')->group(function () {
            Route::get('/', [EmployeeAssetAttachmentController::class, 'index'])->name('employees.asset-attachments.index');
            Route::get('/list', [EmployeeAssetAttachmentController::class, 'getAttachments'])->name('employees.asset-attachments.list');
            Route::get('/form-data', [EmployeeAssetAttachmentController::class, 'getFormData'])->name('employees.asset-attachments.form-data');
            Route::get('/trashed', [EmployeeAssetAttachmentController::class, 'trashed'])->name('employees.asset-attachments.trashed')->middleware('permission:employees.assets.delete');  // Moved up
            Route::post('/', [EmployeeAssetAttachmentController::class, 'store'])->name('employees.asset-attachments.store')->middleware('permission:employees.assets.create');

            // Routes with {id} need care
            Route::delete('/media/{id}', [EmployeeAssetAttachmentController::class, 'deleteMedia'])->name('employees.asset-attachments.media.delete')->middleware('permission:employees.assets.edit');
            Route::post('/{id}/restore', [EmployeeAssetAttachmentController::class, 'restore'])->name('employees.asset-attachments.restore')->middleware('permission:employees.assets.delete');
            Route::delete('/{id}/force-delete', [EmployeeAssetAttachmentController::class, 'forceDelete'])->name('employees.asset-attachments.force-delete')->middleware('permission:employees.assets.delete');

            Route::put('/{id}', [EmployeeAssetAttachmentController::class, 'update'])->name('employees.asset-attachments.update')->middleware('permission:employees.assets.edit');
            Route::delete('/{id}', [EmployeeAssetAttachmentController::class, 'destroy'])->name('employees.asset-attachments.destroy')->middleware('permission:employees.assets.delete');
        });

        // Employee Loans
        Route::prefix('loans')->middleware('permission:employees.loans.view')->group(function () {
            Route::get('/', [\App\Http\Controllers\EmployeeLoanController::class, 'index'])->name('employees.loans.index');
            Route::get('/create', [\App\Http\Controllers\EmployeeLoanController::class, 'create'])->name('employees.loans.create')->middleware('permission:employees.loans.create');
            Route::post('/', [\App\Http\Controllers\EmployeeLoanController::class, 'store'])->name('employees.loans.store')->middleware('permission:employees.loans.create');
            Route::get('/edit/{id}', [\App\Http\Controllers\EmployeeLoanController::class, 'edit'])->name('employees.loans.edit')->middleware('permission:employees.loans.edit');
            Route::put('/{id}', [\App\Http\Controllers\EmployeeLoanController::class, 'update'])->name('employees.loans.update')->middleware('permission:employees.loans.edit');
            Route::delete('/{id}', [\App\Http\Controllers\EmployeeLoanController::class, 'destroy'])->name('employees.loans.destroy')->middleware('permission:employees.loans.delete');
            Route::post('/{id}/approve', [\App\Http\Controllers\EmployeeLoanController::class, 'approve'])->name('employees.loans.approve')->middleware('permission:employees.loans.edit');
            Route::post('/{id}/reject', [\App\Http\Controllers\EmployeeLoanController::class, 'reject'])->name('employees.loans.reject')->middleware('permission:employees.loans.edit');
            Route::post('/{id}/disburse', [\App\Http\Controllers\EmployeeLoanController::class, 'disburse'])->name('employees.loans.disburse')->middleware('permission:employees.loans.edit');
            Route::get('/employee/{employeeId}', [\App\Http\Controllers\EmployeeLoanController::class, 'getEmployeeLoans'])->name('employees.loans.employee');
            Route::get('/employee/{employeeId}/salary', [\App\Http\Controllers\EmployeeLoanController::class, 'getEmployeeSalary'])->name('employees.loans.salary');
        });

        Route::prefix('attendances')->middleware('permission:employees.attendance.view')->group(function () {
            // Actions
            Route::post('apply-standard', [AttendanceController::class, 'applyStandardAttendance'])->name('employees.attendances.apply-standard')->middleware('permission:employees.attendance.create');

            // Inertia.js Pages
            Route::get('dashboard', [AttendanceController::class, 'dashboard'])->name('employees.attendances.dashboard');
            Route::get('management', [AttendanceController::class, 'managementPage'])->name('employees.attendances.management');
            Route::get('report', [AttendanceController::class, 'reportPage'])->name('employees.attendances.report');
            Route::get('report/print', [AttendanceController::class, 'attendanceReportPrint'])->name('employees.attendances.report.print');
            Route::get('monthly/report', [AttendanceController::class, 'monthlyReportPage'])->name('employees.attendances.monthly.report');
            Route::get('monthly/report/print', [AttendanceController::class, 'monthlyReportPrint'])->name('employees.attendances.monthly.report.print');
        });

        Route::prefix('payroll')->middleware('permission:employees.payroll.view')->group(function () {
            // Payroll Dashboard
            Route::get('dashboard', [PayrollController::class, 'dashboard'])->name('employees.payroll.dashboard');

            // Payroll Settings
            Route::get('settings', [PayrollController::class, 'settings'])->name('employees.payroll.settings');

            // Employee Salary Management
            Route::get('salaries', [PayrollController::class, 'employeeSalaries'])->name('employees.payroll.salaries');
            Route::get('salaries/create/{employeeId}', [PayrollController::class, 'createSalaryStructure'])->name('employees.payroll.salaries.create')->middleware('permission:employees.payroll.process');
            Route::get('salaries/edit/{employeeId}', [PayrollController::class, 'editSalaryStructure'])->name('employees.payroll.salaries.edit')->middleware('permission:employees.payroll.process');
            Route::get('salaries/view/{employeeId}', [PayrollController::class, 'viewSalaryStructure'])->name('employees.payroll.salaries.view');

            // Allowance & Deduction Types Management
            Route::get('allowance-types', [PayrollController::class, 'allowanceTypes'])->name('employees.payroll.allowance-types');
            Route::get('deduction-types', [PayrollController::class, 'deductionTypes'])->name('employees.payroll.deduction-types');

            // Payroll Processing
            Route::get('process', [PayrollController::class, 'processPayroll'])->name('employees.payroll.process')->middleware('permission:employees.payroll.process');
            // Payroll Preview (full page)
            Route::get('preview', [PayrollController::class, 'previewPayrollPage'])->name('employees.payroll.preview');
            Route::get('periods', [PayrollController::class, 'payrollPeriods'])->name('employees.payroll.periods');
            Route::get('periods/create', [PayrollController::class, 'createPeriod'])->name('employees.payroll.periods.create')->middleware('permission:employees.payroll.process');
            Route::get('periods/{periodId}/edit', [PayrollController::class, 'editPeriod'])->name('employees.payroll.periods.edit')->middleware('permission:employees.payroll.process');
            Route::get('periods/{periodId}/payslips', [PayrollController::class, 'periodPayslips'])->name('employees.payroll.periods.payslips');

            // Payslips Management
            Route::get('payslips', [PayrollController::class, 'payslips'])->name('employees.payroll.payslips');
            Route::get('payslips/{periodId}', [PayrollController::class, 'periodPayslips'])->name('employees.payroll.payslips.period');
            Route::get('payslip/{payslipId}', [PayrollController::class, 'viewPayslip'])->name('employees.payroll.payslip.view');
            Route::get('payslips/{payslipId}/print', [PayrollController::class, 'printPayslip'])->name('employees.payroll.payslips.print');

            // Salary Sheet (Editor)
            Route::get('salary-sheet', [PayrollController::class, 'salarySheet'])->name('employees.payroll.salary-sheet');

            // Reports
            Route::get('reports', [PayrollController::class, 'reports'])->name('employees.payroll.reports');
            Route::get('reports/summary/{periodId?}', [PayrollController::class, 'summaryReport'])->name('employees.payroll.reports.summary');
            Route::get('reports/summary/{periodId}/print', [PayrollController::class, 'summaryReportPrint'])->name('employees.payroll.reports.summary.print');
            Route::get('reports/detailed/{periodId?}', [PayrollController::class, 'detailedReport'])->name('employees.payroll.reports.detailed');
            Route::get('reports/detailed/{periodId}/print', [PayrollController::class, 'detailedReportPrint'])->name('employees.payroll.reports.detailed.print');

            // Payroll History
            Route::get('history', [PayrollController::class, 'history'])->name('employee.payroll.history');
        });

        // Employee Reports
        Route::prefix('reports')->group(function () {
            // Page Views (Super Admin)
            Route::group(['middleware' => 'super.admin:employees.reports.view'], function () {
                Route::get('/', [EmployeeReportController::class, 'index'])->name('employees.reports');

                // Employee Details Report
                Route::get('employee-details', [EmployeeReportController::class, 'employeeDetails'])->name('employees.reports.employee-details');
                Route::get('employee-details/print', [EmployeeReportController::class, 'employeeDetailsPrint'])->name('employees.reports.employee-details.print');

                // New Hiring Report
                Route::get('new-hiring', [EmployeeReportController::class, 'newHiring'])->name('employees.reports.new-hiring');
                Route::get('new-hiring/print', [EmployeeReportController::class, 'newHiringPrint'])->name('employees.reports.new-hiring.print');

                // Salary Sheet
                Route::get('salary-sheet', [EmployeeReportController::class, 'salarySheet'])->name('employees.reports.salary-sheet');
                Route::get('salary-sheet/print', [EmployeeReportController::class, 'salarySheetPrint'])->name('employees.reports.salary-sheet.print');

                // Deductions Report
                Route::get('deductions', [EmployeeReportController::class, 'deductions'])->name('employees.reports.deductions');
                Route::get('deductions/print', [EmployeeReportController::class, 'deductionsPrint'])->name('employees.reports.deductions.print');

                // Loans Report
                Route::get('loans', [EmployeeReportController::class, 'loans'])->name('employees.reports.loans');
                Route::get('loans/print', [EmployeeReportController::class, 'loansPrint'])->name('employees.reports.loans.print');

                // Advances Report
                Route::get('advances', [EmployeeReportController::class, 'advances'])->name('employees.reports.advances');
                Route::get('advances/print', [EmployeeReportController::class, 'advancesPrint'])->name('employees.reports.advances.print');

                // Increments Report
                Route::get('increments', [EmployeeReportController::class, 'increments'])->name('employees.reports.increments');
                Route::get('increments/print', [EmployeeReportController::class, 'incrementsPrint'])->name('employees.reports.increments.print');

                // Bank Transfer Report
                Route::get('bank-transfer', [EmployeeReportController::class, 'bankTransfer'])->name('employees.reports.bank-transfer');
                Route::get('bank-transfer/print', [EmployeeReportController::class, 'bankTransferPrint'])->name('employees.reports.bank-transfer.print');
            });

            // API Routes (Data & Export) - Permission Middleware
            Route::prefix('api')->middleware('permission:employees.reports.view')->group(function () {
                // Data APIs
                Route::get('employee-details', [\App\Http\Controllers\EmployeeReportApiController::class, 'employeeDetails'])->name('employees.reports.api.employee-details');
                Route::get('new-hiring', [\App\Http\Controllers\EmployeeReportApiController::class, 'newHiring'])->name('employees.reports.api.new-hiring');
                Route::get('salary-sheet', [\App\Http\Controllers\EmployeeReportApiController::class, 'salarySheet'])->name('employees.reports.api.salary-sheet');
                Route::get('deductions', [\App\Http\Controllers\EmployeeReportApiController::class, 'deductions'])->name('employees.reports.api.deductions');
                Route::get('advances', [\App\Http\Controllers\EmployeeReportApiController::class, 'advances'])->name('employees.reports.api.advances');
                Route::get('loans', [\App\Http\Controllers\EmployeeReportApiController::class, 'loans'])->name('employees.reports.api.loans');
                Route::get('increments', [\App\Http\Controllers\EmployeeReportApiController::class, 'increments'])->name('employees.reports.api.increments');
                Route::get('bank-transfer', [\App\Http\Controllers\EmployeeReportApiController::class, 'bankTransfer'])->name('employees.reports.api.bank-transfer');

                // Export APIs (Excel/CSV)
                Route::get('employee-details/export', [\App\Http\Controllers\EmployeeReportApiController::class, 'exportEmployeeDetailsExcel'])->name('employees.reports.api.employee-details.export');
                Route::get('new-hiring/export', [\App\Http\Controllers\EmployeeReportApiController::class, 'exportNewHiringExcel'])->name('employees.reports.api.new-hiring.export');
                Route::get('salary-sheet/export', [\App\Http\Controllers\EmployeeReportApiController::class, 'exportSalarySheetExcel'])->name('employees.reports.api.salary-sheet.export');
                Route::get('deductions/export', [\App\Http\Controllers\EmployeeReportApiController::class, 'exportDeductionsExcel'])->name('employees.reports.api.deductions.export');
                Route::get('increments/export', [\App\Http\Controllers\EmployeeReportApiController::class, 'exportIncrementsExcel'])->name('employees.reports.api.increments.export');
                Route::get('bank-transfer/export', [\App\Http\Controllers\EmployeeReportApiController::class, 'exportBankTransferExcel'])->name('employees.reports.api.bank-transfer.export');
                Route::get('advances/export', [\App\Http\Controllers\EmployeeReportApiController::class, 'exportAdvancesExcel'])->name('employees.reports.api.advances.export');
                Route::get('loans/export', [\App\Http\Controllers\EmployeeReportApiController::class, 'exportLoansExcel'])->name('employees.reports.api.loans.export');
            });
        });
    });

    // Admin Room Booking Routes
    Route::group(['prefix' => 'booking-management'], function () {
        Route::resource('guest-types', GuestTypeController::class)->except(['show'])->middleware([
            'index' => 'permission:guest-types.view',
            'create' => 'permission:guest-types.create',
            'store' => 'permission:guest-types.create',
            'edit' => 'permission:guest-types.edit',
            'update' => 'permission:guest-types.edit',
            'destroy' => 'permission:guest-types.delete',
        ]);
        Route::get('/api/guest-types/active', [GuestTypeController::class, 'getActiveList'])->name('api.guest-types.active')->middleware('permission:guest-types.view');

        Route::get('guests/trashed', [CustomerController::class, 'trashed'])->name('guests.trashed')->middleware('permission:guests.restore');
        Route::post('guests/restore/{id}', [CustomerController::class, 'restore'])->name('guests.restore')->middleware('permission:guests.restore');
        Route::resource('guests', CustomerController::class)->except(['show'])->middleware([
            'index' => 'permission:guests.view',
            'create' => 'permission:guests.create',
            'store' => 'permission:guests.create',
            'edit' => 'permission:guests.edit',
            'update' => 'permission:guests.edit',
            'destroy' => 'permission:guests.delete',
        ]);

        Route::group(['prefix' => 'rooms'], function () {
            Route::get('/', [RoomController::class, 'allRooms'])->name('rooms.all')->middleware('super.admin:rooms.view');

            Route::group(['prefix' => 'booking'], function () {
                Route::get('/create', [RoomBookingController::class, 'booking'])->name('rooms.create.booking')->middleware('super.admin:rooms.bookings.create');
                Route::get('/edit/{id}', [RoomBookingController::class, 'editbooking'])->name('rooms.edit.booking')->middleware('super.admin:rooms.bookings.edit');
                Route::post('/update/{id}', [RoomBookingController::class, 'update'])->name('rooms.update.booking')->middleware('permission:rooms.bookings.edit');
                Route::post('/create', [RoomBookingController::class, 'store'])->name('rooms.store.booking')->middleware('permission:rooms.bookings.create');

                Route::get('dashboard', [RoomBookingController::class, 'dashboard'])->name('rooms.dashboard')->middleware('super.admin:rooms.bookings.view');
                Route::get('manage', [RoomBookingController::class, 'index'])->name('rooms.manage')->middleware('super.admin:rooms.bookings.view');
                Route::get('check-in', [RoomBookingController::class, 'checkInIndex'])->name('rooms.checkin')->middleware('super.admin:rooms.bookings.checkin');
                Route::get('check-out', [RoomBookingController::class, 'checkOutIndex'])->name('rooms.checkout')->middleware('super.admin:rooms.bookings.checkout');
                // Cancelled Bookings
                Route::get('cancelled', [RoomBookingController::class, 'cancelled'])->name('rooms.booking.cancelled')->middleware('super.admin:rooms.bookings.cancelled');
                Route::put('refund/{id}', [RoomBookingController::class, 'processRefund'])->name('rooms.booking.refund')->middleware('permission:rooms.bookings.edit');
                Route::put('cancel/{id}', [RoomBookingController::class, 'cancelBooking'])->name('rooms.booking.cancel')->middleware('permission:rooms.bookings.edit');
                Route::put('undo-cancel/{id}', [RoomBookingController::class, 'undoBooking'])->name('rooms.booking.undo-cancel')->middleware('permission:rooms.bookings.edit');
                Route::get('invoice/{id}', [RoomBookingController::class, 'bookingInvoice'])->name('rooms.invoice')->middleware('permission:rooms.bookings.view');
                Route::put('update-status/{id}', [RoomBookingController::class, 'updateStatus'])->name('rooms.update.status')->middleware('permission:rooms.bookings.edit');

                // Room Calendar
                Route::get('calendar', [RoomBookingController::class, 'calendar'])->name('rooms.booking.calendar')->middleware('super.admin:rooms.bookings.calendar');

                Route::group(['prefix' => 'requests', 'middleware' => 'super.admin:rooms.bookings.requests'], function () {
                    Route::get('', [RoomBookingRequestController::class, 'index'])->name('rooms.request');
                    Route::get('create', [RoomBookingRequestController::class, 'create'])->name('rooms.request.create');
                    Route::post('store', [RoomBookingRequestController::class, 'store'])->name('rooms.request.store')->middleware('permission:rooms.bookings.requests');  // Action overrides group? No, middleware accumulates.
                    Route::put('update/status/{id}', [RoomBookingRequestController::class, 'updateStatus'])->name('rooms.request.update.status')->middleware('permission:rooms.bookings.requests');
                    Route::get('{id}/edit', [RoomBookingRequestController::class, 'edit'])->name('rooms.request.edit');
                    Route::put('{id}', [RoomBookingRequestController::class, 'edit'])->name('rooms.request.update')->middleware('permission:rooms.bookings.requests');
                });
            });

            // Rooms Trashed Module
            Route::get('trashed', [RoomController::class, 'trashed'])->name('rooms.trashed')->middleware('super.admin:rooms.delete');
            Route::post('restore/{id}', [RoomController::class, 'restore'])->name('rooms.restore')->middleware('permission:rooms.delete');
            Route::delete('force-delete/{id}', [RoomController::class, 'forceDelete'])->name('rooms.force-delete')->middleware('permission:rooms.delete');

            Route::get('add', [RoomController::class, 'create'])->name('rooms.add')->middleware('super.admin:rooms.create');
            Route::post('store', [RoomController::class, 'store'])->name('rooms.store')->middleware('permission:rooms.create');
            Route::get('edit/{id}', [RoomController::class, 'edit'])->name('rooms.edit')->middleware('super.admin:rooms.edit');
            Route::post('{id}', [RoomController::class, 'update'])->name('rooms.update')->middleware('permission:rooms.edit');
            Route::delete('{id}', [RoomController::class, 'destroy'])->name('rooms.destroy')->middleware('permission:rooms.delete');

            // get room booking data
            Route::get('api/bookings/{id}', [RoomBookingController::class, 'showRoomBooking'])->name('api.room.booking.show')->middleware('permission:rooms.bookings.view');
            Route::get('api/bookings/{id}/orders', [RoomBookingController::class, 'getOrders'])->name('api.room.booking.orders')->middleware('permission:rooms.bookings.view');
            Route::post('api/bookings/check-in', [RoomBookingController::class, 'checkIn'])->name('api.room.booking.checkin')->middleware('permission:rooms.bookings.checkin');
            // Route::get('/types', [RoomController::class, 'mamageTypes'])->name('rooms.types');

            // Room Reports
            Route::prefix('reports')->middleware('super.admin:rooms.reports.view')->group(function () {
                Route::get('/', [\App\Http\Controllers\RoomReportController::class, 'index'])->name('rooms.reports');

                // Day-wise
                Route::get('day-wise', [\App\Http\Controllers\RoomReportController::class, 'dayWise'])->name('rooms.reports.day-wise')->middleware('super.admin:rooms.reports.day-wise');
                Route::get('day-wise/print', [\App\Http\Controllers\RoomReportController::class, 'dayWisePrint'])->name('rooms.reports.day-wise.print')->middleware('super.admin:rooms.reports.day-wise');
                Route::get('day-wise/export', [\App\Http\Controllers\RoomReportController::class, 'dayWiseExport'])->name('rooms.reports.day-wise.export')->middleware('permission:rooms.reports.day-wise');

                // Room-wise Payment History
                Route::get('payment-history', [\App\Http\Controllers\RoomReportController::class, 'paymentHistory'])->name('rooms.reports.payment-history')->middleware('super.admin:rooms.reports.payment-history');
                Route::get('payment-history/print', [\App\Http\Controllers\RoomReportController::class, 'paymentHistoryPrint'])->name('rooms.reports.payment-history.print')->middleware('super.admin:rooms.reports.payment-history');
                Route::get('payment-history/export', [\App\Http\Controllers\RoomReportController::class, 'paymentHistoryExport'])->name('rooms.reports.payment-history.export')->middleware('permission:rooms.reports.payment-history');

                // Booking
                Route::get('booking', [\App\Http\Controllers\RoomReportController::class, 'booking'])->name('rooms.reports.booking')->middleware('super.admin:rooms.reports.booking');
                Route::get('booking/print', [\App\Http\Controllers\RoomReportController::class, 'bookingPrint'])->name('rooms.reports.booking.print')->middleware('super.admin:rooms.reports.booking');
                Route::get('booking/export', [\App\Http\Controllers\RoomReportController::class, 'bookingExport'])->name('rooms.reports.booking.export')->middleware('permission:rooms.reports.booking');

                // Cancelled
                Route::get('cancelled', [\App\Http\Controllers\RoomReportController::class, 'cancelled'])->name('rooms.reports.cancelled')->middleware('super.admin:rooms.reports.cancelled');
                Route::get('cancelled/print', [\App\Http\Controllers\RoomReportController::class, 'cancelledPrint'])->name('rooms.reports.cancelled.print')->middleware('super.admin:rooms.reports.cancelled');
                Route::get('cancelled/export', [\App\Http\Controllers\RoomReportController::class, 'cancelledExport'])->name('rooms.reports.cancelled.export')->middleware('permission:rooms.reports.cancelled');

                // Check-in
                Route::get('check-in', [\App\Http\Controllers\RoomReportController::class, 'checkIn'])->name('rooms.reports.check-in')->middleware('super.admin:rooms.reports.check-in');
                Route::get('check-in/print', [\App\Http\Controllers\RoomReportController::class, 'checkInPrint'])->name('rooms.reports.check-in.print')->middleware('super.admin:rooms.reports.check-in');
                Route::get('check-in/export', [\App\Http\Controllers\RoomReportController::class, 'checkInExport'])->name('rooms.reports.check-in.export')->middleware('permission:rooms.reports.check-in');

                // Check-out
                Route::get('check-out', [\App\Http\Controllers\RoomReportController::class, 'checkOut'])->name('rooms.reports.check-out')->middleware('super.admin:rooms.reports.check-out');
                Route::get('check-out/print', [\App\Http\Controllers\RoomReportController::class, 'checkOutPrint'])->name('rooms.reports.check-out.print')->middleware('super.admin:rooms.reports.check-out');
                Route::get('check-out/export', [\App\Http\Controllers\RoomReportController::class, 'checkOutExport'])->name('rooms.reports.check-out.export')->middleware('permission:rooms.reports.check-out');

                // Member Wise
                Route::get('member-wise', [\App\Http\Controllers\RoomReportController::class, 'memberWise'])->name('rooms.reports.member-wise')->middleware('super.admin:rooms.reports.member-wise');
                Route::get('member-wise/print', [\App\Http\Controllers\RoomReportController::class, 'memberWisePrint'])->name('rooms.reports.member-wise.print')->middleware('super.admin:rooms.reports.member-wise');
                Route::get('member-wise/export', [\App\Http\Controllers\RoomReportController::class, 'memberWiseExport'])->name('rooms.reports.member-wise.export')->middleware('permission:rooms.reports.member-wise');

                // Mini Bar
                Route::get('mini-bar', [\App\Http\Controllers\RoomReportController::class, 'miniBar'])->name('rooms.reports.mini-bar')->middleware('super.admin:rooms.reports.mini-bar');
                Route::get('mini-bar/print', [\App\Http\Controllers\RoomReportController::class, 'miniBarPrint'])->name('rooms.reports.mini-bar.print')->middleware('super.admin:rooms.reports.mini-bar');
                Route::get('mini-bar/export', [\App\Http\Controllers\RoomReportController::class, 'miniBarExport'])->name('rooms.reports.mini-bar.export')->middleware('permission:rooms.reports.mini-bar');

                // Complementary
                Route::get('complementary', [\App\Http\Controllers\RoomReportController::class, 'complementary'])->name('rooms.reports.complementary')->middleware('super.admin:rooms.reports.complementary');
                Route::get('complementary/print', [\App\Http\Controllers\RoomReportController::class, 'complementaryPrint'])->name('rooms.reports.complementary.print')->middleware('super.admin:rooms.reports.complementary');
                Route::get('complementary/export', [\App\Http\Controllers\RoomReportController::class, 'complementaryExport'])->name('rooms.reports.complementary.export')->middleware('permission:rooms.reports.complementary');
            });
        });

        // Room Types Trashed Module
        Route::get('room-types/trashed', [RoomTypeController::class, 'trashed'])->name('room-types.trashed');
        Route::post('room-types/restore/{id}', [RoomTypeController::class, 'restore'])->name('room-types.restore');
        Route::delete('room-types/force-delete/{id}', [RoomTypeController::class, 'forceDelete'])->name('room-types.force-delete');
        Route::resource('room-types', RoomTypeController::class)->except(['create', 'edit', 'show']);

        // Room Categories Trashed Module
        Route::get('room-categories/trashed', [RoomCategoryController::class, 'trashed'])->name('room-categories.trashed');
        Route::post('room-categories/restore/{id}', [RoomCategoryController::class, 'restore'])->name('room-categories.restore');
        Route::delete('room-categories/force-delete/{id}', [RoomCategoryController::class, 'forceDelete'])->name('room-categories.force-delete');
        Route::resource('room-categories', RoomCategoryController::class)->except(['create', 'edit', 'show']);

        // Room Charges Types Trashed Module
        Route::get('room-charges-type/trashed', [RoomChargesTypeController::class, 'trashed'])->name('room-charges-type.trashed');
        Route::post('room-charges-type/restore/{id}', [RoomChargesTypeController::class, 'restore'])->name('room-charges-type.restore');
        Route::delete('room-charges-type/force-delete/{id}', [RoomChargesTypeController::class, 'forceDelete'])->name('room-charges-type.force-delete');
        Route::resource('room-charges-type', RoomChargesTypeController::class)->except(['create', 'edit', 'show']);

        // Room MiniBar Trashed Module
        Route::get('room-minibar/trashed', [RoomMiniBarController::class, 'trashed'])->name('room-minibar.trashed');
        Route::post('room-minibar/restore/{id}', [RoomMiniBarController::class, 'restore'])->name('room-minibar.restore');
        Route::delete('room-minibar/force-delete/{id}', [RoomMiniBarController::class, 'forceDelete'])->name('room-minibar.force-delete');
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

            // Cancellation & Refund Routes
            Route::put('booking/refund/{id}', [EventBookingController::class, 'processRefund'])->name('events.booking.refund')->middleware('permission:events.bookings.edit');
            Route::put('booking/cancel/{id}', [EventBookingController::class, 'cancelBooking'])->name('events.booking.cancel')->middleware('permission:events.bookings.edit');
            Route::put('booking/undo-cancel/{id}', [EventBookingController::class, 'undoBooking'])->name('events.booking.undo-cancel')->middleware('permission:events.bookings.edit');

            Route::get('booking/{id}/edit', [EventBookingController::class, 'edit'])->name('events.booking.edit')->middleware('super.admin:events.bookings.edit');
            Route::post('booking/{id}', [EventBookingController::class, 'update'])->name('events.booking.update')->middleware('permission:events.bookings.edit');

            // Event Reports
            Route::prefix('reports')->middleware('super.admin:events.reports.view')->group(function () {
                Route::get('/', [\App\Http\Controllers\EventReportController::class, 'index'])->name('events.reports');

                // Day-wise
                Route::get('day-wise', [\App\Http\Controllers\EventReportController::class, 'dayWise'])->name('events.reports.day-wise')->middleware('super.admin:events.reports.day-wise');
                Route::get('day-wise/print', [\App\Http\Controllers\EventReportController::class, 'dayWisePrint'])->name('events.reports.day-wise.print')->middleware('super.admin:events.reports.day-wise');
                Route::get('day-wise/export', [\App\Http\Controllers\EventReportController::class, 'dayWiseExport'])->name('events.reports.day-wise.export')->middleware('permission:events.reports.day-wise');

                // Payment History
                Route::get('payment-history', [\App\Http\Controllers\EventReportController::class, 'paymentHistory'])->name('events.reports.payment-history')->middleware('super.admin:events.reports.payment-history');
                Route::get('payment-history/print', [\App\Http\Controllers\EventReportController::class, 'paymentHistoryPrint'])->name('events.reports.payment-history.print')->middleware('super.admin:events.reports.payment-history');
                Route::get('payment-history/export', [\App\Http\Controllers\EventReportController::class, 'paymentHistoryExport'])->name('events.reports.payment-history.export')->middleware('permission:events.reports.payment-history');

                // Booking
                Route::get('booking', [\App\Http\Controllers\EventReportController::class, 'booking'])->name('events.reports.booking')->middleware('super.admin:events.reports.booking');
                Route::get('booking/print', [\App\Http\Controllers\EventReportController::class, 'bookingPrint'])->name('events.reports.booking.print')->middleware('super.admin:events.reports.booking');
                Route::get('booking/export', [\App\Http\Controllers\EventReportController::class, 'bookingExport'])->name('events.reports.booking.export')->middleware('permission:events.reports.booking');

                // Cancelled
                Route::get('cancelled', [\App\Http\Controllers\EventReportController::class, 'cancelled'])->name('events.reports.cancelled')->middleware('super.admin:events.reports.cancelled');
                Route::get('cancelled/print', [\App\Http\Controllers\EventReportController::class, 'cancelledPrint'])->name('events.reports.cancelled.print')->middleware('super.admin:events.reports.cancelled');
                Route::get('cancelled/export', [\App\Http\Controllers\EventReportController::class, 'cancelledExport'])->name('events.reports.cancelled.export')->middleware('permission:events.reports.cancelled');

                // Completed
                Route::get('completed', [\App\Http\Controllers\EventReportController::class, 'completed'])->name('events.reports.completed')->middleware('super.admin:events.reports.completed');
                Route::get('completed/print', [\App\Http\Controllers\EventReportController::class, 'completedPrint'])->name('events.reports.completed.print')->middleware('super.admin:events.reports.completed');
                Route::get('completed/export', [\App\Http\Controllers\EventReportController::class, 'completedExport'])->name('events.reports.completed.export')->middleware('permission:events.reports.completed');

                // Venue-wise
                Route::get('venue-wise', [\App\Http\Controllers\EventReportController::class, 'venueWise'])->name('events.reports.venue-wise')->middleware('super.admin:events.reports.venue-wise');
                Route::get('venue-wise/print', [\App\Http\Controllers\EventReportController::class, 'venueWisePrint'])->name('events.reports.venue-wise.print')->middleware('super.admin:events.reports.venue-wise');
                Route::get('venue-wise/export', [\App\Http\Controllers\EventReportController::class, 'venueWiseExport'])->name('events.reports.venue-wise.export')->middleware('permission:events.reports.venue-wise');

                // Menu-wise
                Route::get('menu-wise', [\App\Http\Controllers\EventReportController::class, 'menuWise'])->name('events.reports.menu-wise')->middleware('super.admin:events.reports.menu-wise');
                Route::get('menu-wise/print', [\App\Http\Controllers\EventReportController::class, 'menuWisePrint'])->name('events.reports.menu-wise.print')->middleware('super.admin:events.reports.menu-wise');
                Route::get('menu-wise/export', [\App\Http\Controllers\EventReportController::class, 'menuWiseExport'])->name('events.reports.menu-wise.export')->middleware('permission:events.reports.menu-wise');

                // Addons
                Route::get('addons', [\App\Http\Controllers\EventReportController::class, 'addOns'])->name('events.reports.addons')->middleware('super.admin:events.reports.addons');
                Route::get('addons/print', [\App\Http\Controllers\EventReportController::class, 'addOnsPrint'])->name('events.reports.addons.print')->middleware('super.admin:events.reports.addons');
                Route::get('addons/export', [\App\Http\Controllers\EventReportController::class, 'addOnsExport'])->name('events.reports.addons.export')->middleware('permission:events.reports.addons');

                // Complementary
                Route::get('complementary', [\App\Http\Controllers\EventReportController::class, 'complementary'])->name('events.reports.complementary')->middleware('super.admin:events.reports.complementary');
                Route::get('complementary/print', [\App\Http\Controllers\EventReportController::class, 'complementaryPrint'])->name('events.reports.complementary.print')->middleware('super.admin:events.reports.complementary');
                Route::get('complementary/export', [\App\Http\Controllers\EventReportController::class, 'complementaryExport'])->name('events.reports.complementary.export')->middleware('permission:events.reports.complementary');
            });
        });
        Route::get('event-venues/trashed', [EventVenueController::class, 'trashed'])->name('event-venues.trashed');
        Route::post('event-venues/restore/{id}', [EventVenueController::class, 'restore'])->name('event-venues.restore');
        Route::delete('event-venues/force-delete/{id}', [EventVenueController::class, 'forceDelete'])->name('event-venues.force-delete');
        Route::resource('event-venues', EventVenueController::class)->except(['create', 'edit', 'show']);
        Route::get('event-menu/trashed', [EventMenuController::class, 'trashed'])->name('event-menu.trashed');
        Route::post('event-menu/restore/{id}', [EventMenuController::class, 'restore'])->name('event-menu.restore');
        Route::delete('event-menu/force-delete/{id}', [EventMenuController::class, 'forceDelete'])->name('event-menu.force-delete');
        Route::resource('event-menu', EventMenuController::class)->except(['show']);
        Route::get('event-menu-category/trashed', [EventMenuCategoryController::class, 'trashed'])->name('event-menu-category.trashed');
        Route::post('event-menu-category/restore/{id}', [EventMenuCategoryController::class, 'restore'])->name('event-menu-category.restore');
        Route::delete('event-menu-category/force-delete/{id}', [EventMenuCategoryController::class, 'forceDelete'])->name('event-menu-category.force-delete');
        Route::resource('event-menu-category', EventMenuCategoryController::class)->except(['create', 'edit', 'show']);
        Route::get('event-menu-type/trashed', [EventMenuTypeController::class, 'trashed'])->name('event-menu-type.trashed');
        Route::post('event-menu-type/restore/{id}', [EventMenuTypeController::class, 'restore'])->name('event-menu-type.restore');
        Route::delete('event-menu-type/force-delete/{id}', [EventMenuTypeController::class, 'forceDelete'])->name('event-menu-type.force-delete');
        Route::resource('event-menu-type', EventMenuTypeController::class)->except(['create', 'edit', 'show']);
        Route::get('event-menu-addon/trashed', [EventMenuAddOnsController::class, 'trashed'])->name('event-menu-addon.trashed');
        Route::post('event-menu-addon/restore/{id}', [EventMenuAddOnsController::class, 'restore'])->name('event-menu-addon.restore');
        Route::delete('event-menu-addon/force-delete/{id}', [EventMenuAddOnsController::class, 'forceDelete'])->name('event-menu-addon.force-delete');
        Route::resource('event-menu-addon', EventMenuAddOnsController::class)->except(['create', 'edit', 'show']);
        Route::get('event-charges-type/trashed', [EventChargesTypeController::class, 'trashed'])->name('event-charges-type.trashed');
        Route::post('event-charges-type/restore/{id}', [EventChargesTypeController::class, 'restore'])->name('event-charges-type.restore');
        Route::delete('event-charges-type/force-delete/{id}', [EventChargesTypeController::class, 'forceDelete'])->name('event-charges-type.force-delete');
        Route::resource('event-charges-type', EventChargesTypeController::class)->except(['create', 'edit', 'show']);
    });

    // Admin Booking Routes
    Route::get('/api/room-bookings/calendar', [RoomBookingController::class, 'getCalendar'])->name('api.bookings.calendar')->middleware('permission:rooms.bookings.calendar');
    Route::get('/api/room-bookings/search-customers', [RoomBookingController::class, 'searchCustomers'])->name('api.bookings.search-customers')->middleware('permission:rooms.bookings.create');
    Route::get('/api/events/calendar', [EventBookingController::class, 'calendarData'])->name('api.events.calendar')->middleware('permission:events.bookings.calendar');
    Route::get('/api/events/venues', [EventBookingController::class, 'getVenues'])->name('api.events.venues')->middleware('permission:events.venue.view');
    Route::get('/booking/payment', [BookingController::class, 'payNow'])->name('booking.payment');
    Route::post('booking/payment/store', [BookingController::class, 'paymentStore'])->name('booking.payment.store');

    // Admin Booking Routes
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
        Route::get('dashboard', [SubscriptionController::class, 'index'])->name('subscription.dashboard')->middleware('super.admin:subscriptions.dashboard.view');
        Route::get('manage', [SubscriptionController::class, 'management'])->name('subscriptions.management')->middleware('super.admin:subscriptions.view');
        // Subscription categories
        Route::resource('subscription-categories', SubscriptionCategoryController::class)->except('show');
        // Subscription types
        Route::get('subscription-types', [SubscriptionTypeController::class, 'index'])->name('subscription-types.index');
        Route::post('subscription-types/store', [SubscriptionTypeController::class, 'store'])->name('subscription-types.store');
        Route::post('subscription-types/{id}/update2', [SubscriptionTypeController::class, 'update'])->name('subscription-types.update2');
        Route::delete('subscription-types/{id}/delete', [SubscriptionTypeController::class, 'destroy'])->name('subscription-types.destroy');
    });

    Route::post('api/check-duplicate-cnic', [MembersController::class, 'checkDuplicateCnic'])->name('api.check-duplicate-cnic');
    Route::post('api/check-duplicate-membership-no', [MembersController::class, 'checkDuplicateMembershipNo'])->name('api.check-duplicate-membership-no');
    Route::post('api/check-duplicate-barcode', [MembersController::class, 'checkDuplicateBarcode'])->name('api.check-duplicate-barcode');
    Route::get('api/get-next-membership-number', [MembersController::class, 'getNextMembershipNumber'])->name('api.get-next-membership-number');
    Route::get('api/members/search', [MembersController::class, 'search'])->name('api.members.search');

    // Financial Routes
    Route::group(['prefix' => 'admin/finance'], function () {
        // Main Finance Dashboard & Manage
        Route::get('dashboard', [FinancialController::class, 'index'])->name('finance.dashboard')->middleware('super.admin:financial.dashboard.view');

        Route::get('manage', [FinancialController::class, 'getAllTransactions'])->name('finance.transaction')->middleware('super.admin:financial.view');
        Route::post('bulk-discount', [FinancialController::class, 'bulkApplyDiscount'])->name('finance.transaction.bulk-discount')->middleware('permission:financial.edit');
        Route::post('bulk-overdue', [FinancialController::class, 'bulkApplyOverdue'])->name('finance.transaction.bulk-overdue')->middleware('permission:financial.edit');

        // Transaction Management Routes
        Route::get('create', [MemberTransactionController::class, 'create'])->name('finance.transaction.create')->middleware('super.admin:financial.create');
        Route::get('invoice/{id}/pay', [MemberTransactionController::class, 'payInvoiceView'])->name('finance.invoice.pay');
        Route::post('store', [MemberTransactionController::class, 'store'])->name('finance.transaction.store')->middleware('permission:financial.create');
        Route::get('search', [MemberTransactionController::class, 'searchMembers'])->name('finance.transaction.search')->middleware('permission:financial.create');
        Route::get('member/{memberId}', [MemberTransactionController::class, 'getMemberTransactions'])->name('finance.transaction.member')->middleware('permission:financial.create');
        Route::post('/finance/transaction/update-status/{id}', [MemberTransactionController::class, 'updateStatus'])->name('finance.transaction.update-status');
        Route::get('transaction-types', [MemberTransactionController::class, 'getTransactionTypes'])->name('finance.transaction.types');
        Route::get('search-invoices', [FinancialController::class, 'searchInvoices'])->name('finance.transaction.search-invoices');

        // Charge Types Management (CRUD)
        Route::get('charge-types/trashed', [FinancialChargeTypeController::class, 'trashed'])->name('finance.charge-types.trashed')->middleware('permission:finance.charge-types.delete');
        Route::post('charge-types/restore/{id}', [FinancialChargeTypeController::class, 'restore'])->name('finance.charge-types.restore')->middleware('permission:finance.charge-types.delete');
        Route::delete('charge-types/force-delete/{id}', [FinancialChargeTypeController::class, 'forceDelete'])->name('finance.charge-types.force-delete')->middleware('permission:finance.charge-types.delete');
        Route::resource('charge-types', FinancialChargeTypeController::class)->names('finance.charge-types')->middleware([
            'index' => 'super.admin:finance.charge-types.view',
            'create' => 'super.admin:finance.charge-types.create',
            'store' => 'permission:finance.charge-types.create',
            'edit' => 'super.admin:finance.charge-types.edit',
            'update' => 'permission:finance.charge-types.edit',
            'destroy' => 'permission:finance.charge-types.delete',
        ]);

        // Maintenance Fee Posting Routes
        Route::get('maintenance-posting', [MaintenanceFeePostingController::class, 'create'])->name('finance.maintenance.create')->middleware('super.admin:financial.create');
        Route::post('maintenance-posting/preview', [MaintenanceFeePostingController::class, 'preview'])->name('finance.maintenance.preview')->middleware('permission:financial.create');
        Route::post('maintenance-posting', [MaintenanceFeePostingController::class, 'store'])->name('finance.maintenance.store')->middleware('permission:financial.create');
    });

    // Route for business developers, outside the 'admin/finance' group as per user's snippet structure
    Route::get('/employees/business-developers', [EmployeeController::class, 'getBusinessDevelopers'])->name('employees.business-developers')->middleware('permission:financial.edit');

    Route::get('/api/finance/totalRevenue', [FinancialController::class, 'fetchRevenue'])->name('api.finance.totalRevenue');

    // Payroll API Routes
    Route::prefix('api/payroll')->middleware('permission:employees.payroll.view')->group(function () {
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
        Route::get('/employees/list', [PayrollApiController::class, 'getEmployeesList'])->name('employees.list');
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
        // Reports
        Route::get('/reports/summary/{periodId}', [PayrollApiController::class, 'getSummaryReport'])->name('api.payroll.reports.summary');
        Route::get('/reports/detailed/{periodId}', [PayrollApiController::class, 'getDetailedReport'])->name('api.payroll.reports.detailed');
        Route::get('/reports/employee/{employeeId}', [PayrollApiController::class, 'getEmployeePayrollHistory'])->name('api.payroll.reports.employee');
        Route::get('/history/{employeeId}', [PayrollApiController::class, 'getEmployeePayrollHistory'])->name('api.payroll.history');

        // Salary Sheet Editor Endpoints
        Route::get('/salary-sheet', [PayrollApiController::class, 'getSalarySheetData'])->name('api.payroll.salary-sheet');
        Route::post('/salary-sheet/update', [PayrollApiController::class, 'updateSalarySheet'])->name('api.payroll.salary-sheet.update');
        Route::post('/salary-sheet/import', [PayrollApiController::class, 'importSalarySheet'])->name('api.payroll.salary-sheet.import');
        Route::post('/salary-sheet/post', [PayrollApiController::class, 'postPayroll'])->name('api.payroll.salary-sheet.post');
    });

    Route::group(['prefix' => 'payroll'], function () {
        Route::get('/salary-sheet/template', [PayrollApiController::class, 'downloadImportTemplate'])->name('payroll.salary-sheet.template');
        Route::get('/salary-sheet/export', [PayrollApiController::class, 'exportSalarySheet'])->name('payroll.salary-sheet.export');

        Route::get('/preview/print', [PayrollApiController::class, 'printPreviewPage'])->name('payroll.preview.print');
    });

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
        Route::get('partners-affiliates/search', [PartnerAffiliateController::class, 'search'])->name('admin.membership.partners-affiliates.search')->middleware('permission:partners-affiliates.view');
        Route::get('partners-affiliates/trashed', [PartnerAffiliateController::class, 'trashed'])->name('admin.membership.partners-affiliates.trashed')->middleware('permission:partners-affiliates.restore');
        Route::post('partners-affiliates/restore/{id}', [PartnerAffiliateController::class, 'restore'])->name('admin.membership.partners-affiliates.restore')->middleware('permission:partners-affiliates.restore');
        Route::resource('partners-affiliates', PartnerAffiliateController::class)->names('admin.membership.partners-affiliates')->middleware(
            [
                'index' => 'permission:partners-affiliates.view',
                'show' => 'permission:partners-affiliates.view',
                'create' => 'permission:partners-affiliates.create',
                'store' => 'permission:partners-affiliates.create',
                'edit' => 'permission:partners-affiliates.edit',
                'update' => 'permission:partners-affiliates.edit',
                'destroy' => 'permission:partners-affiliates.delete',
            ]
        );
        Route::get('dashboard', [MembershipController::class, 'index'])->name('membership.dashboard')->middleware('super.admin:members.view');
        Route::get('all', [MembershipController::class, 'allMembers'])->name('membership.members')->middleware('super.admin:members.view');

        Route::get('trashed', [MembershipController::class, 'trashed'])->name('membership.trashed')->middleware('super.admin:members.delete');
        Route::post('restore/{id}', [MembershipController::class, 'restore'])->name('membership.restore')->middleware('permission:members.delete');

        Route::delete('/{id}', [MembershipController::class, 'destroy'])->name('membership.destroy')->middleware('permission:members.delete');
        Route::get('create', [MembershipController::class, 'create'])->name('membership.add')->middleware('super.admin:members.create');
        Route::get('edit/{id}', [MembershipController::class, 'edit'])->name('membership.edit')->middleware('super.admin:members.edit');
        Route::get('profile/{id}', [MembershipController::class, 'showMemberProfile'])->name('membership.profile')->middleware('super.admin:members.view');
        Route::get('profile/{id}/family-members', [MembershipController::class, 'getMemberFamilyMembers'])->name('membership.profile.family-members')->middleware('super.admin:members.view');
        Route::get('profile/{id}/all-family-members', [MembershipController::class, 'getAllFamilyMembers'])->name('membership.members.all-family-members')->middleware('permission:members.view');  // API-like? If view, change.
        Route::get('profile/{id}/order-history', [MembershipController::class, 'getMemberOrderHistory'])->name('membership.profile.order-history')->middleware('super.admin:members.view');
        Route::get('/payment-order-data/{invoiceId}', [TransactionController::class, 'PaymentOrderData'])->name('member.orderhistory.invoice');
        Route::post('update/{id}', [MembershipController::class, 'updateMember'])->name('membership.update')->middleware('permission:members.edit');
        Route::post('store', [MembershipController::class, 'store'])->name('membership.store')->middleware('permission:members.create');
        Route::post('store-step-4', [MembershipController::class, 'storeStep4'])->name('membership.store-step-4')->middleware('permission:members.create');
        Route::post('update-status', [MembershipController::class, 'updateStatus'])->name('membership.update-status')->middleware('permission:members.edit');
        Route::post('profession-info', [MembershipController::class, 'saveProfessionInfo'])->name('membership.profession-info')->middleware('permission:members.create');
        Route::get('profession-info/{id}', [MembershipController::class, 'getProfessionInfo'])->name('membership.profession-info.get')->middleware('permission:members.view');
        // Card Routes
        Route::get('/cards', [CardController::class, 'index'])->name('cards.dashboard')->middleware('super.admin:cards.view');

        // Reports Index - Dashboard with all reports
        Route::get('reports', [MemberFeeRevenueController::class, 'reportsIndex'])->name('membership.reports')->middleware('super.admin:reports.view');

        // Membership Maintanance Revenue
        Route::get('maintanance-fee-revenue', [MemberFeeRevenueController::class, 'maintenanceFeeRevenue'])->name('membership.maintanance-fee-revenue')->middleware('super.admin:reports.maintanance-fee-revenue');
        Route::get('maintanance-fee-revenue/print', [MemberFeeRevenueController::class, 'maintenanceFeeRevenuePrint'])->name('membership.maintanance-fee-revenue.print')->middleware('super.admin:reports.maintanance-fee-revenue');

        // Pending Maintenance Report
        Route::get('pending-maintenance-report', [MemberFeeRevenueController::class, 'pendingMaintenanceReport'])->name('membership.pending-maintenance-report')->middleware('super.admin:reports.pending-maintenance');
        Route::get('pending-maintenance-report/print', [MemberFeeRevenueController::class, 'pendingMaintenanceReportPrint'])->name('membership.pending-maintenance-report.print')->middleware('super.admin:reports.pending-maintenance');
        Route::post('pending-maintenance-report/bulk-status', [MemberFeeRevenueController::class, 'pendingMaintenanceBulkStatusChange'])->name('membership.pending-maintenance-report.bulk-status')->middleware('super.admin:reports.pending-maintenance');
        Route::get('pending-maintenance-report/bulk-print', [MemberFeeRevenueController::class, 'pendingMaintenanceBulkPrint'])->name('membership.pending-maintenance-report.bulk-print')->middleware('super.admin:reports.pending-maintenance');

        // Supplementary Card Report
        Route::get('supplementary-card-report', [MemberFeeRevenueController::class, 'supplementaryCardReport'])->name('membership.supplementary-card-report')->middleware('super.admin:reports.supplementary-card');
        Route::get('supplementary-card-report/print', [MemberFeeRevenueController::class, 'supplementaryCardReportPrint'])->name('membership.supplementary-card-report.print')->middleware('super.admin:reports.supplementary-card');

        // Sleeping Members Report
        Route::get('sleeping-members-report', [MemberFeeRevenueController::class, 'sleepingMembersReport'])->name('membership.sleeping-members-report')->middleware('super.admin:reports.sleeping-members');
        Route::get('sleeping-members-report/print', [MemberFeeRevenueController::class, 'sleepingMembersReportPrint'])->name('membership.sleeping-members-report.print')->middleware('super.admin:reports.sleeping-members');

        // Member Card Detail Report
        Route::get('member-card-detail-report', [MemberFeeRevenueController::class, 'memberCardDetailReport'])->name('membership.member-card-detail-report')->middleware('super.admin:reports.member-card-detail');
        Route::get('member-card-detail-report/print', [MemberFeeRevenueController::class, 'memberCardDetailReportPrint'])->name('membership.member-card-detail-report.print')->middleware('super.admin:reports.member-card-detail');

        // Monthly Maintenance Fee Report
        Route::get('monthly-maintenance-fee-report', [MemberFeeRevenueController::class, 'monthlyMaintenanceFeeReport'])->name('membership.monthly-maintenance-fee-report')->middleware('super.admin:reports.monthly-maintenance-fee');
        Route::get('monthly-maintenance-fee-report/print', [MemberFeeRevenueController::class, 'monthlyMaintenanceFeeReportPrint'])->name('membership.monthly-maintenance-fee-report.print')->middleware('super.admin:reports.monthly-maintenance-fee');

        // New Year Eve Report
        Route::get('new-year-eve-report', [MemberFeeRevenueController::class, 'newYearEveReport'])->name('membership.new-year-eve-report')->middleware('super.admin:reports.new-year-eve');
        Route::get('new-year-eve-report/print', [MemberFeeRevenueController::class, 'newYearEveReportPrint'])->name('membership.new-year-eve-report.print')->middleware('super.admin:reports.new-year-eve');

        // Reinstating Fee Report
        Route::get('reinstating-fee-report', [MemberFeeRevenueController::class, 'reinstatingFeeReport'])->name('membership.reinstating-fee-report')->middleware('super.admin:reports.reinstating-fee');
        Route::get('reinstating-fee-report/print', [MemberFeeRevenueController::class, 'reinstatingFeeReportPrint'])->name('membership.reinstating-fee-report.print')->middleware('super.admin:reports.reinstating-fee');

        // Sports Subscriptions Report
        Route::get('sports-subscriptions-report', [MemberFeeRevenueController::class, 'sportsSubscriptionsReport'])->name('membership.sports-subscriptions-report')->middleware('super.admin:reports.sports-subscriptions');
        Route::get('sports-subscriptions-report/print', [MemberFeeRevenueController::class, 'sportsSubscriptionsReportPrint'])->name('membership.sports-subscriptions-report.print')->middleware('super.admin:reports.sports-subscriptions');

        // Subscriptions & Maintenance Summary Report
        Route::get('subscriptions-maintenance-summary', [MemberFeeRevenueController::class, 'subscriptionsMaintenanceSummary'])->name('membership.subscriptions-maintenance-summary')->middleware('super.admin:reports.subscriptions-maintenance-summary');
        Route::get('subscriptions-maintenance-summary/print', [MemberFeeRevenueController::class, 'subscriptionsMaintenanceSummaryPrint'])->name('membership.subscriptions-maintenance-summary.print')->middleware('super.admin:reports.subscriptions-maintenance-summary');

        // Pending Maintenance Quarters Report
        Route::get('pending-maintenance-quarters-report', [MemberFeeRevenueController::class, 'pendingMaintenanceQuartersReport'])->name('membership.pending-maintenance-quarters-report')->middleware('super.admin:reports.pending-maintenance-quarters');
        Route::get('pending-maintenance-quarters-report/print', [MemberFeeRevenueController::class, 'pendingMaintenanceQuartersReportPrint'])->name('membership.pending-maintenance-quarters-report.print')->middleware('super.admin:reports.pending-maintenance-quarters');

        // Family Members Archive route
        Route::get('family-members-archive', [FamilyMembersArchiveConroller::class, 'index'])->name('membership.family-members')->middleware('permission:family-members.view');
        Route::get('family-members-archive/trashed', [FamilyMembersArchiveConroller::class, 'trashed'])->name('membership.family-members.trashed');
        Route::post('family-members-archive/restore/{id}', [FamilyMembersArchiveConroller::class, 'restore'])->name('membership.family-members.restore');
        Route::get('family-members-archive/search', [FamilyMembersArchiveConroller::class, 'search'])->name('membership.family-members.search');

        // Applied Member
        Route::get('applied-member', [AppliedMemberController::class, 'index'])->name('applied-member.index')->middleware('permission:applied-members.view');
        Route::get('applied-member/trashed', [AppliedMemberController::class, 'trashed'])->name('applied-member.trashed')->middleware('permission:applied-members.restore');
        Route::post('applied-member/restore/{id}', [AppliedMemberController::class, 'restore'])->name('applied-member.restore')->middleware('permission:applied-members.restore');
        Route::get('api/applied-members/search', [AppliedMemberController::class, 'search'])->name('api.applied-members.search')->middleware('permission:applied-members.view');
        Route::post('applied-member', [AppliedMemberController::class, 'store'])->name('applied-member.store')->middleware('permission:applied-members.create');
        Route::put('applied-member/{id}', [AppliedMemberController::class, 'update'])->name('applied-member.update')->middleware('permission:applied-members.edit');
        Route::delete('applied-member/{id}', [AppliedMemberController::class, 'destroy'])->name('applied-member.destroy')->middleware('permission:applied-members.delete');

        // Member Categories
        Route::get('member-categories/trashed', [MemberCategoryController::class, 'trashed'])->name('member-categories.trashed')->middleware('permission:member-categories.restore');
        Route::post('member-categories/restore/{id}', [MemberCategoryController::class, 'restore'])->name('member-categories.restore')->middleware('permission:member-categories.restore');
        Route::resource('member-categories', MemberCategoryController::class)->except('show')->middleware([
            'index' => 'permission:member-categories.view',
            'create' => 'permission:member-categories.create',
            'store' => 'permission:member-categories.create',
            'edit' => 'permission:member-categories.edit',
            'update' => 'permission:member-categories.edit',
            'destroy' => 'permission:member-categories.delete',
        ]);

        // Corporate Company Management Routes
        Route::get('corporate-companies/trashed', [CorporateCompanyController::class, 'trashed'])->name('corporate-companies.trashed')->middleware('permission:corporate-companies.restore');
        Route::post('corporate-companies/restore/{id}', [CorporateCompanyController::class, 'restore'])->name('corporate-companies.restore')->middleware('permission:corporate-companies.restore');
        Route::resource('corporate-companies', CorporateCompanyController::class)->except('show')->middleware([
            'index' => 'permission:corporate-companies.view',
            'create' => 'permission:corporate-companies.create',
            'store' => 'permission:corporate-companies.create',
            'edit' => 'permission:corporate-companies.edit',
            'update' => 'permission:corporate-companies.edit',
            'destroy' => 'permission:corporate-companies.delete',
        ]);

        // Members types
        Route::get('member-types', [MemberTypeController::class, 'index'])->name('member-types.index')->middleware('permission:member-types.view');
        Route::get('member-types/trashed', [MemberTypeController::class, 'trashed'])->name('member-types.trashed')->middleware('permission:member-types.restore');
        Route::post('member-types/restore/{id}', [MemberTypeController::class, 'restore'])->name('member-types.restore')->middleware('permission:member-types.restore');
        Route::post('member-types/store', [MemberTypeController::class, 'store'])->name('member-types.store')->middleware('permission:member-types.create');
        Route::post('member-types/{id}/update2', [MemberTypeController::class, 'update'])->name('member-types.update2')->middleware('permission:member-types.edit');
        Route::delete('member-types/{id}/delete', [MemberTypeController::class, 'destroy'])->name('member-types.destroy')->middleware('permission:member-types.delete');

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

    // Corporate Membership Routes
    Route::group(['prefix' => 'admin/corporate-membership'], function () {
        Route::get('dashboard', [CorporateMembershipController::class, 'index'])->name('corporate-membership.dashboard')->middleware('permission:corporate-members.view');
        Route::get('all', [CorporateMembershipController::class, 'allMembers'])->name('corporate-membership.members')->middleware('permission:corporate-members.view');
        Route::get('create', [CorporateMembershipController::class, 'create'])->name('corporate-membership.add')->middleware('permission:corporate-members.create');
        Route::get('edit/{id}', [CorporateMembershipController::class, 'edit'])->name('corporate-membership.edit')->middleware('permission:corporate-members.edit');
        Route::get('profile/{id}', [CorporateMembershipController::class, 'showMemberProfile'])->name('corporate-membership.profile')->middleware('permission:corporate-members.view');
        Route::get('profile/{id}/family-members', [CorporateMembershipController::class, 'getFamilyMembers'])->name('corporate-membership.profile.family-members')->middleware('permission:corporate-members.view');
        Route::get('profile/{id}/all-family-members', [CorporateMembershipController::class, 'getAllFamilyMembers'])->name('corporate-membership.members.all-family-members')->middleware('permission:corporate-members.view');
        Route::get('profile/{id}/profession-info', [CorporateMembershipController::class, 'getProfessionInfo'])->name('corporate-membership.profession-info.get')->middleware('permission:corporate-members.view');
        Route::get('family-members', [CorporateMembershipController::class, 'familyMembersIndex'])->name('corporate-membership.family-members')->middleware('permission:corporate-members.view');
        Route::post('store', [CorporateMembershipController::class, 'store'])->name('corporate-membership.store')->middleware('permission:corporate-members.create');
        Route::post('store-step-4', [CorporateMembershipController::class, 'storeStep4'])->name('corporate-membership.store-step-4')->middleware('permission:corporate-members.create');
        Route::post('update-status', [CorporateMembershipController::class, 'updateStatus'])->name('corporate-membership.update-status')->middleware('permission:corporate-members.edit');
        Route::post('update/{id}', [CorporateMembershipController::class, 'update'])->name('corporate-membership.update')->middleware('permission:corporate-members.edit');
        Route::delete('/{id}', [CorporateMembershipController::class, 'destroy'])->name('corporate-membership.destroy')->middleware('permission:corporate-members.delete');
        Route::get('trashed', [CorporateMembershipController::class, 'trashed'])->name('corporate-membership.trashed')->middleware('permission:corporate-members.delete');
        Route::post('restore/{id}', [CorporateMembershipController::class, 'restore'])->name('corporate-membership.restore')->middleware('permission:corporate-members.delete');
        Route::get('api/search', [CorporateMembershipController::class, 'search'])->name('api.corporate-members.search')->middleware('permission:corporate-members.view');
    });

    // Corporate Member Profile route
    Route::get('/corporate-members/{id}', [CorporateMembershipController::class, 'showMemberProfile'])->name('corporate-member.profile');

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
    Route::group(['prefix' => 'admin/data-migration', 'middleware' => ['permission:system.data-migration']], function () {
        Route::get('/', [DataMigrationController::class, 'index'])->name('data-migration.index');
        Route::get('/stats', [DataMigrationController::class, 'getMigrationStats'])->name('data-migration.stats');
        Route::post('/migrate-members', [DataMigrationController::class, 'migrateMembers'])->name('data-migration.migrate-members');
        Route::post('/migrate-families', [DataMigrationController::class, 'migrateFamilies'])->name('data-migration.migrate-families');
        Route::post('/migrate-customers', [DataMigrationController::class, 'migrateCustomers'])->name('data-migration.customers');
        Route::post('/migrate-employees', [DataMigrationController::class, 'migrateEmployees'])->name('data-migration.employees');
        Route::post('/migrate-invoices', [DataMigrationController::class, 'migrateInvoicesPublic'])->name('data-migration.migrate-invoices');
        Route::post('/migrate-invoices-global', [DataMigrationController::class, 'migrateInvoicesGlobal'])->name('data-migration.migrate-invoices-global');
        Route::post('/migrate-transaction-types', [DataMigrationController::class, 'migrateTransactionTypesPublic'])->name('data-migration.migrate-transaction-types');
        Route::post('/migrate-subscription-types', [DataMigrationController::class, 'migrateSubscriptionTypesPublic'])->name('data-migration.migrate-subscription-types');
        Route::post('/migrate-departments', [DataMigrationController::class, 'migrateDepartmentsAndSubdepartments'])->name('data-migration.migrate-departments');
        // Removed duplicate/incorrect lines and referencing correct public method
        // Route::post('/data-migration/migrate-invoices', ...); // Removed duplicate
        Route::post('/data-migration/migrate-financials', [DataMigrationController::class, 'migrateFinancials'])->name('data-migration.migrate-financials');  // Added this route
        Route::post('/migrate-fnb', [DataMigrationController::class, 'migrateFnB'])->name('data-migration.migrate-fnb');  // Added FnB migration route

        // Atomic Financial Migration Routes
        Route::get('/old-transaction-types', [DataMigrationController::class, 'getOldTransactionTypesPublic'])->name('data-migration.old-transaction-types');
        Route::get('/pending-invoices-count', [DataMigrationController::class, 'getPendingInvoicesCount'])->name('data-migration.pending-invoices-count');
        Route::post('/migrate-invoices-deep', [DataMigrationController::class, 'migrateInvoicesDeep'])->name('data-migration.migrate-invoices-deep');

        Route::post('/migrate-corporate-members', [DataMigrationController::class, 'migrateCorporateMembers'])->name('data-migration.migrate-corporate-members');
        Route::post('/migrate-corporate-families', [DataMigrationController::class, 'migrateCorporateFamilies'])->name('data-migration.migrate-corporate-families');
        Route::post('/migrate-media', [DataMigrationController::class, 'migrateMedia'])->name('data-migration.migrate-media');
        Route::post('/migrate-media-photos', [DataMigrationController::class, 'migrateMediaPhotos'])->name('data-migration.migrate-media-photos');
        Route::post('/reset', [DataMigrationController::class, 'resetMigration'])->name('data-migration.reset');
        Route::post('/reset-families', [DataMigrationController::class, 'resetFamiliesOnly'])->name('data-migration.reset-families');
        Route::post('/delete-profile-photos', [DataMigrationController::class, 'deleteProfilePhotos'])->name('data-migration.delete-profile-photos');
        Route::post('/generate-qr-codes', [DataMigrationController::class, 'generateQrCodes'])->name('data-migration.generate-qr-codes');
        Route::post('/generate-corporate-qr-codes', [DataMigrationController::class, 'generateCorporateQrCodes'])->name('data-migration.generate-corporate-qr-codes');
        Route::post('/cleanup-profile-photos', [DataMigrationController::class, 'cleanupProfilePhotos'])->name('data-migration.cleanup-profile-photos');
        Route::get('/validate', [DataMigrationController::class, 'validateMigration'])->name('data-migration.validate');
        Route::post('/delete-legacy-invoices', [DataMigrationController::class, 'deleteLegacyInvoices'])->name('data-migration.delete-legacy-invoices');
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
        Route::post('/update-employee-user/{id}', [UserManagementController::class, 'updateEmployeeUser'])->name('admin.users.update-employee');
        Route::post('/assign-role', [UserManagementController::class, 'assignRole'])->name('admin.users.assign-role')->middleware('super.admin:users.edit');
        Route::post('/remove-role', [UserManagementController::class, 'removeRole'])->name('admin.users.remove-role')->middleware('super.admin:users.edit');
    });

    // tenant route
    Route::group(['prefix' => 'admin/kitchen'], function () {
        Route::get('', [TenantController::class, 'index'])->name('locations.index')->middleware('permission:kitchen.locations.view');
        Route::get('register', [TenantController::class, 'create'])->name('locations.create')->middleware('permission:kitchen.locations.create');
        Route::post('store', [TenantController::class, 'store'])->name('locations.store')->middleware('permission:kitchen.locations.create');
        Route::get('{tenant}/edit', [TenantController::class, 'edit'])->name('locations.edit')->middleware('permission:kitchen.locations.edit');
        Route::put('{tenant}', [TenantController::class, 'update'])->name('locations.update')->middleware('permission:kitchen.locations.edit');
    });

    // Admin POS Reports Routes
    Route::prefix('admin/reports')->middleware('super.admin:reports.pos.view')->group(function () {
        Route::get('pos/all', [AdminPosReportController::class, 'index'])->name('admin.reports.pos.all');
        Route::get('pos/restaurant/{tenantId}', [AdminPosReportController::class, 'singleRestaurant'])->name('admin.reports.pos.single')->middleware('super.admin:reports.pos.restaurant-wise');
        Route::get('pos/all/print', [AdminPosReportController::class, 'printAll'])->name('admin.reports.pos.all.print');
        Route::get('pos/restaurant/{tenantId}/print', [AdminPosReportController::class, 'printSingle'])->name('admin.reports.pos.single.print')->middleware('super.admin:reports.pos.restaurant-wise');
        Route::get('pos/restaurant-wise', [AdminPosReportController::class, 'restaurantWise'])->name('admin.reports.pos.restaurant-wise')->middleware('super.admin:reports.pos.restaurant-wise');
        Route::get('pos/restaurant-wise/print', [AdminPosReportController::class, 'restaurantWisePrint'])->name('admin.reports.pos.restaurant-wise.print')->middleware('super.admin:reports.pos.restaurant-wise');
        Route::get('pos/running-sales-orders', [AdminPosReportController::class, 'runningSalesOrders'])->name('admin.reports.pos.running-sales-orders')->middleware('super.admin:reports.pos.running-sales');
        Route::get('pos/running-sales-orders/print', [AdminPosReportController::class, 'runningSalesOrdersPrint'])->name('admin.reports.pos.running-sales-orders.print')->middleware('super.admin:reports.pos.running-sales');
        Route::get('pos/sales-summary-with-items', [AdminPosReportController::class, 'salesSummaryWithItems'])->name('admin.reports.pos.sales-summary-with-items')->middleware('super.admin:reports.pos.sales-summary');
        Route::get('pos/sales-summary-with-items/print', [AdminPosReportController::class, 'salesSummaryWithItemsPrint'])->name('admin.reports.pos.sales-summary-with-items.print')->middleware('super.admin:reports.pos.sales-summary');
        Route::get('pos/daily-sales-list-cashier-wise', [AdminPosReportController::class, 'dailySalesListCashierWise'])->name('admin.reports.pos.daily-sales-list-cashier-wise')->middleware('super.admin:reports.pos.cashier-sales');
        Route::get('pos/daily-sales-list-cashier-wise/print', [AdminPosReportController::class, 'dailySalesListCashierWisePrint'])->name('admin.reports.pos.daily-sales-list-cashier-wise.print')->middleware('super.admin:reports.pos.cashier-sales');
        Route::get('pos/daily-dump-items-report', [AdminPosReportController::class, 'dailyDumpItemsReport'])->name('admin.reports.pos.daily-dump-items-report')->middleware('super.admin:reports.pos.dump-report');
        Route::get('pos/daily-dump-items-report/print', [AdminPosReportController::class, 'dailyDumpItemsReportPrint'])->name('admin.reports.pos.daily-dump-items-report.print')->middleware('super.admin:reports.pos.dump-report');
    });

    // Voucher Management Routes
    Route::prefix('admin/vouchers')->middleware('super.admin:finance.vouchers.view')->group(function () {
        Route::get('/', [VoucherController::class, 'dashboard'])->name('vouchers.dashboard');
        Route::get('/create', [VoucherController::class, 'create'])->name('vouchers.create')->middleware('super.admin:finance.vouchers.create');
        Route::post('/', [VoucherController::class, 'store'])->name('vouchers.store')->middleware('permission:finance.vouchers.create');
        Route::get('/{voucher}', [VoucherController::class, 'show'])->name('vouchers.show');
        Route::get('/{voucher}/edit', [VoucherController::class, 'edit'])->name('vouchers.edit')->middleware('super.admin:finance.vouchers.edit');
        Route::put('/{voucher}', [VoucherController::class, 'update'])->name('vouchers.update')->middleware('permission:finance.vouchers.edit');
        Route::delete('/{voucher}', [VoucherController::class, 'destroy'])->name('vouchers.destroy')->middleware('permission:finance.vouchers.delete');
        Route::post('/{voucher}/mark-used', [VoucherController::class, 'markAsUsed'])->name('vouchers.mark-used')->middleware('permission:finance.vouchers.view');
        Route::post('/update-status', [VoucherController::class, 'updateStatus'])->name('vouchers.update-status');
    });

    Route::prefix('api')->group(function () {
        // Dashboard Stats API
        Route::get('dashboard/stats', [AdminController::class, 'getDashboardStats'])->name('api.dashboard.stats');

        Route::resource('departments', EmployeeDepartmentController::class)->except(['create', 'show', 'edit'])->middleware('permission:employees.departments.view');
        // Replace index with your own custom function
        Route::get('departments', [EmployeeDepartmentController::class, 'listAll'])->name('api.departments.listAll')->middleware('permission:employees.departments.view');

        // Subdepartment API routes
        Route::resource('subdepartments', EmployeeSubdepartmentController::class)->except(['create', 'show', 'edit'])->middleware('permission:employees.departments.view');
        Route::get('subdepartments', [EmployeeSubdepartmentController::class, 'listAll'])->name('api.subdepartments.listAll')->middleware('permission:employees.departments.view');

        Route::post('employee/create', [EmployeeController::class, 'store'])->name('api.employees.store')->middleware('permission:employees.create');
        Route::put('employees/update/{employeeId}', [EmployeeController::class, 'update'])->name('api.employees.update')->middleware('permission:employees.edit');

        // Leave Category API routes
        Route::prefix('leave-categories')->middleware('permission:employees.leaves.view')->group(function () {
            Route::get('/', [LeaveCategoryController::class, 'getAll'])->name('api.leave-categories.getAll');
            Route::post('/', [LeaveCategoryController::class, 'store'])->name('api.leave-categories.store')->middleware('permission:employees.leaves.approve');
            Route::get('/{id}', [LeaveCategoryController::class, 'show'])->name('api.leave-categories.show');
            Route::put('/{id}', [LeaveCategoryController::class, 'update'])->name('api.leave-categories.update')->middleware('permission:employees.leaves.approve');
            Route::delete('/{id}', [LeaveCategoryController::class, 'destroy'])->name('api.leave-categories.destroy')->middleware('permission:employees.leaves.approve');
        });

        // Leave Application API routes
        Route::prefix('leave-applications')->middleware('permission:employees.leaves.view')->group(function () {
            Route::post('/', [LeaveApplicationController::class, 'store'])->name('api.leave-applications.store')->middleware('permission:employees.leaves.approve');
            Route::get('/{id}', [LeaveApplicationController::class, 'show'])->name('api.leave-applications.show');
            Route::put('/{id}', [LeaveApplicationController::class, 'update'])->name('api.leave-applications.update')->middleware('permission:employees.leaves.approve');
            Route::delete('/{id}', [LeaveApplicationController::class, 'destroy'])->name('api.leave-applications.destroy')->middleware('permission:employees.leaves.approve');
        });

        // Leave Applications List API route (with search)
        Route::get('employees/leaves/applications', [LeaveApplicationController::class, 'getApplications'])->name('api.leave-applications.list');

        // Leave Report API route
        Route::get('employees/leaves/reports', [LeaveApplicationController::class, 'leaveReport'])->name('api.leave-reports');
        Route::get('employees/leaves/reports/export', [LeaveApplicationController::class, 'exportLeaveReport'])->name('api.leave-reports.export');

        // Attendance API routes
        Route::prefix('attendances')->middleware('permission:employees.attendance.view')->group(function () {
            Route::get('/', [AttendanceController::class, 'index'])->name('api.attendances.index');
            Route::get('reports', [AttendanceController::class, 'attendanceReport'])->name('api.attendances.reports');
            Route::get('reports/export', [AttendanceController::class, 'exportAttendanceReport'])->name('api.attendances.reports.export');
            Route::put('{attendanceId}', [AttendanceController::class, 'updateAttendance'])->name('api.attendances.update');
            Route::get('profile/report/{employeeId}', [AttendanceController::class, 'profileReport'])->name('api.attendances.profile.report');
            Route::post('all/report', [AttendanceController::class, 'allEmployeesReport'])->name('api.attendances.all.report');

            Route::get('leaves/reports/monthly', [LeaveApplicationController::class, 'leaveReportMonthly'])->name('api.attendances.leaves.reports.monthly');
            Route::get('leaves/reports/monthly/export', [LeaveApplicationController::class, 'exportMonthlyReport'])->name('api.attendances.leaves.reports.monthly.export');
        });

        // Voucher API routes
        Route::prefix('vouchers')->middleware('permission:finance.vouchers.view')->group(function () {
            Route::get('/', [VoucherController::class, 'getVouchers'])->name('api.vouchers.index');
            Route::get('/{voucher}', [VoucherController::class, 'show'])->name('api.vouchers.show');
            Route::post('/{voucher}/mark-used', [VoucherController::class, 'markAsUsed'])->name('api.vouchers.mark-used');
        });
    });
});

// Central guest-only auth routes
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

use App\Http\Controllers\Api\CorporateCompanyController as ApiCorporateCompanyController;

// Corporate Company API Routes
Route::prefix('api')->group(function () {
    Route::controller(ApiCorporateCompanyController::class)->group(function () {
        Route::get('/corporate-companies', 'index');
        Route::post('/corporate-companies', 'store');
        Route::put('/corporate-companies/{id}', 'update');
        Route::delete('/corporate-companies/{id}', 'destroy');
    });
});
