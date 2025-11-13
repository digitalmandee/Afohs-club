<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class PayrollPeriod extends Model
{
    use HasFactory;

    protected $fillable = [
        'period_name',
        'start_date',
        'end_date',
        'pay_date',
        'status',
        'description',
        'total_employees',
        'total_gross_amount',
        'total_deductions',
        'total_net_amount',
        'created_by',
        'processed_by',
        'processed_at'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'pay_date' => 'date',
        'processed_at' => 'datetime',
        'total_gross_amount' => 'decimal:2',
        'total_deductions' => 'decimal:2',
        'total_net_amount' => 'decimal:2'
    ];

    /**
     * Get payslips for this period
     */
    public function payslips()
    {
        return $this->hasMany(Payslip::class);
    }

    /**
     * Get the user who created this period
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who processed this period
     */
    public function processor()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    /**
     * Scope to get periods by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to get current month period
     */
    public function scopeCurrentMonth($query)
    {
        return $query->whereMonth('start_date', now()->month)
                    ->whereYear('start_date', now()->year);
    }

    /**
     * Get formatted period name
     */
    public function getFormattedPeriodNameAttribute()
    {
        return $this->period_name ?: 
               Carbon::parse($this->start_date)->format('M Y') . ' Payroll';
    }

    /**
     * Check if period is editable
     */
    public function isEditable()
    {
        return in_array($this->status, ['draft', 'processing']);
    }

    /**
     * Check if period is processable
     */
    public function isProcessable()
    {
        return $this->status === 'draft';
    }

    /**
     * Generate period name automatically
     */
    public static function generatePeriodName($startDate, $endDate)
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);
        
        if ($start->month === $end->month) {
            return $start->format('F Y') . ' Payroll';
        } else {
            return $start->format('M') . '-' . $end->format('M Y') . ' Payroll';
        }
    }
}
