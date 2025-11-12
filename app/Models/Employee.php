<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends BaseModel
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['user_id', 'department_id', 'employee_type_id', 'employee_id', 'name', 'email', 'designation', 'phone_no', 'employment_type', 'address', 'emergency_no', 'gender', 'marital_status', 'national_id', 'account_no', 'salary', 'joining_date', 'created_by', 'updated_by', 'deleted_by'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function employeeType()
    {
        return $this->belongsTo(EmployeeType::class);
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function leaveApplications()
    {
        return $this->hasMany(LeaveApplication::class, 'employee_id', 'id');
    }

    /**
     * Get the current salary structure for this employee
     */
    public function salaryStructure()
    {
        return $this->hasOne(EmployeeSalaryStructure::class)->where('is_active', true)->latest();
    }

    /**
     * Get all salary structures for this employee
     */
    public function salaryStructures()
    {
        return $this->hasMany(EmployeeSalaryStructure::class);
    }

    /**
     * Get active allowances for this employee
     */
    public function allowances()
    {
        return $this->hasMany(EmployeeAllowance::class)->where('is_active', true);
    }

    /**
     * Get active deductions for this employee
     */
    public function deductions()
    {
        return $this->hasMany(EmployeeDeduction::class)->where('is_active', true);
    }

    /**
     * Get all payslips for this employee
     */
    public function payslips()
    {
        return $this->hasMany(Payslip::class);
    }

    /**
     * Get the latest payslip for this employee
     */
    public function latestPayslip()
    {
        return $this->hasOne(Payslip::class)->latest();
    }

    /**
     * Check if employee has active salary structure
     */
    public function hasActiveSalaryStructure()
    {
        return $this->salaryStructure()->exists();
    }

    /**
     * Get current basic salary
     */
    public function getCurrentBasicSalary()
    {
        $salaryStructure = $this->salaryStructure;
        return $salaryStructure ? $salaryStructure->basic_salary : 0;
    }
}
