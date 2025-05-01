<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderTaking;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;

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

    public function updateAll(Request $request, $orderId)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,in_progress,completed',
            'items' => 'required|json',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->with('error', 'Validation failed.');
        }

        // Update overall order status
        $order = Order::findOrFail($orderId);
        $order->status = $request->input('status');
        $order->save();

        // Update item-level statuses
        $items = json_decode($request->input('items'), true);

        foreach ($items as $item) {
            $orderTaking = OrderTaking::where('id', $item['id'])
                ->where('order_id', $orderId)
                ->first();

            if ($orderTaking) {
                $orderTaking->status = $item['status'];
                $orderTaking->save();
            }
        }

        return redirect()->back()->with('success', 'Order and item statuses updated successfully.');
    }

    public function updateItemStatus(Request $request, $orderId, $itemId)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,completed',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->with('error', 'Validation failed for item status.');
        }

        $orderTaking = OrderTaking::where('id', $itemId)
            ->where('order_id', $orderId)
            ->firstOrFail();

        $orderTaking->status = $request->input('status');
        $orderTaking->save();

        return redirect()->back()->with('success', 'Item status updated successfully.');
    }
}
