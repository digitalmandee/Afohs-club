<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Room ;
use App\Models\BookingEvents ;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BookingController extends Controller
{
   public function index()
{
    $bookings = Booking::latest()->get();
    $rooms = Room::latest()->get();
    $events = BookingEvents::latest()->get();

    $data = [
        'bookingsData' => $bookings,
        'rooms' => $rooms,
        'events' => $events,
    ];

    return Inertia::render('App/Admin/Booking/Dashboard', [
        'data' => $data,
    ]);
}

//     public function roomsAndEvents()
// {
//     $rooms = Room::latest()->get()->toArray();
//     $events = BookingEvents::latest()->get()->toArray();

//     $roomsEvents = [
//         'rooms' => $rooms,
//         'events' => $events,
//     ];

//     return Inertia::render('App/Admin/Booking/Dashboard', [
//         'roomsEvent' => $roomsEvents,
//     ]);
// }


    public function booking()
{
    $booking = Booking::latest()->get();
    return Inertia::render('App/Admin/Booking/RoomBooking', [
        'booking' => $booking,
        'next_booking_id' => $this->getBookingId()
    ]);
}

    public function store(Request $request)
    {
        $validated = $request->validate([
            'memberId' => 'required|string',
            'bookingType' => 'required|in:room,event',
            'bookingFor' => 'required|in:main_guest,other',
            'personCount' => 'nullable|integer|min:0',
            'roomCount' => 'nullable|integer|min:0',
            'totalPayment' => 'required|numeric|min:0',
            'eventName' => 'nullable|string',
            'eventDate' => 'nullable|date',
            'eventTime' => 'nullable|date_format:H:i',
            'checkin' => 'required_if:bookingType,room|date|nullable',
            'checkout' => 'nullable|date|after:checkin',
        ]);

        $member_id = Auth::user()->id;

        $bookingId = $this->getBookingId();

        Booking::create([
            'booking_id' => $bookingId,
            'user_id' => $member_id,
            'booking_type' => $validated['bookingType'],
            'booking_For' => $validated['bookingFor'],
            'type_id' => $validated['memberId'],
            'persons' => $validated['personCount'],
            'total_rooms' => $validated['roomCount'],
            'checkin' => $validated['checkin'] ?? ($validated['eventDate'] ?? now()),
            'checkout' => $validated['checkout'],
            'event_name' => $validated['eventName'],
            'start_time' => $validated['eventTime'],
            'end_time' => null,
            'total_payment' => $validated['totalPayment'],
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Booking saved successfully',
            'booking_id' => $bookingId,
        ], 201);
    }

    // ✅ Get next booking ID
    // public function nextBookingId()
    // {
    //     return response()->json(['booking_id' => $this->getBookingId()]);
    // }

    private function getBookingId()
    {
        $booking_id =  (int) Booking::max('booking_id');
        return $booking_id + 1;
    }
}
