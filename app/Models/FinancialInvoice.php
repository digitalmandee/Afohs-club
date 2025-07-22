<?php

namespace App\Models;

class FinancialInvoice extends BaseModel
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
        'remarks',
        'status',
        'created_by',
        'updated_by',
        'deleted_by'
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