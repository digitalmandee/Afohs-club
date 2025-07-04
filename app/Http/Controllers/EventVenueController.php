<?php

namespace App\Http\Controllers;

use App\Models\EventVenue;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventVenueController extends Controller
{
    public function index()
    {
        $eventVenuesData = EventVenue::orderBy('created_at', 'desc')->get();

        return Inertia::render('App/Admin/Events/Venue/Index', compact('eventVenuesData'));
    }

    // Store a new event venue
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:event_venues,name',
            'status' => 'required|in:active,inactive', // ✅ validate status
        ]);

        $eventVenue = EventVenue::create([
            'name' => $request->name,
            'status' => $request->status, // ✅ store status
        ]);

        return response()->json([
            'message' => 'Event Venue created successfully.',
            'data' => $eventVenue,
        ], 201);
    }

    // Update an existing event venue
    public function update(Request $request, $id)
    {
        $eventVenue = EventVenue::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255|unique:event_venues,name,' . $eventVenue->id,
            'status' => 'required|in:active,inactive', // ✅ validate status
        ]);

        $eventVenue->update([
            'name' => $request->name,
            'status' => $request->status, // ✅ update status
        ]);

        return response()->json([
            'message' => 'Event Venue updated successfully.',
            'data' => $eventVenue,
        ], 200);
    }

    // Delete an event venue
    public function destroy($id)
    {
        $eventVenue = EventVenue::findOrFail($id);
        $eventVenue->delete();

        return response()->json(['message' => 'Event Venue deleted successfully.']);
    }
}
