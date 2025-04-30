<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'waiter_id',
        'table_id',
        'order_type',
        'person_count',
        'down_payment',
        'start_date',
        'start_time',
        'status'
    ];

    public function orderTakings()
    {
        return $this->hasMany(OrderTaking::class);
    }
}
