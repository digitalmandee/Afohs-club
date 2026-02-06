<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use App\Models\FinancialInvoice;
use App\Models\Invoices;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::where('created_by', Auth::id())
            ->whereIn('order_type', ['dineIn', 'delivery', 'takeaway', 'reservation', 'room_service'])
            // ✅ Only show orders with invoices waiting for payment
            ->where('payment_status', 'awaiting')
            ->with(['member:id,full_name,membership_no', 'customer:id,name,customer_no', 'employee:id,employee_id,name', 'table:id,table_no', 'orderItems:id,order_id', 'roomBooking.room:id,name', 'tenant:id,name']);

        // ===============================
        // FILTER: Search by member name or membership_no
        // ===============================
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->whereHas('member', function ($q) use ($search) {
                $q
                    ->where('full_name', 'like', "%$search%")
                    ->orWhere('membership_no', 'like', "%$search%");
            });
        }

        // ===============================
        // FILTER: Order Type
        // ===============================
        if ($request->has('orderType') && $request->orderType != 'all') {
            $orderTypeMap = [
                'dineIn' => 'dineIn',
                'takeaway' => 'takeaway',
                'delivery' => 'delivery',
                'reservation' => 'reservation',
                'room_service' => 'room_service',
            ];
            if (isset($orderTypeMap[$request->orderType])) {
                $query->where('order_type', $orderTypeMap[$request->orderType]);
            }
        }

        // ===============================
        // FILTER: Order Status
        // ===============================
        if ($request->has('orderStatus') && $request->orderStatus != 'all') {
            $statusMap = [
                'ready' => 'completed',
                'cooking' => 'in_progress',
                'waiting' => 'pending',
                'completed' => 'completed',
                'cancelled' => 'cancelled',
            ];
            if (isset($statusMap[$request->orderStatus])) {
                $query->where('status', $statusMap[$request->orderStatus]);
            }
        }

        // ===============================
        // FILTER: Member Status
        // ===============================
        if ($request->has('memberStatus') && $request->memberStatus != 'all') {
            $query->whereHas('member', function ($q) use ($request) {
                $q->where('status', $request->memberStatus);
            });
        }

        // ===============================
        // SORTING
        // ===============================
        $sort = $request->sort ?? 'desc';
        $query->orderBy('id', $sort);

        // ===============================
        // PAGINATION
        // ===============================
        $perPage = 10;
        $orders = $query->paginate($perPage)->withQueryString();

        // ===============================
        // Attach invoices to orders
        // ===============================
        $orderIds = $orders->pluck('id')->toArray();
        $invoices = FinancialInvoice::select('id', 'data', 'status')
            ->where(function ($q) use ($orderIds) {
                foreach ($orderIds as $id) {
                    $q->orWhereJsonContains('data->order_id', $id);
                }
            })
            ->get();

        $orders->getCollection()->transform(function ($order) use ($invoices) {
            $order->invoice = $invoices->first(function ($invoice) use ($order) {
                $data = $invoice->data;
                return isset($data['order_id']) && $data['order_id'] == $order->id;
            });

            $order->order_items_count = $order->orderItems->count();
            return $order;
        });

        return Inertia::render('App/Transaction/Dashboard', [
            'Invoices' => $orders,
            'filters' => $request->all(),
        ]);
    }

    public function PaymentOrderData($invoiceId)
    {
        $order = Order::where('id', $invoiceId)->with(['member:id,full_name,membership_no', 'customer:id,name,customer_no', 'employee:id,employee_id,name', 'cashier:id,name', 'orderItems:id,order_id,order_item,status', 'table:id,table_no'])->firstOrFail();
        return $order;
    }

    public function OrderPayment(Request $request)
    {
        // Validate base fields + ENT/CTS
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'paid_amount' => 'required|numeric',
            'payment_method' => 'required|in:cash,credit_card,split_payment,ent,cts',
            // For credit card
            'credit_card_type' => 'nullable|required_if:payment_method,credit_card|string',
            'receipt' => 'nullable|file|mimes:jpg,jpeg,png,pdf',
            // ENT
            'ent_reason' => 'nullable|string',
            'ent_comment' => 'nullable|string',
            'ent_items' => 'nullable|array',
            'ent_items.*' => 'exists:order_items,id',
            // CTS
            'cts_comment' => 'nullable|string',
            'cts_amount' => 'nullable|numeric',
        ]);

        $order = Order::findOrFail($request->order_id);
        $totalDue = $order->total_price;
        $paidAmount = $request->paid_amount;
        $entAmount = 0;
        $ctsAmount = 0;
        $entDetails = '';

        // Calculate ENT Value if specific items selected
        if ($request->payment_method === 'ent') {
            if ($request->has('ent_items')) {
                // New Flow: Key exists. Calculate from items (empty array = 0).
                if ($request->filled('ent_items')) {
                    $entItems = $order->orderItems()->whereIn('id', $request->ent_items)->get();
                    foreach ($entItems as $item) {
                        // Calculate item total (price * quantity)
                        $itemData = $item->order_item;  // JSON column
                        $iPrice = $itemData['total_price'] ?? (($itemData['price'] ?? 0) * ($itemData['quantity'] ?? 1));
                        $entAmount += $iPrice;
                        $entDetails .= ($itemData['name'] ?? 'Item') . ' (x' . ($itemData['quantity'] ?? 1) . '), ';
                    }
                }
                // If ent_items empty, entAmount remains 0. Correct.
            } else {
                // Legacy Flow: No ent_items key -> Assume Full
                $entAmount = $totalDue;
            }
        }

        // CTS Amount
        if ($request->payment_method === 'cts') {
            $ctsAmount = $request->filled('cts_amount') ? $request->cts_amount : $totalDue;
        }

        // Verification
        // Allow variance of 1.0 for float rounding
        if (($paidAmount + $entAmount + $ctsAmount) < ($totalDue - 1.0)) {
            return back()->withErrors([
                'paid_amount' => 'Total payment (Paid + ENT + CTS) is less than Total Due. (' . ($paidAmount + $entAmount + $ctsAmount) . ' < ' . $totalDue . ')'
            ]);
        }

        // 1. Update Order Status
        $order->cashier_id = Auth::id();
        $order->payment_method = $request->payment_method;
        $order->paid_amount = $paidAmount;  // Only actual money paid
        $order->paid_at = now();

        // Update Comments with Details
        if ($request->payment_method === 'ent') {
            $order->ent_reason = $request->ent_reason;
            $comment = $request->ent_comment;
            if ($entDetails) {
                $comment .= ' [ENT Items: ' . rtrim($entDetails, ', ') . ' - Value: ' . number_format($entAmount, 2) . ']';
            }
            $order->ent_comment = $comment;
        } elseif ($request->payment_method === 'cts') {
            $comment = $request->cts_comment;
            if ($request->filled('cts_amount') && $ctsAmount < $totalDue) {
                $comment .= ' [Partial CTS Amount: ' . number_format($ctsAmount, 2) . ']';
            }
            $order->cts_comment = $comment;
        }

        $receiptPath = null;
        if ($request->payment_method === 'credit_card') {
            $order->credit_card_type = $request->credit_card_type;
            if ($request->hasFile('receipt')) {
                $receiptPath = FileHelper::saveImage($request->file('receipt'), 'receipts');
                $order->receipt = $receiptPath;
            }
        } elseif ($request->payment_method === 'split_payment') {
            $order->cash_amount = $request->cash;
            $order->credit_card_amount = $request->credit_card;
            $order->bank_amount = $request->bank_transfer;
        }

        $order->payment_status = 'paid';
        $order->save();

        // 2. Update Financial Invoice (lookup by order_id, not just member_id)
        $invoice = FinancialInvoice::whereJsonContains('data', ['order_id' => $order->id])
            ->first();

        if ($invoice) {
            $invoice->update([
                'status' => 'paid',
                'payment_date' => now(),
                'payment_method' => $request->payment_method,
                'paid_amount' => $order->paid_amount,
                'ent_reason' => $order->ent_reason,
                'ent_comment' => $order->ent_comment,
                'cts_comment' => $order->cts_comment,
            ]);

            // 3. Create Financial Receipt & Transaction (Credits)
            // Always create receipt for the PAID portion (if > 0)
            if ($paidAmount > 0) {
                // Find the single summary item for this order
                $invoiceItem = \App\Models\FinancialInvoiceItem::where('invoice_id', $invoice->id)
                    ->where('fee_type', '7')  // Food Order
                    ->where('description', 'like', "%Order #{$order->id}%")
                    ->first();

                // If no summary item found (legacy data?), try finding ANY item linked to this invoice to attach credit to
                if (!$invoiceItem) {
                    $invoiceItem = $invoice->items()->first();
                }

                if ($invoiceItem) {
                    // Create Receipt
                    $receipt = \App\Models\FinancialReceipt::create([
                        // 'financial_invoice_id' => $invoice->id, // Removed as column likely doesn't exist in model
                        'payer_type' => 'App\Models\Member',  // Assuming Member payer for now
                        'payer_id' => $invoice->member_id,
                        'receipt_no' => 'REC-' . time(),  // Simple generation or use helper if available
                        'amount' => $paidAmount,
                        'receipt_date' => now(),
                        'payment_method' => $request->payment_method,
                        'payment_details' => json_encode([
                            'credit_card_type' => $request->credit_card_type,
                            'split_payment' => $request->payment_method === 'split_payment' ? [
                                'cash' => $request->cash,
                                'credit_card' => $request->credit_card,
                                'bank' => $request->bank_transfer
                            ] : null,
                            'receipt_path' => $receiptPath,
                            'ent_details' => $entDetails ? "ENT Value: $entAmount" : null,
                            'cts_details' => $ctsAmount > 0 ? "CTS Value: $ctsAmount" : null,
                        ]),
                        // 'receipt_path' => $receiptPath, // Model doesn't have receipt_path in fillable? Wait, I didn't see it.
                        'created_by' => Auth::id(),
                    ]);

                    // Create Credit Transaction
                    \App\Models\Transaction::create([
                        'financial_invoice_item_id' => $invoiceItem->id,
                        'financial_receipt_id' => $receipt->id,
                        'type' => 'credit',
                        'amount' => $paidAmount,  // Total amount credited
                        'date' => now(),
                        'payment_method' => $request->payment_method,
                        'transaction_type_id' => 1,  // Payment
                        'description' => "Payment for Order #{$order->id}",
                        'created_by' => Auth::id(),
                    ]);
                }
            }
        }

        return back()->with('success', 'Payment successful');
    }

    /**
     * Transaction History - Shows all paid transactions
     */
    public function transactionHistory(Request $request)
    {
        $query = Order::where('created_by', Auth::id())
            ->whereIn('order_type', ['dineIn', 'delivery', 'takeaway', 'reservation', 'room_service'])
            ->where('payment_status', 'paid')
            ->with([
                'member:id,full_name,membership_no',
                'customer:id,name,customer_no',
                'employee:id,employee_id,name',
                'table:id,table_no',
                'cashier:id,name',
                'waiter:id,name',
                'tenant:id,name',  // ✅ Load Tenant Name
                'orderItems:id,order_id,order_item,status',
            ]);

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

        // 📅 Date range filter (by paid_at)
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('paid_at', [$request->start_date . ' 00:00:00', $request->end_date . ' 23:59:59']);
        } elseif ($request->filled('start_date')) {
            $query->whereDate('paid_at', '>=', $request->start_date);
        } elseif ($request->filled('end_date')) {
            $query->whereDate('paid_at', '<=', $request->end_date);
        }

        // 💳 Payment method filter
        if ($request->filled('payment_method') && $request->payment_method !== 'all') {
            $query->where('payment_method', $request->payment_method);
        }

        // 🍽 Order type filter
        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('order_type', $request->type);
        }

        // Clone query for totals before pagination
        $totalsQuery = clone $query;

        $orders = $query->orderBy('paid_at', 'desc')->paginate(15)->withQueryString();

        // Calculate totals for summary (from cloned query)
        $totals = [
            'total_amount' => $totalsQuery->sum('total_price'),
            'total_paid' => $totalsQuery->sum('paid_amount'),
            'count' => $totalsQuery->count(),
        ];

        return Inertia::render('App/Transaction/History/Dashboard', [
            'orders' => $orders,
            'filters' => $request->all(),
            'totals' => $totals,
        ]);
    }
}
