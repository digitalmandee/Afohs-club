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
}