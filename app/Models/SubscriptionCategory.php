<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SubscriptionCategory extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['name', 'subscription_type_id', 'description', 'fee', 'subscription_fee', 'status', 'payment_type', 'daypass_fee'];

    // Automatically calculate daypass fee when monthly fee is set
    protected static function boot()
    {
        parent::boot();
        
        static::saving(function ($model) {
            if ($model->payment_type === 'daypass' && $model->fee) {
                $model->daypass_fee = round($model->fee / 30); // Round to whole number
            }
        });
    }

    // Accessor to get the appropriate fee based on payment type
    public function getEffectiveFeeAttribute()
    {
        return $this->payment_type === 'daypass' ? $this->daypass_fee : $this->fee;
    }

    public function subscriptionType()
    {
        return $this->belongsTo(SubscriptionType::class);
    }
}
