<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinancialInvoice extends Model
{
    protected $fillable = [
        'invoice_no',
        'customer_id',
        'member_id',
        'subscription_type',
        'invoice_type',
        'discount_type',
        'discount_value',
        'discount_details',
        'amount',
        'total_price',
        'paid_amount',
        'customer_charges',
        'issue_date',
        'due_date',
        'paid_for_month',
        'paid_for_quarter',
        'payment_method',
        'payment_date',
        'reciept',
        'data',
        'status'
    ];

    protected $casts = [
        'data' => 'array'
    ];

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id', 'id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'member_id', 'id');
    }
}