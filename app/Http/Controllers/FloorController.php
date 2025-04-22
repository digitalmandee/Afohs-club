<?php

namespace App\Http\Controllers;

use App\Models\Floor;
use App\Models\Table;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FloorController extends Controller
{
    public function index()
    {
        $floors = Floor::all();
        $tables = Table::with('floor')->get();
        // dd($floors);
        return Inertia::render('App/Table/NewFloor', [
            'floorsdata' => $floors,
            'tablesData' => $tables,
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
            // dd($floor);

            foreach ($request->tables as $tableData) {
                $floor->tables()->create([
                    'table_no' => $tableData['table_no'],
                    'capacity' => $tableData['capacity'],
                ]);
            }
        }

        return redirect()->route('floors.index')->with('success', 'Floors and Tables added!');
    }

    public function floorTable()
    {
        $floors = Floor::all();
        $tables = Table::with('floor')->get();

        // dd($floors, $tables);
        return Inertia::render('App/Table/Dashboard', [
            'floorsdata' => $floors,
            'tablesData' => $tables,
        ]);
    }
    public function toggleStatus(Request $request, $id)
    {
        $floor = Floor::findOrFail($id);
        $floor->status = $request->status;
        $floor->save();

        return redirect()->back(); // ✅ Fix: send an Inertia-friendly response
    }

    public function createOrEdit($id = null)
    {
        $floor = $id ? Floor::with('tables')->findOrFail($id) : null;
        $floors = Floor::all();
        $tables = Table::with('floor')->get();

        return Inertia::render('App/Table/NewFloor', [
            'floor' => $floor,
            'floorsdata' => $floors,
            'tablesData' => $tables,
        ]);
    }
    public function edit($id)
    {
        $floor = Floor::with('tables')->findOrFail($id);

        return Inertia::render('App/Table/NewFloor', [
            'floorInfo' => $floor
        ]);
    }




    // public function edit($id)
    // {
    //     $floor = Floor::findOrFail($id);

    //     return Inertia::render('App/Table/NewFloor', [
    //         'floor' => $floor,
    //     ]);
    // }

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
