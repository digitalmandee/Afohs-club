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
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,in_progress,completed',
        ]);

        $order = Order::findOrFail($id);
        $order->status = $validated['status'];
        $order->save();

        return back()->with('success', 'Order status updated.');
    }
}
