<?php

namespace App\Http\Controllers;

use App\Models\RoomMiniBar;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoomMiniBarController extends Controller
{
    // List all room mini bar types
    public function index()
    {
        $roomMiniBarData = RoomMiniBar::orderBy('created_at', 'desc')->get();

        return Inertia::render('App/Admin/Rooms/MiniBar/Index', compact('roomMiniBarData'));
    }

    // Store a new room mini bar type
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:room_mini_bars,name',
            'amount' => 'required|numeric|min:0',
            'status' => 'required|in:active,inactive', // ✅ validate status
        ]);

        $roomMiniBar = RoomMiniBar::create([
            'name' => $request->name,
            'amount' => $request->amount,
            'status' => $request->status, // ✅ store status
        ]);

        return response()->json([
            'message' => 'Room Mini Bar Type created successfully.',
            'data' => $roomMiniBar,
        ], 201);
    }

    // Update an existing room mini bar type
    public function update(Request $request, $id)
    {
        $roomMiniBar = RoomMiniBar::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255|unique:room_mini_bars,name,' . $roomMiniBar->id,
            'amount' => 'required|numeric|min:0',
            'status' => 'required|in:active,inactive', // ✅ validate status
        ]);

        $roomMiniBar->update([
            'name' => $request->name,
            'amount' => $request->amount,
            'status' => $request->status, // ✅ update status
        ]);

        return response()->json([
            'message' => 'Room Mini Bar Type updated successfully.',
            'data' => $roomMiniBar,
        ], 200);
    }

    // Delete a room mini bar type
    public function destroy($id)
    {
        $roomMiniBar = RoomMiniBar::findOrFail($id);
        $roomMiniBar->delete();

        return response()->json(['message' => 'Room Mini Bar Type deleted successfully.']);
    }
}
