<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderTaking extends Model
{
    use HasFactory;

    protected $fillable = ['order_id', 'order_item', 'status'];

    protected $casts = ['order_item' => 'array'];
}
