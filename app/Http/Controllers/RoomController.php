<?php
namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\EventLocation;
use App\Helpers\FileHelper;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoomController extends Controller
{
    // Show all rooms (optional)
    public function index()
    {
        $rooms = Room::latest()->get();

        return Inertia::render('App/Admin/Booking/RoomManage', [
            'rooms' => $rooms,
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
        $rooms = Room::latest()->get();
        $locations = EventLocation::all();

        return Inertia::render('App/Admin/Booking/AddRoom', [
            'rooms' => $rooms,
            'locations' => $locations,
        ]);
    }

    // Store new room
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'number_of_beds' => 'required|integer|min:1',
            'max_capacity' => 'required|integer|min:1',
            'price_per_night' => 'required|numeric|min:0',
            'number_of_bathrooms' => 'required|integer|min:0',
            'photo' => 'nullable|image|max:2048',
        ]);

        $path = null;
        if ($request->hasFile('photo')) {
            $path = FileHelper::saveImage($request->file('photo'), 'booking_rooms');
        }

        Room::create([
            'name' => $request->name,
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
            'number_of_beds' => 'required|integer|min:1',
            'max_capacity' => 'required|integer|min:1',
            'price_per_night' => 'required|numeric|min:0',
            'number_of_bathrooms' => 'required|integer|min:0',
            'photo' => 'nullable|image|max:2048',
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
        if ($room->photo_path) {
            FileHelper::deleteImage($room->photo_path);
        }

        $room->delete();

        return redirect()->route('rooms.all')->with('success', 'Room deleted successfully.');
    }
}
