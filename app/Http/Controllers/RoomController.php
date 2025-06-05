<?php
namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\EventLocation;

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
     // Show form + existing event data
    // public function index()
    // {
    //     return Inertia::render('App/Admin/Booking/AddRoom', [
    //         'eventLocation' => $locations,
    //     ]);
    // }

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
            $path = $request->file('photo')->store('rooms', 'public');
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
}
