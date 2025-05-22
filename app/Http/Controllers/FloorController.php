<?php

namespace App\Http\Controllers;

use App\Models\Floor;
use App\Models\Table;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class FloorController extends Controller
{
    public function index()
    {
        $floors = Floor::all();
        $tables = Table::with('floor')->get();
        return Inertia::render('App/Table/Newfloor', [
            'floorsdata' => $floors,
            'tablesData' => $tables,
        ]);
    }

    public function create()
    {
        return Inertia::render('App/Table/Newfloor');
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

        return Inertia::render('App/Table/Newfloor', [
            'floorInfo' => $floor,
        ]);
    }

    public function edit($id)
    {
        $floor = Floor::with('tables')->findOrFail($id);
        $floors = Floor::all();
        $tables = Table::with('floor')->get();

        return Inertia::render('App/Table/Newfloor', [
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

        $floor = Floor::findOrFail($id);

        // Update floor details
        $floor->update([
            'name' => $request->floor['name'],
            'area' => $request->floor['area'],
        ]);

        $existingTableIds = $floor->tables()->pluck('id')->toArray();
        $requestTableIds = [];

        foreach ($request->tables as $tableData) {
            $tableId = $tableData['id'] ?? null;

            if ($tableId && str_starts_with($tableId, 'new')) {
                // New table
                $floor->tables()->create([
                    'table_no' => $tableData['table_no'],
                    'capacity' => $tableData['capacity'],
                ]);
            } elseif ($tableId && str_starts_with($tableId, 'update-')) {
                // Updated existing table
                $realId = (int) str_replace('update-', '', $tableId);
                $requestTableIds[] = (int) $realId;

                $floor->tables()->where('id', $realId)->update([
                    'table_no' => $tableData['table_no'],
                    'capacity' => $tableData['capacity'],
                ]);
            } elseif (is_numeric($tableId)) {
                // Unchanged table
                $requestTableIds[] = (int) $tableId;
            }
        }

        // Optionally delete removed tables (i.e., present in DB but missing in request)
        $toDelete = array_diff($existingTableIds, $requestTableIds);
        if (!empty($toDelete)) {
            $floor->tables()->whereIn('id', $toDelete)->delete();
        }

        return redirect()->route('table.management')->with('success', 'Floor and tables updated successfully!');
    }

    public function getFloors(Request $request)
    {
        $date = $request->date;
        $floorId = $request->floor;

        $parsedDate = Carbon::parse($date)->startOfDay();

        $floor = Floor::where('id', $floorId)
            ->whereDate('created_at', '<=', $parsedDate)
            ->with(['tables' => function ($query) use ($parsedDate) {
                $query->whereDate('created_at', '<=', $parsedDate)
                    ->select('id', 'floor_id', 'table_no', 'capacity')
                    ->with(['orders' => function ($orderQuery) use ($parsedDate) {
                        $orderQuery->select('id', 'table_id', 'status', 'start_date', 'user_id')
                            ->whereDate('start_date', $parsedDate)
                            ->whereIn('status', ['pending', 'in_progress', 'completed'])
                            ->with([
                                'invoice:id,order_id,status',
                                'user:id,user_id,name',
                            ]);
                    }]);
            }])
            ->first();

        $totalCapacity = 0;
        $availableCapacity = 0;

        if ($floor) {
            foreach ($floor->tables as $table) {
                $isAvailable = true;
                $bookedBy = null;

                $totalCapacity += $table->capacity;

                foreach ($table->orders as $order) {
                    $invoice = $order->invoice;

                    if (!$bookedBy && $order->user) {
                        $bookedBy = [
                            'id' => $order->user->user_id,
                            'name' => $order->user->name,
                        ];
                    }

                    if (!$invoice || $invoice->status === 'unpaid') {
                        $isAvailable = false;
                        break;
                    }

                    if (!($order->status === 'completed' && $invoice->status === 'paid')) {
                        $isAvailable = false;
                        break;
                    }
                }

                $table->is_available = $isAvailable;
                $table->booked_by = $bookedBy;

                if ($isAvailable) {
                    $availableCapacity += $table->capacity;
                }

                unset($table->orders);
            }
        }

        return response()->json([
            'floor' => $floor,
            'total_capacity' => $totalCapacity,
            'available_capacity' => $availableCapacity,
        ]);
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