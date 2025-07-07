<?php

namespace App\Http\Controllers;

use App\Models\EventMenuType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventMenuTypeController extends Controller
{
    public function index()
    {
        $eventMenuTypesData = EventMenuType::orderBy('created_at', 'desc')->get();

        return Inertia::render('App/Admin/Events/MenuType/Index', compact('eventMenuTypesData'));
    }

    // Store a new event menu type
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:event_menu_types,name',
            'status' => 'required|in:active,inactive', // ✅ validate status
        ]);

        $eventMenuType = EventMenuType::create([
            'name' => $request->name,
            'status' => $request->status, // ✅ store status
        ]);

        return response()->json([
            'message' => 'Event Menu Type created successfully.',
            'data' => $eventMenuType,
        ], 201);
    }

    // Update an existing event menu type
    public function update(Request $request, $id)
    {
        $eventMenuType = EventMenuType::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255|unique:event_menu_types,name,' . $eventMenuType->id,
            'status' => 'required|in:active,inactive', // ✅ validate status
        ]);

        $eventMenuType->update([
            'name' => $request->name,
            'status' => $request->status, // ✅ update status
        ]);

        return response()->json([
            'message' => 'Event Menu Type updated successfully.',
            'data' => $eventMenuType,
        ], 200);
    }

    // Delete an event menu type
    public function destroy($id)
    {
        $eventMenuType = EventMenuType::findOrFail($id);
        $eventMenuType->delete();

        return response()->json(['message' => 'Event Menu Type deleted successfully.']);
    }
}
