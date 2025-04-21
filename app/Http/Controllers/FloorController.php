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
        // dd('Rendering NewFloor');
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
            'floors' => 'required|array|min:1',
            'floors.*.name' => 'required|string|max:255',
            'floors.*.area' => 'required|string|max:255',
            'tables' => 'required|array|min:1',
            'tables.*.table_no' => 'required|string|max:255',
            'tables.*.capacity' => 'required|string|max:255',
        ]);

        // Check for duplicate  table_no
        $tableNumbers = [];
        foreach ($request->tables as $index => $table) {
            $tableNumbers[] = $table['table_no'];
        }

        if (count($tableNumbers) !== count(array_unique($tableNumbers))) {
            return back()->withErrors(['tables' => 'Duplicate table numbers are not allowed.']);
        }

        foreach ($request->floors as $floorData) {
            $floor = Floor::create([
                'name' => $floorData['name'],
                'area' => $floorData['area'],
            ]);

            foreach ($request->tables as $tableData) {
                $floor->tables()->create([
                    'table_no' => $tableData['table_no'],
                    'capacity' => $tableData['capacity'],
                ]);
            }
        }

        return redirect()->route('floors.index')->with('success', 'Floors and Tables added!');
    }



    public function edit($id)
    {
        $floor = Floor::findOrFail($id);

        return Inertia::render('App/Table/NewFloor', [
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
