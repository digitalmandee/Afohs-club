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
        'discount_amount',
        'discount_details',
        'amount',
        'total_price',
        'customer_charges',
        'issue_date',
        'due_date',
        'paid_for_month',
        'payment_method',
        'payment_date',
        'reciept',
        'data',
        'status'
    ];

    protected $casts = [
        'data' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}