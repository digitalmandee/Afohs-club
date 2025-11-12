<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AllowanceType extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'type',
        'is_taxable',
        'is_active',
        'description'
    ];

    protected $casts = [
        'is_taxable' => 'boolean',
        'is_active' => 'boolean'
    ];

    /**
     * Get employee allowances for this type
     */
    public function employeeAllowances()
    {
        return $this->hasMany(EmployeeAllowance::class);
    }

    /**
     * Get payslip allowances for this type
     */
    public function payslipAllowances()
    {
        return $this->hasMany(PayslipAllowance::class);
    }

    /**
     * Scope to get only active allowance types
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get only taxable allowance types
     */
    public function scopeTaxable($query)
    {
        return $query->where('is_taxable', true);
    }
}
