<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Order extends Model
{
    use HasFactory, BelongsToTenant;

    // protected $dates = ['order_time' => 'datetime:Y-m-d\TH:i:s\Z'];

    protected $fillable = [
        'reservation_id',
        'member_id',
        'customer_id',
        'room_booking_id',
        'event_booking_id',
        'cashier_id',
        'waiter_id',
        'table_id',
        'order_type',
        'person_count',
        'down_payment',
        'nature_of_function',
        'theme_of_function',
        'special_request',
        'amount',
        'start_date',
        'start_time',
        'order_time',
        'end_time',
        'status',
        'remark',
        'instructions',
        'cancelType',
        'payment_status',
        'kitchen_note',
        'staff_note',
        'payment_note',
        'tax',
        'address',
        'discount',
        'total_price',
        'cost_price',
        'cash_amount',
        'credit_card_amount',
        'bank_amount',
        'paid_at',
        'paid_amount',
        'credit_card_type',
        'payment_method',
        'reciept',
        'tenant_id',
    ];

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function table()
    {
        return $this->belongsTo(Table::class);
    }

    public function member()
    {
        return $this->belongsTo(Member::class, 'member_id', 'user_id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'id');
    }

    public function waiter()
    {
        return $this->belongsTo(Employee::class, 'waiter_id', 'id');
    }

    // public function invoice()
    // {
    //     return $this->hasOne(FinancialInvoice::class)->whereJsonContains('data->order_id', $this->id);
    // }

    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_id', 'id');
    }
}
