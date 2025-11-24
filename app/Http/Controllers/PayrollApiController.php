<?php

namespace App\Http\Controllers;

use App\Models\AllowanceType;
use App\Models\DeductionType;
use App\Models\Employee;
use App\Models\EmployeeAllowance;
use App\Models\EmployeeDeduction;
use App\Models\EmployeeSalaryStructure;
use App\Models\Order;
use App\Models\PayrollPeriod;
use App\Models\PayrollSetting;
use App\Models\Payslip;
use App\Services\PayrollProcessingService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PayrollApiController extends Controller
{
    protected $payrollService;

    public function __construct(PayrollProcessingService $payrollService)
    {
        $this->payrollService = $payrollService;
    }

    // Settings Management
    public function getSettings()
    {
        $settings = PayrollSetting::first();
        return response()->json(['success' => true, 'settings' => $settings]);
    }

    public function updateSettings(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'company_name' => 'required|string|max:255',
            'pay_frequency' => 'required|in:monthly,bi-weekly,weekly',
            'currency' => 'required|string|max:10',
            'working_days_per_month' => 'required|integer|min:20|max:31',
            'working_hours_per_day' => 'required|numeric|min:6|max:12',
            'overtime_rate_multiplier' => 'required|numeric|min:1|max:3',
            'late_deduction_per_minute' => 'required|numeric|min:0',
            'absent_deduction_type' => 'required|in:full_day,hourly,fixed_amount',
            'absent_deduction_amount' => 'required|numeric|min:0',
            'max_allowed_absents' => 'required|integer|min:0|max:10',
            'grace_period_minutes' => 'required|integer|min:0|max:60'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $settings = PayrollSetting::first();
        if ($settings) {
            $settings->update($request->all());
        } else {
            $settings = PayrollSetting::create($request->all());
        }

        return response()->json(['success' => true, 'settings' => $settings]);
    }

    // Allowance Types Management
    public function getAllowanceTypes()
    {
        $allowanceTypes = AllowanceType::all();
        return response()->json(['success' => true, 'allowanceTypes' => $allowanceTypes]);
    }

    public function storeAllowanceType(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:allowance_types,name',
            'type' => 'required|in:fixed,percentage,conditional',
            'is_taxable' => 'boolean',
            'description' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $allowanceType = AllowanceType::create($request->all());
        return response()->json(['success' => true, 'allowanceType' => $allowanceType], 201);
    }

    public function updateAllowanceType(Request $request, $id)
    {
        $allowanceType = AllowanceType::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:allowance_types,name,' . $id,
            'type' => 'required|in:fixed,percentage,conditional',
            'is_taxable' => 'boolean',
            'is_active' => 'boolean',
            'description' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $allowanceType->update($request->all());
        return response()->json(['success' => true, 'allowanceType' => $allowanceType]);
    }

    public function deleteAllowanceType($id)
    {
        $allowanceType = AllowanceType::findOrFail($id);
        $allowanceType->delete();

        return response()->json(['success' => true, 'message' => 'Allowance type deactivated successfully']);
    }

    // Deduction Types Management
    public function getDeductionTypes()
    {
        $deductionTypes = DeductionType::all();
        return response()->json(['success' => true, 'deductionTypes' => $deductionTypes]);
    }

    public function storeDeductionType(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:deduction_types,name',
            'type' => 'required|in:fixed,percentage,conditional',
            'is_mandatory' => 'boolean',
            'calculation_base' => 'required|in:basic_salary,gross_salary',
            'is_active' => 'boolean',
            'description' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $deductionType = DeductionType::create($request->all());
        return response()->json(['success' => true, 'deductionType' => $deductionType], 201);
    }

    public function updateDeductionType(Request $request, $id)
    {
        $deductionType = DeductionType::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:deduction_types,name,' . $id,
            'type' => 'required|in:fixed,percentage,conditional',
            'is_mandatory' => 'boolean',
            'calculation_base' => 'required|in:basic_salary,gross_salary',
            'is_active' => 'boolean',
            'description' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $deductionType->update($request->all());
        return response()->json(['success' => true, 'deductionType' => $deductionType]);
    }

    public function deleteDeductionType($id)
    {
        $deductionType = DeductionType::findOrFail($id);
        $deductionType->delete();

        return response()->json(['success' => true, 'message' => 'Deduction type deleted successfully']);
    }

    // Employee Salary Management
    public function getEmployeeSalaries(Request $request)
    {
        $query = Employee::with([
            'salaryStructure',
            'allowances.allowanceType',
            'deductions.deductionType',
            'department:id,name',
            'employeeType:id,name'
        ]);

        // Server-side search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('employee_id', 'like', "%{$search}%");
            });
        }

        // Optionally filter only employees that have a salary structure
        if ($request->has('has_salary') && $request->get('has_salary')) {
            $query->whereHas('salaryStructure');
        }

        // Optionally filter only employees with active salary structure
        if ($request->has('active_salary') && $request->get('active_salary')) {
            $query->whereHas('salaryStructure', function ($q) {
                $q->where('is_active', true);
            });
        }

        $perPage = $request->get('per_page', 15);
        // If per_page is 0 or negative, fetch a large number (treat as 'all')
        if ((int) $perPage <= 0) {
            $perPage = 100000;
        }

        $employees = $query->paginate($perPage);
        return response()->json(['success' => true, 'employees' => $employees]);
    }

    public function storeSalaryStructure(Request $request, $employeeId)
    {
        $validator = Validator::make($request->all(), [
            'basic_salary' => 'required|numeric|min:0',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after:effective_from',
            'allowances' => 'array',
            'allowances.*.allowance_type_id' => 'required|exists:allowance_types,id',
            'allowances.*.amount' => 'required|numeric|min:0',
            'deductions' => 'array',
            'deductions.*.deduction_type_id' => 'required|exists:deduction_types,id',
            'deductions.*.amount' => 'required|numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $employee = Employee::findOrFail($employeeId);

        DB::beginTransaction();
        try {
            // Deactivate existing salary structure
            EmployeeSalaryStructure::where('employee_id', $employeeId)
                ->where('is_active', true)
                ->update(['is_active' => false, 'effective_to' => Carbon::parse($request->effective_from)->subDay()]);

            // Create new salary structure
            $salaryStructure = EmployeeSalaryStructure::create([
                'employee_id' => $employeeId,
                'basic_salary' => $request->basic_salary,
                'effective_from' => $request->effective_from,
                'effective_to' => $request->effective_to,
                'is_active' => true,
                'created_by' => Auth::id()
            ]);

            // Remove existing allowances and deductions for this employee
            EmployeeAllowance::where('employee_id', $employeeId)->delete();
            EmployeeDeduction::where('employee_id', $employeeId)->delete();

            // Create allowances
            if ($request->has('allowances') && is_array($request->allowances)) {
                foreach ($request->allowances as $allowance) {
                    EmployeeAllowance::create([
                        'employee_id' => $employeeId,
                        'allowance_type_id' => $allowance['allowance_type_id'],
                        'amount' => $allowance['amount'],
                        'effective_from' => $request->effective_from,
                        'effective_to' => $request->effective_to,
                        'is_active' => true,
                        'created_by' => Auth::id()
                    ]);
                }
            }

            // Create deductions
            if ($request->has('deductions') && is_array($request->deductions)) {
                foreach ($request->deductions as $deduction) {
                    EmployeeDeduction::create([
                        'employee_id' => $employeeId,
                        'deduction_type_id' => $deduction['deduction_type_id'],
                        'amount' => $deduction['amount'],
                        'effective_from' => $request->effective_from,
                        'effective_to' => $request->effective_to,
                        'is_active' => true,
                        'created_by' => Auth::id()
                    ]);
                }
            }

            DB::commit();
            return response()->json(['success' => true, 'salaryStructure' => $salaryStructure], 201);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['success' => false, 'message' => 'Error creating salary structure: ' . $e->getMessage()], 500);
        }
    }

    public function updateSalaryStructure(Request $request, $employeeId)
    {
        $validator = Validator::make($request->all(), [
            'basic_salary' => 'required|numeric|min:0',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after:effective_from'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $salaryStructure = EmployeeSalaryStructure::where('employee_id', $employeeId)
            ->where('is_active', true)
            ->firstOrFail();

        $salaryStructure->update([
            'basic_salary' => $request->basic_salary,
            'effective_from' => $request->effective_from,
            'effective_to' => $request->effective_to,
            'updated_by' => Auth::id()
        ]);

        return response()->json(['success' => true, 'salaryStructure' => $salaryStructure]);
    }

    public function getEmployeeSalaryDetails($employeeId)
    {
        $employee = Employee::with([
            'salaryStructure',
            'allowances.allowanceType',
            'deductions.deductionType',
            'department',
            'employeeType'
        ])->findOrFail($employeeId);

        return response()->json(['success' => true, 'employee' => $employee]);
    }

    // Employee Allowances Management
    public function storeEmployeeAllowance(Request $request, $employeeId)
    {
        $validator = Validator::make($request->all(), [
            'allowance_type_id' => 'required|exists:allowance_types,id',
            'amount' => 'required_without:percentage|nullable|numeric|min:0',
            'percentage' => 'required_without:amount|nullable|numeric|min:0|max:100',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after:effective_from'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $allowance = EmployeeAllowance::create([
            'employee_id' => $employeeId,
            'allowance_type_id' => $request->allowance_type_id,
            'amount' => $request->amount,
            'percentage' => $request->percentage,
            'effective_from' => $request->effective_from,
            'effective_to' => $request->effective_to,
            'is_active' => true
        ]);

        $allowance->load('allowanceType');
        return response()->json(['success' => true, 'allowance' => $allowance], 201);
    }

    public function updateEmployeeAllowance(Request $request, $id)
    {
        $allowance = EmployeeAllowance::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'amount' => 'required_without:percentage|nullable|numeric|min:0',
            'percentage' => 'required_without:amount|nullable|numeric|min:0|max:100',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after:effective_from',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $allowance->update($request->all());
        $allowance->load('allowanceType');

        return response()->json(['success' => true, 'allowance' => $allowance]);
    }

    public function deleteEmployeeAllowance($id)
    {
        $allowance = EmployeeAllowance::findOrFail($id);
        $allowance->update(['is_active' => false, 'effective_to' => now()]);

        return response()->json(['success' => true, 'message' => 'Employee allowance deactivated successfully']);
    }

    // Employee Deductions Management
    public function storeEmployeeDeduction(Request $request, $employeeId)
    {
        $validator = Validator::make($request->all(), [
            'deduction_type_id' => 'required|exists:deduction_types,id',
            'amount' => 'required_without:percentage|nullable|numeric|min:0',
            'percentage' => 'required_without:amount|nullable|numeric|min:0|max:100',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after:effective_from'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $deduction = EmployeeDeduction::create([
            'employee_id' => $employeeId,
            'deduction_type_id' => $request->deduction_type_id,
            'amount' => $request->amount,
            'percentage' => $request->percentage,
            'effective_from' => $request->effective_from,
            'effective_to' => $request->effective_to,
            'is_active' => true
        ]);

        $deduction->load('deductionType');
        return response()->json(['success' => true, 'deduction' => $deduction], 201);
    }

    public function updateEmployeeDeduction(Request $request, $id)
    {
        $deduction = EmployeeDeduction::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'amount' => 'required_without:percentage|nullable|numeric|min:0',
            'percentage' => 'required_without:amount|nullable|numeric|min:0|max:100',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after:effective_from',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $deduction->update($request->all());
        $deduction->load('deductionType');

        return response()->json(['success' => true, 'deduction' => $deduction]);
    }

    public function deleteEmployeeDeduction($id)
    {
        $deduction = EmployeeDeduction::findOrFail($id);
        $deduction->update(['is_active' => false, 'effective_to' => now()]);

        return response()->json(['success' => true, 'message' => 'Employee deduction deactivated successfully']);
    }

    // Payroll Periods Management
    public function getPayrollPeriods(Request $request)
    {
        $periods = PayrollPeriod::orderBy('start_date', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json(['success' => true, 'periods' => $periods]);
    }

    public function storePayrollPeriod(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'period_name' => 'nullable|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'pay_date' => 'nullable|date|after_or_equal:end_date',
            'status' => 'nullable|in:draft,active,processing,completed,paid',
            'description' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // Check for overlapping periods
        $overlapping = PayrollPeriod::where(function ($query) use ($request) {
            $query
                ->whereBetween('start_date', [$request->start_date, $request->end_date])
                ->orWhereBetween('end_date', [$request->start_date, $request->end_date])
                ->orWhere(function ($q) use ($request) {
                    $q
                        ->where('start_date', '<=', $request->start_date)
                        ->where('end_date', '>=', $request->end_date);
                });
        })->exists();

        if ($overlapping) {
            return response()->json([
                'success' => false,
                'message' => 'Payroll period overlaps with existing period'
            ], 422);
        }

        $periodName = $request->period_name ?: PayrollPeriod::generatePeriodName($request->start_date, $request->end_date);

        $period = PayrollPeriod::create([
            'period_name' => $periodName,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'pay_date' => $request->pay_date,
            'status' => $request->status ?: 'draft',
            'description' => $request->description,
            'created_by' => Auth::id()
        ]);

        return response()->json(['success' => true, 'period' => $period], 201);
    }

    public function updatePayrollPeriod(Request $request, $id)
    {
        $period = PayrollPeriod::findOrFail($id);

        if (!$period->isEditable()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot edit processed payroll period'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'period_name' => 'nullable|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'pay_date' => 'nullable|date|after_or_equal:end_date'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $period->update($request->all());
        return response()->json(['success' => true, 'period' => $period]);
    }

    public function deletePayrollPeriod($id)
    {
        $period = PayrollPeriod::findOrFail($id);

        if ($period->status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete paid payroll period'
            ], 422);
        }

        $period->delete();
        return response()->json(['success' => true, 'message' => 'Payroll period deleted successfully']);
    }

    public function markPeriodAsPaid($id)
    {
        $period = PayrollPeriod::findOrFail($id);

        // Validate period can be marked as paid
        if ($period->status !== 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Only completed periods can be marked as paid'
            ], 422);
        }

        // Check if all payslips are approved
        $unapprovedPayslips = $period->payslips()->where('status', '!=', 'approved')->count();
        if ($unapprovedPayslips > 0) {
            return response()->json([
                'success' => false,
                'message' => "Cannot mark as paid. {$unapprovedPayslips} payslips are not yet approved."
            ], 422);
        }

        // Mark period as paid
        $period->update(['status' => 'paid']);

        // Optionally mark all payslips as paid too
        $period->payslips()->update(['status' => 'paid']);

        return response()->json([
            'success' => true,
            'message' => 'Period marked as paid successfully',
            'period' => $period
        ]);
    }

    // Payroll Processing
    public function processPayroll(Request $request, $periodId)
    {
        $validator = Validator::make($request->all(), [
            'employee_ids' => 'nullable|array',
            'employee_ids.*' => 'exists:employees,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $employeeIds = $request->get('employee_ids');

        // If a token is provided, resolve employee ids from cache
        if ($request->has('token')) {
            $session = Cache::get('payroll_preview_' . $request->get('token'));
            if ($session && isset($session['employee_ids'])) {
                $employeeIds = $session['employee_ids'];
            }
        }

        $result = $this->payrollService->processPayrollForPeriod($periodId, $employeeIds);

        return response()->json($result);
    }

    /**
     * Create a short-lived preview session and return a token.
     */
    public function createPreviewSession(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'period_id' => 'nullable|exists:payroll_periods,id',
            'employee_ids' => 'nullable|array',
            'employee_ids.*' => 'exists:employees,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $token = Str::random(40);
        $payload = [
            'period_id' => $request->get('period_id'),
            'employee_ids' => $request->get('employee_ids', [])
        ];

        Cache::put('payroll_preview_' . $token, $payload, now()->addMinutes(30));

        return response()->json(['success' => true, 'token' => $token]);
    }

    public function previewPayroll(Request $request, $periodId)
    {
        $period = PayrollPeriod::findOrFail($periodId);

        $employeeIds = $request->get('employee_ids');

        // If a preview session token is provided, try to read employee_ids from cache
        if ($request->has('token')) {
            $session = Cache::get('payroll_preview_' . $request->get('token'));
            if ($session && isset($session['employee_ids'])) {
                $employeeIds = $session['employee_ids'];
            }

            // If session contains period_id and route param is empty, use it
            if ($session && empty($periodId) && isset($session['period_id'])) {
                $periodId = $session['period_id'];
                $period = PayrollPeriod::findOrFail($periodId);
            }
        }

        $query = Employee::with(['salaryStructure', 'allowances', 'deductions', 'department']);

        if ($employeeIds) {
            $query->whereIn('id', $employeeIds);
        }

        $employees = $query->get();
        $preview = [];

        // Batch fetch CTS orders for all employees in the preview to avoid per-employee queries
        $ordersByEmployee = collect();
        try {
            if ($employees->count() > 0) {
                $employeeIdsList = $employees->pluck('id')->toArray();
                $periodStart = Carbon::parse($period->start_date)->startOfDay();
                $periodEnd = Carbon::parse($period->end_date)->endOfDay();

                $ctsOrders = Order::whereIn('employee_id', $employeeIdsList)
                    ->where('payment_method', 'cts')
                    ->whereNull('deducted_in_payslip_id')
                    ->whereBetween('paid_at', [$periodStart, $periodEnd])
                    ->get()
                    ->groupBy('employee_id');

                $ordersByEmployee = $ctsOrders;
            }
        } catch (\Exception $ex) {
            $ordersByEmployee = collect();
        }

        foreach ($employees as $employee) {
            if (!$employee->salaryStructure)
                continue;

            // Calculate preview data (simplified version)
            $basicSalary = $employee->salaryStructure->basic_salary;
            $totalAllowances = $employee->allowances->sum(function ($allowance) use ($basicSalary) {
                return $allowance->calculateAmount($basicSalary);
            });
            $totalDeductions = $employee->deductions->sum(function ($deduction) use ($basicSalary) {
                return $deduction->calculateAmount($basicSalary);
            });

            // Include CTS orders (paid within the payroll period) as additional deductions (from batched result)
            $orderDeductions = [];
            $totalOrderDeductions = 0;
            $ctsOrdersForEmployee = $ordersByEmployee->get($employee->id, collect());
            foreach ($ctsOrdersForEmployee as $order) {
                $amt = $order->total_price ?? 0;
                $amt = (float) $amt;
                $orderDeductions[] = [
                    'id' => $order->id,
                    'paid_at' => $order->paid_at ? (string) $order->paid_at : null,
                    'amount' => $amt,
                    'payment_method' => $order->payment_method,
                    'note' => $order->payment_note ?? $order->remark ?? null,
                    'deducted_at' => $order->deducted_at ? (string) $order->deducted_at : null,
                ];
                $totalOrderDeductions += $amt;
            }

            // Add order-based deductions to total deductions
            $totalDeductionsWithOrders = $totalDeductions + $totalOrderDeductions;

            $preview[] = [
                'employee_id' => $employee->id,
                'employee_name' => $employee->name,
                'employee_number' => $employee->employee_id,
                'department' => $employee->department->name ?? 'N/A',
                'basic_salary' => $basicSalary,
                'total_allowances' => $totalAllowances,
                'total_deductions' => $totalDeductions,
                'total_order_deductions' => $totalOrderDeductions,
                'order_deductions' => $orderDeductions,
                'gross_salary' => $basicSalary + $totalAllowances,
                'net_salary' => $basicSalary + $totalAllowances - $totalDeductionsWithOrders
            ];
        }

        // Support pagination for preview results
        $page = (int) $request->get('page', 1);
        $perPage = (int) $request->get('per_page', 15);

        $collection = collect($preview);
        $slice = $collection->forPage($page, $perPage)->values();

        $paginator = new \Illuminate\Pagination\LengthAwarePaginator(
            $slice,
            $collection->count(),
            $perPage,
            $page,
            ['path' => url()->current(), 'query' => request()->query()]
        );

        return response()->json(['success' => true, 'preview' => $paginator]);
    }

    // Payslips Management
    public function getPeriodPayslips(Request $request, $periodId)
    {
        $query = Payslip::with([
            'employee:id,name,employee_id,department_id',
            'employee.department:id,name',
            'employee.user:id,name'
        ])->where('payroll_period_id', $periodId);

        // Apply search filter
        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $query->whereHas('employee', function ($q) use ($searchTerm) {
                $q
                    ->where('name', 'like', "%{$searchTerm}%")
                    ->orWhere('employee_id', 'like', "%{$searchTerm}%")
                    ->orWhereHas('user', function ($userQuery) use ($searchTerm) {
                        $userQuery->where('name', 'like', "%{$searchTerm}%");
                    });
            });
        }

        // Apply status filter
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $payslips = $query->paginate($request->get('per_page', 15));

        // Attach CTS order deductions to each payslip (batch fetch) so front-end can display them
        try {
            $period = PayrollPeriod::find($periodId);
            if ($period) {
                $periodStart = Carbon::parse($period->start_date)->startOfDay();
                $periodEnd = Carbon::parse($period->end_date)->endOfDay();

                $employeeIds = collect($payslips->items())->pluck('employee_id')->unique()->filter()->values()->toArray();
                if (!empty($employeeIds)) {
                    $ctsOrders = Order::whereIn('employee_id', $employeeIds)
                        ->where('payment_method', 'cts')
                        ->whereNull('deducted_in_payslip_id')
                        ->whereBetween('paid_at', [$periodStart, $periodEnd])
                        ->get()
                        ->groupBy('employee_id');

                    // Attach per-payslip
                    $payslips->getCollection()->transform(function ($payslip) use ($ctsOrders) {
                        $empOrders = $ctsOrders->get($payslip->employee_id, collect());
                        $payslip->order_deductions = $empOrders->map(function ($o) {
                            return [
                                'id' => $o->id,
                                'paid_at' => $o->paid_at ? (string) $o->paid_at : null,
                                'amount' => (float) ($o->total_price ?? $o->paid_amount ?? $o->amount ?? 0),
                                'note' => $o->payment_note ?? $o->remark ?? null,
                                'deducted_at' => $o->deducted_at ? (string) $o->deducted_at : null
                            ];
                        })->values();
                        $payslip->total_order_deductions = (float) collect($payslip->order_deductions)->sum('amount');
                        return $payslip;
                    });
                }
            }
        } catch (\Exception $e) {
            // fail silently - don't break the API if orders lookup fails
        }

        return response()->json(['success' => true, 'payslips' => $payslips]);
    }

    public function getPayslip($payslipId)
    {
        $payslip = Payslip::with([
            'employee',
            'payrollPeriod',
            'allowances.allowanceType',
            'deductions.deductionType'
        ])->findOrFail($payslipId);

        // Attach CTS order deductions for this payslip (employee + period)
        try {
            $period = $payslip->payrollPeriod;
            if ($period && $payslip->employee_id) {
                $periodStart = Carbon::parse($period->start_date)->startOfDay();
                $periodEnd = Carbon::parse($period->end_date)->endOfDay();

                $ctsOrders = Order::where('employee_id', $payslip->employee_id)
                    ->where('payment_method', 'cts')
                    ->whereNull('deducted_in_payslip_id')
                    ->whereBetween('paid_at', [$periodStart, $periodEnd])
                    ->get();

                $payslip->order_deductions = $ctsOrders->map(function ($o) {
                    return [
                        'id' => $o->id,
                        'paid_at' => $o->paid_at ? (string) $o->paid_at : null,
                        'amount' => (float) ($o->total_price ?? $o->paid_amount ?? $o->amount ?? 0),
                        'note' => $o->payment_note ?? $o->remark ?? null,
                        'deducted_at' => $o->deducted_at ? (string) $o->deducted_at : null
                    ];
                })->values();
                $payslip->total_order_deductions = $payslip->order_deductions->sum('amount');
            } else {
                $payslip->order_deductions = collect();
                $payslip->total_order_deductions = 0;
            }
        } catch (\Exception $e) {
            $payslip->order_deductions = collect();
            $payslip->total_order_deductions = 0;
        }

        return response()->json(['success' => true, 'payslip' => $payslip]);
    }

    public function approvePayslip($payslipId)
    {
        $payslip = Payslip::findOrFail($payslipId);

        if (!$payslip->canBeApproved()) {
            return response()->json([
                'success' => false,
                'message' => 'Payslip cannot be approved in current status'
            ], 422);
        }

        $payslip->approve();
        return response()->json(['success' => true, 'payslip' => $payslip]);
    }

    public function rejectPayslip($payslipId)
    {
        $payslip = Payslip::findOrFail($payslipId);

        if ($payslip->status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot reject a paid payslip'
            ], 422);
        }

        $payslip->update(['status' => 'rejected']);
        return response()->json(['success' => true, 'payslip' => $payslip]);
    }

    public function revertPayslipToDraft($payslipId)
    {
        $payslip = Payslip::findOrFail($payslipId);

        if ($payslip->status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot revert a paid payslip'
            ], 422);
        }

        if ($payslip->status === 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Payslip is already in draft status'
            ], 422);
        }

        $payslip->update(['status' => 'draft']);
        return response()->json(['success' => true, 'payslip' => $payslip]);
    }

    public function bulkApprovePayslips(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'payslip_ids' => 'required|array',
            'payslip_ids.*' => 'exists:payslips,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $approved = 0;
        foreach ($request->payslip_ids as $payslipId) {
            $payslip = Payslip::find($payslipId);
            if ($payslip && $payslip->canBeApproved()) {
                $payslip->approve();
                $approved++;
            }
        }

        return response()->json([
            'success' => true,
            'message' => "{$approved} payslips approved successfully"
        ]);
    }

    public function markPayslipAsPaid($payslipId)
    {
        $payslip = Payslip::findOrFail($payslipId);

        if (!$payslip->canBePaid()) {
            return response()->json([
                'success' => false,
                'message' => 'Payslip must be approved before marking as paid'
            ], 422);
        }

        $payslip->markAsPaid();
        return response()->json(['success' => true, 'payslip' => $payslip]);
    }

    // Reports
    public function getSummaryReport($periodId)
    {
        $period = PayrollPeriod::findOrFail($periodId);

        // Get payslips for this period
        $payslips = Payslip::with(['employee', 'employee.department'])
            ->where('payroll_period_id', $periodId)
            ->get();

        // Calculate summary data
        $summary = [
            'total_employees' => $payslips->count(),
            'total_gross_salary' => $payslips->sum('gross_salary'),
            'total_deductions' => $payslips->sum('total_deductions'),
            'total_net_salary' => $payslips->sum('net_salary'),
            'total_allowances' => $payslips->sum('total_allowances'),
            'department_breakdown' => $this->getDepartmentBreakdown($payslips)
        ];

        return response()->json(['success' => true, 'report' => $summary]);
    }

    private function getDepartmentBreakdown($payslips)
    {
        $breakdown = [];

        foreach ($payslips as $payslip) {
            $deptName = $payslip->employee->department->name ?? 'No Department';

            if (!isset($breakdown[$deptName])) {
                $breakdown[$deptName] = [
                    'employee_count' => 0,
                    'total_gross_salary' => 0,
                    'total_deductions' => 0,
                    'total_net_salary' => 0,
                    'total_allowances' => 0
                ];
            }

            $breakdown[$deptName]['employee_count']++;
            $breakdown[$deptName]['total_gross_salary'] += $payslip->gross_salary ?? 0;
            $breakdown[$deptName]['total_deductions'] += $payslip->total_deductions ?? 0;
            $breakdown[$deptName]['total_net_salary'] += $payslip->net_salary ?? 0;
            $breakdown[$deptName]['total_allowances'] += $payslip->total_allowances ?? 0;
        }

        return $breakdown;
    }

    public function getDetailedReport($periodId)
    {
        $period = PayrollPeriod::findOrFail($periodId);

        $payslips = Payslip::with([
            'employee:id,name,employee_id,department_id',
            'employee.department:id,name',
            'employee.user:id,name',
            'allowances.allowanceType:id,name',
            'deductions.deductionType:id,name'
        ])->where('payroll_period_id', $periodId)->get();

        // Calculate totals for the report
        $totals = [
            'total_employees' => $payslips->count(),
            'total_gross_salary' => $payslips->sum('gross_salary'),
            'total_deductions' => $payslips->sum('total_deductions'),
            'total_net_salary' => $payslips->sum('net_salary'),
            'total_allowances' => $payslips->sum('total_allowances'),
        ];

        return response()->json([
            'success' => true,
            'report' => [
                'period' => $period,
                'payslips' => $payslips,
                'totals' => $totals
            ]
        ]);
    }

    public function getDepartmentWiseReport($periodId)
    {
        $payslips = Payslip::where('payroll_period_id', $periodId)->get();
        $departmentWise = $payslips->groupBy('department')->map(function ($departmentPayslips) {
            return [
                'employee_count' => $departmentPayslips->count(),
                'total_basic_salary' => $departmentPayslips->sum('basic_salary'),
                'total_allowances' => $departmentPayslips->sum('total_allowances'),
                'total_deductions' => $departmentPayslips->sum('total_deductions'),
                'total_gross_salary' => $departmentPayslips->sum('gross_salary'),
                'total_net_salary' => $departmentPayslips->sum('net_salary')
            ];
        });

        return response()->json(['success' => true, 'departmentWise' => $departmentWise]);
    }

    public function getEmployeePayrollHistory($employeeId)
    {
        $payslips = Payslip::with('payrollPeriod')
            ->where('employee_id', $employeeId)
            ->orderBy('created_at', 'desc')
            ->paginate(12);

        return response()->json(['success' => true, 'payslips' => $payslips]);
    }

    // Dashboard Stats
    public function getDashboardStats()
    {
        $stats = [
            'total_employees' => Employee::count(),
            'employees_with_salary' => Employee::whereHas('salaryStructure')->count(),
            'current_period' => PayrollPeriod::where('status', 'processing')->first(),
            'pending_payslips' => Payslip::where('status', 'draft')->count(),
            'this_month_payroll' => PayrollPeriod::whereMonth('start_date', now()->month)
                ->whereYear('start_date', now()->year)
                ->first(),
            'recent_periods' => PayrollPeriod::orderBy('start_date', 'desc')->take(5)->get()
        ];

        return response()->json(['success' => true, 'stats' => $stats]);
    }
}
