<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\PayrollPeriod;
use App\Models\Payslip;
use App\Models\PayslipAllowance;
use App\Models\PayslipDeduction;
use App\Models\Attendance;
use App\Models\PayrollSetting;
use Carbon\Carbon;
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
            'salaryStructure' => function($query) {
                $query->where('is_active', true)->latest();
            },
            'allowances' => function($query) {
                $query->where('is_active', true);
            },
            'deductions' => function($query) {
                $query->where('is_active', true);
            },
            'department:id,name',
            'employeeType:id,name'
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

            foreach ($employees as $employee) {
                $payslip = $this->generatePayslip($employee, $period);
                
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
                'processed_by' => auth()->id(),
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
    public function generatePayslip($employee, $period)
    {
        // Check if payslip already exists
        $existingPayslip = Payslip::where('employee_id', $employee->id)
                                 ->where('payroll_period_id', $period->id)
                                 ->first();

        if ($existingPayslip) {
            return $existingPayslip; // Skip if already processed
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
            'total_deductions' => $salaryComponents['total_deductions'],
            'gross_salary' => $salaryComponents['gross_salary'],
            'net_salary' => $salaryComponents['net_salary'],
            
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
        $lateDeduction = $attendanceData['days_late'] * $this->settings->late_deduction_per_minute * 60; // Assuming 1 hour late per day

        // Calculate overtime amount
        $overtimeAmount = $attendanceData['overtime_hours'] * 
                         ($basicSalary / ($this->settings->working_days_per_month * $this->settings->working_hours_per_day)) * 
                         $this->settings->overtime_rate_multiplier;

        // Add attendance-based deductions to total
        $totalDeductions += $absentDeduction + $lateDeduction;
        
        // Add overtime to allowances
        $totalAllowances += $overtimeAmount;

        $grossSalary = $basicSalary + $totalAllowances;
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
            'deductions' => $deductions
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
            if ($start->dayOfWeek !== Carbon::SUNDAY) { // Exclude Sundays
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
            'department_wise' => $this->getDepartmentWiseSummary($payslips)
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
}
