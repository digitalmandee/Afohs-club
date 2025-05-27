<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MembershipInvoice extends Model
{
    protected $fillable = [
        'user_id',
        'subscription_type',
        'amount',
        'customer_charges',
        'total_price',
        'status'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}