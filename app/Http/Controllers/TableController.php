<?php

namespace App\Http\Controllers;

use App\Models\Floor;
use App\Models\Table;
use Illuminate\Http\Request;

class TableController extends Controller
{
    public function index(Request $request)
    {
        $floors = Floor::all();
        $query = Table::with('floor');

        if ($request->filled('floor_id')) {
            $query->where('floor_id', $request->floor_id);
        }

        $tables = $query->get();

        return view('tables.index', compact('tables', 'floors'));
    }

    public function create()
    {
        $floors = Floor::all();
        return view('tables.create', compact('floors'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'floor_id' => 'required|exists:floors,id',
            'table_no' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
        ]);

        Table::create([
            'floor_id' => $request->floor_id,
            'table_no' => $request->table_no,
            'capacity' => $request->capacity,
        ]);

        return redirect()->route('tables.index')->with('success', 'Table added successfully!');
    }


    public function edit(Table $table)
    {
        $floors = Floor::all();
        return view('tables.edit', compact('table', 'floors'));
    }

    public function update(Request $request, Table $table)
    {
        $request->validate([
            'floor_id' => 'required|exists:floors,id',
            'table_no' => 'required|integer',
            'capacity' => 'required|integer',
        ]);

        $table->update($request->all());

        return redirect()->route('tables.index')->with('success', 'Table updated!');
    }

    public function destroy(Table $table)
    {
        $table->delete();
        return redirect()->route('tables.index')->with('success', 'Table deleted!');
    }
}
