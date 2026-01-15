<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\DeductionType;
use App\Models\Employee;
use App\Models\Order;
use App\Models\PayrollPeriod;
use App\Models\PayrollSetting;
use App\Models\Payslip;
use App\Models\PayslipAllowance;
use App\Models\PayslipDeduction;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PayrollProcessingService
{
    protected $settings;

    public function __construct()
    {
        $this->settings = PayrollSetting::first();
    }

    /**
     * Process payroll for a specific period
     */
    public function processPayrollForPeriod($periodId, $employeeIds = null)
    {
        $period = PayrollPeriod::findOrFail($periodId);

        $employeesQuery = Employee::with([
            'salaryStructure' => function ($query) {
                $query->where('is_active', true)->latest();
            },
            'allowances' => function ($query) {
                $query->where('is_active', true);
            },
            'deductions' => function ($query) {
                $query->where('is_active', true);
            },
            'department:id,name'
        ]);

        if ($employeeIds) {
            $employeesQuery->whereIn('id', $employeeIds);
        }

        $employees = $employeesQuery->get();

        DB::beginTransaction();

        try {
            $totalEmployees = 0;
            $totalGrossAmount = 0;
            $totalDeductions = 0;
            $totalNetAmount = 0;

            // Batch fetch CTS orders for all employees to avoid per-employee queries
            $ordersByEmployee = collect();
            try {
                if ($employees->count() > 0) {
                    $employeeIdsList = $employees->pluck('id')->toArray();
                    $periodStart = Carbon::parse($period->start_date)->startOfDay();
                    $periodEnd = Carbon::parse($period->end_date)->endOfDay();

                    // Only consider CTS orders that have not been deducted yet to avoid double-deduction
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
                $employeeOrders = $ordersByEmployee->get($employee->id, collect());
                $payslip = $this->generatePayslip($employee, $period, $employeeOrders);

                if ($payslip) {
                    $totalEmployees++;
                    $totalGrossAmount += $payslip->gross_salary;
                    $totalDeductions += $payslip->total_deductions;
                    $totalNetAmount += $payslip->net_salary;
                }
            }

            // Update period totals
            $period->update([
                'total_employees' => $totalEmployees,
                'total_gross_amount' => $totalGrossAmount,
                'total_deductions' => $totalDeductions,
                'total_net_amount' => $totalNetAmount,
                'status' => 'completed',
                'processed_by' => Auth::id(),
                'processed_at' => now()
            ]);

            DB::commit();

            return [
                'success' => true,
                'message' => "Payroll processed successfully for {$totalEmployees} employees",
                'data' => [
                    'total_employees' => $totalEmployees,
                    'total_gross_amount' => $totalGrossAmount,
                    'total_net_amount' => $totalNetAmount
                ]
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Payroll processing error: ' . $e->getMessage());

            return [
                'success' => false,
                'message' => 'Error processing payroll: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Generate payslip for individual employee
     */
    public function generatePayslip($employee, $period, $employeeOrders = null)
    {
        // Check if payslip already exists
        $existingPayslip = Payslip::where('employee_id', $employee->id)
            ->where('payroll_period_id', $period->id)
            ->first();

        if ($existingPayslip) {
            return $existingPayslip;  // Skip if already processed
        }

        // Get salary structure
        $salaryStructure = $employee->salaryStructure;
        if (!$salaryStructure) {
            Log::warning("No salary structure found for employee: {$employee->name}");
            return null;
        }

        // Calculate attendance data
        $attendanceData = $this->calculateAttendanceData($employee, $period);

        // Calculate salary components
        $salaryComponents = $this->calculateSalaryComponents($employee, $attendanceData, $salaryStructure);

        // Use employeeOrders (passed from batch fetch) as CTS orders for this employee
        $totalOrderDeductions = 0;
        $orderDeductions = [];
        try {
            $ctsOrders = $employeeOrders instanceof \Illuminate\Support\Collection ? $employeeOrders : collect();
            Log::info("CTS Orders (batched) for Employee {$employee->id}: " . $ctsOrders->count());

            foreach ($ctsOrders as $order) {
                // defensive: skip orders already marked as deducted
                if (!empty($order->deducted_in_payslip_id)) {
                    continue;
                }

                $amt = $order->total_price ?? $order->paid_amount ?? $order->amount ?? 0;
                $amt = (float) $amt;
                $orderDeductions[] = [
                    'order_id' => $order->id,
                    'amount' => $amt,
                    'paid_at' => $order->paid_at ? (string) $order->paid_at : null
                ];
                $totalOrderDeductions += $amt;
            }
        } catch (\Exception $ex) {
            $totalOrderDeductions = 0;
            $orderDeductions = [];
        }

        // Adjust totals to include order deductions
        $totalDeductionsWithOrders = $salaryComponents['total_deductions'] + $totalOrderDeductions;
        $netSalaryWithOrders = ($salaryComponents['gross_salary']) - $totalDeductionsWithOrders;

        // Create payslip
        $payslip = Payslip::create([
            'payroll_period_id' => $period->id,
            'employee_id' => $employee->id,
            'employee_name' => $employee->name,
            'employee_id_number' => $employee->employee_id,
            'designation' => $employee->designation,
            'department' => $employee->department->name ?? 'N/A',
            // Salary Components
            'basic_salary' => $salaryComponents['basic_salary'],
            'total_allowances' => $salaryComponents['total_allowances'],
            'total_deductions' => $totalDeductionsWithOrders,
            'gross_salary' => $salaryComponents['gross_salary'],
            'net_salary' => $netSalaryWithOrders,
            // Attendance Data
            'total_working_days' => $attendanceData['total_working_days'],
            'days_present' => $attendanceData['days_present'],
            'days_absent' => $attendanceData['days_absent'],
            'days_late' => $attendanceData['days_late'],
            'overtime_hours' => $attendanceData['overtime_hours'],
            // Calculations
            'absent_deduction' => $salaryComponents['absent_deduction'],
            'late_deduction' => $salaryComponents['late_deduction'],
            'overtime_amount' => $salaryComponents['overtime_amount'],
            'status' => 'draft'
        ]);

        // Create allowances details
        foreach ($salaryComponents['allowances'] as $allowance) {
            PayslipAllowance::create([
                'payslip_id' => $payslip->id,
                'allowance_type_id' => $allowance['type_id'],
                'allowance_name' => $allowance['name'],
                'amount' => $allowance['amount'],
                'is_taxable' => $allowance['is_taxable']
            ]);
        }

        // Create deductions details
        foreach ($salaryComponents['deductions'] as $deduction) {
            PayslipDeduction::create([
                'payslip_id' => $payslip->id,
                'deduction_type_id' => $deduction['type_id'],
                'deduction_name' => $deduction['name'],
                'amount' => $deduction['amount']
            ]);
        }

        // Create CTS order-based deductions (if any) and map to a DeductionType
        if (!empty($orderDeductions)) {
            // Try to find an existing deduction type for CTS orders
            $ctsDeductionType = DeductionType::where('name', 'like', '%cts%')->orWhere('name', 'like', '%CTS%')->first();
            if (!$ctsDeductionType) {
                // Create a fallback deduction type
                $ctsDeductionType = DeductionType::create([
                    'name' => 'CTS Order',
                    'type' => 'fixed',
                    'is_mandatory' => false,
                    'calculation_base' => 'basic_salary',
                    'is_active' => true,
                    'description' => 'Deductions for CTS (Customer To Settle) orders'
                ]);
            }

            foreach ($orderDeductions as $od) {
                $pd = PayslipDeduction::create([
                    'payslip_id' => $payslip->id,
                    'order_id' => $od['order_id'] ?? null,
                    'deduction_type_id' => $ctsDeductionType->id,
                    'deduction_name' => 'CTS Order #' . ($od['order_id'] ?? 'N/A'),
                    'amount' => $od['amount'] ?? 0
                ]);

                // Mark the order as deducted (link back to payslip)
                try {
                    if (!empty($od['order_id'])) {
                        $order = Order::find($od['order_id']);
                        if ($order) {
                            $order->deducted_in_payslip_id = $payslip->id;
                            $order->deducted_at = now();
                            $order->save();
                        }
                    }
                } catch (\Exception $ex) {
                    // Ignore order update failures
                }
            }
        }

        return $payslip;
    }

    /**
     * Calculate attendance data for employee in period
     */
    private function calculateAttendanceData($employee, $period)
    {
        $attendances = Attendance::where('employee_id', $employee->id)
            ->whereBetween('date', [$period->start_date, $period->end_date])
            ->get();

        $totalWorkingDays = $this->calculateWorkingDays($period->start_date, $period->end_date);
        $daysPresent = $attendances->whereIn('status', ['present', 'late'])->count();
        $daysAbsent = $attendances->where('status', 'absent')->count();
        $daysLate = $attendances->where('status', 'late')->count();

        // Calculate overtime hours
        $overtimeHours = 0;
        foreach ($attendances as $attendance) {
            if ($attendance->check_in && $attendance->check_out) {
                $checkIn = Carbon::parse($attendance->check_in);
                $checkOut = Carbon::parse($attendance->check_out);
                $hoursWorked = $checkOut->diffInHours($checkIn);

                if ($hoursWorked > $this->settings->working_hours_per_day) {
                    $overtimeHours += $hoursWorked - $this->settings->working_hours_per_day;
                }
            }
        }

        return [
            'total_working_days' => $totalWorkingDays,
            'days_present' => $daysPresent,
            'days_absent' => $daysAbsent,
            'days_late' => $daysLate,
            'overtime_hours' => $overtimeHours
        ];
    }

    /**
     * Calculate salary components
     */
    private function calculateSalaryComponents($employee, $attendanceData, $salaryStructure)
    {
        $basicSalary = $salaryStructure->basic_salary;
        $dailySalary = $basicSalary / $this->settings->working_days_per_month;

        // Calculate allowances
        $allowances = [];
        $totalAllowances = 0;

        foreach ($employee->allowances as $employeeAllowance) {
            $amount = 0;

            if ($employeeAllowance->allowanceType->type === 'fixed') {
                $amount = $employeeAllowance->amount;
            } elseif ($employeeAllowance->allowanceType->type === 'percentage') {
                $amount = ($basicSalary * $employeeAllowance->percentage) / 100;
            }

            $allowances[] = [
                'type_id' => $employeeAllowance->allowance_type_id,
                'name' => $employeeAllowance->allowanceType->name,
                'amount' => $amount,
                'is_taxable' => $employeeAllowance->allowanceType->is_taxable
            ];

            $totalAllowances += $amount;
        }

        // Apply global allowances (is_global = true)
        $existingAllowanceTypeIds = collect($allowances)->pluck('type_id')->toArray();
        $globalAllowanceTypes = \App\Models\AllowanceType::where('is_active', true)
            ->where('is_global', true)
            ->whereNotIn('id', $existingAllowanceTypeIds)  // Avoid duplicates
            ->get();

        foreach ($globalAllowanceTypes as $globalType) {
            $amount = 0;
            if ($globalType->type === 'fixed') {
                $amount = $globalType->default_amount ?? 0;
            } elseif ($globalType->type === 'percentage') {
                $amount = ($basicSalary * ($globalType->percentage ?? 0)) / 100;
            }

            if ($amount > 0) {
                $allowances[] = [
                    'type_id' => $globalType->id,
                    'name' => $globalType->name . ' (Global)',
                    'amount' => $amount,
                    'is_taxable' => $globalType->is_taxable
                ];
                $totalAllowances += $amount;
            }
        }

        // Calculate deductions
        $deductions = [];
        $totalDeductions = 0;

        foreach ($employee->deductions as $employeeDeduction) {
            $amount = 0;
            $calculationBase = $employeeDeduction->deductionType->calculation_base === 'basic_salary'
                ? $basicSalary
                : ($basicSalary + $totalAllowances);

            if ($employeeDeduction->deductionType->type === 'fixed') {
                $amount = $employeeDeduction->amount;
            } elseif ($employeeDeduction->deductionType->type === 'percentage') {
                $amount = ($calculationBase * $employeeDeduction->percentage) / 100;
            }

            $deductions[] = [
                'type_id' => $employeeDeduction->deduction_type_id,
                'name' => $employeeDeduction->deductionType->name,
                'amount' => $amount
            ];

            $totalDeductions += $amount;
        }

        // Apply global deductions (is_global = true)
        $existingDeductionTypeIds = collect($deductions)->pluck('type_id')->toArray();
        $globalDeductionTypes = \App\Models\DeductionType::where('is_active', true)
            ->where('is_global', true)
            ->whereNotIn('id', $existingDeductionTypeIds)
            ->get();

        foreach ($globalDeductionTypes as $globalType) {
            $calculationBase = ($globalType->calculation_base ?? 'basic_salary') === 'basic_salary'
                ? $basicSalary
                : ($basicSalary + $totalAllowances);

            $amount = 0;
            if ($globalType->type === 'fixed') {
                $amount = $globalType->default_amount ?? 0;
            } elseif ($globalType->type === 'percentage') {
                $amount = ($calculationBase * ($globalType->percentage ?? 0)) / 100;
            }

            if ($amount > 0) {
                $deductions[] = [
                    'type_id' => $globalType->id,
                    'name' => $globalType->name . ' (Global)',
                    'amount' => $amount
                ];
                $totalDeductions += $amount;
            }
        }

        // Calculate overtime amount
        $overtimeAmount = $attendanceData['overtime_hours']
            * ($basicSalary / ($this->settings->working_days_per_month * $this->settings->working_hours_per_day))
            * $this->settings->overtime_rate_multiplier;

        // Add overtime to allowances
        $totalAllowances += $overtimeAmount;

        // Calculate Gross Salary first so we can use it for Tax
        $grossSalary = $basicSalary + $totalAllowances;

        // Calculate Income Tax based on slabs
        $taxAmount = 0;
        $taxSlabs = $this->settings->tax_slabs ?? [];

        if (!empty($taxSlabs) && is_array($taxSlabs)) {
            // Sort slabs by min_salary to ensure correct order check
            usort($taxSlabs, function ($a, $b) {
                return $a['min_salary'] <=> $b['min_salary'];
            });

            foreach ($taxSlabs as $slab) {
                $minSalary = $slab['min_salary'];
                $maxSalary = $slab['max_salary'];
                $fixedAmount = $slab['fixed_amount'] ?? 0;
                $taxRate = $slab['tax_rate'] ?? 0;

                // Normalize Yearly to Monthly
                if (($slab['frequency'] ?? 'monthly') === 'yearly') {
                    $minSalary = $minSalary / 12;
                    if (!is_null($maxSalary)) {
                        $maxSalary = $maxSalary / 12;
                    }
                    $fixedAmount = $fixedAmount / 12;
                }

                // Check if salary falls in this slab
                // If max_salary is null, it means "above min_salary"
                if ($grossSalary >= $minSalary && (is_null($maxSalary) || $grossSalary <= $maxSalary)) {
                    // Calculate Tax
                    // Logic: (Gross - Min) * Rate% + Fixed
                    // Note: This is a direct slab check as per user request ("if has salary 50k plus above then this tax employe cut")
                    // It is NOT a progressive tax calculation (where you pay different rates for different chunks of salary).
                    // It applies the rule of the matching slab.

                    $taxableAmount = $grossSalary - $minSalary;
                    $calculatedTax = ($taxableAmount * $taxRate / 100) + $fixedAmount;

                    $taxAmount = $calculatedTax;
                    break;  // Stop after finding the matching slab
                }
            }
        }

        if ($taxAmount > 0) {
            // Find or Create Income Tax Deduction Type
            $taxDeductionType = DeductionType::firstOrCreate(
                ['name' => 'Income Tax'],
                [
                    'type' => 'fixed',
                    'is_mandatory' => true,
                    'calculation_base' => 'gross_salary',
                    'is_active' => true,
                    'description' => 'Auto-calculated Income Tax'
                ]
            );

            $deductions[] = [
                'type_id' => $taxDeductionType->id,
                'name' => 'Income Tax',
                'amount' => $taxAmount
            ];
            $totalDeductions += $taxAmount;
        }

        // Calculate absent deduction
        $absentDeduction = 0;
        if ($attendanceData['days_absent'] > $this->settings->max_allowed_absents) {
            $excessAbsents = $attendanceData['days_absent'] - $this->settings->max_allowed_absents;

            if ($this->settings->absent_deduction_type === 'full_day') {
                $absentDeduction = $dailySalary * $excessAbsents;
            } elseif ($this->settings->absent_deduction_type === 'fixed_amount') {
                $absentDeduction = $this->settings->absent_deduction_amount * $excessAbsents;
            }
        }

        // Calculate late deduction
        $lateDeduction = $attendanceData['days_late'] * $this->settings->late_deduction_per_minute * 60;  // Assuming 1 hour late per day

        // Add attendance-based deductions to total
        $totalDeductions += $absentDeduction + $lateDeduction;

        // Calculate Salary Advance Deductions
        $advanceDeduction = 0;
        if (\Illuminate\Support\Facades\Schema::hasTable('employee_advances')) {
            $activeAdvances = \App\Models\EmployeeAdvance::where('employee_id', $employee->id)
                ->where('status', 'paid')
                ->where('remaining_amount', '>', 0)
                ->get();

            foreach ($activeAdvances as $advance) {
                $monthlyDeduction = min($advance->monthly_deduction, $advance->remaining_amount);

                if ($monthlyDeduction > 0) {
                    $advanceDeduction += $monthlyDeduction;

                    // Add to deductions array
                    $deductions[] = [
                        'type_id' => null,
                        'name' => 'Salary Advance (ID: ' . $advance->id . ')',
                        'amount' => $monthlyDeduction
                    ];

                    // Update remaining amount
                    $newRemaining = $advance->remaining_amount - $monthlyDeduction;
                    $advance->update([
                        'remaining_amount' => $newRemaining,
                        'status' => $newRemaining <= 0 ? 'deducted' : 'paid'
                    ]);
                }
            }

            $totalDeductions += $advanceDeduction;
        }

        // ========================================
        // LOAN DEDUCTIONS (Auto from disbursed loans)
        // ========================================
        $loanDeduction = 0;
        if (\Illuminate\Support\Facades\Schema::hasTable('employee_loans')) {
            $activeLoans = \App\Models\EmployeeLoan::where('employee_id', $employee->id)
                ->where('status', 'disbursed')
                ->where('remaining_amount', '>', 0)
                ->get();

            foreach ($activeLoans as $loan) {
                $deductAmount = min($loan->monthly_deduction, $loan->remaining_amount);
                $loanDeduction += $deductAmount;

                $deductions[] = [
                    'deduction_name' => 'Loan Installment (ID: ' . $loan->id . ')',
                    'deduction_type' => 'fixed',
                    'amount' => $deductAmount,
                ];

                // Update loan
                $newPaid = $loan->total_paid + $deductAmount;
                $newRemaining = $loan->remaining_amount - $deductAmount;
                $newInstallmentsPaid = $loan->installments_paid + 1;

                $loan->update([
                    'total_paid' => $newPaid,
                    'remaining_amount' => max(0, $newRemaining),
                    'installments_paid' => $newInstallmentsPaid,
                    'next_deduction_date' => now()->addMonth()->startOfMonth(),
                    'status' => $newRemaining <= 0 ? 'completed' : 'disbursed'
                ]);
            }

            $totalDeductions += $loanDeduction;
        }

        // Note: Overtime was already added to totalAllowances above

        $netSalary = $grossSalary - $totalDeductions;

        return [
            'basic_salary' => $basicSalary,
            'total_allowances' => $totalAllowances,
            'total_deductions' => $totalDeductions,
            'gross_salary' => $grossSalary,
            'net_salary' => $netSalary,
            'absent_deduction' => $absentDeduction,
            'late_deduction' => $lateDeduction,
            'overtime_amount' => $overtimeAmount,
            'allowances' => $allowances,
            'deductions' => $deductions,
            'tax_amount' => $taxAmount ?? 0
        ];
    }

    /**
     * Calculate working days excluding weekends
     */
    private function calculateWorkingDays($startDate, $endDate)
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);
        $workingDays = 0;

        while ($start->lte($end)) {
            if ($start->dayOfWeek !== Carbon::SUNDAY) {  // Exclude Sundays
                $workingDays++;
            }
            $start->addDay();
        }

        return $workingDays;
    }

    /**
     * Generate summary report for period
     */
    public function generateSummaryReport($period)
    {
        $payslips = Payslip::where('payroll_period_id', $period->id)->get();

        return [
            'total_employees' => $payslips->count(),
            'total_basic_salary' => $payslips->sum('basic_salary'),
            'total_allowances' => $payslips->sum('total_allowances'),
            'total_deductions' => $payslips->sum('total_deductions'),
            'total_gross_salary' => $payslips->sum('gross_salary'),
            'total_net_salary' => $payslips->sum('net_salary'),
            'total_absent_deduction' => $payslips->sum('absent_deduction'),
            'total_late_deduction' => $payslips->sum('late_deduction'),
            'total_overtime_amount' => $payslips->sum('overtime_amount'),
            'department_wise' => $this->getDepartmentWiseSummary($payslips),
            'allowances_summary' => $this->getAllowancesSummary($payslips),
            'deductions_summary' => $this->getDeductionsSummary($payslips)
        ];
    }

    /**
     * Get department wise summary
     */
    private function getDepartmentWiseSummary($payslips)
    {
        return $payslips->groupBy('department')->map(function ($departmentPayslips) {
            return [
                'employee_count' => $departmentPayslips->count(),
                'total_gross' => $departmentPayslips->sum('gross_salary'),
                'total_net' => $departmentPayslips->sum('net_salary')
            ];
        });
    }

    /**
     * Get allowances summary
     */
    private function getAllowancesSummary($payslips)
    {
        $summary = [];
        foreach ($payslips as $payslip) {
            foreach ($payslip->allowances as $allowance) {
                if (!isset($summary[$allowance->allowance_name])) {
                    $summary[$allowance->allowance_name] = 0;
                }
                $summary[$allowance->allowance_name] += $allowance->amount;
            }

            // Add Overtime as a separate allowance type if not already in allowances list
            if ($payslip->overtime_amount > 0) {
                if (!isset($summary['Overtime'])) {
                    $summary['Overtime'] = 0;
                }
                $summary['Overtime'] += $payslip->overtime_amount;
            }
        }
        return $summary;
    }

    /**
     * Get deductions summary
     */
    private function getDeductionsSummary($payslips)
    {
        $summary = [];
        foreach ($payslips as $payslip) {
            foreach ($payslip->deductions as $deduction) {
                if (!isset($summary[$deduction->deduction_name])) {
                    $summary[$deduction->deduction_name] = 0;
                }
                $summary[$deduction->deduction_name] += $deduction->amount;
            }

            // Add Absent Deduction
            if ($payslip->absent_deduction > 0) {
                if (!isset($summary['Absent Deduction'])) {
                    $summary['Absent Deduction'] = 0;
                }
                $summary['Absent Deduction'] += $payslip->absent_deduction;
            }

            // Add Late Deduction
            if ($payslip->late_deduction > 0) {
                if (!isset($summary['Late Deduction'])) {
                    $summary['Late Deduction'] = 0;
                }
                $summary['Late Deduction'] += $payslip->late_deduction;
            }
        }
        return $summary;
    }
}
