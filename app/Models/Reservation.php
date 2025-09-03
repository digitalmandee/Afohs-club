<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_id',
        'customer_id',
        'table_id',
        'nature_of_function',
        'theme_of_function',
        'special_request',
        'person_count',
        'down_payment',
        'date',
        'start_time',
        'end_time',
        'status',
    ];

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
        return $this->belongsTo(Customer::class);
    }
}
