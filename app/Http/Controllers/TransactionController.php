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
        $query = Order::query()
            ->whereIn('order_type', ['dineIn', 'takeaway', 'reservation'])
            ->with(['member', 'table:id,table_no', 'orderItems:id,order_id']);

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
                'reservation' => 'reservation',
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

        // ===============================
        // Total Orders
        // ===============================
        $totalOrders = Order::whereNotIn('status', ['cancelled', 'refund'])->count();

        return Inertia::render('App/Transaction/Dashboard', [
            'Invoices' => $orders,
            'totalOrders' => $totalOrders,
            'filters' => $request->all(),
        ]);
    }

    public function PaymentOrderData($invoiceId)
    {
        $order = Order::where('id', $invoiceId)->with(['member:id,user_id,full_name,membership_no', 'cashier:id,name', 'orderItems:id,order_id,order_item,status', 'table:id,table_no'])->firstOrFail();
        return $order;
    }

    public function OrderPayment(Request $request)
    {
        // Basic validation for common fields
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'paid_amount' => 'required|numeric',
            // 'customer_changes' => 'required|numeric',
            'payment_method' => 'required|in:cash,credit_card,split_payment',
            // Conditional validation for credit card fields
            'credit_card_type' => 'required_if:payment_method,credit_card|string|nullable',
            // If you handle receipt upload, validate here, e.g. 'receipt' => 'nullable|file|mimes:jpg,png,pdf',
        ]);

        $invoice = Order::findOrFail($request->order_id);
        $totalDue = $invoice->total_price;

        if ($request->paid_amount < $totalDue) {
            return back()->withErrors(['paid_amount' => 'The paid amount is not enough to cover the total price of the invoice.']);
        }

        // Save payment details
        $invoice->cashier_id = Auth::user()->id;
        $invoice->payment_method = $request->payment_method;
        $invoice->paid_amount = $request->paid_amount;

        if ($request->payment_method === 'credit_card') {
            $invoice->credit_card_type = $request->credit_card_type;
            // Handle receipt saving if applicable
            // Example:
            if ($request->hasFile('receipt')) {
                $path = FileHelper::saveImage($request->file('receipt'), 'receipts');
                $invoice->receipt = $path;
            }
        }
        if ($request->payment_method === 'split_payment') {
            $invoice->cash_amount = $request->cash;
            $invoice->credit_card_amount = $request->credit_card;
            $invoice->bank_amount = $request->bank_transfer;
        }
        $invoice->paid_at = now();
        $invoice->payment_status = 'paid';
        $invoice->save();

        FinancialInvoice::where('member_id', $invoice->member_id)
            ->whereJsonContains('data', ['order_id' => $invoice->id])
            ->update([
                'status' => 'paid',
                'payment_date' => now(),
                'payment_method' => $request->payment_method,
                'paid_amount' => $request->paid_amount
            ]);

        Log::info('Invoice updated for member ' . $request->order_id);

        return redirect()->back()->with('success', 'Payment successful');
    }
}
