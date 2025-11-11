<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class RoomBookingRequest extends BaseModel
{
    use HasFactory;

    protected $fillable = ['booking_date', 'check_in_date', 'check_out_date', 'booking_type', 'member_id', 'customer_id', 'room_id', 'booking_category', 'persons', 'security_deposit', 'per_day_charge', 'status', 'created_by', 'updated_by', 'deleted_by'];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function categoryCharges()
    {
        return $this->hasMany(RoomCategoryCharge::class, 'room_id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'id');
    }

    public function member()
    {
        return $this->belongsTo(Member::class, 'member_id', 'id');
    }
}