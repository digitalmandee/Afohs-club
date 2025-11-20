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
            ->whereIn('order_type', ['dineIn', 'delivery', 'takeaway', 'reservation'])
            ->with(['member:id,full_name,membership_no', 'customer:id,name,customer_no', 'employee:id,employee_id,name', 'table:id,table_no', 'orderItems:id,order_id']);

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
            'credit_card_type' => 'required_if:payment_method,credit_card|string|nullable',
            'receipt' => 'nullable|file|mimes:jpg,jpeg,png,pdf',
            // ENT
            'ent_reason' => 'nullable|string',
            'ent_comment' => 'nullable|string',
            // CTS
            'cts_comment' => 'nullable|string',
        ]);

        $invoice = Order::findOrFail($request->order_id);
        $totalDue = $invoice->total_price;

        // ENT & CTS allow 0 amount
        if (!in_array($request->payment_method, ['ent', 'cts'])) {
            if ($request->paid_amount < $totalDue) {
                return back()->withErrors([
                    'paid_amount' => 'The paid amount is not enough to cover the total price of the invoice.'
                ]);
            }
        }

        // Save main payment data
        $invoice->cashier_id = Auth::id();
        $invoice->payment_method = $request->payment_method;
        $invoice->paid_amount = $request->paid_amount;
        $invoice->paid_at = now();

        /*
         * |--------------------------------------------------------------------------
         * | CREDIT CARD
         * |--------------------------------------------------------------------------
         */
        if ($request->payment_method === 'credit_card') {
            $invoice->credit_card_type = $request->credit_card_type;

            if ($request->hasFile('receipt')) {
                $path = FileHelper::saveImage($request->file('receipt'), 'receipts');
                $invoice->receipt = $path;
            }
        }

        /*
         * |--------------------------------------------------------------------------
         * | SPLIT PAYMENT
         * |--------------------------------------------------------------------------
         */
        if ($request->payment_method === 'split_payment') {
            $invoice->cash_amount = $request->cash;
            $invoice->credit_card_amount = $request->credit_card;
            $invoice->bank_amount = $request->bank_transfer;
        }

        /*
         * |--------------------------------------------------------------------------
         * | ENT (Employee No-Take)
         * |--------------------------------------------------------------------------
         */
        if ($request->payment_method === 'ent') {
            // $invoice->ent_reason = $request->ent_reason;
            // $invoice->ent_comment = $request->ent_comment;

            // ENT = no money paid
            $invoice->paid_amount = 0;
        }

        /*
         * |--------------------------------------------------------------------------
         * | CTS (Customer Treat / Customer To-Settle)
         * |--------------------------------------------------------------------------
         */
        if ($request->payment_method === 'cts') {
            // $invoice->cts_comment = $request->cts_comment;

            // CTS = no money paid
            $invoice->paid_amount = 0;
        }

        $invoice->payment_status = 'paid';
        $invoice->save();

        /*
         * |--------------------------------------------------------------------------
         * | UPDATE FINANCIAL INVOICE
         * |--------------------------------------------------------------------------
         */
        FinancialInvoice::where('member_id', $invoice->member_id)
            ->whereJsonContains('data', ['order_id' => $invoice->id])
            ->update([
                'status' => 'paid',
                'payment_date' => now(),
                'payment_method' => $request->payment_method,
                // 'paid_amount' => ($request->payment_method === 'ent' || $request->payment_method === 'cts') ? 0 : $request->paid_amount,
                'paid_amount' => $request->paid_amount,
                'ent_reason' => $request->ent_reason,
                'ent_comment' => $request->ent_comment,
                'cts_comment' => $request->cts_comment,
            ]);

        return back()->with('success', 'Payment successful');
    }
}