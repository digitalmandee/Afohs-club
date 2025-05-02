<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class KitchenController extends Controller
{
    public function index()
    {
        $orders = Order::with(['orderItems', 'table'])
            ->latest()
            ->get();

        return Inertia::render('App/Kitchen/Dashboard', [
            'kitchenOrders' => $orders,
        ]);
    }

    public function updateAll(Request $request, $orderId)
    {
        // Log the full request payload for debugging
        // Log::info('KitchenController::updateAll received request:', [
        //     'orderId' => $orderId,
        //     'payload' => $request->all(),
        // ]);
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,in_progress,completed',
            'items' => 'required|json',
            'order_time' => 'nullable|date_format:Y-m-d\TH:i:s.v\Z', // Validate order_time if provided in the specified format
            'end_time' => 'nullable|date_format:Y-m-d\TH:i:s.v\Z', // Validate end_time if provided in the specified format
        ]);

        if ($validator->fails()) {
            // Log::error('Validation failed for updateAll:', [
            //     'errors' => $validator->errors()->all(),
            //     'input' => $request->all(),
            // ]);
            return redirect()->back()->withErrors($validator)->with('error', 'Validation failed.');
        }

        // Update overall order status, order_time, and end_time
        $order = Order::findOrFail($orderId);
        $order->status = $request->input('status');

        if ($request->filled('order_time')) {
            $orderTimeIso = $request->input('order_time');
            $order->order_time = Carbon::parse($orderTimeIso)->format('Y-m-d H:i:s');
        } elseif ($request->input('status') === 'in_progress') {
            $order->order_time = Carbon::now()->format('Y-m-d H:i:s');
        }

        if ($request->filled('end_time')) {
            $orderTimeIso = $request->input('end_time');
            $order->end_time = Carbon::parse($orderTimeIso)->format('Y-m-d H:i:s');
        } elseif ($request->input('status') === 'completed') {
            $order->end_time = Carbon::now()->format('Y-m-d H:i:s');
        }

        $order->save();

        // Update item-level statuses
        $items = json_decode($request->input('items'), true);

        foreach ($items as $item) {
            $orderItem = OrderItem::where('id', $item['id'])
                ->where('order_id', $orderId)
                ->first();

            if ($orderItem) {
                $orderItem->status = $item['status'];
                $orderItem->save();
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

        $orderItem = OrderItem::where('id', $itemId)
            ->where('order_id', $orderId)
            ->firstOrFail();

        $orderItem->status = $request->input('status');
        $orderItem->save();

        return redirect()->back()->with('success', 'Item status updated successfully.');
    }
}
