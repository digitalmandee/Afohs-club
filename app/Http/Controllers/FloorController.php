<?php

namespace App\Http\Controllers;

use App\Models\FinancialInvoice;
use App\Models\Floor;
use App\Models\Order;
use App\Models\Reservation;
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
                $query
                    ->whereDate('created_at', '<=', $parsedDate)
                    ->select('id', 'floor_id', 'table_no', 'capacity')
                    ->with([
                        // Reservations for the day
                        'reservations' => function ($resQuery) use ($parsedDate) {
                            $resQuery
                                ->whereDate('date', $parsedDate)
                                ->select('id', 'table_id', 'date', 'start_time', 'end_time', 'member_id')
                                ->with([
                                    'order' => function ($orderQuery) {
                                        $orderQuery->select('id', 'reservation_id', 'table_id', 'status', 'order_type', 'start_date', 'member_id');
                                    },
                                    'member:id,user_id,full_name',
                                ]);
                        },
                        // Direct dinein/takeaway orders
                        'orders' => function ($orderQuery) use ($parsedDate) {
                            $orderQuery
                                ->whereDate('start_date', $parsedDate)
                                ->whereNull('reservation_id')
                                ->whereIn('order_type', ['dinein', 'takeaway'])
                                ->whereIn('status', ['pending', 'in_progress'])
                                ->select('id', 'table_id', 'order_type', 'status', 'start_date', 'member_id')
                                ->with([
                                    'member:id,user_id,full_name',
                                ]);
                        }
                    ]);
            }])
            ->first();

        // Attach invoices
        $floor->tables->map(function ($table) {
            // Attach invoice for orders
            $table->orders = $table->orders->map(function ($order) {
                $invoice = FinancialInvoice::whereJsonContains('data->order_id', $order->id)
                    ->select('id', 'status', 'data')
                    ->first();
                $order->invoice = $invoice;
                return $order;
            });

            // Attach invoice for reservations
            $table->reservations = $table->reservations->map(function ($reservation) {
                if ($reservation->order) {
                    $invoice = FinancialInvoice::whereJsonContains('data->order_id', $reservation->order->id)
                        ->select('id', 'status', 'data')
                        ->first();
                    $reservation->invoice = $invoice;
                } else {
                    $reservation->invoice = null;
                }
                return $reservation;
            });

            return $table;
        });

        $totalCapacity = 0;
        $availableCapacity = 0;

        if ($floor) {
            foreach ($floor->tables as $table) {
                $isAvailable = true;
                $bookedBy = null;

                $totalCapacity += $table->capacity;

                // 🔹 Reservation check
                foreach ($table->reservations as $reservation) {
                    $order = $reservation->order;

                    $now = Carbon::now()->format('H:i:s');

                    // Add flag for active reservation
                    $reservation->is_current = (
                        $now >= $reservation->start_time &&
                        $now <= $reservation->end_time
                    );

                    if ($reservation->member && !$bookedBy) {
                        $bookedBy = [
                            'reservation_id' => $reservation->id,
                            'id' => $reservation->member->user_id,
                            'name' => $reservation->member->full_name,
                            'time_slot' => $reservation->start_time . ' - ' . $reservation->end_time,
                        ];
                    }

                    if (!$order) {
                        $isAvailable = false;
                        continue;
                    }

                    $invoice = $order->invoice;
                    if (!$invoice || $invoice->status !== 'paid' || $order->status !== 'completed') {
                        $isAvailable = false;
                    }
                }

                // 🔹 Direct dinein/takeaway orders
                foreach ($table->orders as $order) {
                    $invoice = $order->invoice;

                    if (!$bookedBy && $order->member) {
                        $bookedBy = [
                            'order_id' => $order->id,
                            'id' => $order->member->user_id,
                            'name' => $order->member->full_name,
                            'type' => $order->order_type,
                        ];
                    }

                    if (!$invoice || $invoice->status !== 'paid' || $order->status !== 'completed') {
                        $isAvailable = false;
                    }
                }

                $table->is_available = $isAvailable;
                $table->booked_by = $bookedBy;

                if ($isAvailable) {
                    $availableCapacity += $table->capacity;
                }
            }
        }

        Log::info($floor);

        return response()->json([
            'floor' => $floor,
            'total_capacity' => $totalCapacity,
            'available_capacity' => $availableCapacity,
        ]);
    }

    public function tableOrderDetails(Request $request, $id)
    {
        // Check if ID is an order
        $order = Order::with([
            'member:id,user_id,full_name',
            'table:id,table_no',
            'orderItems:id,order_id,order_item,status',
        ])->find($id);

        if ($order) {
            // Attach invoice dynamically
            $invoice = FinancialInvoice::whereJsonContains('data->order_id', $order->id)
                ->select('id', 'total_price', 'amount', 'data', 'status')
                ->first();
            $order->invoice = $invoice;

            return response()->json(['success' => true, 'type' => 'order', 'data' => $order]);
        }

        // Otherwise, check if ID is a reservation
        $reservation = Reservation::with([
            'member:id,user_id,full_name',
            'table:id,table_no',
            'order.orderItems:id,order_id,order_item,status',
        ])->find($id);

        if ($reservation) {
            // Attach invoice dynamically to reservation's order
            if ($reservation->order) {
                $invoice = FinancialInvoice::whereJsonContains('data->order_id', $reservation->order->id)
                    ->select('id', 'total_price', 'amount', 'data', 'status')
                    ->first();
                $reservation->order->invoice = $invoice;
            }

            return response()->json(['success' => true, 'type' => 'reservation', 'data' => $reservation]);
        }

        return response()->json(['success' => false, 'message' => 'Not found'], 404);
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
