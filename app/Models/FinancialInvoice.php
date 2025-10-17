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
        'advance_payment',
        'paid_amount',
        'customer_charges',
        'period_start',
        'period_end',
        'issue_date',
        'due_date',
        'paid_for_month',
        'payment_method',
        'payment_date',
        'receipt', // Fixed spelling from 'reciept'
        'data',
        'remarks',
        'status',
        'created_by',
        'updated_by',
        'deleted_by',
        // New fields for transaction system
        'fee_type',
        'payment_frequency',
        'quarter_number',
        'valid_from',
        'valid_to',
        'credit_card_type',
        // Subscription fields
        'subscription_type_id',
        'subscription_category_id'
    ];

    protected $casts = [
        'data' => 'array',
        'valid_from' => 'date',
        'valid_to' => 'date',
        'issue_date' => 'date',
        'due_date' => 'date',
        'payment_date' => 'date'
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'id');
    }

    public function member()
    {
        return $this->belongsTo(Member::class, 'member_id', 'user_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by', 'id');
    }

    public function subscriptionType()
    {
        return $this->belongsTo(SubscriptionType::class, 'subscription_type_id', 'id');
    }

    public function subscriptionCategory()
    {
        return $this->belongsTo(SubscriptionCategory::class, 'subscription_category_id', 'id');
    }
}