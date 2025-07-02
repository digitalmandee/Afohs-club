<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SubscriptionCategory extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['name', 'subscription_type_id', 'description', 'fee', 'subscription_fee', 'status'];

    public function subscriptionType()
    {
        return $this->belongsTo(SubscriptionType::class);
    }
}
