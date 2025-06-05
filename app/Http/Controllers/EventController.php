<?php

namespace App\Http\Controllers;

use App\Models\BookingEvents;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventController extends Controller
{
    // Show form + existing event data
    public function create()
    {
        $events = BookingEvents::latest()->get();
        return Inertia::render('App/Admin/Booking/AddRoom', [
            'events' => $events,
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
}
