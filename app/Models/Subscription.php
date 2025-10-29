<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_id',
        'subscription_category_id',
        'subscription_type_id',
        'valid_from',
        'valid_to',
        'status',
        'qr_code'
    ];

    protected $casts = [
        'valid_from' => 'date',
        'valid_to' => 'date',
    ];

    // Polymorphic relationship to invoice
    public function invoice()
    {
        return $this->morphOne(FinancialInvoice::class, 'invoiceable');
    }

    public function member()
    {
        return $this->belongsTo(Member::class);
    }

    public function subscriptionCategory()
    {
        return $this->belongsTo(SubscriptionCategory::class);
    }

    public function subscriptionType()
    {
        return $this->belongsTo(SubscriptionType::class);
    }
}
