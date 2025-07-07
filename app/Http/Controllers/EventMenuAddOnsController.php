<?php

namespace App\Http\Controllers;

use App\Models\EventMenuAddOn;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventMenuAddOnsController extends Controller
{
    // List all event menu add-ons
    public function index()
    {
        $eventMenuAddOnsData = EventMenuAddOn::orderBy('created_at', 'desc')->get();

        return Inertia::render('App/Admin/Events/MenuAddons/Index', compact('eventMenuAddOnsData'));
    }

    // Store a new event menu add-on
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:event_menu_add_ons,name',
            'amount' => 'required|numeric|min:0',
            'status' => 'required|in:active,inactive', // validate status
        ]);

        $eventMenuAddOn = EventMenuAddOn::create([
            'name' => $request->name,
            'amount' => $request->amount,
            'status' => $request->status, // store status
        ]);

        return response()->json([
            'message' => 'Event Menu Add-on created successfully.',
            'data' => $eventMenuAddOn,
        ], 201);
    }

    // Update an existing event menu add-on
    public function update(Request $request, $id)
    {
        $eventMenuAddOn = EventMenuAddOn::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255|unique:event_menu_add_ons,name,' . $eventMenuAddOn->id,
            'amount' => 'required|numeric|min:0',
            'status' => 'required|in:active,inactive', // validate status
        ]);

        $eventMenuAddOn->update([
            'name' => $request->name,
            'amount' => $request->amount,
            'status' => $request->status, // update status
        ]);

        return response()->json([
            'message' => 'Event Menu Add-on updated successfully.',
            'data' => $eventMenuAddOn,
        ], 200);
    }

    // Delete an event menu add-on
    public function destroy($id)
    {
        $eventMenuAddOn = EventMenuAddOn::findOrFail($id);
        $eventMenuAddOn->delete();

        return response()->json(['message' => 'Event Menu Add-on deleted successfully.']);
    }
}
