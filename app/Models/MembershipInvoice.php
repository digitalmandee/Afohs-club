<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MembershipInvoice extends Model
{
    protected $fillable = [
        'user_id',
        'invoice_no',
        'invoice_type',
        'subscription_type',
        'amount',
        'customer_charges',
        'discount_amount',
        'discount_details',
        'total_price',
        'paid_for_month',
        'payment_method',
        'payment_date',
        'receipt',
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