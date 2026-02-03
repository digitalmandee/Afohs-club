<?php

namespace App\Http\Controllers;

use App\Constants\AppConstants;
use App\Events\OrderCreated;
use App\Helpers\FileHelper;
use App\Jobs\PrintOrderJob;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Employee;
use App\Models\FinancialInvoice;
use App\Models\FinancialInvoiceItem;
use App\Models\FinancialReceipt;
use App\Models\Floor;
use App\Models\GuestType;
use App\Models\Invoices;
use App\Models\Member;
use App\Models\MemberType;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariantValue;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\RoomBooking;
use App\Models\RoomServiceOrder;
use App\Models\RoomType;
use App\Models\Table;
use App\Models\Tenant;
use App\Models\Transaction;
use App\Models\TransactionRelation;
use App\Models\User;
use App\Models\Variant;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
        $guestTypes = GuestType::where('status', 1)->select('id', 'name')->get();

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
            'floorData' => $floorData,
            'tableData' => $tableData,
            // 'memberTypes' => $memberTypes, // Removed to avoid confusion if not needed
            'guestTypes' => $guestTypes,
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

    public function getRoomsForOrder()
    {
        $roomTypes = RoomType::with(['rooms' => function ($query) {
            $query
                ->select('id', 'name', 'room_type_id')
                ->with(['currentBooking' => function ($q) {
                    $q
                        ->select('id', 'room_id', 'booking_no', 'status', 'member_id', 'customer_id', 'guest_first_name', 'guest_last_name', 'check_in_date', 'check_out_date')
                        ->whereDate('check_out_date', '>=', Carbon::today())
                        ->with(['member', 'customer']);
                }]);
        }])->get();

        return response()->json($roomTypes);
    }

    public function orderManagement(Request $request)
    {
        $filters = $request->only('search_id', 'search_name', 'search_membership', 'time', 'type', 'start_date', 'end_date');
        $allrestaurants = Tenant::select('id', 'name')->get();

        // Check if request expects JSON (Axios call)
        if ($request->wantsJson()) {
            $query = Order::with([
                'table:id,table_no',
                'orderItems:id,order_id,tenant_id,order_item,status,remark,instructions,cancelType',
                'member:id,member_type_id,full_name,membership_no',
                'customer:id,name,customer_no',
                'employee:id,employee_id,name',
                'member.memberType:id,name'
            ]);

            // ✅ Exclude paid orders from Order Management (table is free after payment)
            // But INCLUDE 'awaiting' payment status (so generated invoices show up)
            $query->where(function ($q) {
                $q
                    ->whereNull('payment_status')
                    ->orWhere('payment_status', '!=', 'paid');
            });

            // 🔍 Search By ID
            if ($request->filled('search_id')) {
                $query->where('id', $request->search_id);
            }

            // 🔍 Search By Client Name
            if ($request->filled('search_name')) {
                $searchName = trim(preg_replace('/\s+/', ' ', $request->search_name));
                $query->where(function ($q) use ($searchName) {
                    $q
                        ->whereHas('member', fn($q) => $q->where('full_name', 'like', "%$searchName%"))
                        ->orWhereHas('customer', fn($q) => $q->where('name', 'like', "%$searchName%"))
                        ->orWhereHas('employee', fn($q) => $q->where('name', 'like', "%$searchName%"));
                });
            }

            // 🔍 Search By Membership No
            if ($request->filled('search_membership')) {
                $searchMembership = trim($request->search_membership);
                $query->where(function ($q) use ($searchMembership) {
                    $q
                        ->whereHas('member', fn($q) => $q->where('membership_no', 'like', "%$searchMembership%"))
                        ->orWhereHas('customer', fn($q) => $q->where('customer_no', 'like', "%$searchMembership%"))
                        ->orWhereHas('employee', fn($q) => $q->where('employee_id', 'like', "%$searchMembership%"));
                });
            }

            // 📅 Time filter
            if ($request->time && $request->time !== 'all') {
                $today = now();
                switch ($request->time) {
                    case 'today':
                        $query->whereDate('start_date', $today->toDateString());
                        break;
                    case 'yesterday':
                        $query->whereDate('start_date', $today->copy()->subDay()->toDateString());
                        break;
                    case 'this_week':
                        $query->whereBetween(DB::raw('DATE(start_date)'), [$today->copy()->startOfWeek()->toDateString(), $today->copy()->endOfWeek()->toDateString()]);
                        break;
                }
            }

            // 📅 Date range filter
            if ($request->filled('start_date') && $request->filled('end_date')) {
                $query->whereBetween('start_date', [$request->start_date, $request->end_date]);
            }

            // 🍽 Order type
            if ($request->type && $request->type !== 'all') {
                $query->where('order_type', $request->type);
            }

            $orders = $query->latest()->paginate(20)->withQueryString();

            // Attach Invoice Data
            $orders->getCollection()->transform(function ($order) {
                // Optimization: In a real high-load scenario, fetch all invoices for these IDs in one go.
                // For now, keeping logic but moving to async call to unblock page load.
                $invoice = FinancialInvoice::whereJsonContains('data->order_id', $order->id)->first();
                $order->invoice = $invoice;
                return $order;
            });

            return response()->json($orders);
        }

        // Return Inertia Shell (Immediate Load)
        return Inertia::render('App/Order/Management/Dashboard', [
            'initialOrders' => null,  // Frontend will fetch
            'allrestaurants' => $allrestaurants,
            'filters' => $filters  // Pass filters to populate inputs
        ]);
    }

    public function generateInvoice($id)
    {
        DB::beginTransaction();
        try {
            $order = Order::with('orderItems', 'member', 'customer', 'employee')->findOrFail($id);

            // Check if invoice already exists
            $existingInvoice = FinancialInvoice::whereJsonContains('data->order_id', $order->id)->first();
            if ($existingInvoice) {
                return response()->json([
                    'success' => true,
                    'message' => 'Invoice already exists.',
                    'invoice' => $existingInvoice,
                    'order' => $order
                ]);
            }

            $totalPrice = $order->total_price;
            $items = $order->orderItems;

            $invoiceData = [
                'invoice_no' => $this->getInvoiceNo(),
                'invoice_type' => 'food_order',
                'amount' => $order->amount,  // Subtotal
                'total_price' => $totalPrice,  // Grand Total
                'payment_method' => null,
                'issue_date' => Carbon::now(),
                'status' => 'unpaid',
                'data' => [
                    'order_id' => $order->id,
                ],
            ];

            // Determine Payer
            if ($order->member_id) {
                $invoiceData['member_id'] = $order->member_id;
            } elseif ($order->customer_id) {
                $invoiceData['customer_id'] = $order->customer_id;
            } elseif ($order->employee_id) {
                $invoiceData['employee_id'] = $order->employee_id;
            }

            $invoice = FinancialInvoice::create($invoiceData);

            // Create Invoice Items (Aggregated)
            // Note: We are creating a single line item for the food order.
            // If detailed items are needed, loop through $items.
            // For now, consistent with sendToKitchen takeaway logic:

            $description = 'Food Order #' . $order->id;

            FinancialInvoiceItem::create([
                'invoice_id' => $invoice->id,
                'fee_type' => AppConstants::TRANSACTION_TYPE_ID_FOOD_ORDER,
                'description' => $description,
                'qty' => 1,
                'amount' => $order->amount,
                'sub_total' => $order->amount,
                'discount_type' => 'fixed',
                'discount_value' => $order->discount ?? 0,
                'discount_amount' => $order->discount ?? 0,
                'tax_amount' => $order->tax ?? 0,
                'total' => $totalPrice,
            ]);

            // Create Debit Transaction (Unpaid)
            Transaction::create([
                'type' => 'debit',
                'amount' => $totalPrice,
                'date' => now(),
                'description' => 'Invoice #' . $invoiceData['invoice_no'] . ' - Food Order',
                'payable_type' => $order->member ? Member::class : ($order->customer ? Customer::class : Employee::class),
                'payable_id' => $order->member_id ?? ($order->customer_id ?? $order->employee_id),
                'reference_type' => FinancialInvoice::class,
                'reference_id' => $invoice->id,
                'invoice_id' => $invoice->id,
                'created_by' => Auth::id(),
            ]);

            // Update Order Status
            $order->update([
                'status' => 'completed',
                'payment_status' => 'awaiting'
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Invoice generated successfully.',
                'invoice' => $invoice,
                'order' => $order
            ]);
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    public function savedOrder()
    {
        $today = Carbon::today()->toDateString();
        $orders = Reservation::whereDate('date', $today)
            ->with('member:idfull_name,membership_no', 'customer:id,name,customer_no', 'table:id,table_no')
            ->get();

        return response()->json([
            'SavedOrders' => $orders,
        ]);
    }

    public function orderMenu(Request $request)
    {
        $totalSavedOrders = Order::where('status', 'saved')->count();

        // Filter restaurants based on user's allowed tenants
        $user = Auth::user();
        $allowedTenantIds = $user->allowedTenants()->pluck('tenants.id');

        if ($allowedTenantIds->isNotEmpty()) {
            // User has specific tenant access - filter restaurants
            $allrestaurants = Tenant::whereIn('id', $allowedTenantIds)
                ->select('id', 'name')
                ->get();
        } else {
            // Admin or unrestricted user - show all restaurants
            $allrestaurants = Tenant::select('id', 'name')->get();
        }
        $activeTenantId = tenant()->id;
        $latestCategory = Category::where('tenant_id', $activeTenantId)->latest()->first();
        $firstCategoryId = $latestCategory->id ?? null;

        $orderContext = null;

        // 🔎 Case 1: Reservation flow
        $reservation = null;
        if ($request->has('reservation_id')) {
            $reservation = Reservation::where('id', $request->reservation_id)
                ->with([
                    'member:id,full_name,membership_no',
                    'customer:id,name,customer_no',
                    'table:id,table_no,floor_id',
                    'order.orderItems'
                ])
                ->first();
        }

        // 🔎 Case 1b: Room Booking flow (from Rooms selection)
        if ($request->has('room_booking_id')) {
            $roomBooking = RoomBooking::where('id', $request->room_booking_id)
                ->with([
                    'member:id,full_name,membership_no,personal_email,current_address',
                    'customer:id,name,customer_no,email,address',
                    'room:id,name'
                ])
                ->first();

            if ($roomBooking) {
                // Determine member details similar to direct flow
                $memberData = [];
                if ($roomBooking->member) {
                    $memberData = [
                        'id' => $roomBooking->member->id,
                        'booking_type' => 'member',
                        'name' => $roomBooking->member->full_name,
                        'membership_no' => $roomBooking->member->membership_no,
                        'email' => $roomBooking->member->personal_email,
                        'address' => $roomBooking->member->current_address
                    ];
                } elseif ($roomBooking->customer) {
                    $memberData = [
                        'id' => $roomBooking->customer->id,
                        'customer_no' => $roomBooking->customer->customer_no,
                        'booking_type' => 'guest',
                        'name' => $roomBooking->customer->name,
                        'email' => $roomBooking->customer->email,
                        'address' => $roomBooking->customer->address
                    ];
                } else {
                    // Walk-in guest in room? Use Guest info from booking
                    $memberData = [
                        'id' => null,  // No customer ID
                        'booking_type' => 'guest',
                        'name' => $roomBooking->guest_first_name . ' ' . $roomBooking->guest_last_name,
                        'email' => $roomBooking->guest_email ?? '',
                        'address' => $roomBooking->guest_address ?? ''
                    ];
                }

                $orderContext = [
                    'order_type' => 'room_service',
                    'room_booking_id' => $roomBooking->id,
                    'room' => $roomBooking->room,
                    'member' => $memberData
                ];
            }
        }

        // 🔎 Case 2: Direct order flow (via query params)
        if (!$orderContext && $request->has('order_type')) {
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
            if ($request->filled('member_id') && $request->filled('member_type')) {
                if ($request->member_type == 1) {
                    $member = Member::select('id', 'full_name', 'membership_no', 'personal_email', 'current_address')
                        ->where('id', $request->member_id)
                        ->first();
                    $orderContext['member'] = [
                        'id' => $member->id,
                        'booking_type' => 'member',
                        'name' => $member->full_name,
                        'membership_no' => $member->membership_no,
                        'email' => $member->personal_email,
                        'address' => $member->current_address
                    ];
                } elseif ($request->member_type == 2) {
                    $customer = Customer::select('id', 'name', 'customer_no', 'email', 'address')
                        ->where('id', $request->member_id)
                        ->first();
                    $orderContext['member'] = [
                        'id' => $customer->id,
                        'customer_no' => $customer->customer_no,
                        'booking_type' => 'guest',
                        'name' => $customer->name,
                        'email' => $customer->email,
                        'address' => $customer->address
                    ];
                } elseif ($request->member_type == 3) {
                    $employee = Employee::select('id', 'employee_id', 'name', 'email', 'phone_no')
                        ->where('id', $request->member_id)
                        ->first();
                    $orderContext['member'] = [
                        'id' => $employee->id,
                        'employee_id' => $employee->employee_id,
                        'booking_type' => 'employee',
                        'name' => $employee->name,
                        'email' => $employee->email,
                    ];
                }
            }

            // Table
            if ($request->filled('table_id')) {
                $orderContext['table'] = Table::select('id', 'table_no', 'floor_id')
                    ->find($request->table_id);
            }

            // Waiter
            if ($request->filled('waiter_id')) {
                $orderContext['waiter'] = Employee::select('id', 'name')
                    ->find($request->waiter_id);
            }

            // Floor (optional, in case frontend needs it separately)
            if ($request->filled('floor_id')) {
                $orderContext['floor'] = $request->get('floor_id');
            }
            // Room (from direct flow if needed)
            if ($request->filled('room_id')) {
                $room = Room::find($request->room_id);
                if ($room) {
                    $orderContext['room'] = $room;
                }
            }
        }

        $orderNo = $this->getOrderNo();

        // Rider
        if ($request->filled('rider_id')) {
            $orderContext['rider_id'] = $request->rider_id;
        }

        return Inertia::render('App/Order/OrderMenu', [
            'totalSavedOrders' => $totalSavedOrders,
            'allrestaurants' => $allrestaurants,
            'activeTenantId' => $activeTenantId,
            'firstCategoryId' => $firstCategoryId,
            'reservation' => $reservation,  // Reservation flow
            'is_new_order' => $request->boolean('is_new_order'),  // Flag to distinguish New Reservation flow
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
            // 'member.id' => 'required|exists:members,user_id',
            'order_items' => 'required|array',
            'order_items.*.id' => 'required|exists:products,id',
            'price' => 'required|numeric',
            'kitchen_note' => 'nullable|string',
            'staff_note' => 'nullable|string',
            'payment_note' => 'nullable|string',
            'staff_note' => 'nullable|string',
            'payment_note' => 'nullable|string',
            'reservation_id' => 'nullable|exists:reservations,id',
            'room_booking_id' => 'nullable|exists:room_bookings,id',
            'rider_id' => 'nullable|exists:employees,id',
        ]);

        DB::beginTransaction();

        try {
            $totalDue = $request->price;
            $orderType = $request->order_type;

            if ($orderType == 'takeaway' && !in_array($request->payment['payment_method'], ['ent', 'cts']) && $request->payment['paid_amount'] < $totalDue) {
                return back()->withErrors(['paid_amount' => 'The paid amount is not enough to cover the total price of the invoice.']);
            }

            $orderData = [
                'waiter_id' => $request->input('waiter.id'),
                'table_id' => $request->input('table.id'),
                'order_type' => $request->order_type,
                'person_count' => $request->person_count,
                'start_date' => Carbon::parse($request->date)->toDateString(),
                'start_time' => $request->time,
                'down_payment' => $request->down_payment,
                'amount' => $request->price,
                'kitchen_note' => $request->kitchen_note,
                'staff_note' => $request->staff_note,
                'payment_note' => $request->payment_note,
                'reservation_id' => $request->reservation_id ?? null,
                'room_booking_id' => $request->room_booking_id ?? null,
                'address' => $request->address,
                'rider_id' => $request->rider_id ?? null,
                'status' => ($request->order_type === 'reservation') ? 'saved' : 'in_progress',
            ];

            $bookingType = $request->input('member.booking_type');
            $memberId = $request->input('member.id');

            if ($bookingType == 'member') {
                $orderData['member_id'] = $memberId;
            } elseif ($bookingType == 'guest') {
                $orderData['customer_id'] = $memberId;
            } else {
                $orderData['employee_id'] = $memberId;
            }

            if ($orderType == 'takeaway') {
                $orderData['cashier_id'] = Auth::user()->id;
                $orderData['payment_method'] = $request->payment['payment_method'];
                $orderData['paid_amount'] = $request->payment['paid_amount'];

                if ($request->payment['payment_method'] === 'credit_card') {
                    $orderData['credit_card_type'] = $request->payment['credit_card_type'];
                    // Handle receipt saving if applicable
                    // Example:
                    if ($request->hasFile('receipt')) {
                        $path = FileHelper::saveImage($request->file('receipt'), 'receipts');
                        $orderData['receipt'] = $path;
                    }
                }
                if ($request->payment['payment_method'] === 'split_payment') {
                    $orderData['cash_amount'] = $request->payment['cash'];
                    $orderData['credit_card_amount'] = $request->payment['credit_card'];
                    $orderData['bank_amount'] = $request->payment['bank_transfer'];
                }
                $orderData['paid_at'] = now();
                $orderData['payment_status'] = 'paid';
            }

            $order = Order::updateOrCreate(
                ['id' => $request->id],
                $orderData
            );

            // If updating a DRAFT (saved) order, wipe items first to allow clean overwrite
            if (!$order->wasRecentlyCreated && $order->status === 'saved') {
                foreach ($order->orderItems as $existingItem) {
                    $itemData = $existingItem->order_item;
                    $qty = $itemData['quantity'] ?? 1;
                    $prodId = $itemData['id'] ?? null;

                    if ($prodId) {
                        \App\Models\Product::where('id', $prodId)->increment('current_stock', $qty);
                    }

                    if (!empty($itemData['variants'])) {
                        foreach ($itemData['variants'] as $variant) {
                            $vId = $variant['id'] ?? null;
                            if ($vId) {
                                \App\Models\ProductVariantValue::where('id', $vId)->increment('stock', 1);
                            }
                        }
                    }
                    $existingItem->delete();
                }
            }

            // Mark reservation completed (ONLY if order is active, not saved)
            if ($orderData['status'] !== 'saved' && $request->order_type === 'reservation' && $request->filled('reservation_id')) {
                Reservation::where('id', $request->reservation_id)->update([
                    'status' => 'completed'
                ]);
            }

            $groupedByKitchen = collect($request->order_items)
                ->filter(function ($item) {
                    return !empty($item['id']);
                })
                ->groupBy('tenant_id');
            $totalCostPrice = 0;

            foreach ($groupedByKitchen as $kitchenId => $items) {
                // Filter out invalid items (missing ID)
                $items = collect($items)->filter(function ($item) {
                    return !empty($item['id']);
                });
                if ($items->isEmpty())
                    continue;

                $safeKitchenId = is_numeric($kitchenId) ? (int) $kitchenId : (string) $kitchenId;

                foreach ($items as $item) {
                    $productId = $item['id'] ?? null;
                    if (!$productId)
                        continue;

                    $productQty = $item['quantity'] ?? 1;

                    $product = Product::find($productId);

                    if (!$product || $product->current_stock < $productQty || $product->minimal_stock > $product->current_stock - $productQty) {
                        throw new \Exception('Insufficient stock for product: ' . ($product->name ?? 'Unknown'));
                    }

                    $product->decrement('current_stock', $productQty);

                    if (!empty($item['variants'])) {
                        foreach ($item['variants'] as $variant) {
                            $variantId = $variant['id'] ?? null;
                            if (!$variantId)
                                continue;

                            $variantValue = ProductVariantValue::find($variantId);
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
                        'status' => 'in_progress',
                    ]);
                }
            }

            // Handle Cancelled Items (if any)
            if ($request->has('cancelled_items')) {
                $groupedCancelled = collect($request->cancelled_items)
                    ->filter(function ($item) {
                        return !empty($item['id']);
                    })
                    ->groupBy('tenant_id');

                foreach ($groupedCancelled as $kitchenId => $items) {
                    $safeKitchenId = is_numeric($kitchenId) ? (int) $kitchenId : (string) $kitchenId;

                    foreach ($items as $item) {
                        // Apply Stock Logic:
                        // Since we WIPED all items (Restoring Stock), we need to consume stock again unless it's a 'Return'.
                        // If cancelType is 'return', we do nothing (stock stays restored).
                        // If cancelType is 'void' or 'complementary', we decrement stock (consumed).

                        $cancelType = $item['cancelType'] ?? 'void';

                        if ($cancelType !== 'return') {
                            $productId = $item['id'] ?? null;
                            $productQty = $item['quantity'] ?? 1;

                            if ($productId) {
                                $product = \App\Models\Product::find($productId);
                                if ($product) {
                                    $product->decrement('current_stock', $productQty);
                                }
                            }

                            if (!empty($item['variants'])) {
                                foreach ($item['variants'] as $variant) {
                                    $vId = $variant['id'] ?? null;
                                    if ($vId) {
                                        \App\Models\ProductVariantValue::where('id', $vId)->decrement('stock', 1);
                                    }
                                }
                            }
                        }

                        OrderItem::create([
                            'order_id' => $order->id,
                            'tenant_id' => $safeKitchenId,
                            'order_item' => $item,
                            'status' => 'cancelled',  // Explicitly marked
                            'remark' => $item['remark'] ?? null,
                            'instructions' => $item['instructions'] ?? null,
                            'cancelType' => $cancelType,
                        ]);
                    }
                }
            }

            $order->update([
                'tax' => $request->tax,
                'discount' => $request->discount,
                'total_price' => $request->total_price,
                'cost_price' => $totalCostPrice,
            ]);

            // ✅ Create Invoice ONLY for takeaway (immediate payment flow)
            // For dine-in, delivery, reservation, room_service: invoice created when order marked 'completed'
            if ($orderType === 'takeaway') {
                $invoiceData = [
                    'invoice_no' => $this->getInvoiceNo(),
                    'invoice_type' => 'food_order',
                    'amount' => $request->price,
                    'total_price' => $request->total_price,
                    // discount logic moved to items
                    'payment_method' => null,
                    'issue_date' => Carbon::now(),
                    'status' => 'unpaid',
                    'data' => [
                        'order_id' => $order->id,
                    ],
                ];

                if ($bookingType == 'member') {
                    $invoiceData['member_id'] = $memberId;
                    $payerType = \App\Models\Member::class;
                    $payerId = $memberId;
                } elseif ($bookingType == 'guest') {
                    $invoiceData['customer_id'] = $memberId;
                    $payerType = \App\Models\Customer::class;
                    $payerId = $memberId;
                } else {
                    $invoiceData['employee_id'] = $memberId;
                    $payerType = \App\Models\Employee::class;
                    $payerId = $memberId;
                }

                if ($orderType == 'takeaway') {
                    $invoiceData['status'] = 'paid';
                    $invoiceData['payment_date'] = now();
                    $invoiceData['payment_method'] = $request->payment['payment_method'];
                    $invoiceData['paid_amount'] = $request->payment['paid_amount'];
                    $invoiceData['ent_reason'] = $request->payment['ent_reason'] ?? null;
                    $invoiceData['ent_comment'] = $request->payment['ent_comment'] ?? null;
                    $invoiceData['cts_comment'] = $request->payment['cts_comment'] ?? null;
                }

                $invoice = FinancialInvoice::create($invoiceData);

                // ✅ Create Invoice Items & DEBIT Transactions (Aggregated)
                if (!empty($request->order_items)) {
                    $totalGross = 0;
                    $totalDiscount = 0;
                    $totalTax = 0;
                    $itemNames = [];

                    $taxRate = $request->tax ?? 0;  // Tax rate (e.g. 0.16)

                    foreach ($request->order_items as $item) {
                        $qty = $item['quantity'] ?? 1;
                        $price = $item['price'] ?? 0;
                        $subTotal = $qty * $price;

                        // Use item discount as sum source
                        $itemDiscountAmount = $item['discount_amount'] ?? 0;

                        // Tax Calculation per item (consistent with previous logic)
                        $netAmount = $subTotal - $itemDiscountAmount;
                        $itemTaxAmount = $netAmount * $taxRate;

                        $totalGross += $subTotal;
                        $totalDiscount += $itemDiscountAmount;
                        $totalTax += $itemTaxAmount;

                        if (count($itemNames) < 3) {
                            $itemNames[] = $item['name'] ?? 'Item';
                        }
                    }

                    $totalNet = $totalGross - $totalDiscount + $totalTax;

                    $description = 'Food Order Items (' . count($request->order_items) . ') - ' . implode(', ', $itemNames) . (count($request->order_items) > 3 ? '...' : '');

                    $invoiceItem = FinancialInvoiceItem::create([
                        'invoice_id' => $invoice->id,
                        'fee_type' => AppConstants::TRANSACTION_TYPE_ID_FOOD_ORDER,  // Food Order / Room Service
                        'description' => $description,
                        'qty' => 1,  // Aggregated item count as 1 block
                        'amount' => $totalGross,
                        'sub_total' => $totalGross,
                        'discount_type' => 'fixed',  // Aggregated discount is always an amount
                        'discount_value' => $totalDiscount,
                        'discount_amount' => $totalDiscount,
                        'tax_amount' => $totalTax,
                        'total' => $totalNet,
                    ]);

                    // Create Debit Transaction for THIS aggregated invoice item
                    Transaction::create([
                        'type' => 'debit',
                        'amount' => $totalNet,
                        'date' => now(),
                        'description' => 'Invoice #' . $invoiceData['invoice_no'] . ' - Food Order',
                        'payable_type' => $payerType,
                        'payable_id' => $payerId,
                        'reference_type' => FinancialInvoiceItem::class,
                        'reference_id' => $invoiceItem->id,
                        'invoice_id' => $invoice->id,
                        'created_by' => Auth::id(),
                    ]);
                }

                // If Paid (Takeaway) -> Receipt + Credit + Allocation
                if ($orderType == 'takeaway') {
                    $receiptImg = $orderData['receipt'] ?? null;

                    // 1. Create Receipt
                    $receipt = FinancialReceipt::create([
                        'receipt_no' => time(),
                        'payer_type' => $payerType,
                        'payer_id' => $payerId,
                        'amount' => $request->payment['paid_amount'],
                        'payment_method' => $request->payment['payment_method'],
                        'receipt_date' => now(),
                        'status' => 'active',
                        'remarks' => 'Payment for Food Order #' . $invoiceData['invoice_no'],
                        'created_by' => Auth::id(),
                        'receipt_image' => $receiptImg,
                    ]);

                    // 2. Link Receipt to Invoice
                    TransactionRelation::create([
                        'invoice_id' => $invoice->id,
                        'receipt_id' => $receipt->id,
                        'amount' => $request->payment['paid_amount'],
                    ]);

                    // 3. Create SINGLE Credit Transaction (Amount Paid)
                    Transaction::create([
                        'type' => 'credit',
                        'amount' => $request->payment['paid_amount'],
                        'date' => now(),
                        'description' => 'Payment Received (Rec #' . $receipt->receipt_no . ')',
                        'payable_type' => $payerType,
                        'payable_id' => $payerId,
                        'reference_type' => FinancialInvoiceItem::class,
                        'reference_id' => $invoiceItem->id,  // Link to the summary item
                        'invoice_id' => $invoice->id,
                        'receipt_id' => $receipt->id,
                        'created_by' => Auth::id(),
                    ]);
                }
            }

            DB::commit();

            $order->load(['table', 'orderItems']);
            broadcast(new OrderCreated($order));

            // Dispatch print job (async, no delay in API response)
            dispatch(new PrintOrderJob($groupedByKitchen, $order));

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
            'tax_rate' => 'nullable|numeric',
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

            if (
                $request->has('subtotal') &&
                $request->has('total_price') &&
                $validated['subtotal'] !== null &&
                $validated['total_price'] !== null
            ) {
                $updateData['amount'] = $validated['subtotal'];
                $updateData['total_price'] = $validated['total_price'];

                // Update discount if provided
                if ($request->has('discount')) {
                    $updateData['discount'] = $validated['discount'];
                }

                // Update tax if provided
                if ($request->has('tax_rate')) {
                    $updateData['tax'] = $validated['tax_rate'];
                }
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
                    'status' => $itemData['status'] ?? 'pending',
                    'remark' => $itemData['remark'] ?? null,
                    'instructions' => $itemData['instructions'] ?? null,
                    'cancelType' => $itemData['cancelType'] ?? null,
                ]);
            }

            // Update financial invoice if exists and not paid (lookup by order_id, not member_id)
            $financialInvoice = FinancialInvoice::where('invoice_type', 'food_order')
                ->whereJsonContains('data', ['order_id' => $order->id])
                ->first();

            // ✅ AUTO-CREATE INVOICE when order marked 'completed' (for dine-in, delivery, reservation, room_service)
            // Only if a payer exists (member, customer, or employee)
            $hasPayer = $order->member_id || $order->customer_id || $order->employee_id;
            if (
                $validated['status'] === 'completed' &&
                !$financialInvoice &&
                $hasPayer &&
                in_array($order->order_type, ['dineIn', 'delivery', 'reservation', 'room_service'])
            ) {
                // Determine payer type
                if ($order->member_id) {
                    $payerType = \App\Models\Member::class;
                    $payerId = $order->member_id;
                } elseif ($order->customer_id) {
                    $payerType = \App\Models\Customer::class;
                    $payerId = $order->customer_id;
                } else {
                    $payerType = \App\Models\Employee::class;
                    $payerId = $order->employee_id;
                }

                $invoiceData = [
                    'invoice_no' => $this->getInvoiceNo(),
                    'invoice_type' => 'food_order',
                    'amount' => $order->amount ?? 0,
                    'total_price' => $order->total_price ?? 0,
                    'payment_method' => null,
                    'issue_date' => Carbon::now(),
                    'status' => 'unpaid',
                    'data' => [
                        'order_id' => $order->id,
                    ],
                ];

                if ($order->member_id) {
                    $invoiceData['member_id'] = $order->member_id;
                } elseif ($order->customer_id) {
                    $invoiceData['customer_id'] = $order->customer_id;
                } else {
                    $invoiceData['employee_id'] = $order->employee_id;
                }

                $financialInvoice = FinancialInvoice::create($invoiceData);

                // Update order payment_status to 'awaiting'
                $order->update(['payment_status' => 'awaiting']);

                // Mark reservation as completed
                if ($order->order_type === 'reservation' && $order->reservation_id) {
                    Reservation::where('id', $order->reservation_id)->update(['status' => 'completed']);
                }

                // Create Invoice Items & Debit Transaction (Aggregated)
                $orderItems = $order->orderItems()->where('status', '!=', 'cancelled')->get();
                if ($orderItems->isNotEmpty()) {
                    $totalGross = 0;
                    $totalDiscount = 0;
                    $totalTax = 0;
                    $itemNames = [];

                    $taxRate = $order->tax ?? 0;

                    foreach ($orderItems as $orderItem) {
                        $item = $orderItem->order_item;
                        $qty = $item['quantity'] ?? 1;
                        $price = $item['price'] ?? 0;
                        $subTotal = $qty * $price;

                        $itemDiscountAmount = $item['discount_amount'] ?? 0;
                        $netAmount = $subTotal - $itemDiscountAmount;
                        $itemTaxAmount = $netAmount * $taxRate;

                        $totalGross += $subTotal;
                        $totalDiscount += $itemDiscountAmount;
                        $totalTax += $itemTaxAmount;

                        if (count($itemNames) < 3) {
                            $itemNames[] = $item['name'] ?? 'Item';
                        }
                    }

                    $totalNet = $totalGross - $totalDiscount + $totalTax;

                    $description = 'Food Order Items (' . $orderItems->count() . ') - ' . implode(', ', $itemNames) . ($orderItems->count() > 3 ? '...' : '');

                    $invoiceItem = FinancialInvoiceItem::create([
                        'invoice_id' => $financialInvoice->id,
                        'fee_type' => AppConstants::TRANSACTION_TYPE_ID_FOOD_ORDER,
                        'description' => $description,
                        'qty' => 1,
                        'amount' => $totalGross,
                        'sub_total' => $totalGross,
                        'discount_type' => 'fixed',
                        'discount_value' => $totalDiscount,
                        'discount_amount' => $totalDiscount,
                        'tax_amount' => $totalTax,
                        'total' => $totalNet,
                    ]);

                    Transaction::create([
                        'type' => 'debit',
                        'amount' => $totalNet,
                        'date' => now(),
                        'description' => 'Invoice #' . $invoiceData['invoice_no'] . ' - Food Order',
                        'payable_type' => $payerType,
                        'payable_id' => $payerId,
                        'reference_type' => FinancialInvoiceItem::class,
                        'reference_id' => $invoiceItem->id,
                        'invoice_id' => $financialInvoice->id,
                        'created_by' => Auth::id(),
                    ]);

                    // If reservation order with advance payment, create credit entry
                    if ($order->order_type === 'reservation' && $order->reservation_id) {
                        $reservation = Reservation::find($order->reservation_id);
                        if ($reservation && $reservation->down_payment > 0) {
                            // Create credit transaction for advance payment
                            Transaction::create([
                                'type' => 'credit',
                                'amount' => $reservation->down_payment,
                                'date' => now(),
                                'description' => 'Advance Payment Adjustment - Reservation #' . $reservation->id,
                                'payable_type' => $payerType,
                                'payable_id' => $payerId,
                                'reference_type' => Reservation::class,
                                'reference_id' => $reservation->id,
                                'invoice_id' => $financialInvoice->id,
                                'created_by' => Auth::id(),
                            ]);

                            // Update invoice to show advance deducted
                            $financialInvoice->update([
                                'advance_payment' => $reservation->down_payment,
                                'data' => array_merge($financialInvoice->data ?? [], [
                                    'reservation_id' => $reservation->id,
                                    'advance_deducted' => $reservation->down_payment,
                                ]),
                            ]);
                        }
                    }
                }
            } elseif ($financialInvoice && $financialInvoice->status !== 'paid') {
                if ($validated['status'] === 'cancelled' || $validated['status'] === 'refund') {
                    // Mark invoice as cancelled
                    $financialInvoice->update(['status' => 'cancelled']);
                } elseif (
                    $request->has('subtotal') &&
                    $request->has('total_price') &&
                    $validated['subtotal'] !== null &&
                    $validated['total_price'] !== null
                ) {
                    // Otherwise update amounts if provided
                    $financialInvoice->update([
                        'amount' => $validated['subtotal'],
                        'total_price' => $validated['total_price'],
                    ]);

                    // ✅ Sync Ledger (Debit) if unpaid
                    $transaction = Transaction::where('reference_type', FinancialInvoice::class)
                        ->where('reference_id', $financialInvoice->id)
                        ->where('type', 'debit')
                        ->first();

                    if ($transaction) {
                        $transaction->update([
                            'amount' => $validated['total_price'],
                            'description' => 'Food Order Invoice #' . $financialInvoice->invoice_no . ' (Updated)',
                        ]);
                    }

                    // ✅ Sync Ledger (Debit) if unpaid
                    $transaction = Transaction::where('reference_type', FinancialInvoice::class)
                        ->where('reference_id', $financialInvoice->id)
                        ->where('type', 'debit')
                        ->first();

                    if ($transaction) {
                        $transaction->update([
                            'amount' => $validated['total_price'],
                            'description' => 'Food Order Invoice #' . $financialInvoice->invoice_no . ' (Updated)',
                        ]);
                    }
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

        // Only filter by order_type if it exists and is not 'room_service'
        if ($order_type && $order_type !== 'room_service') {
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

    public function searchProducts(Request $request)
    {
        $searchTerm = $request->query('search');

        if (empty($searchTerm)) {
            return response()->json(['success' => true, 'products' => []], 200);
        }

        // Search products across all restaurants by ID or name
        $products = Product::with(['variants:id,product_id,name', 'variants.values', 'category', 'tenant:id,name'])
            ->where(function ($query) use ($searchTerm) {
                $query
                    ->where('id', 'like', "%{$searchTerm}%")
                    ->where('menu_code', 'like', "%{$searchTerm}%")
                    ->orWhere('name', 'like', "%{$searchTerm}%");
            })
            ->where('current_stock', '>', 0)  // Only show products with stock
            ->limit(20)  // Limit results for performance
            ->get();

        return response()->json(['success' => true, 'products' => $products], 200);
    }

    /**
     * Search Customers (Member, Corporate, Guest) for Auto-complete
     */
    public function searchCustomers(Request $request)
    {
        $query = $request->input('query');
        $type = $request->input('type', 'all');

        if (!$query) {
            return response()->json([]);
        }

        $results = collect();

        // 1. Members
        if ($type === 'all' || $type === 'member') {
            $members = Member::where('status', 'active')
                ->where(function ($q) use ($query) {
                    $q
                        ->where('full_name', 'like', "%{$query}%")
                        ->orWhere('membership_no', 'like', "%{$query}%");
                })
                ->limit(30)
                ->get()
                ->map(function ($m) {
                    return [
                        'label' => "{$m->full_name} (Member - {$m->membership_no})",
                        'value' => $m->full_name,
                        'type' => 'Member',
                        'name' => $m->full_name,
                        'membership_no' => $m->membership_no,
                        'status' => $m->status,
                    ];
                });
            $results = $results->merge($members);
        }

        // 2. Corporate Members
        if ($type === 'all' || $type === 'corporate') {
            // Check if CorporateMember model exists and is imported, assuming yes based on previous files
            $corporate = \App\Models\CorporateMember::where('status', 'active')
                ->where(function ($q) use ($query) {
                    $q
                        ->where('full_name', 'like', "%{$query}%")
                        ->orWhere('membership_no', 'like', "%{$query}%");
                })
                ->limit(30)
                ->get()
                ->map(function ($m) {
                    return [
                        'label' => "{$m->full_name} (Corporate - {$m->membership_no})",
                        'value' => $m->full_name,
                        'type' => 'Corporate',
                        'name' => $m->full_name,
                        'membership_no' => $m->membership_no,
                        'status' => $m->status,
                    ];
                });
            $results = $results->merge($corporate);
        }

        // 3. Guests (Customers)
        if ($type === 'all' || $type === 'guest') {
            $guests = Customer::query()
                ->where(function ($q) use ($query) {
                    $q
                        ->where('name', 'like', "%{$query}%")
                        ->orWhere('customer_no', 'like', "%{$query}%");
                })
                ->limit(30)
                ->get()
                ->map(function ($c) {
                    return [
                        'label' => "{$c->name} (Guest - {$c->customer_no})",
                        'value' => $c->name,
                        'type' => 'Guest',
                        'name' => $c->name,
                        'customer_no' => $c->customer_no,
                        'id' => $c->id,
                        'status' => 'active',  // Guests usually don't have status, default active
                    ];
                });
            $results = $results->merge($guests);
        }

        // 4. Employees (Optional, but useful for internal orders) - only if type is all or employee
        if ($type === 'all' || $type === 'employee') {
            $employees = Employee::where('status', 'active')
                ->where(function ($q) use ($query) {
                    $q
                        ->where('name', 'like', "%{$query}%")
                        ->orWhere('employee_id', 'like', "%{$query}%");
                })
                ->limit(30)
                ->get()
                ->map(function ($e) {
                    return [
                        'label' => "{$e->name} (Employee - {$e->employee_id})",
                        'value' => $e->name,
                        'type' => 'Employee',
                        'name' => $e->name,
                        'membership_no' => $e->employee_id,  // Normalize key
                        'employee_id' => $e->employee_id,
                        'status' => $e->status,
                    ];
                });
            $results = $results->merge($employees);
        }

        return response()->json($results);
    }

    /**
     * Order History - Shows all completed/paid orders
     */
    public function orderHistory(Request $request)
    {
        $query = Order::with([
            'table:id,table_no',
            'orderItems:id,order_id,order_item,status',
            'member:id,member_type_id,full_name,membership_no',
            'member.memberType:id,name',
            'customer:id,name,customer_no',
            'employee:id,employee_id,name',
            'cashier:id,name',
            'waiter:id,name',
        ])
            ->whereIn('order_type', ['dineIn', 'delivery', 'takeaway', 'reservation', 'room_service'])
            ->where(function ($q) {
                $q
                    ->where('status', 'completed')
                    ->orWhere('payment_status', 'paid');
            });

        // 🔍 Search by Order ID
        if ($request->filled('search_id')) {
            $query->where('id', $request->search_id);
        }

        // 🔍 Search by Client Name
        if ($request->filled('search_name')) {
            $searchName = trim($request->search_name);
            $query->where(function ($q) use ($searchName) {
                $q
                    ->whereHas('member', fn($q) => $q->where('full_name', 'like', "%$searchName%"))
                    ->orWhereHas('customer', fn($q) => $q->where('name', 'like', "%$searchName%"))
                    ->orWhereHas('employee', fn($q) => $q->where('name', 'like', "%$searchName%"));
            });
        }

        // 👤 Customer Type filter
        if ($request->filled('customer_type') && $request->customer_type !== 'all') {
            switch ($request->customer_type) {
                case 'member':
                    $query->whereNotNull('member_id');
                    break;
                case 'guest':
                    $query->whereNotNull('customer_id');
                    break;
                case 'employee':
                    $query->whereNotNull('employee_id');
                    break;
            }
        }

        // 📅 Date range filter
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('start_date', [$request->start_date, $request->end_date]);
        } elseif ($request->filled('start_date')) {
            $query->whereDate('start_date', '>=', $request->start_date);
        } elseif ($request->filled('end_date')) {
            $query->whereDate('start_date', '<=', $request->end_date);
        }

        // 🍽 Order type filter
        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('order_type', $request->type);
        }

        // 💰 Payment status filter
        if ($request->filled('payment_status') && $request->payment_status !== 'all') {
            $query->where('payment_status', $request->payment_status);
        }

        // 💳 Payment method filter
        if ($request->filled('payment_method') && $request->payment_method !== 'all') {
            $query->where('payment_method', $request->payment_method);
        }

        // 🍽 Table filter
        if ($request->filled('table_id')) {
            $query->where('table_id', $request->table_id);
        }

        // 👨‍🍳 Waiter filter
        if ($request->filled('waiter_id')) {
            $query->where('waiter_id', $request->waiter_id);
        }

        // 💵 Cashier filter
        if ($request->filled('cashier_id')) {
            $query->where('cashier_id', $request->cashier_id);
        }

        $orders = $query->orderBy('id', 'desc')->paginate(15)->withQueryString();

        // Dropdown Data
        $tables = Table::select('id', 'table_no')->get();
        $waiters = Employee::whereHas('designation', fn($q) => $q->whereIn('name', ['Waiter', 'Waiters', 'Captain']))
            ->select('id', 'name')
            ->get();
        $cashiers = User::select('id', 'name')->get();

        return Inertia::render('App/Order/History/Dashboard', [
            'orders' => $orders,
            'filters' => $request->all(),
            'tables' => $tables,
            'waiters' => $waiters,
            'cashiers' => $cashiers,
        ]);
    }
}
