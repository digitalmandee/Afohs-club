<?php

namespace App\Http\Controllers;

use App\Models\Floor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FloorController extends Controller
{
    public function index()
    {
        $floors = Floor::all();

        return Inertia::render('App/Table/NewFloor', [
            'floors' => $floors,
        ]);
    }

    public function create()
    {
        return Inertia::render('App/Table/NewFloor');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        Floor::create([
            'name' => $request->name,
        ]);

        return redirect()->route('floors.index')->with('success', 'Floor added successfully!');
    }

    public function edit($id)
    {
        $floor = Floor::findOrFail($id);

        return Inertia::render('App/Table/EditFloor', [
            'floor' => $floor,
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $floor = Floor::findOrFail($id);
        $floor->update(['name' => $request->name]);

        return redirect()->route('floors.index')->with('success', 'Floor updated successfully!');
    }

    public function destroy(Floor $floor)
    {
        $floor->delete();

        return redirect()->route('floors.index')->with('success', 'Floor deleted!');
    }
}
