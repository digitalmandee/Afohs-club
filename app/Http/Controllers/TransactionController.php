<?php

namespace App\Http\Controllers;

use App\Models\Invoices;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index()
    {
        $Invoices = Invoices::with(['user', 'order.user'])->latest()->get();
        $totalOrders = Order::count();

        return Inertia::render('App/Transaction/Dashboard', compact('Invoices', 'totalOrders'));
    }

    public function PaymentOrderData($invoiceId)
    {
        $order = Invoices::where('id', $invoiceId)->with(['user:id,name', 'order', 'order.orderItems:id,order_id,order_item,status', 'order.table:id,table_no'])->firstOrFail();
        return $order;
    }
    public function OrderPayment(Request $request)
    {
        // First basic validation for presence and numeric types
        $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'paid_amount' => 'required|numeric',
            'customer_changes' => 'required|numeric',
        ]);

        $invoice = Invoices::findOrFail($request->invoice_id);

        // Now validate against the actual invoice data
        $totalDue = $invoice->total_price;

        if (($request->paid_amount) < $totalDue) {
            return back()->withErrors(['paid_amount' => 'The paid amount is not enough to cover the total price of the invoice.']);
        }

        // Save payment
        $invoice->paid_amount = $request->paid_amount;
        $invoice->customer_change = $request->customer_changes;
        $invoice->payment_method = 'cash';
        $invoice->status = 'paid';
        $invoice->save();

        return redirect()->back()->with('success', 'Payment successful');
    }
}