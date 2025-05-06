<?php

namespace App\Http\Controllers;

use App\Models\Floor;
use App\Models\Table;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FloorController extends Controller
{
    public function index()
    {
        $floors = Floor::all();
        $tables = Table::with('floor')->get();
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
            'floor.name' => 'required|string|max:255',
            'floor.area' => 'required|string|max:255',
            'tables' => 'required|array|min:1',
            'tables.*.table_no' => 'required|string|max:255',
            'tables.*.capacity' => 'required|string|max:255',
        ]);

        // Check for duplicate table_no
        $tableNumbers = array_map(fn($table) => $table['table_no'], $request->tables);
        if (count($tableNumbers) !== count(array_unique($tableNumbers))) {
            return back()->withErrors(['tables' => 'Duplicate table numbers are not allowed.']);
        }

        $floor = Floor::create([
            'name' => $request->floor['name'],
            'area' => $request->floor['area'],
        ]);

        foreach ($request->tables as $tableData) {
            $floor->tables()->create([
                'table_no' => $tableData['table_no'],
                'capacity' => $tableData['capacity'],
            ]);
        }

        return redirect()->route('table.management')->with('success', 'Floors and Tables added!');
    }

    public function floorTable()
    {
        $floors = Floor::all();
        $tables = Table::with('floor')->get();

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

        return redirect()->back();
    }

    public function createOrEdit($id = null)
    {
        $floor = $id ? Floor::with('tables')->findOrFail($id) : null;

        return Inertia::render('App/Table/NewFloor', [
            'floorInfo' => $floor,
        ]);
    }

    public function edit($id)
    {
        $floor = Floor::with('tables')->findOrFail($id);
        $floors = Floor::all();
        $tables = Table::with('floor')->get();

        return Inertia::render('App/Table/NewFloor', [
            'floorInfo' => $floor,
            'floorsdata' => $floors,
            'tablesData' => $tables,
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'floor.name' => 'required|string|max:255',
            'floor.area' => 'required|string|max:255',
            'tables' => 'required|array|min:1',
            'tables.*.table_no' => 'required|string|max:255',
            'tables.*.capacity' => 'required|string|max:255',
        ]);

        dd($request->all());

        // Check for duplicate table_no
        $tableNumbers = array_map(fn($table) => $table['table_no'], $request->tables);
        if (count($tableNumbers) !== count(array_unique($tableNumbers))) {
            return back()->withErrors(['tables' => 'Duplicate table numbers are not allowed.']);
        }

        $floor = Floor::findOrFail($id);

        // Update floor details
        $floor->update([
            'name' => $request->floor['name'],
            'area' => $request->floor['area'],
        ]);

        // Delete existing tables
        $floor->tables()->delete();

        // Create new tables
        foreach ($request->tables as $tableData) {
            $floor->tables()->create([
                'table_no' => $tableData['table_no'],
                'capacity' => $tableData['capacity'],
            ]);
        }

        return redirect()->route('table.management')->with('success', 'Floor and tables updated successfully!');
    }

    public function getFloors(Request $request)
    {
        $date = $request->date;
        $floor = $request->floor;

        // Parse the incoming ISO date string to Carbon
        $parsedDate = Carbon::parse($date)->startOfDay(); // For safe comparison

        // Fetch floors created today or earlier
        $floor = Floor::where('id', $floor)->whereDate('created_at', '<=', $parsedDate)
            ->with(['tables' => function ($query) use ($parsedDate) {
                $query->whereDate('created_at', '<=', $parsedDate);
            }])
            ->first();

        return response()->json(['floor' => $floor]);
    }

    public function destroy(Floor $floor)
    {
        $floor->delete();

        return redirect()->route('table.management')->with('success', 'Floor deleted!');
    }

    public function floorAll()
    {
        $floorTables = Floor::select('id', 'name')->where('status', 1)->with('tables:id,floor_id,table_no,capacity')->get();

        return response()->json(['success' => true, 'floors' => $floorTables]);
    }
}