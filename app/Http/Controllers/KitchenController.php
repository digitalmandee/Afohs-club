<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderTaking;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
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
        // Log the full request payload for debugging
        Log::info('KitchenController::updateAll received request:', [
            'orderId' => $orderId,
            'payload' => $request->all(),
        ]);

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,in_progress,completed',
            'items' => 'required|json',
            'order_time' => 'nullable|date_format:H:i:s', // Validate order_time if provided
            'end_time' => 'nullable|date_format:H:i:s', // Validate end_time if provided
        ]);

        if ($validator->fails()) {
            Log::error('Validation failed for updateAll:', [
                'errors' => $validator->errors()->all(),
                'input' => $request->all(),
            ]);
            return redirect()->back()->withErrors($validator)->with('error', 'Validation failed.');
        }

        // Update overall order status, order_time, and end_time
        $order = Order::findOrFail($orderId);
        $order->status = $request->input('status');

        if ($request->filled('order_time')) {
            Log::info('Received order_time: ' . $request->input('order_time')); // Debug log
            $order->order_time = $request->input('order_time');
        } elseif ($request->input('status') === 'in_progress') {
            $order->order_time = now()->format('H:i:s'); // Fallback to current time
            Log::info('Using fallback order_time: ' . $order->order_time); // Debug log
        }

        if ($request->filled('end_time')) {
            Log::info('Received end_time: ' . $request->input('end_time')); // Debug log
            $order->end_time = $request->input('end_time');
        } elseif ($request->input('status') === 'completed') {
            $order->end_time = now()->format('H:i:s'); // Fallback to current time
            Log::info('Using fallback end_time: ' . $order->end_time); // Debug log
        }

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

        Log::info('Order updated successfully:', [
            'orderId' => $orderId,
            'status' => $order->status,
            'order_time' => $order->order_time,
            'end_time' => $order->end_time,
        ]);

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
