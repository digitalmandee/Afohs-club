<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'invoice_id', 'category', 'subscription_type', 'start_date', 'expiry_date', 'status', 'qr_code'];

    protected $casts = ['category' => 'array'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function invoice()
    {
        return $this->hasOne(FinancialInvoice::class, 'id', 'invoice_id');
    }
}