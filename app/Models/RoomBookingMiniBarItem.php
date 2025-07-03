<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoomBookingMiniBarItem extends Model
{
    use HasFactory;
    protected $fillable = ['room_booking_id', 'item', 'amount', 'qty', 'total'];
}