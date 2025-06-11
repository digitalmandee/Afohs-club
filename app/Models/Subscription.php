<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'category', 'subscription_type', 'start_date', 'expiry_date', 'status'];

    protected $casts = ['category' => 'array'];
}
