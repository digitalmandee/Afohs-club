<?php

namespace App\Http\Controllers;

use App\Models\RoomChargesType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoomChargesTypeController extends Controller
{
    // List all room charges types
    public function index()
    {
        $roomChargesData = RoomChargesType::orderBy('created_at', 'desc')->get();

        return Inertia::render('App/Admin/Rooms/ChargesType/Index', compact('roomChargesData'));
    }

    // Store a new room charges type
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:room_charges_types,name',
            'amount' => 'required|numeric|min:0',
            'status' => 'required|in:active,inactive', // ✅ validate status
        ]);

        $roomChargesType = RoomChargesType::create([
            'name' => $request->name,
            'amount' => $request->amount,
            'status' => $request->status, // ✅ store status
        ]);

        return response()->json([
            'message' => 'Room Charges Type created successfully.',
            'data' => $roomChargesType,
        ], 201);
    }

    // Update an existing room charges type
    public function update(Request $request, $id)
    {
        $roomChargesType = RoomChargesType::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255|unique:room_charges_types,name,' . $roomChargesType->id,
            'amount' => 'required|numeric|min:0',
            'status' => 'required|in:active,inactive', // ✅ validate status
        ]);

        $roomChargesType->update([
            'name' => $request->name,
            'amount' => $request->amount,
            'status' => $request->status, // ✅ update status
        ]);

        return response()->json([
            'message' => 'Room Charges Type updated successfully.',
            'data' => $roomChargesType,
        ], 200);
    }

    // Delete a room charges type
    public function destroy($id)
    {
        $roomChargesType = RoomChargesType::findOrFail($id);
        $roomChargesType->delete();

        return response()->json(['message' => 'Room Charges Type deleted successfully.']);
    }
}
