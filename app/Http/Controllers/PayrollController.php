<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Employee;
use App\Models\PayrollPeriod;
use App\Models\Payslip;
use App\Models\PayrollSetting;
use App\Models\AllowanceType;
use App\Models\DeductionType;
use App\Models\EmployeeSalaryStructure;
use App\Services\PayrollProcessingService;
use Carbon\Carbon;

class PayrollController extends Controller
{
    protected $payrollService;

    public function __construct(PayrollProcessingService $payrollService)
    {
        $this->payrollService = $payrollService;
    }

    /**
     * Display the payroll dashboard
     */
    public function dashboard()
    {
        $stats = [
            'total_employees' => Employee::count(),
            'active_employees' => Employee::whereNull('deleted_at')->count(),
            'current_period' => PayrollPeriod::where('status', 'processing')->first(),
            'pending_payslips' => Payslip::where('status', 'draft')->count(),
            'this_month_payroll' => PayrollPeriod::whereMonth('start_date', now()->month)
                                                ->whereYear('start_date', now()->year)
                                                ->first(),
        ];

        return Inertia::render('App/Admin/Employee/Payroll/Dashboard', [
            'stats' => $stats
        ]);
    }

    /**
     * Display payroll settings page
     */
    public function settings()
    {
        $settings = PayrollSetting::first();
        
        return Inertia::render('App/Admin/Employee/Payroll/Settings', [
            'settings' => $settings
        ]);
    }

    /**
     * Display allowance types management
     */
    public function allowanceTypes()
    {
        $allowanceTypes = AllowanceType::where('is_active', true)->get();
        
        return Inertia::render('App/Admin/Employee/Payroll/AllowanceTypes', [
            'allowanceTypes' => $allowanceTypes
        ]);
    }

    /**
     * Display deduction types management
     */
    public function deductionTypes()
    {
        $deductionTypes = DeductionType::where('is_active', true)->get();
        
        return Inertia::render('App/Admin/Employee/Payroll/DeductionTypes', [
            'deductionTypes' => $deductionTypes
        ]);
    }

    /**
     * Display employee salaries management
     */
    public function employeeSalaries()
    {
        $employees = Employee::with([
            'salaryStructure' => function($query) {
                $query->where('is_active', true)->latest();
            },
            'department:id,name',
            'employeeType:id,name'
        ])->get();

        return Inertia::render('App/Admin/Employee/Payroll/EmployeeSalaries', [
            'employees' => $employees
        ]);
    }

    /**
     * Create salary structure for employee
     */
    public function createSalaryStructure($employeeId)
    {
        $employee = Employee::with(['department', 'employeeType'])->findOrFail($employeeId);
        $allowanceTypes = AllowanceType::all();
        $deductionTypes = DeductionType::all();

        return Inertia::render('App/Admin/Employee/Payroll/CreateSalaryStructure', [
            'employeeId' => $employeeId,
            'employee' => $employee,
            'allowanceTypes' => $allowanceTypes,
            'deductionTypes' => $deductionTypes
        ]);
    }

    /**
     * Edit salary structure for employee
     */
    public function editSalaryStructure($employeeId)
    {
        $employee = Employee::with([
            'user',
            'salaryStructure',
            'allowances.allowanceType',
            'deductions.deductionType',
            'department',
            'employeeType'
        ])->findOrFail($employeeId);

        $allowanceTypes = AllowanceType::all();
        $deductionTypes = DeductionType::all();

        return Inertia::render('App/Admin/Employee/Payroll/EditSalaryStructure', [
            'employeeId' => $employeeId,
            'employee' => $employee,
            'allowanceTypes' => $allowanceTypes,
            'deductionTypes' => $deductionTypes
        ]);
    }

    /**
     * View salary structure for employee
     */
    public function viewSalaryStructure($employeeId)
    {
        $employee = Employee::with([
            'user',
            'salaryStructure',
            'allowances.allowanceType',
            'deductions.deductionType',
            'department',
            'employeeType'
        ])->findOrFail($employeeId);

        return Inertia::render('App/Admin/Employee/Payroll/ViewSalaryStructure', [
            'employee' => $employee
        ]);
    }

    /**
     * Display payroll processing page
     */
    public function processPayroll()
    {
        $currentPeriod = PayrollPeriod::where('status', 'processing')->first();
        $employees = Employee::with(['salaryStructure', 'department'])->get();
        
        return Inertia::render('App/Admin/Employee/Payroll/ProcessPayroll', [
            'currentPeriod' => $currentPeriod,
            'employees' => $employees
        ]);
    }

    /**
     * Display payroll periods
     */
    public function payrollPeriods()
    {
        return Inertia::render('App/Admin/Employee/Payroll/PayrollPeriods');
    }

    /**
     * Create a new payroll period
     */
    public function createPeriod()
    {
        $lastPeriod = PayrollPeriod::orderBy('end_date', 'desc')->first();
        
        return Inertia::render('App/Admin/Employee/Payroll/CreatePeriod', [
            'lastPeriod' => $lastPeriod
        ]);
    }

    /**
     * Edit a payroll period
     */
    public function editPeriod($periodId)
    {
        $period = PayrollPeriod::findOrFail($periodId);
        
        return Inertia::render('App/Admin/Employee/Payroll/EditPeriod', [
            'period' => $period
        ]);
    }

    /**
     * Display payslips overview
     */
    public function payslips()
    {
        $periods = PayrollPeriod::with(['payslips' => function($query) {
            $query->selectRaw('payroll_period_id, count(*) as total_payslips, sum(net_salary) as total_amount')
                  ->groupBy('payroll_period_id');
        }])->orderBy('start_date', 'desc')->paginate(15);

        return Inertia::render('App/Admin/Employee/Payroll/Payslips', [
            'periods' => $periods
        ]);
    }

    /**
     * Display payslips for specific period
     */
    public function periodPayslips($periodId)
    {
        $period = PayrollPeriod::findOrFail($periodId);
        $payslips = Payslip::with(['employee:id,name,employee_id'])
                           ->where('payroll_period_id', $periodId)
                           ->paginate(20);

        return Inertia::render('App/Admin/Employee/Payroll/PeriodPayslips', [
            'period' => $period,
            'payslips' => $payslips
        ]);
    }

    /**
     * View individual payslip
     */
    public function viewPayslip($payslipId)
    {
        $payslip = Payslip::with([
            'employee',
            'payrollPeriod',
            'allowances.allowanceType',
            'deductions.deductionType'
        ])->findOrFail($payslipId);

        return Inertia::render('App/Admin/Employee/Payroll/ViewPayslip', [
            'payslip' => $payslip
        ]);
    }

    /**
     * Display payroll reports
     */
    public function reports()
    {
        $periods = PayrollPeriod::orderBy('start_date', 'desc')->take(12)->get();
        
        return Inertia::render('App/Admin/Employee/Payroll/Reports', [
            'periods' => $periods
        ]);
    }

    /**
     * Generate summary report
     */
    public function summaryReport(Request $request, $periodId = null)
    {
        // Handle both query parameter and route parameter
        $periodId = $periodId ?: $request->query('period_id');
        
        if (!$periodId) {
            return redirect()->route('employees.payroll.reports')->with('error', 'Period ID is required');
        }
        
        $period = PayrollPeriod::findOrFail($periodId);
        
        // For now, return basic summary data until PayrollProcessingService is available
        $summary = [
            'total_employees' => $period->total_employees ?? 0,
            'total_gross_amount' => $period->total_gross_amount ?? 0,
            'total_deductions' => $period->total_deductions ?? 0,
            'total_net_amount' => $period->total_net_amount ?? 0,
        ];
        
        return Inertia::render('App/Admin/Employee/Payroll/SummaryReport', [
            'period' => $period,
            'summary' => $summary
        ]);
    }

    /**
     * Generate detailed report
     */
    public function detailedReport(Request $request, $periodId = null)
    {
        // Handle both query parameter and route parameter
        $periodId = $periodId ?: $request->query('period_id');
        
        if (!$periodId) {
            return redirect()->route('employees.payroll.reports')->with('error', 'Period ID is required');
        }
        
        $period = PayrollPeriod::findOrFail($periodId);
        
        $payslips = Payslip::with(['employee', 'allowances', 'deductions'])
                           ->where('payroll_period_id', $periodId)
                           ->get();
        
        return Inertia::render('App/Admin/Employee/Payroll/DetailedReport', [
            'period' => $period,
            'payslips' => $payslips
        ]);
    }

    /**
     * Print summary report
     */
    public function summaryReportPrint($periodId)
    {
        $period = PayrollPeriod::findOrFail($periodId);
        
        // For now, return basic summary data until PayrollProcessingService is available
        $summary = [
            'total_employees' => $period->total_employees ?? 0,
            'total_gross_amount' => $period->total_gross_amount ?? 0,
            'total_deductions' => $period->total_deductions ?? 0,
            'total_net_amount' => $period->total_net_amount ?? 0,
        ];
        
        return Inertia::render('App/Admin/Employee/Payroll/PrintSummaryReport', [
            'period' => $period,
            'summary' => $summary
        ]);
    }

    /**
     * Print detailed report
     */
    public function detailedReportPrint($periodId)
    {
        $period = PayrollPeriod::findOrFail($periodId);
        
        $payslips = Payslip::with(['employee', 'allowances', 'deductions'])
                           ->where('payroll_period_id', $periodId)
                           ->get();
        
        return Inertia::render('App/Admin/Employee/Payroll/PrintDetailedReport', [
            'period' => $period,
            'payslips' => $payslips
        ]);
    }

    /**
     * Print individual payslip
     */
    public function printPayslip($payslipId)
    {
        $payslip = Payslip::with([
            'employee:id,name,employee_id,department_id',
            'employee.department:id,name',
            'employee.user:id,name',
            'payrollPeriod:id,period_name,start_date,end_date',
            'allowances.allowanceType:id,name',
            'deductions.deductionType:id,name'
        ])->findOrFail($payslipId);

        return Inertia::render('App/Admin/Employee/Payroll/PrintPayslip', [
            'payslip' => $payslip
        ]);
    }

}
