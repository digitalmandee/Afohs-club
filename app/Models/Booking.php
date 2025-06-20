<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'user_id',
        'booking_type',
        'booking_For',
        'type_id',
        'persons',
        'total_rooms',
        'checkin',
        'checkout',
        'event_name',
        'start_time',
        'end_time',
        'total_payment',
        'status',
    ];
}
