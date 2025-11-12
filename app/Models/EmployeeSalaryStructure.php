<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmployeeSalaryStructure extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'employee_id',
        'basic_salary',
        'effective_from',
        'effective_to',
        'is_active',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'basic_salary' => 'decimal:2',
        'effective_from' => 'date',
        'effective_to' => 'date',
        'is_active' => 'boolean'
    ];

    /**
     * Get the employee for this salary structure
     */
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get the user who created this structure
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this structure
     */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Scope to get active salary structures
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get current salary structures
     */
    public function scopeCurrent($query)
    {
        return $query->where('effective_from', '<=', now())
                    ->where(function($q) {
                        $q->whereNull('effective_to')
                          ->orWhere('effective_to', '>=', now());
                    });
    }

    /**
     * Check if this salary structure is current
     */
    public function isCurrent()
    {
        return $this->effective_from <= now() && 
               ($this->effective_to === null || $this->effective_to >= now());
    }

    /**
     * Deactivate this salary structure
     */
    public function deactivate()
    {
        $this->update([
            'is_active' => false,
            'effective_to' => now()->subDay()
        ]);
    }
}
