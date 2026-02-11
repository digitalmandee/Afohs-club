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
use App\Models\PosCakeBooking;
use App\Models\PosShift;
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
                                ->select('id', 'table_id', 'status', 'payment_status', 'start_date')
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
        Log::info($floorTables);
        // 🔗 Attach invoices manually
        $floorTables->each(function ($floor) {
            $floor->tables->each(function ($table) {
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
                            $invoice = $reservation->order;
                            if (!$invoice || $invoice->payment_status !== 'paid' || $reservation->status !== 'completed') {
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
                        $invoice = $order;

                        if (
                            !$invoice ||
                            $invoice->payment_status !== 'paid' ||
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
            $query = Order::where('created_by', Auth::id())
                ->with([
                    'table:id,table_no',
                    'tenant:id,name',  // ✅ Load Tenant Name
                    'orderItems:id,order_id,tenant_id,order_item,status,remark,instructions,cancelType',
                    'member:id,member_type_id,full_name,membership_no',
                    'customer:id,name,customer_no,guest_type_id',
                    'customer.guestType:id,name',
                    'employee:id,employee_id,name',
                    'member.memberType:id,name',
                    'waiter:id,name',  // Waiter relation
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

            // 🍽 Order type (Smart Filter)
            if ($request->type && $request->type !== 'all') {
                if ($request->type === 'member') {
                    $query->whereNotNull('member_id');
                } elseif ($request->type === 'employee') {
                    $query->whereNotNull('employee_id');
                } elseif ($request->type === 'guest') {
                    $query
                        ->whereNotNull('customer_id')
                        ->whereNull('member_id')
                        ->whereNull('employee_id');
                } elseif ($request->type === 'corporate') {
                    $query->whereHas('member.memberType', function ($q) {
                        $q->where('name', 'Corporate');
                    });
                } else {
                    $query->where('order_type', $request->type);
                }
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
                'invoiceable_id' => $order->id,
                'invoiceable_type' => Order::class,
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

            // Calculate tax based on taxable items
            $calculatedTaxAmount = 0;
            $taxRate = $order->tax ?? 0;
            foreach ($items as $item) {
                // Check if product is taxable (assuming eager loaded or available)
                // We need to fetch product is_taxable if not in order_item.
                // Since we loaded orderItems, we can access the data.
                // Ideally, $item->order_item should have it.
                $itemData = $item->order_item;
                $isTaxable = false;

                // If is_taxable is in JSON
                if (isset($itemData['is_taxable'])) {
                    $isTaxable = $itemData['is_taxable'];
                } else {
                    // Fallback: Check product (this causes N+1 if not careful, but for one order it's fine)
                    if (isset($itemData['product_id'])) {
                        $prod = \App\Models\Product::find($itemData['product_id']);
                        if ($prod)
                            $isTaxable = $prod->is_taxable;
                    }
                }

                if ($isTaxable) {
                    $itemTotal = ($itemData['quantity'] ?? 1) * ($itemData['price'] ?? 0);
                    $itemDisc = $itemData['discount_amount'] ?? 0;
                    $calculatedTaxAmount += ($itemTotal - $itemDisc) * $taxRate;
                }
            }

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
                'tax_amount' => $calculatedTaxAmount,
                'total' => $totalPrice,  // Note: verify if total_price in DB matches this calc
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
        $orders = Reservation::where('created_by', Auth::id())
            ->whereDate('date', $today)
            ->with('member:id,full_name,membership_no', 'customer:id,name,customer_no', 'table:id,table_no')
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

        // 🔎 Case 1c: Cake Booking flow
        if ($request->has('cake_booking_id')) {
            $booking = PosCakeBooking::with(['member:id,full_name,membership_no', 'customer:id,name,customer_no', 'cakeType'])->find($request->cake_booking_id);

            if ($booking) {
                $memberData = [];
                if ($booking->member) {
                    $memberData = [
                        'id' => $booking->member->id,
                        'booking_type' => 'member',
                        'name' => $booking->member->full_name,
                        'membership_no' => $booking->member->membership_no,
                    ];
                } elseif ($booking->customer) {
                    $memberData = [
                        'id' => $booking->customer->id,
                        'customer_no' => $booking->customer->customer_no,
                        'booking_type' => 'guest',
                        'name' => $booking->customer->name,
                    ];
                }

                $orderContext = [
                    'order_type' => 'takeaway',
                    'cake_booking' => $booking,
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

    // Helper to get active shift (Global Scope, ignoring date restriction)
    private function getActiveShift()
    {
        return PosShift::where('user_id', Auth::id())
            ->where('status', 'active')
            ->latest()
            ->first();
    }

    private function checkActiveShift(): bool
    {
        return (bool) $this->getActiveShift();
    }

    public function sendToKitchen(Request $request)
    {
        // Enforce Active Shift (Global)
        $activeShift = $this->getActiveShift();
        if (!$activeShift) {
            return response()->json([
                'message' => 'You must start a shift before creating orders.',
                'error_code' => 'NO_ACTIVE_SHIFT'
            ], 403);
        }

        $request->validate([
            // 'member.id' => 'required|exists:members,user_id',
            'order_items' => 'required|array',
            'order_items.*.id' => 'required|exists:products,id',
            'price' => 'required|numeric',
            'kitchen_note' => 'nullable|string',
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

            // Validate Takeaway Payment
            if ($orderType == 'takeaway') {
                $entEnabled = $request->payment['ent_enabled'] ?? false;
                $ctsEnabled = $request->payment['cts_enabled'] ?? false;
                $entDeduction = $entEnabled ? ($request->payment['ent_amount'] ?? 0) : 0;
                $ctsDeduction = $ctsEnabled ? ($request->payment['cts_amount'] ?? 0) : 0;
                $bankChargesEnabled = $request->payment['bank_charges_enabled'] ?? false;
                $bankChargesAmount = $bankChargesEnabled ? ($request->payment['bank_charges_amount'] ?? 0) : 0;
                $paidAmount = $request->payment['paid_amount'] ?? 0;
                $remainingDue = $totalDue + $bankChargesAmount - $entDeduction - $ctsDeduction;

                // Allow small float variance (1.0)
                if ($paidAmount < ($remainingDue - 1.0)) {
                    return back()->withErrors(['paid_amount' => 'The paid amount (' . $paidAmount . ') is not enough to cover the remaining balance (' . $remainingDue . ') after deductions.']);
                }
            }

            $orderData = [
                'waiter_id' => $request->input('waiter.id'),
                'table_id' => $request->input('table.id'),
                'order_type' => $request->order_type,
                'person_count' => $request->person_count,
                // ✅ Use Persistent Shift Date and Tenant
                'start_date' => $activeShift->start_date,  // Force usage of shift date
                'tenant_id' => $activeShift->tenant_id,  // Force usage of shift tenant
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
                // Takeaway orders are paid immediately and completed at point of sale
                // Reservations that are new are saved as drafts
                // All other orders go to in_progress for kitchen processing
                'status' => $request->order_type === 'takeaway'
                    ? 'completed'
                    : (($request->order_type === 'reservation' && $request->boolean('is_new_order')) ? 'saved' : 'in_progress'),
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

            // 🔎 DEBUG: Log Request Status Logic
            Log::info('SendToKitchen Request:', [
                'order_type' => $request->order_type,
                'is_new_order' => $request->input('is_new_order'),
                'resolved_status' => $orderData['status']
            ]);

            // Capture existing order state BEFORE update to correctly handle item wiping
            $existingOrder = null;
            if ($request->id) {
                $existingOrder = Order::find($request->id);
            }

            $order = Order::updateOrCreate(
                ['id' => $request->id],
                $orderData
            );

            // If updating a DRAFT (saved) order, wipe items first to allow clean overwrite
            // We check $existingOrder->status because $order->status might now be 'in_progress'
            $wasSaved = $existingOrder && $existingOrder->status === 'saved';
            // Fallback: if no existing order (new creation), it's not "previously saved", so we don't wipe (nothing to wipe)
            // Check if we found an existing order that was saved
            if ($wasSaved) {
                Log::info('Wiping items for previously saved order #' . $existingOrder->id);
                foreach ($existingOrder->orderItems as $existingItem) {
                    $itemData = $existingItem->order_item;
                    $qty = $itemData['quantity'] ?? 1;
                    $prodId = $itemData['id'] ?? null;

                    if ($prodId) {
                        $prod = \App\Models\Product::find($prodId);
                        if ($prod && $prod->manage_stock) {
                            $prod->increment('current_stock', $qty);

                            if (!empty($itemData['variants'])) {
                                foreach ($itemData['variants'] as $variant) {
                                    $vId = $variant['id'] ?? null;
                                    if ($vId) {
                                        \App\Models\ProductVariantValue::where('id', $vId)->increment('stock', 1);
                                    }
                                }
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

                    // Only check stock if management is enabled
                    if ($product && $product->manage_stock) {
                        if ($product->current_stock < $productQty || $product->minimal_stock > $product->current_stock - $productQty) {
                            throw new \Exception('Insufficient stock for product: ' . ($product->name ?? 'Unknown'));
                        }
                        $product->decrement('current_stock', $productQty);
                    }

                    if (!empty($item['variants'])) {
                        foreach ($item['variants'] as $variant) {
                            $variantId = $variant['id'] ?? null;
                            if (!$variantId)
                                continue;

                            $variantValue = ProductVariantValue::find($variantId);

                            if (!$variantValue) {
                                throw new \Exception('Invalid variant ID: ' . $variantId);
                            }

                            // Only check and decrement stock if management is enabled
                            if ($product->manage_stock) {
                                if ($variantValue->stock < 0) {
                                    throw new \Exception('Insufficient stock for variant: ' . ($variantValue->name ?? 'Unknown'));
                                }
                                $variantValue->decrement('stock', 1);
                            }

                            $totalCostPrice += $variantValue->additional_price;
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
                                if ($product && $product->manage_stock) {
                                    $product->decrement('current_stock', $productQty);

                                    if (!empty($item['variants'])) {
                                        foreach ($item['variants'] as $variant) {
                                            $vId = $variant['id'] ?? null;
                                            if ($vId) {
                                                \App\Models\ProductVariantValue::where('id', $vId)->decrement('stock', 1);
                                            }
                                        }
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
                    'invoiceable_id' => $order->id,
                    'invoiceable_type' => Order::class,
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

                    if ($request->payment['bank_charges_enabled'] ?? false) {
                        $invoiceData['data']['bank_charges_enabled'] = true;
                        $invoiceData['data']['bank_charges_type'] = $request->payment['bank_charges_type'] ?? 'percentage';
                        $invoiceData['data']['bank_charges_value'] = round((float) ($request->payment['bank_charges_value'] ?? 0), 0);
                        $invoiceData['data']['bank_charges_amount'] = round((float) ($request->payment['bank_charges_amount'] ?? 0), 0);
                    }
                }

                $invoice = FinancialInvoice::create($invoiceData);

                // ✅ Create Invoice Items & DEBIT Transactions (Aggregated)
                if (!empty($request->order_items)) {
                    $totalGross = 0;
                    $totalDiscount = 0;
                    $totalTax = 0;
                    $itemNames = [];

                    $taxRate = $request->tax ?? 0;  // Tax rate (e.g. 0.16)

                    // Fetch products to check is_taxable
                    $productIds = collect($request->order_items)->pluck('product_id')->filter()->toArray();
                    $products = Product::whereIn('id', $productIds)->get()->keyBy('id');

                    foreach ($request->order_items as $item) {
                        $qty = $item['quantity'] ?? 1;
                        $price = $item['price'] ?? 0;
                        $subTotal = $qty * $price;

                        // Use item discount as sum source
                        $itemDiscountAmount = $item['discount_amount'] ?? 0;

                        // Tax Calculation
                        $netAmount = $subTotal - $itemDiscountAmount;

                        // Check if product is taxable
                        $isTaxable = false;
                        if (isset($item['product_id']) && isset($products[$item['product_id']])) {
                            $isTaxable = $products[$item['product_id']]->is_taxable;
                        }

                        $itemTaxAmount = $isTaxable ? ($netAmount * $taxRate) : 0;

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

                    // Bank Charges Transaction
                    if (isset($invoiceData['data']['bank_charges_amount']) && $invoiceData['data']['bank_charges_amount'] > 0) {
                        $bcAmount = $invoiceData['data']['bank_charges_amount'];

                        $bcItem = FinancialInvoiceItem::create([
                            'invoice_id' => $invoice->id,
                            'fee_type' => 8,  // Using literal 8 for Financial Charges/Bank Charges
                            'description' => 'Bank Charges (' . ($invoiceData['data']['bank_charges_type'] == 'percentage' ? ($invoiceData['data']['bank_charges_value'] ?? 0) . '%' : 'Fixed') . ')',
                            'qty' => 1,
                            'amount' => $bcAmount,
                            'sub_total' => $bcAmount,
                            'total' => $bcAmount,
                        ]);

                        Transaction::create([
                            'type' => 'debit',
                            'amount' => $bcAmount,
                            'date' => now(),
                            'description' => 'Bank Charges for Order #' . $invoiceData['invoice_no'],
                            'payable_type' => $payerType,
                            'payable_id' => $payerId,
                            'reference_type' => FinancialInvoiceItem::class,
                            'reference_id' => $bcItem->id,
                            'invoice_id' => $invoice->id,
                            'created_by' => Auth::id(),
                        ]);
                    }
                }

                if ($orderType == 'takeaway') {
                    // Recalculate Logic for ENT/CTS to ensure consistency with TransactionController
                    $entAmount = 0;
                    $entDetails = '';
                    $ctsAmount = 0;
                    $paymentData = $request->payment;

                    // Check if ENT is enabled (new toggle-based flow)
                    $entEnabled = $paymentData['ent_enabled'] ?? false;
                    $ctsEnabled = $paymentData['cts_enabled'] ?? false;

                    // ENT Calculation - Only if enabled
                    if ($entEnabled) {
                        if (array_key_exists('ent_items', $paymentData) && !empty($paymentData['ent_items'])) {
                            // Calculate from items
                            $entIds = $paymentData['ent_items'];
                            foreach ($request->order_items as $item) {
                                if (in_array($item['id'], $entIds)) {
                                    $iPrice = $item['total_price'] ?? (($item['price'] ?? 0) * ($item['quantity'] ?? 1));
                                    $entAmount += $iPrice;
                                    $entDetails .= ($item['name'] ?? 'Item') . ' (x' . ($item['quantity'] ?? 1) . '), ';
                                }
                            }
                        } elseif (isset($paymentData['ent_amount'])) {
                            // Use provided ENT amount
                            $entAmount = $paymentData['ent_amount'];
                        }
                    }

                    // CTS Calculation - Only if enabled
                    if ($ctsEnabled) {
                        $ctsAmount = isset($paymentData['cts_amount']) ? $paymentData['cts_amount'] : 0;
                    }

                    // Verify Total (Paid + ENT + CTS >= Total)
                    // Note: paid_amount in request is the amount paid via selected payment method
                    $paidCash = $paymentData['paid_amount'] ?? 0;
                    // Allow small float variance
                    if (($paidCash + $entAmount + $ctsAmount) < ($request->total_price - 1.0)) {
                        throw new \Exception('Total payment (Paid + ENT + CTS) is less than Total Due. (' . ($paidCash + $entAmount + $ctsAmount) . ' < ' . $request->total_price . ')');
                    }

                    // Update Invoice with ENT/CTS Details
                    $updateData = [];

                    if ($entEnabled && $entAmount > 0) {
                        $comment = $invoiceData['ent_comment'] ?? '';
                        if ($entDetails) {
                            $comment .= ' [ENT Items: ' . rtrim($entDetails, ', ') . ' - Value: ' . number_format($entAmount, 2) . ']';
                        }
                        $updateData['ent_comment'] = $comment;
                        $updateData['ent_amount'] = $entAmount;
                        $updateData['ent_reason'] = $paymentData['ent_reason'] ?? null;
                    }

                    if ($ctsEnabled && $ctsAmount > 0) {
                        $comment = $invoiceData['cts_comment'] ?? '';
                        if ($ctsAmount < $request->total_price) {
                            $comment .= ' [Partial CTS Amount: ' . number_format($ctsAmount, 2) . ']';
                        }
                        $updateData['cts_comment'] = $comment;
                        $updateData['cts_amount'] = $ctsAmount;
                    }

                    if (!empty($updateData)) {
                        $invoice->update($updateData);
                    }
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
                        'payment_method' => ($request->payment['payment_method'] === 'cts' && !empty($request->payment['cts_payment_method']))
                            ? $request->payment['cts_payment_method']
                            : $request->payment['payment_method'],
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
        // Enforce Active Shift for updates too (mostly adding items)
        // If just changing status to paid, maybe allow?
        // User said "start shift... everyday before taking his first order".
        // Let's enforce for safety.
        if (!$this->checkActiveShift()) {
            return response()->json([
                'message' => 'You must have an active shift to update orders.',
                'error_code' => 'NO_ACTIVE_SHIFT'
            ], 403);
        }

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

            $getItemId = function ($rawId) {
                if (is_int($rawId) || (is_string($rawId) && ctype_digit($rawId))) {
                    return (int) $rawId;
                }
                if (is_string($rawId) && str_starts_with($rawId, 'update-')) {
                    $maybe = substr($rawId, 7);
                    return ctype_digit($maybe) ? (int) $maybe : null;
                }
                return null;
            };

            $normalizeOrderItem = function ($orderItem) {
                if (!is_array($orderItem)) {
                    return [];
                }

                if (!isset($orderItem['product_id']) && isset($orderItem['id'])) {
                    $orderItem['product_id'] = $orderItem['id'];
                }
                if (!isset($orderItem['id']) && isset($orderItem['product_id'])) {
                    $orderItem['id'] = $orderItem['product_id'];
                }

                $qty = isset($orderItem['quantity']) ? (int) $orderItem['quantity'] : 1;
                $orderItem['quantity'] = $qty > 0 ? $qty : 1;
                $orderItem['price'] = isset($orderItem['price']) ? (float) $orderItem['price'] : 0.0;

                $variants = isset($orderItem['variants']) && is_array($orderItem['variants']) ? $orderItem['variants'] : [];
                $orderItem['variants'] = array_values(array_map(function ($v) {
                    if (!is_array($v)) {
                        return [];
                    }
                    if (isset($v['price'])) {
                        $v['price'] = (float) $v['price'];
                    }
                    return $v;
                }, $variants));

                return $orderItem;
            };

            $itemKey = function ($orderItem) use ($normalizeOrderItem) {
                $oi = $normalizeOrderItem($orderItem);
                $productId = $oi['product_id'] ?? $oi['id'] ?? null;
                $variants = isset($oi['variants']) && is_array($oi['variants']) ? $oi['variants'] : [];
                $variantKeyParts = [];
                foreach ($variants as $v) {
                    $variantKeyParts[] = ($v['id'] ?? '') . ':' . ($v['value'] ?? '');
                }
                sort($variantKeyParts);
                return (string) ($productId ?? '') . '|' . implode(',', $variantKeyParts);
            };

            $unitPrice = function ($orderItem) use ($normalizeOrderItem) {
                $oi = $normalizeOrderItem($orderItem);
                $base = (float) ($oi['price'] ?? 0);
                $variants = isset($oi['variants']) && is_array($oi['variants']) ? $oi['variants'] : [];
                $variantsSum = 0.0;
                foreach ($variants as $v) {
                    $variantsSum += isset($v['price']) ? (float) $v['price'] : 0.0;
                }
                return $base + $variantsSum;
            };

            $recalcPricing = function ($orderItem) use ($normalizeOrderItem, $unitPrice) {
                $oi = $normalizeOrderItem($orderItem);
                $qty = (int) ($oi['quantity'] ?? 1);
                $qty = $qty > 0 ? $qty : 1;
                $totalPrice = $unitPrice($oi) * $qty;
                $oi['total_price'] = $totalPrice;

                $discountValue = isset($oi['discount_value']) ? (float) $oi['discount_value'] : null;
                $discountType = $oi['discount_type'] ?? null;

                if ($discountValue !== null && $discountValue > 0) {
                    $disc = 0.0;
                    if ($discountType === 'percentage') {
                        $disc = round($totalPrice * ($discountValue / 100));
                    } else {
                        $disc = round($discountValue * $qty);
                    }
                    if ($disc > $totalPrice) {
                        $disc = $totalPrice;
                    }
                    $oi['discount_amount'] = $disc;
                } else {
                    $oi['discount_amount'] = isset($oi['discount_amount']) ? (float) $oi['discount_amount'] : 0.0;
                }

                return $oi;
            };

            $mergeIncoming = function (array $updated, array $new) use ($itemKey, $recalcPricing) {
                $map = [];

                foreach ($updated as $row) {
                    if (!is_array($row) || !isset($row['order_item'])) {
                        continue;
                    }
                    $row['order_item'] = $recalcPricing($row['order_item']);
                    $baseKey = $itemKey($row['order_item']);
                    $status = $row['status'] ?? null;
                    $key = $status === 'cancelled' ? ('cancelled|' . $baseKey . '|' . uniqid('row_', true)) : $baseKey;
                    if ($key === '|') {
                        $key = uniqid('row_', true);
                    }
                    $map[$key] = $row;
                }

                foreach ($new as $row) {
                    if (!is_array($row) || !isset($row['order_item'])) {
                        continue;
                    }
                    $row['order_item'] = $recalcPricing($row['order_item']);
                    $baseKey = $itemKey($row['order_item']);
                    $status = $row['status'] ?? null;
                    $key = $status === 'cancelled' ? ('cancelled|' . $baseKey . '|' . uniqid('row_', true)) : $baseKey;
                    if ($key === '|') {
                        $key = uniqid('row_', true);
                    }

                    if (!isset($map[$key])) {
                        $map[$key] = $row;
                        continue;
                    }

                    $existingStatus = $map[$key]['status'] ?? null;
                    if ($existingStatus === 'cancelled' || $status === 'cancelled') {
                        $map[uniqid('row_', true)] = $row;
                        continue;
                    }

                    $existingQty = (int) ($map[$key]['order_item']['quantity'] ?? 1);
                    $incomingQty = (int) ($row['order_item']['quantity'] ?? 1);
                    $nextQty = $existingQty + ($incomingQty > 0 ? $incomingQty : 1);

                    $map[$key]['order_item']['quantity'] = $nextQty;
                    $map[$key]['order_item'] = $recalcPricing($map[$key]['order_item']);
                }

                $mergedUpdated = [];
                $mergedNew = [];
                foreach ($map as $row) {
                    $rawId = $row['id'] ?? null;
                    if (is_string($rawId) && str_starts_with($rawId, 'update-')) {
                        $mergedUpdated[] = $row;
                    } else {
                        $mergedNew[] = $row;
                    }
                }

                return [$mergedUpdated, $mergedNew];
            };

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

            [$mergedUpdatedItems, $mergedNewItems] = $mergeIncoming($validated['updated_items'] ?? [], $validated['new_items'] ?? []);

            // Update existing order items
            foreach ($mergedUpdatedItems as $itemData) {
                $itemId = $getItemId($itemData['id'] ?? null);
                if (!$itemId) {
                    continue;
                }
                $normalizedOrderItem = $recalcPricing($itemData['order_item'] ?? []);
                $order->orderItems()->where('id', $itemId)->update([
                    'order_item' => $normalizedOrderItem,
                    'status' => $itemData['status'],
                    'remark' => $itemData['remark'] ?? null,
                    'instructions' => $itemData['instructions'] ?? null,
                    'cancelType' => $itemData['cancelType'] ?? null,
                ]);
            }

            // Add new order items
            foreach ($mergedNewItems as $itemData) {
                $normalizedOrderItem = $recalcPricing($itemData['order_item'] ?? []);
                $order->orderItems()->create([
                    'tenant_id' => $normalizedOrderItem['tenant_id'] ?? null,
                    'order_item' => $normalizedOrderItem,
                    'status' => $itemData['status'] ?? 'pending',
                    'remark' => $itemData['remark'] ?? null,
                    'instructions' => $itemData['instructions'] ?? null,
                    'cancelType' => $itemData['cancelType'] ?? null,
                ]);
            }

            $freshItems = $order->orderItems()->where('status', '!=', 'cancelled')->get();
            $taxRate = (float) ($order->tax ?? 0);
            $subtotal = 0.0;
            $totalDiscount = 0.0;
            $totalTax = 0.0;
            foreach ($freshItems as $row) {
                $oi = is_array($row->order_item) ? $row->order_item : [];
                $oi = $normalizeOrderItem($oi);
                $qty = (int) ($oi['quantity'] ?? 1);
                $lineTotal = $unitPrice($oi) * ($qty > 0 ? $qty : 1);
                $lineDiscount = isset($oi['discount_amount']) ? (float) $oi['discount_amount'] : 0.0;
                $net = $lineTotal - $lineDiscount;

                $isTaxable = $oi['is_taxable'] ?? null;
                if ($isTaxable === null) {
                    $productId = $oi['product_id'] ?? null;
                    if ($productId) {
                        $product = Product::find($productId);
                        $isTaxable = $product ? (bool) $product->is_taxable : false;
                    } else {
                        $isTaxable = false;
                    }
                } else {
                    $isTaxable = $isTaxable === true || $isTaxable === 1 || $isTaxable === 'true';
                }

                $subtotal += $lineTotal;
                $totalDiscount += $lineDiscount;
                $totalTax += $isTaxable ? ($net * $taxRate) : 0.0;
            }

            $computedAmount = (float) round($subtotal);
            $computedDiscount = (float) round($totalDiscount);
            $computedTotal = (float) round($subtotal - $totalDiscount + $totalTax);

            $shouldSyncTotals = !empty($mergedUpdatedItems) || !empty($mergedNewItems) || ($request->has('subtotal') || $request->has('total_price'));
            if ($shouldSyncTotals) {
                $order->update([
                    'amount' => $computedAmount,
                    'discount' => $computedDiscount,
                    'total_price' => $computedTotal,
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
                    'invoiceable_id' => $order->id,
                    'invoiceable_type' => Order::class,
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

                    // Fetch products to check is_taxable
                    $productIds = [];
                    foreach ($orderItems as $orderItem) {
                        $itemData = $orderItem->order_item;
                        if (isset($itemData['product_id'])) {
                            $productIds[] = $itemData['product_id'];
                        }
                    }
                    $productIds = array_unique($productIds);
                    $products = Product::whereIn('id', $productIds)->get()->keyBy('id');

                    foreach ($orderItems as $orderItem) {
                        $item = is_array($orderItem->order_item) ? $orderItem->order_item : [];
                        $item = $normalizeOrderItem($item);
                        $qty = (int) ($item['quantity'] ?? 1);
                        $subTotal = $unitPrice($item) * ($qty > 0 ? $qty : 1);

                        $itemDiscountAmount = $item['discount_amount'] ?? 0;
                        $netAmount = $subTotal - $itemDiscountAmount;

                        // Check if product is taxable
                        $isTaxable = false;
                        if (isset($item['product_id']) && isset($products[$item['product_id']])) {
                            $isTaxable = $products[$item['product_id']]->is_taxable;
                        }

                        $itemTaxAmount = $isTaxable ? ($netAmount * $taxRate) : 0;

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
                } elseif ($shouldSyncTotals) {
                    // Otherwise update amounts if provided
                    $financialInvoice->update([
                        'amount' => $computedAmount,
                        'total_price' => $computedTotal,
                    ]);

                    // ✅ Sync Ledger (Debit) if unpaid
                    $transaction = Transaction::where('reference_type', FinancialInvoice::class)
                        ->where('reference_id', $financialInvoice->id)
                        ->where('type', 'debit')
                        ->first();

                    if ($transaction) {
                        $transaction->update([
                            'amount' => $computedTotal,
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
                            'amount' => $computedTotal,
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

        $productsQuery->where('is_salable', true);

        // Filter by stock: Show if stock > 0 OR if strict stock management is disabled
        $productsQuery->where(function ($q) {
            $q
                ->where('current_stock', '>', 0)
                ->orWhere('manage_stock', false);
        });

        $products = $productsQuery->get();

        return response()->json(['success' => true, 'products' => $products], 200);
    }

    public function getCategories(Request $request)
    {
        $tenantId = $request->query('tenant_id');
        $categories = Category::latest()->get();

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
                    ->orWhere('menu_code', 'like', "%{$searchTerm}%")
                    ->orWhere('name', 'like', "%{$searchTerm}%");
            })
            ->where(function ($query) {
                // Show product if stock is > 0 OR if stock management is disabled
                $query
                    ->where('current_stock', '>', 0)
                    ->orWhere('manage_stock', false);
            })
            ->where('is_salable', true)  // Only show salable products
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
            'tenant:id,name',  // ✅ Load Tenant Name
            'orderItems:id,order_id,order_item,status',
            'member:id,member_type_id,full_name,membership_no',
            'member.memberType:id,name',
            'customer:id,name,customer_no,guest_type_id',
            'customer.guestType:id,name',
            'employee:id,employee_id,name',
            'cashier:id,name',
            'user:id,name',  // Order Creator
            'waiter:id,name',
        ])
            // Load invoice ENT/CTS data via subquery (since relationship is via JSON column)
            ->addSelect([
                'orders.*',
                'invoice_ent_amount' => FinancialInvoice::select('ent_amount')
                    ->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(data, '\$.order_id')) = CAST(orders.id AS CHAR)")
                    ->limit(1),
                'invoice_cts_amount' => FinancialInvoice::select('cts_amount')
                    ->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(data, '\$.order_id')) = CAST(orders.id AS CHAR)")
                    ->limit(1),
                'invoice_ent_reason' => FinancialInvoice::select('ent_reason')
                    ->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(data, '\$.order_id')) = CAST(orders.id AS CHAR)")
                    ->limit(1),
                'invoice_ent_comment' => FinancialInvoice::select('ent_comment')
                    ->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(data, '\$.order_id')) = CAST(orders.id AS CHAR)")
                    ->limit(1),
                'invoice_cts_comment' => FinancialInvoice::select('cts_comment')
                    ->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(data, '\$.order_id')) = CAST(orders.id AS CHAR)")
                    ->limit(1),
                'invoice_bank_charges_amount' => FinancialInvoice::selectRaw("CAST(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(data, '\\$.bank_charges_amount')), '0') AS DECIMAL(10,2))")
                    ->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(data, '\$.order_id')) = CAST(orders.id AS CHAR)")
                    ->limit(1),
                'invoice_bank_charges_enabled' => FinancialInvoice::selectRaw("COALESCE(JSON_UNQUOTE(JSON_EXTRACT(data, '\\$.bank_charges_enabled')), '0')")
                    ->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(data, '\$.order_id')) = CAST(orders.id AS CHAR)")
                    ->limit(1),
                'invoice_bank_charges_type' => FinancialInvoice::selectRaw("JSON_UNQUOTE(JSON_EXTRACT(data, '\\$.bank_charges_type'))")
                    ->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(data, '\$.order_id')) = CAST(orders.id AS CHAR)")
                    ->limit(1),
                'invoice_bank_charges_value' => FinancialInvoice::selectRaw("CAST(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(data, '\\$.bank_charges_value')), '0') AS DECIMAL(10,2))")
                    ->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(data, '\$.order_id')) = CAST(orders.id AS CHAR)")
                    ->limit(1),
            ])
            ->whereIn('order_type', ['dineIn', 'delivery', 'takeaway', 'reservation', 'room_service'])
            ->where('status', '!=', 'pending');

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

        // 🔍 Unified Type Filter (Member, Corporate, Employee, Guest, Order Types)
        if ($request->filled('type') && $request->type !== 'all') {
            if ($request->type === 'member') {
                $query->whereNotNull('member_id');
            } elseif ($request->type === 'employee') {
                $query->whereNotNull('employee_id');
            } elseif ($request->type === 'guest') {
                $query
                    ->whereNotNull('customer_id')
                    ->whereNull('member_id')
                    ->whereNull('employee_id');
            } elseif ($request->type === 'corporate') {
                $query->whereHas('member.memberType', function ($q) {
                    $q->where('name', 'Corporate');
                });
            } else {
                // Assume it's a specific order_type (dineIn, delivery, etc.)
                $query->where('order_type', $request->type);
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

        // 💰 Payment status filter
        if ($request->filled('payment_status') && $request->payment_status !== 'all') {
            $query->where('payment_status', $request->payment_status);
        }

        // 💳 Payment method filter
        if ($request->filled('payment_method') && $request->payment_method !== 'all') {
            $query->where('payment_method', $request->payment_method);
        }

        // 🎯 Adjustment Type filter (ENT/CTS) - Query via linked invoice's JSON data
        if ($request->filled('adjustment_type') && $request->adjustment_type !== 'all') {
            $adjustmentType = $request->adjustment_type;
            $query->whereExists(function ($subQuery) use ($adjustmentType) {
                $subQuery
                    ->select(DB::raw(1))
                    ->from('financial_invoices')
                    ->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(data, '\$.order_id')) = CAST(orders.id AS CHAR)")
                    ->when($adjustmentType === 'ent', function ($q) {
                        $q->where('ent_amount', '>', 0);
                    })
                    ->when($adjustmentType === 'cts', function ($q) {
                        $q->where('cts_amount', '>', 0);
                    })
                    ->when($adjustmentType === 'none', function ($q) {
                        $q->where(function ($inner) {
                            $inner->whereNull('ent_amount')->orWhere('ent_amount', 0);
                        })->where(function ($inner) {
                            $inner->whereNull('cts_amount')->orWhere('cts_amount', 0);
                        });
                    });
            });
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
