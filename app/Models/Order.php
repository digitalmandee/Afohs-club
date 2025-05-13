<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $dates = ['order_time'];

    protected $fillable = [
        'order_number',
        'user_id',
        'waiter_id',
        'table_id',
        'order_type',
        'person_count',
        'down_payment',
        'amount',
        'start_date',
        'start_time',
        'order_time',
        'end_time',
        'status'
    ];

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function table()
    {
        return $this->belongsTo(Table::class);
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function invoice()
    {
        return $this->hasOne(Invoices::class);
    }
}