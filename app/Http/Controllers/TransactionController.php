<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use App\Models\FinancialInvoice;
use App\Models\Invoices;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index()
    {
        $orders = Order::whereIn('order_type', ['dineIn', 'takeaway'])->with([
            'member',
            'table:id,table_no',
            'orderItems:id,order_id',
        ])->latest()->get()->map(function ($order) {
            $order->order_items_count = $order->orderItems->count() ?? 0;
            return $order;
        });

        $totalOrders = Order::count();

        return Inertia::render('App/Transaction/Dashboard', [
            'Invoices' => $orders,
            'totalOrders' => $totalOrders,
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

        FinancialInvoice::where('member_id', $invoice->user_id)
            ->whereJsonContains('data', ['order_id' => $invoice->id])
            ->update([
                'status' => 'paid',
                'payment_date' => now(),
                'payment_method' => $request->payment_method,
                'paid_amount' => $request->paid_amount
            ]);

        return redirect()->back()->with('success', 'Payment successful');
    }
}