<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use App\Models\Booking;
use App\Models\BookingEvents;
use App\Models\EventLocation;
use App\Models\FinancialInvoice;
use App\Models\Room;
use App\Models\RoomBooking;
use App\Models\RoomBookingRequest;
use App\Models\RoomCategory;
use App\Models\RoomCategoryCharge;
use App\Models\RoomType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoomController extends Controller
{
    public function index()
    {
        // Step 1: Build bookingId => invoice mapping
        $invoices = FinancialInvoice::where('invoice_type', 'room_booking')->get();

        $bookingInvoiceMap = [];

        foreach ($invoices as $invoice) {
            foreach ($invoice->data as $entry) {
                if (!empty($entry['booking_id'])) {
                    $bookingInvoiceMap[$entry['booking_id']] = [
                        'id' => $invoice->id,
                        'status' => $invoice->status,
                    ];
                }
            }
        }

        // Step 2: Get all RoomBookings
        $bookings = RoomBooking::with('room', 'customer', 'member')->latest()->get();

        // Step 3: Attach invoice data to each booking
        $bookings->transform(function ($booking) use ($bookingInvoiceMap) {
            $invoice = $bookingInvoiceMap[$booking->id] ?? null;
            $booking->invoice = $invoice;
            return $booking;
        });

        $totalBookings = Booking::count();
        $totalRoomBookings = Booking::where('booking_type', 'room')->count();
        $totalEventBookings = Booking::where('booking_type', 'event')->count();

        $rooms = Room::latest()->get();
        $events = BookingEvents::latest()->get();

        $totalRooms = $rooms->count();
        $totalEvents = $events->count();

        $conflictedRooms = Booking::query()
            ->where('booking_type', 'room')
            ->whereIn('status', ['confirmed', 'pending'])
            ->where('checkin', '<', now()->addDay())
            ->where('checkout', '>', now())
            ->pluck('type_id')
            ->unique();

        $availableRoomsToday = Room::query()
            ->whereNotIn('id', $conflictedRooms)
            ->count();

        $conflictedEvents = Booking::query()
            ->where('booking_type', 'event')
            ->whereIn('status', ['confirmed', 'pending'])
            ->where('checkin', '<', now()->addDay())
            ->where('checkout', '>', now())
            ->pluck('type_id')
            ->unique();

        $availableEventsToday = BookingEvents::query()
            ->whereNotIn('id', $conflictedEvents)
            ->count();

        $data = [
            'bookingsData' => $bookings,
            'rooms' => $rooms,
            'events' => $events,
            'totalRooms' => $totalRooms,
            'totalEvents' => $totalEvents,
            'availableRoomsToday' => $availableRoomsToday,
            'availableEventsToday' => $availableEventsToday,
            'totalBookings' => $totalBookings,
            'totalRoomBookings' => $totalRoomBookings,
            'totalEventBookings' => $totalEventBookings,
        ];

        return Inertia::render('App/Admin/Booking/RoomManage', [
            'data' => $data,
            'rooms' => $rooms,
        ]);
    }

    public function dashboard()
    {
        // Step 1: Build bookingId => invoice mapping
        $invoices = FinancialInvoice::where('invoice_type', 'room_booking')->get();

        $bookingInvoiceMap = [];

        foreach ($invoices as $invoice) {
            foreach ($invoice->data as $entry) {
                if (!empty($entry['booking_id'])) {
                    $bookingInvoiceMap[$entry['booking_id']] = [
                        'id' => $invoice->id,
                        'status' => $invoice->status,
                    ];
                }
            }
        }

        // Step 2: Get all RoomBookings
        $bookings = RoomBooking::with('room', 'customer', 'member')->latest()->take(10)->get();

        // Step 3: Attach invoice data to each booking
        $bookings->transform(function ($booking) use ($bookingInvoiceMap) {
            $invoice = $bookingInvoiceMap[$booking->id] ?? null;
            $booking->invoice = $invoice;
            return $booking;
        });

        $totalBookings = RoomBooking::count();
        $totalRoomBookings = RoomBooking::count();

        $rooms = Room::latest()->get();

        $totalRooms = $rooms->count();

        // Determine unavailable rooms today
        $conflictedRooms = RoomBooking::query()
            ->whereIn('status', ['confirmed', 'pending'])
            ->where('check_in_date', '<', now()->addDay())  // today and future
            ->where('check_out_date', '>', now())  // overlapping today
            ->pluck('room_id')
            ->unique();

        $availableRoomsToday = Room::query()
            ->whereNotIn('id', $conflictedRooms)
            ->count();

        $data = [
            'bookingsData' => $bookings,
            'rooms' => $rooms,
            'totalRooms' => $totalRooms,
            'availableRoomsToday' => $availableRoomsToday,
            'totalBookings' => $totalBookings,
            'totalRoomBookings' => $totalRoomBookings,
        ];

        $roomTypes = RoomType::where('status', 'active')->select('id', 'name')->get();

        return Inertia::render('App/Admin/Booking/Dashboard', [
            'data' => $data,
            'roomTypes' => $roomTypes
        ]);
    }

    public function allRooms()
    {
        $rooms = Room::latest()->get();

        return Inertia::render('App/Admin/Booking/AllRooms', [
            'rooms' => $rooms,
        ]);
    }

    // Show form + existing room data
    public function create()
    {
        $roomTypes = RoomType::where('status', 'active')->select('id', 'name')->get();
        $categories = RoomCategory::where('status', 'active')->select('id', 'name')->get();
        $locations = EventLocation::all();

        return Inertia::render('App/Admin/Booking/AddRoom', [
            'roomTypes' => $roomTypes,
            'locations' => $locations,
            'categories' => $categories
        ]);
    }

    // Store new room
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'number_of_beds' => 'required|integer',
            'max_capacity' => 'required|integer',
            'room_type_id' => 'required|exists:room_types,id',
            'number_of_bathrooms' => 'required|integer',
            'photo' => 'nullable|image|max:4096',
            'category_charges' => 'nullable|array',
            'category_charges.*.id' => 'required|exists:room_categories,id',
            'category_charges.*.amount' => 'nullable|numeric|min:0',
        ]);

        $request->validate([]);

        $path = null;
        if ($request->hasFile('photo')) {
            $path = FileHelper::saveImage($request->file('photo'), 'booking_rooms');
        }

        $room = Room::create([
            'name' => $request->name,
            'room_type_id' => $request->room_type_id,
            'number_of_beds' => $request->number_of_beds,
            'max_capacity' => $request->max_capacity,
            'number_of_bathrooms' => $request->number_of_bathrooms,
            'photo_path' => $path,
        ]);

        // Save category charges
        foreach ($request->category_charges as $charge) {
            if (!empty($charge['amount'])) {
                RoomCategoryCharge::updateOrCreate(
                    [
                        'room_id' => $room->id,
                        'room_category_id' => $charge['id']
                    ],
                    [
                        'amount' => $charge['amount']
                    ]
                );
            }
        }

        return redirect()->route('rooms.add')->with('success', 'Room added successfully.');
    }

    // Show edit form for a room
    public function edit($id)
    {
        $room = Room::with('categoryCharges')->findOrFail($id);
        $roomTypes = RoomType::where('status', 'active')->select('id', 'name')->get();
        $categories = RoomCategory::where('status', 'active')->select('id', 'name')->get();
        $locations = EventLocation::all();

        return Inertia::render('App/Admin/Booking/AddRoom', [
            'roomTypes' => $roomTypes,
            'locations' => $locations,
            'categories' => $categories,
            'room' => $room,
        ]);
    }

    // Update a room
    public function update(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'number_of_beds' => 'required|integer',
            'max_capacity' => 'required|integer',
            'room_type_id' => 'required|exists:room_types,id',
            'number_of_bathrooms' => 'required|integer',
            'photo' => 'nullable|image|max:4096',
            'category_charges' => 'nullable|array',
            'category_charges.*.id' => 'required|exists:room_categories,id',
            'category_charges.*.amount' => 'nullable|numeric|min:0',
        ]);

        $room = Room::findOrFail($request->id);

        $path = $room->photo_path;
        if ($request->hasFile('photo')) {
            $path = FileHelper::saveImage($request->file('photo'), 'booking_rooms');
        }

        $room->update([
            'name' => $request->name,
            'room_type_id' => $request->room_type_id,
            'number_of_beds' => $request->number_of_beds,
            'max_capacity' => $request->max_capacity,
            'number_of_bathrooms' => $request->number_of_bathrooms,
            'photo_path' => $path,
        ]);

        // Save category charges
        foreach ($request->category_charges as $charge) {
            if (!empty($charge['amount'])) {
                RoomCategoryCharge::updateOrCreate(
                    [
                        'room_id' => $room->id,
                        'room_category_id' => $charge['id']
                    ],
                    [
                        'amount' => $charge['amount']
                    ]
                );
            }
        }

        return redirect()->route('rooms.all')->with('success', 'Room updated successfully.');
    }

    // Delete a room
    public function destroy($id)
    {
        $room = Room::findOrFail($id);

        // Delete the photo if it exists
        // if ($room->photo_path) {
        //     FileHelper::deleteImage($room->photo_path);
        // }

        $room->delete();

        return redirect()->route('rooms.all')->with('success', 'Room deleted successfully.');
    }
}
