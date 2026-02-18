<?php

namespace App\Http\Controllers;

use App\Models\FinancialInvoice;
use App\Models\Floor;
use App\Models\Order;
use App\Models\Reservation;
use App\Models\Table;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class FloorController extends Controller
{
    private function restaurantId(Request $request = null)
    {
        $request = $request ?? request();
        $requestedId = $request->query('restaurant_id') ?? $request->input('restaurant_id');

        if ($requestedId !== null && $requestedId !== '') {
            $user = Auth::guard('tenant')->user() ?? Auth::user();
            $tenants = $user ? $user->getAccessibleTenants() : collect();

            if ($tenants->contains(fn($t) => (string) $t->id === (string) $requestedId)) {
                return $requestedId;
            }
        }

        return $request->session()->get('active_restaurant_id') ?? tenant('id');
    }

    private function tableManagementRouteName(Request $request = null): string
    {
        $request = $request ?? request();
        return $request->routeIs('pos.*') ? 'pos.table.management' : 'table.management';
    }

    public function index()
    {
        $restaurantId = $this->restaurantId();

        $floors = Floor::where('location_id', $restaurantId)->get();
        $tables = Table::with('floor')
            ->where('location_id', $restaurantId)
            ->get();
        return Inertia::render('App/Table/Newfloor', [
            'floorsdata' => $floors,
            'tablesData' => $tables,
            'allrestaurants' => (Auth::guard('tenant')->user() ?? Auth::user())
                ?->getAccessibleTenants()
                ?->map(fn($t) => ['id' => $t->id, 'name' => $t->name])
                ?->values() ?? collect(),
            'activeTenantId' => $restaurantId,
        ]);
    }

    public function create()
    {
        $restaurantId = $this->restaurantId();

        return Inertia::render('App/Table/Newfloor', [
            'allrestaurants' => (Auth::guard('tenant')->user() ?? Auth::user())
                ?->getAccessibleTenants()
                ?->map(fn($t) => ['id' => $t->id, 'name' => $t->name])
                ?->values() ?? collect(),
            'activeTenantId' => $restaurantId,
        ]);
    }

    public function store(Request $request)
    {
        $restaurantId = $this->restaurantId($request);

        $request->validate([
            'floor.name' => 'nullable|string|max:255',
            'tables' => 'required|array|min:1',
            'tables.*.table_no' => 'required|string|max:255',
            'tables.*.capacity' => 'required|integer|min:1',
        ]);

        // Check for duplicate table_no
        $tableNumbers = array_map(fn($table) => $table['table_no'], $request->tables);
        if (count($tableNumbers) !== count(array_unique($tableNumbers))) {
            return back()->withErrors(['tables' => 'Duplicate table numbers are not allowed.']);
        }

        $floorName = trim((string) data_get($request->input('floor', []), 'name', ''));

        $floor = null;
        if ($floorName !== '') {
            $floor = Floor::create([
                'name' => $floorName,
                'area' => 'N/A',
                'tenant_id' => $restaurantId,
                'location_id' => $restaurantId,
            ]);
        }

        foreach ($request->tables as $tableData) {
            if ($floor) {
                $floor->tables()->create([
                    'table_no' => $tableData['table_no'],
                    'capacity' => $tableData['capacity'],
                    'tenant_id' => $restaurantId,
                    'location_id' => $restaurantId,
                ]);
            } else {
                Table::create([
                    'floor_id' => null,
                    'table_no' => $tableData['table_no'],
                    'capacity' => $tableData['capacity'],
                    'tenant_id' => $restaurantId,
                    'location_id' => $restaurantId,
                ]);
            }
        }

        return redirect()->route($this->tableManagementRouteName($request))->with('success', 'Floors and Tables added!');
    }

    public function floorTable()
    {
        $restaurantId = $this->restaurantId();

        $floors = Floor::where('location_id', $restaurantId)->get();
        $tables = Table::with('floor')
            ->where('location_id', $restaurantId)
            ->get();

        return Inertia::render('App/Table/Dashboard', [
            'floorsdata' => $floors,
            'tablesData' => $tables,
            'allrestaurants' => (Auth::guard('tenant')->user() ?? Auth::user())
                ?->getAccessibleTenants()
                ?->map(fn($t) => ['id' => $t->id, 'name' => $t->name])
                ?->values() ?? collect(),
            'activeTenantId' => $restaurantId,
        ]);
    }

    public function toggleStatus(Request $request, $id)
    {
        $restaurantId = $this->restaurantId($request);
        $floor = Floor::where('location_id', $restaurantId)->findOrFail($id);
        $floor->status = $request->status;
        $floor->save();

        return redirect()->back();
    }

    public function createOrEdit($id = null)
    {
        $restaurantId = $this->restaurantId();
        $floor = null;
        if ($id === 'no_floor' || $id === 'no-floor') {
            $tables = Table::where('location_id', $restaurantId)
                ->whereNull('floor_id')
                ->select('id', 'floor_id', 'table_no', 'capacity')
                ->orderBy('id')
                ->get();

            $floor = (object) [
                'id' => 'no_floor',
                'name' => null,
                'tables' => $tables,
            ];
        } elseif ($id) {
            $floor = Floor::where('location_id', $restaurantId)->with('tables')->findOrFail($id);
        }

        return Inertia::render('App/Table/Newfloor', [
            'floorInfo' => $floor,
            'allrestaurants' => (Auth::guard('tenant')->user() ?? Auth::user())
                ?->getAccessibleTenants()
                ?->map(fn($t) => ['id' => $t->id, 'name' => $t->name])
                ?->values() ?? collect(),
            'activeTenantId' => $restaurantId,
        ]);
    }

    public function updateNoFloor(Request $request)
    {
        $restaurantId = $this->restaurantId($request);

        $request->validate([
            'tables' => 'required|array|min:1',
            'tables.*.table_no' => 'required|string|max:255',
            'tables.*.capacity' => 'required|integer|min:1',
        ]);

        $tableNumbers = array_map(fn($table) => $table['table_no'], $request->tables);
        if (count($tableNumbers) !== count(array_unique($tableNumbers))) {
            return back()->withErrors(['tables' => 'Duplicate table numbers are not allowed.']);
        }

        $existingTableIds = Table::where('location_id', $restaurantId)
            ->whereNull('floor_id')
            ->pluck('id')
            ->toArray();

        $requestTableIds = [];

        foreach ($request->tables as $tableData) {
            $tableId = $tableData['id'] ?? null;

            if ($tableId && str_starts_with((string) $tableId, 'new')) {
                Table::create([
                    'floor_id' => null,
                    'table_no' => $tableData['table_no'],
                    'capacity' => $tableData['capacity'],
                    'tenant_id' => $restaurantId,
                    'location_id' => $restaurantId,
                ]);
                continue;
            }

            if ($tableId && str_starts_with((string) $tableId, 'update-')) {
                $realId = (int) str_replace('update-', '', (string) $tableId);
                $requestTableIds[] = $realId;

                Table::where('location_id', $restaurantId)
                    ->whereNull('floor_id')
                    ->where('id', $realId)
                    ->update([
                        'table_no' => $tableData['table_no'],
                        'capacity' => $tableData['capacity'],
                    ]);
                continue;
            }

            if (is_numeric($tableId)) {
                $requestTableIds[] = (int) $tableId;
            }
        }

        $toDelete = array_diff($existingTableIds, $requestTableIds);
        if (!empty($toDelete)) {
            Table::where('location_id', $restaurantId)
                ->whereNull('floor_id')
                ->whereIn('id', $toDelete)
                ->delete();
        }

        return redirect()->route($this->tableManagementRouteName($request))->with('success', 'Tables updated successfully!');
    }

    public function edit($id)
    {
        $restaurantId = $this->restaurantId();

        $floor = Floor::where('location_id', $restaurantId)->with('tables')->findOrFail($id);
        $floors = Floor::where('location_id', $restaurantId)->get();
        $tables = Table::with('floor')
            ->where('location_id', $restaurantId)
            ->get();

        return Inertia::render('App/Table/Newfloor', [
            'floorInfo' => $floor,
            'floorsdata' => $floors,
            'tablesData' => $tables,
            'allrestaurants' => (Auth::guard('tenant')->user() ?? Auth::user())
                ?->getAccessibleTenants()
                ?->map(fn($t) => ['id' => $t->id, 'name' => $t->name])
                ?->values() ?? collect(),
            'activeTenantId' => $restaurantId,
        ]);
    }

    public function update(Request $request, $id)
    {
        $restaurantId = $this->restaurantId($request);

        $request->validate([
            'floor.name' => 'required|string|max:255',
            'tables' => 'required|array|min:1',
            'tables.*.table_no' => 'required|string|max:255',
            'tables.*.capacity' => 'required|integer|min:1',
        ]);

        $floor = Floor::where('location_id', $restaurantId)->findOrFail($id);

        // Update floor details
        $floor->update([
            'name' => $request->floor['name'],
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
                    'tenant_id' => $restaurantId,
                    'location_id' => $restaurantId,
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

        return redirect()->route($this->tableManagementRouteName($request))->with('success', 'Floor and tables updated successfully!');
    }

    public function getFloors(Request $request)
    {
        $restaurantId = $this->restaurantId($request);

        $date = $request->date;
        $floorId = $request->floor;

        $parsedDate = Carbon::parse($date)->startOfDay();

        $isNoFloor = $floorId === 'no_floor' || $floorId === null || $floorId === '';

        if ($isNoFloor) {
            $tables = Table::where('location_id', $restaurantId)
                ->whereNull('floor_id')
                ->whereDate('created_at', '<=', $parsedDate)
                ->select('id', 'floor_id', 'table_no', 'capacity')
                ->with([
                    'reservations' => function ($resQuery) use ($parsedDate, $restaurantId) {
                        $resQuery
                            ->where('location_id', $restaurantId)
                            ->whereDate('date', $parsedDate)
                            ->select('id', 'table_id', 'date', 'start_time', 'end_time', 'member_id', 'customer_id')
                            ->with([
                                'order' => function ($orderQuery) {
                                    $orderQuery->select('id', 'reservation_id', 'table_id', 'status', 'order_type', 'start_date', 'member_id');
                                },
                                'member:id,full_name',
                                'customer:id,name',
                            ]);
                    },
                    'orders' => function ($orderQuery) use ($parsedDate, $restaurantId) {
                        $orderQuery
                            ->where('location_id', $restaurantId)
                            ->whereDate('start_date', $parsedDate)
                            ->whereNull('reservation_id')
                            ->whereIn('order_type', ['dinein', 'takeaway'])
                            ->whereIn('status', ['pending', 'in_progress'])
                            ->select('id', 'table_id', 'order_type', 'status', 'start_date', 'member_id', 'customer_id')
                            ->with([
                                'member:id,full_name',
                                'customer:id,name',
                            ]);
                    }
                ])
                ->get();

            $floor = (object) [
                'id' => null,
                'name' => 'No Floor',
                'tables' => $tables,
            ];
        } else {
            $floor = Floor::where('location_id', $restaurantId)
                ->where('id', $floorId)
                ->whereDate('created_at', '<=', $parsedDate)
                ->with(['tables' => function ($query) use ($parsedDate, $restaurantId) {
                    $query
                        ->where('location_id', $restaurantId)
                        ->whereDate('created_at', '<=', $parsedDate)
                        ->select('id', 'floor_id', 'table_no', 'capacity')
                        ->with([
                            'reservations' => function ($resQuery) use ($parsedDate, $restaurantId) {
                                $resQuery
                                    ->where('location_id', $restaurantId)
                                    ->whereDate('date', $parsedDate)
                                    ->select('id', 'table_id', 'date', 'start_time', 'end_time', 'member_id', 'customer_id')
                                    ->with([
                                        'order' => function ($orderQuery) {
                                            $orderQuery->select('id', 'reservation_id', 'table_id', 'status', 'order_type', 'start_date', 'member_id');
                                        },
                                        'member:id,full_name',
                                        'customer:id,name',
                                    ]);
                            },
                            'orders' => function ($orderQuery) use ($parsedDate, $restaurantId) {
                                $orderQuery
                                    ->where('location_id', $restaurantId)
                                    ->whereDate('start_date', $parsedDate)
                                    ->whereNull('reservation_id')
                                    ->whereIn('order_type', ['dinein', 'takeaway'])
                                    ->whereIn('status', ['pending', 'in_progress'])
                                    ->select('id', 'table_id', 'order_type', 'status', 'start_date', 'member_id', 'customer_id')
                                    ->with([
                                        'member:id,full_name',
                                        'customer:id,name',
                                    ]);
                            }
                        ]);
                }])->first();
        }

        $totalCapacity = 0;
        $availableCapacity = 0;

        if ($floor) {
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

                    // Priority: customer first, then member
                    if (!$bookedBy) {
                        if ($reservation->customer) {
                            $bookedBy = [
                                'reservation_id' => $reservation->id,
                                'id' => $reservation->customer->id,
                                'name' => $reservation->customer->name,
                                'time_slot' => $reservation->start_time . ' - ' . $reservation->end_time,
                                'type' => 'customer',
                            ];
                        } elseif ($reservation->member) {
                            $bookedBy = [
                                'reservation_id' => $reservation->id,
                                'id' => $reservation->member->id,
                                'name' => $reservation->member->full_name,
                                'time_slot' => $reservation->start_time . ' - ' . $reservation->end_time,
                                'type' => 'member',
                            ];
                        }
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

                    // Priority: customer first, then member
                    if (!$bookedBy) {
                        if ($order->customer) {
                            $bookedBy = [
                                'order_id' => $order->id,
                                'id' => $order->customer->id,
                                'name' => $order->customer->name,
                                'order_type' => $order->order_type,
                                'type' => 'customer',
                            ];
                        } elseif ($order->member) {
                            $bookedBy = [
                                'order_id' => $order->id,
                                'id' => $order->member->id,
                                'name' => $order->member->full_name,
                                'order_type' => $order->order_type,
                                'type' => 'member',
                            ];
                        }
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
            'member:id,full_name',
            'customer:id,name,customer_no',
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
            'member:id,full_name',
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

        return redirect()->route($this->tableManagementRouteName())->with('success', 'Floor deleted!');
    }

    public function floorAll()
    {
        $floorTables = Floor::select('id', 'name')->where('status', 1)->with('tables:id,floor_id,table_no,capacity')->get();

        return response()->json(['success' => true, 'floors' => $floorTables]);
    }
}
