<?php

namespace App\Http\Controllers;

use App\Events\OrderCreated;
use App\Models\Category;
use App\Models\FinancialInvoice;
use App\Models\Floor;
use App\Models\Invoices;
use App\Models\Member;
use App\Models\MemberType;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariantValue;
use App\Models\Reservation;
use App\Models\Table;
use App\Models\Tenant;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Mike42\Escpos\PrintConnectors\NetworkPrintConnector;
use Mike42\Escpos\Printer;

class OrderController extends Controller
{
    // Show new order page
    public function index(Request $request)
    {
        $orderNo = $this->getOrderNo();
        $memberTypes = MemberType::select('id', 'name')->get();

        $floorData = null;
        $tableData = null;

        // If query params exist, fetch floor and table
        if ($request->filled('floor')) {
            $floorId = $request->get('floor');
            $tableId = $request->get('table');

            $floorQuery = Floor::select('id', 'name')
                ->where('status', 1)
                ->where('id', $floorId);

            if ($tableId) {
                // Directly fetch the single table instead of returning an array
                $tableData = Table::select('id', 'floor_id', 'table_no', 'capacity')
                    ->where('floor_id', $floorId)
                    ->where('id', $tableId)
                    ->first();
            }

            $floorData = $floorQuery->first();
        }

        return Inertia::render('App/Order/New/Index', [
            'orderNo' => $orderNo,
            'memberTypes' => $memberTypes,
            'selectedFloor' => $floorData,
            'selectedTable' => $tableData,
        ]);
    }

    public function getFloorsWithTables()
    {
        $today = Carbon::today()->toDateString();
        $now = Carbon::now('Asia/Karachi');

        $floorTables = Floor::select('id', 'name')
            ->where('status', 1)
            ->with(['tables' => function ($query) use ($today) {
                $query
                    ->select('id', 'floor_id', 'table_no', 'capacity')
                    ->with([
                        'orders' => function ($orderQuery) use ($today) {
                            $orderQuery
                                ->select('id', 'table_id', 'status', 'start_date')
                                ->whereDate('start_date', $today)
                                ->whereIn('status', ['pending', 'in_progress', 'completed']);
                        },
                        'reservations' => function ($resQuery) use ($today) {
                            $resQuery
                                ->select('id', 'table_id', 'date', 'start_time', 'end_time', 'status')
                                ->whereDate('date', $today)
                                ->with([
                                    'order' => function ($q) {
                                        $q
                                            ->select('id', 'table_id', 'status');
                                    }
                                ]);
                        }
                    ]);
            }])
            ->get();
        // 🔗 Attach invoices manually
        $floorTables->each(function ($floor) {
            $floor->tables->each(function ($table) {
                $table->orders->each(function ($order) {
                    $invoice = FinancialInvoice::whereJsonContains('data->order_id', $order->id)
                        ->select('id', 'status', 'data')
                        ->first();
                    $order->invoice = $invoice;
                });

                // If you also want reservation’s order invoice
                $table->reservations->each(function ($reservation) {
                    if ($reservation->order) {
                        $invoice = FinancialInvoice::whereJsonContains('data->order_id', $reservation->order->id)
                            ->select('id', 'status', 'data')
                            ->first();
                        $reservation->order->invoice = $invoice;
                    }
                });
            });
        });

        foreach ($floorTables as $floor) {
            foreach ($floor->tables as $table) {
                $isAvailable = true;

                // 🔹 Check reservations first
                foreach ($table->reservations as $reservation) {
                    $startTime = Carbon::parse($reservation->date . ' ' . $reservation->start_time, 'Asia/Karachi')->subMinutes(15);
                    $endTime = Carbon::parse($reservation->date . ' ' . $reservation->end_time, 'Asia/Karachi')->addMinutes(5);

                    // Only block table if current time is within reservation window and reservation not completed
                    if ($reservation->status !== 'completed' && $now->between($startTime, $endTime)) {
                        if ($reservation->order) {
                            $invoice = $reservation->order->invoice;
                            if (!$invoice || $invoice->status !== 'paid' || $reservation->order->status !== 'completed') {
                                $isAvailable = false;
                                break;
                            }
                        } else {
                            // No order but reservation is active → block table
                            $isAvailable = false;
                            break;
                        }
                    }
                }

                // 🔹 If still available, check direct orders (not tied to reservation)
                if ($isAvailable) {
                    foreach ($table->orders as $order) {
                        $invoice = $order->invoice;

                        if (
                            !$invoice ||
                            $invoice->status !== 'paid' ||
                            $order->status !== 'completed'
                        ) {
                            $isAvailable = false;
                            break;
                        }
                    }
                }

                $table->is_available = $isAvailable;

                // Hide relations from response
                unset($table->orders, $table->reservations);
            }
        }

        return response()->json($floorTables);
    }

    public function orderManagement(Request $request)
    {
        $orders = Order::with(['table:id,table_no', 'orderItems:id,order_id,tenant_id,order_item,status,remark,instructions,cancelType', 'member:id,user_id,member_type_id,full_name,membership_no', 'member.memberType:id,name'])->latest()->get();
        $categoriesList = Category::where('tenant_id', tenant()->id)->select('id', 'name')->get();
        $allrestaurants = Tenant::select('id', 'name')->get();

        return Inertia::render('App/Order/Management/Dashboard', compact('orders', 'categoriesList', 'allrestaurants'));
    }

    public function savedOrder()
    {
        $today = Carbon::today()->toDateString();
        $orders = Reservation::whereDate('date', $today)
            ->with('member:user_id,full_name,membership_no', 'table:id,table_no')
            ->get();

        return response()->json([
            'SavedOrders' => $orders,
        ]);
    }

    public function orderMenu(Request $request)
    {
        $totalSavedOrders = Order::where('status', 'saved')->count();
        $allrestaurants = Tenant::select('id', 'name')->get();
        $activeTenantId = tenant()->id;
        $latestCategory = Category::where('tenant_id', $activeTenantId)->latest()->first();
        $firstCategoryId = $latestCategory->id ?? null;

        // 🔎 Case 1: Reservation flow
        $reservation = null;
        if ($request->has('reservation_id')) {
            $reservation = Reservation::where('id', $request->reservation_id)
                ->with([
                    'member:user_id,full_name,membership_no',
                    'table:id,table_no,floor_id',
                ])
                ->first();
        }

        // 🔎 Case 2: Direct order flow (via query params)
        $orderContext = null;
        if ($request->has('order_type')) {
            if ($request->filled('order_type')) {
                $orderContext = [
                    'order_type' => $request->get('order_type'),
                ];
            }
            if ($request->filled('person_count')) {
                $orderContext = [
                    'person_count' => $request->get('person_count'),
                ];
            }

            // Member
            if ($request->filled('member_id')) {
                $member = Member::select('user_id', 'full_name', 'membership_no')
                    ->where('user_id', $request->member_id)
                    ->first();
                $orderContext['member'] = [
                    'id' => $member->user_id,
                    'name' => $member->full_name,
                    'membership_no' => $member->membership_no,
                ];
            }

            // Table
            if ($request->filled('table_id')) {
                $orderContext['table'] = Table::select('id', 'table_no', 'floor_id')
                    ->find($request->table_id);
            }

            // Waiter
            if ($request->filled('waiter_id')) {
                $orderContext['waiter'] = User::select('id', 'name')
                    ->find($request->waiter_id);
            }

            // Floor (optional, in case frontend needs it separately)
            if ($request->filled('floor_id')) {
                $orderContext['floor'] = $request->get('floor_id');
            }
        }

        $orderNo = $this->getOrderNo();

        return Inertia::render('App/Order/OrderMenu', [
            'totalSavedOrders' => $totalSavedOrders,
            'allrestaurants' => $allrestaurants,
            'activeTenantId' => $activeTenantId,
            'firstCategoryId' => $firstCategoryId,
            'reservation' => $reservation,  // Reservation flow
            'orderContext' => $orderContext,  // Direct order flow with related details
            'orderNo' => $orderNo,
        ]);
    }

    // Get next order number
    private function getOrderNo()
    {
        $lastOrder = Order::select('id')->latest()->first();
        $orderNo = $lastOrder ? (int) $lastOrder->id + 1 : 1;
        return $orderNo;
    }

    private function getInvoiceNo()
    {
        $invoicNo = FinancialInvoice::max('invoice_no');
        $invoicNo = (int) $invoicNo + 1;
        return $invoicNo;
    }

    public function sendToKitchen(Request $request)
    {
        $request->validate([
            'member.id' => 'required|exists:members,user_id',
            'order_items' => 'required|array',
            'order_items.*.id' => 'required|exists:products,id',
            'price' => 'required|numeric',
            'kitchen_note' => 'nullable|string',
            'staff_note' => 'nullable|string',
            'payment_note' => 'nullable|string',
            'reservation_id' => 'nullable|exists:reservations,id',
        ]);

        DB::beginTransaction();

        try {
            $order = Order::updateOrCreate(
                ['id' => $request->id],
                [
                    'member_id' => $request->member['id'],
                    'waiter_id' => $request->waiter['id'] ?? null,
                    'table_id' => $request->table['id'] ?? null,
                    'order_type' => $request->order_type,
                    'person_count' => $request->person_count,
                    'start_date' => Carbon::parse($request->date)->toDateString(),
                    'start_time' => $request->time,
                    'down_payment' => $request->down_payment,
                    'amount' => $request->price,
                    'status' => 'pending',
                    'kitchen_note' => $request->kitchen_note,
                    'staff_note' => $request->staff_note,
                    'payment_note' => $request->payment_note,
                    'reservation_id' => $request->reservation_id ?? null,
                ]
            );

            // Mark reservation completed
            if ($request->order_type === 'reservation' && $request->filled('reservation_id')) {
                Reservation::where('id', $request->reservation_id)->update([
                    'status' => 'completed'
                ]);
            }

            $groupedByKitchen = collect($request->order_items)->groupBy('tenant_id');
            $totalCostPrice = 0;

            foreach ($groupedByKitchen as $kitchenId => $items) {
                $safeKitchenId = is_numeric($kitchenId) ? (int) $kitchenId : (string) $kitchenId;

                foreach ($items as $item) {
                    $productId = $item['id'];
                    $productQty = $item['quantity'] ?? 1;

                    $product = Product::find($productId);

                    if (!$product || $product->current_stock < $productQty || $product->minimal_stock > $product->current_stock - $productQty) {
                        throw new \Exception('Insufficient stock for product: ' . ($product->name ?? 'Unknown'));
                    }

                    $product->decrement('current_stock', $productQty);

                    if (!empty($item['variants'])) {
                        foreach ($item['variants'] as $variant) {
                            $variantValue = ProductVariantValue::find($variant['id']);
                            if (!$variantValue || $variantValue->stock < 0) {
                                throw new \Exception('Insufficient stock for variant: ' . ($variantValue->name ?? 'Unknown'));
                            }
                            $totalCostPrice += $variantValue->additional_price;
                            $variantValue->decrement('stock', 1);
                        }
                    }

                    $totalCostPrice += $product->cost_of_goods_sold * $productQty;

                    OrderItem::create([
                        'order_id' => $order->id,
                        'tenant_id' => $safeKitchenId,
                        'order_item' => $item,
                        'status' => 'pending',
                    ]);
                }
            }

            $order->update([
                'tax' => $request->tax,
                'discount' => $request->discount,
                'total_price' => $request->total_price,
                'cost_price' => $totalCostPrice,
            ]);

            FinancialInvoice::create([
                'invoice_no' => $this->getInvoiceNo(),
                'member_id' => $request->member['id'],
                'invoice_type' => 'food_order',
                'amount' => $request->price,
                'total_price' => $request->total_price,
                'discount_type' => $request->discount_type,
                'discount_value' => $request->discount_type ? (float) $request->discount_value : 0,
                'payment_method' => 'cash',
                'issue_date' => Carbon::now(),
                'status' => 'unpaid',
                'data' => [
                    'order_id' => $order->id,
                ],
            ]);

            DB::commit();

            $order->load(['table', 'orderItems']);
            broadcast(new OrderCreated($order));
            $this->printOrdersForKitchens($groupedByKitchen, $order);

            return response()->json([
                'success' => true,
                'message' => 'Order sent to kitchen successfully.',
                'order' => $order
            ]);
        } catch (\Throwable $th) {
            DB::rollBack();
            Log::error('Error sending order to kitchen: ' . $th->getMessage());

            return response()->json([
                'success' => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    protected function printOrdersForKitchens($groupedByKitchen, $order)
    {
        foreach ($groupedByKitchen as $kitchenId => $items) {
            $kitchen = Tenant::find($kitchenId);
            if (!$kitchen || !$kitchen->printer_ip)
                continue;

            try {
                $printerIp = $kitchen->printer_ip;
                $printerPort = $kitchen->printer_port ?? 9100;

                $connector = new NetworkPrintConnector($printerIp, $printerPort);
                $printer = new Printer($connector);

                // Print header
                $printer->setJustification(Printer::JUSTIFY_CENTER);
                $printer->text("Kitchen: {$kitchen->name}\n");
                $printer->text("Order #: {$order->id}\n");
                $printer->text("Table: {$order->table->table_no}\n");
                $printer->text(date('Y-m-d H:i:s') . "\n");
                $printer->text("--------------------------------\n");

                // Print each item
                foreach ($items as $item) {
                    $this->printItem($printer, $item);
                }

                // Finalize the print
                $printer->feed(1);
                $printer->cut();
                $printer->close();
            } catch (\Throwable $th) {
                Log::error("Printer error for Kitchen {$kitchenId}: " . $th->getMessage());
            }
        }
    }

    protected function printItem($printer, $item)
    {
        // Print the category if available
        if (isset($item['category']) && !empty($item['category'])) {
            $printer->setJustification(Printer::JUSTIFY_CENTER);
            $printer->text("Category: {$item['category']}\n");
        }

        // Print item basic info
        $printer->setJustification(Printer::JUSTIFY_LEFT);
        $printer->text("- {$item['name']} x {$item['quantity']}\n");

        // Print item variants
        if (isset($item['variants']) && !empty($item['variants'])) {
            foreach ($item['variants'] as $variant) {
                $printer->text("  > {$variant['name']}: {$variant['value']}\n");
            }
        }

        // Add separator
        $printer->text("--------------------------------\n");
    }

    // update Order

    public function update(Request $request, $id)
    {
        // Validate status and items first
        $validated = $request->validate([
            'updated_items' => 'nullable|array',
            'new_items' => 'nullable|array',
            'status' => 'required|in:saved,pending,in_progress,completed,cancelled,no_show,refund',
            'subtotal' => 'nullable|numeric',
            'total_price' => 'nullable|numeric',
            'discount' => 'nullable|numeric',
        ]);

        // Custom check for subtotal/total_price dependency
        if (($request->has('subtotal') && !$request->has('total_price')) ||
                ($request->has('total_price') && !$request->has('subtotal'))) {
            return redirect()->back()->withErrors([
                'subtotal' => 'Subtotal and total_price must be provided together.'
            ]);
        }

        DB::beginTransaction();

        try {
            $order = Order::findOrFail($id);

            // Update only price fields if both are present
            // Update order fields
            $updateData = [
                'status' => $validated['status'],
                'remark' => $request->remark ?? null,
                'instructions' => $request->instructions ?? null,
                'cancelType' => $request->cancelType ?? null,
            ];

            if ($request->has('subtotal') && $request->has('total_price')) {
                $updateData['amount'] = $validated['subtotal'];
                $updateData['total_price'] = $validated['total_price'];
            }

            $order->update($updateData);

            // Update existing order items
            foreach ($validated['updated_items'] ?? [] as $itemData) {
                $itemId = (int) str_replace('update-', '', $itemData['id']);
                $order->orderItems()->where('id', $itemId)->update([
                    'order_item' => $itemData['order_item'],
                    'status' => $itemData['status'],
                    'remark' => $itemData['remark'] ?? null,
                    'instructions' => $itemData['instructions'] ?? null,
                    'cancelType' => $itemData['cancelType'] ?? null,
                ]);
            }

            // Add new order items
            foreach ($validated['new_items'] ?? [] as $itemData) {
                $order->orderItems()->create([
                    'tenant_id' => $itemData['order_item']['tenant_id'] ?? null,
                    'order_item' => $itemData['order_item'],
                    'status' => 'pending',
                ]);
            }

            // Update financial invoice if exists and not paid
            $financialInvoice = FinancialInvoice::where('member_id', $order->member_id)
                ->where('invoice_type', 'food_order')
                ->whereJsonContains('data', ['order_id' => $order->id])
                ->first();

            if ($financialInvoice && $financialInvoice->status !== 'paid') {
                if ($validated['status'] === 'cancelled' || $validated['status'] === 'refund') {
                    // Mark invoice as cancelled
                    $financialInvoice->update(['status' => 'cancelled']);
                } elseif ($request->has('subtotal') && $request->has('total_price')) {
                    // Otherwise update amounts if provided
                    $financialInvoice->update([
                        'amount' => $validated['subtotal'],
                        'total_price' => $validated['total_price'],
                    ]);
                }
            }

            DB::commit();

            return redirect()->back()->with('success', 'Order updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            report($e);
            return redirect()->back()->withErrors(['error' => 'Failed to update order.']);
        }
    }

    // Order Queue
    public function orderQueue()
    {
        $orders2 = Order::whereIn('status', ['pending', 'in_progress', 'completed'])->get();
        return Inertia::render('App/Order/Queue', compact('orders2'));
    }

    public function getProducts(Request $request, $category_id)
    {
        $order_type = $request->input('order_type', '');
        $category = Category::find($category_id);

        if (!$category) {
            return response()->json(['success' => true, 'products' => []], 200);
        }

        $productsQuery = Product::with(['variants:id,product_id,name', 'variants.values', 'category'])->where('category_id', $category_id);

        // Only filter by order_type if it exists
        if ($order_type) {
            $productsQuery->whereJsonContains('available_order_types', $order_type);
        }

        $products = $productsQuery->get();

        return response()->json(['success' => true, 'products' => $products], 200);
    }

    public function getCategories(Request $request)
    {
        $tenantId = $request->query('tenant_id');
        Log::info($tenantId);
        $categories = Category::where('tenant_id', $tenantId)->latest()->get();

        return response()->json(['categories' => $categories]);
    }
}
