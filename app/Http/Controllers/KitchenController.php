<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KitchenController extends Controller
{
    public function index()
    {
        $orders = Order::with(['orderTakings', 'table'])
            ->latest()
            ->get();

        return Inertia::render('App/Kitchen/Dashboard', [
            'kitchenOrders' => $orders,
        ]);
    }
}
