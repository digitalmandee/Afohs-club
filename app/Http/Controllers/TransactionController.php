<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use App\Models\Invoices;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index()
    {
        $orders = Order::with([
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
        $order = Order::where('id', $invoiceId)->with(['member:id,user_id,first_name,last_name', 'orderItems:id,order_id,order_item,status', 'table:id,table_no'])->firstOrFail();
        return $order;
    }

    public function OrderPayment(Request $request)
    {
        // Basic validation for common fields
        $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'paid_amount' => 'required|numeric',
            // 'customer_changes' => 'required|numeric',
            'payment_method' => 'required|in:cash,credit_card,split_payment',
            // Conditional validation for credit card fields
            'credit_card_type' => 'required_if:payment_method,credit_card|string|nullable',
            // If you handle receipt upload, validate here, e.g. 'receipt' => 'nullable|file|mimes:jpg,png,pdf',
        ]);

        $invoice = Invoices::findOrFail($request->invoice_id);
        $totalDue = $invoice->total_price;

        if ($request->paid_amount < $totalDue) {
            return back()->withErrors(['paid_amount' => 'The paid amount is not enough to cover the total price of the invoice.']);
        }

        // Save payment details
        $invoice->cashier_id = auth()->user()->id;
        if ($request->payment_method === 'cash') {
            $invoice->customer_change = $request->customer_changes;
        }
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
            $invoice->customer_change = $request->customer_changes;
            $invoice->cash = $request->cash;
            $invoice->credit_card = $request->credit_card;
            $invoice->bank_transfer = $request->bank_transfer;
        }

        $invoice->status = 'paid';
        $invoice->save();

        return redirect()->back()->with('success', 'Payment successful');
    }
}
