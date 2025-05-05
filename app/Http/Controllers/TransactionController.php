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
        $Invoice = Invoices::with(['user', 'order.user'])
            ->latest()
            ->get();
        $totalOrders = Order::count();

        return Inertia::render('App/Transaction/Dashboard', [
            'Invoices' => $Invoice,
            'totalOrders' => $totalOrders,

        ]);
    }
}
