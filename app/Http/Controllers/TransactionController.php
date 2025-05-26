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
        $invoices = Invoices::with([
            'user',
            'order.user',
            'order.table:id,table_no',
            'order.orderItems:id,order_id'
        ])->latest()
            ->get()
            ->map(function ($invoice) {
                $invoice->order_items_count = $invoice->order?->orderItems->count() ?? 0;
                return $invoice;
            });

        $totalOrders = Order::count();


        return Inertia::render('App/Transaction/Dashboard', [
            'Invoices' => $invoices,
            'totalOrders' => $totalOrders,
        ]);
    }


    public function PaymentOrderData($invoiceId)
    {
        $order = Invoices::where('id', $invoiceId)->with(['cashier:id,name', 'user:id,name', 'order', 'order.orderItems:id,order_id,order_item,status', 'order.table:id,table_no'])->firstOrFail();
        return $order;
    }
    public function OrderPayment(Request $request)
    {
        // Basic validation for common fields
        $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'paid_amount' => 'required|numeric',
            // 'customer_changes' => 'required|numeric',
            'payment_method' => 'required|in:cash,credit_card',
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

        $invoice->status = 'paid';
        $invoice->save();

        return redirect()->back()->with('success', 'Payment successful');
    }
}
