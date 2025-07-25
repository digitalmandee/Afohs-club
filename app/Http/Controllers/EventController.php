<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use App\Models\Booking;
use App\Models\BookingEvents;
use App\Models\EventLocation;
use App\Models\FinancialInvoice;
use App\Models\Room;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventController extends Controller
{
    public function index()
    {
        // Only get bookings where booking_type is 'event'
        $bookings = Booking::with('typeable', 'user')
            ->where('booking_type', 'event')
            ->latest()
            ->get();

        $totalBookings = Booking::count();
        $totalRoomBookings = Booking::where('booking_type', 'room')->count();
        $totalEventBookings = Booking::where('booking_type', 'event')->count();

        $events = BookingEvents::latest()->get();
        $totalEvents = $events->count();

        // Determine unavailable events today
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
            'bookingsData' => $bookings,  // Only event bookings
            'events' => $events,
            'totalEvents' => $totalEvents,
            'availableEventsToday' => $availableEventsToday,
            'totalBookings' => $totalBookings,
            'totalRoomBookings' => $totalRoomBookings,
            'totalEventBookings' => $totalEventBookings,
        ];

        return Inertia::render('App/Admin/Booking/EventManage', [
            'data' => $data,
            'events' => $events,
        ]);
    }

    // public function index()
    // {
    //     $events = BookingEvents::latest()->get();
    //     return Inertia::render('App/Admin/Booking/EventManage', [
    //         'events' => $events,
    //     ]);
    // }
    public function allEvents()
    {
        $events = BookingEvents::latest()->get();
        return Inertia::render('App/Admin/Booking/AllEvents', [
            'events' => $events,
        ]);
    }

    public function create()
    {
        $events = BookingEvents::latest()->get();
        $locations = EventLocation::all();
        return Inertia::render('App/Admin/Booking/AddRoom', [
            'events' => $events,
            'locations' => $locations,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'event_name' => 'required|string|max:255',
            'date_time' => 'required|string',
            'max_capacity' => 'required|integer',
            'price_per_person' => 'required|numeric',
            'pricing_type' => 'required|in:fixed,per person',
            'status' => 'required|in:pending,upcomming,completed',
            'location' => 'required|string|max:255',
            'photo' => 'nullable|image|max:2048',
        ]);

        $path = null;
        if ($request->hasFile('photo')) {
            $path = FileHelper::saveImage($request->file('photo'), 'booking_events');
        }

        BookingEvents::create([
            'event_name' => $request->event_name,
            'date_time' => $request->date_time,
            'max_capacity' => $request->max_capacity,
            'price_per_person' => $request->price_per_person,
            'pricing_type' => $request->pricing_type,
            'status' => $request->status,
            'location' => $request->location,
            'photo_path' => $path,
        ]);

        return redirect()->route('events.add')->with('success', 'Event added successfully.');
    }

    public function edit($id)
    {
        $event = BookingEvents::findOrFail($id);
        $locations = EventLocation::all();
        return Inertia::render('App/Admin/Booking/EditEvent', [
            'event' => $event,
            'locations' => $locations,
        ]);
    }

    public function update(Request $request, $id)
    {
        $event = BookingEvents::findOrFail($id);

        $request->validate([
            'event_name' => 'required|string|max:255',
            'date_time' => 'required|string',
            'max_capacity' => 'required|integer',
            'price_per_person' => 'required|numeric',
            'pricing_type' => 'required|in:fixed,per person',
            'status' => 'required|in:pending,upcomming,completed',
            'location' => 'required|string',
            'photo' => 'nullable|image|max:2048',
        ]);

        $path = $event->photo_path;
        if ($request->hasFile('photo')) {
            // Delete old photo if it exists
            $path = null;
            if ($request->hasFile('photo')) {
                $path = FileHelper::saveImage($request->file('photo'), 'booking_events');
            }
        }

        $event->update([
            'event_name' => $request->event_name,
            'date_time' => $request->date_time,
            'max_capacity' => $request->max_capacity,
            'price_per_person' => $request->price_per_person,
            'pricing_type' => $request->pricing_type,
            'status' => $request->status,
            'location' => $request->location,
            'photo_path' => $path,
        ]);

        return redirect()->route('events.dashboard')->with('success', 'Event updated successfully.');
    }

    public function destroy($id)
    {
        $event = BookingEvents::findOrFail($id);
        if ($event->photo_path) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($event->photo_path);
        }
        $event->delete();

        return redirect()->route('events.dashboard')->with('success', 'Event deleted successfully.');
    }

    public function locations()
    {
        $locations = EventLocation::all();
        return Inertia::render('App/Admin/Booking/EventLoction', [
            'locations' => $locations,
        ]);
    }

    public function storeLocation(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:event_locations,name',
        ]);

        EventLocation::create([
            'name' => $request->name,
        ]);

        return redirect()->back()->with('success', 'Location added successfully.');
    }

    public function updateLocation(Request $request, $id)
    {
        $location = EventLocation::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255|unique:event_locations,name,' . $id,
        ]);

        $location->update([
            'name' => $request->name,
        ]);

        return redirect()->back()->with('success', 'Location updated successfully.');
    }

    public function deleteLocation($id)
    {
        $location = EventLocation::findOrFail($id);
        $location->delete();

        return redirect()->back()->with('success', 'Location deleted successfully.');
    }
}
