<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class RoomBooking extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'booking_no',
        'customer_id',
        'member_id',
        'booking_date',
        'check_in_date',
        'check_in_time',
        'arrival_details',
        'check_out_date',
        'check_out_time',
        'departure_details',
        'guest_first_name',
        'guest_last_name',
        'guest_company',
        'guest_address',
        'guest_country',
        'guest_city',
        'guest_mob',
        'guest_email',
        'guest_cnic',
        'accompanied_guest',
        'acc_relationship',
        'booked_by',
        'booking_type',
        'room_id',
        'persons',
        'category',
        'nights',
        'per_day_charge',
        'room_charge',
        'security_deposit',
        'total_other_charges',
        'total_mini_bar',
        'discount_type',
        'discount_value',
        'grand_total',
        'additional_data',
        'booking_docs',
        'additional_notes',
        'status',
        'created_by',
        'updated_by',
    ];

    protected $casts = ['additional_data' => 'array'];

    public function miniBarItems()
    {
        return $this->hasMany(RoomBookingMiniBarItem::class);
    }

    public function otherCharges()
    {
        return $this->hasMany(RoomBookingOtherCharge::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id', 'id');
    }

    public function member()
    {
        return $this->belongsTo(Member::class, 'member_id', 'user_id');
    }
}