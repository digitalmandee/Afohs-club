<?php

namespace App\Http\Controllers;

use App\Models\BookingEvents;
use App\Models\EventLocation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventController extends Controller
{
    // // Show form + existing event data
    // public function index()
    // {
    //     $locations = EventLocation::all();
    //     return Inertia::render('App/Admin/Booking/AddRoom', [
    //         'eventLocation' => $locations,
    //     ]);
    // }
    public function create()
    {
        $events = BookingEvents::latest()->get();
        $locations = EventLocation::all();
        return Inertia::render('App/Admin/Booking/AddRoom', [
            'events' => $events,
            'locations' => $locations,
        ]);
    }

    // Store new event
    public function store(Request $request)
    {
        $request->validate([
            'event_name' => 'required|string|max:255',
            'date_time' => 'required|string',
            'max_capacity' => 'required|integer|min:1',
            'price_per_person' => 'required|numeric|min:0',
            'pricing_type' => 'required|in:fixed,per person',
            'status' => 'required|in:pending,upcomming,completed',
            'location' => 'required|string|max:255',
            'photo' => 'nullable|image|max:2048',
        ]);

        $path = null;
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('events', 'public');
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

    // Show event locations page
    public function locations()
    {
        $locations = EventLocation::all();
        return Inertia::render('App/Admin/Booking/AddRoom', [
            'locations' => $locations,
        ]);
    }

    // Store new event location
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

    // Update event location
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

    // Delete event location
    public function deleteLocation($id)
    {
        $location = EventLocation::findOrFail($id);
        $location->delete();

        return redirect()->back()->with('success', 'Location deleted successfully.');
    }
}
