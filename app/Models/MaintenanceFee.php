<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaintenanceFee extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_id',
        'year',
        'month',
        'amount',
        'status',
        'paid_date',
    ];

    public function member()
    {
        return $this->belongsTo(Member::class);
    }

    public function invoice()
    {
        return $this->morphOne(FinancialInvoice::class, 'invoiceable');
    }
}
