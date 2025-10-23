<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class EventBooking extends BaseModel
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'booking_no',
        'customer_id',
        'member_id',
        'event_venue_id',
        'family_id',
        'booking_date',
        'booking_type',
        'booked_by',
        'event_name',
        'event_date',
        'event_time_from',
        'event_time_to',
        'menu_charges',
        'addons_charges',
        'total_per_person_charges',
        'no_of_guests',
        'guest_charges',
        'extra_guests',
        'extra_guest_charges',
        'total_food_charges',
        'total_other_charges',
        'total_charges',
        'surcharge_type',
        'surcharge_amount',
        'surcharge_note',
        'reduction_type',
        'reduction_amount',
        'reduction_note',
        'total_price',
        'paid_amount',
        'booking_docs',
        'additional_notes',
        'additional_data',
        'status',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    protected $casts = ['additional_data' => 'array'];

    /**
     * Get the menu for the booking.
     */
    public function menu()
    {
        return $this->hasOne(EventBookingMenu::class, 'event_booking_id');
    }

    /**
     * Get the menu add-ons for the booking.
     */
    public function menuAddOns()
    {
        return $this->hasMany(EventBookingMenuAddOn::class, 'event_booking_id');
    }

    /**
     * Get the other charges for the booking.
     */
    public function otherCharges()
    {
        return $this->hasMany(EventBookingOtherCharges::class, 'event_booking_id');
    }

    /**
     * Get the event venue.
     */
    public function eventVenue()
    {
        return $this->belongsTo(EventVenue::class, 'event_venue_id');
    }

    /**
     * Get the customer (member).
     */
    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }
}