<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingEvents;
use App\Models\FinancialInvoice;
use App\Models\Room;
use App\Models\EventLocation;
use App\Helpers\FileHelper;
use App\Models\RoomType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoomController extends Controller
{
    public function index()
    {
        $bookings = Booking::with('typeable')
            ->where('booking_type', 'room')
            ->latest()
            ->get();

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
            ->pluck('type_id')->unique();

        $availableRoomsToday = Room::query()
            ->whereNotIn('id', $conflictedRooms)
            ->count();

        $conflictedEvents = Booking::query()
            ->where('booking_type', 'event')
            ->whereIn('status', ['confirmed', 'pending'])
            ->where('checkin', '<', now()->addDay())
            ->where('checkout', '>', now())
            ->pluck('type_id')->unique();

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

    // Show all rooms (optional)
    // public function index()
    // {
    //     $rooms = Room::latest()->get();

    //     return Inertia::render('App/Admin/Booking/RoomManage', [
    //         'rooms' => $rooms,
    //     ]);
    // }

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
        $locations = EventLocation::all();

        return Inertia::render('App/Admin/Booking/AddRoom', [
            'roomTypes' => $roomTypes,
            'locations' => $locations,
        ]);
    }

    // Store new room
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'number_of_beds' => 'required|integer',
            'max_capacity' => 'required|integer',
            'price_per_night' => 'required|numeric',
            'room_type_id' => 'required|exists:room_types,id',
            'number_of_bathrooms' => 'required|integer',
            'photo' => 'nullable|image|max:4096',
        ]);

        $path = null;
        if ($request->hasFile('photo')) {
            $path = FileHelper::saveImage($request->file('photo'), 'booking_rooms');
        }

        Room::create([
            'name' => $request->name,
            'room_type_id' => $request->room_type_id,
            'number_of_beds' => $request->number_of_beds,
            'max_capacity' => $request->max_capacity,
            'price_per_night' => $request->price_per_night,
            'number_of_bathrooms' => $request->number_of_bathrooms,
            'photo_path' => $path,
        ]);

        return redirect()->route('rooms.add')->with('success', 'Room added successfully.');
    }

    // Show edit form for a room
    public function edit($id)
    {
        $room = Room::findOrFail($id);
        $locations = EventLocation::all();

        return Inertia::render('App/Admin/Booking/EditRoom', [
            'room' => $room,
            'locations' => $locations,
        ]);
    }

    // Update a room
    public function update(Request $request, $id)
    {
        $room = Room::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'number_of_beds' => 'required|integer',
            'max_capacity' => 'required|integer',
            'price_per_night' => 'required|numeric',
            'number_of_bathrooms' => 'required|integer',
            'photo' => 'nullable|image|max:4096',
        ]);

        $path = $room->photo_path;
        if ($request->hasFile('photo')) {
            $path = FileHelper::saveImage($request->file('photo'), 'booking_rooms');
        }

        $room->update([
            'name' => $request->name,
            'number_of_beds' => $request->number_of_beds,
            'max_capacity' => $request->max_capacity,
            'price_per_night' => $request->price_per_night,
            'number_of_bathrooms' => $request->number_of_bathrooms,
            'photo_path' => $path,
        ]);

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