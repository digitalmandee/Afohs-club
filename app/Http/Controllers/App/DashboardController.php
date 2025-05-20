<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\Invoices;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();

        // Revenue
        $today_revenue = Invoices::whereDate('created_at', $today)->sum('total_price');
        $yesterday_revenue = Invoices::whereDate('created_at', $yesterday)->sum('total_price');

        // Cost
        $today_cost = Invoices::whereDate('created_at', $today)->sum('cost_price');
        $yesterday_cost = Invoices::whereDate('created_at', $yesterday)->sum('cost_price');

        // Profit
        $today_profit = $today_revenue - $today_cost;
        $yesterday_profit = $yesterday_revenue - $yesterday_cost;

        // Profit margin
        $today_profit_margin = $today_revenue > 0
            ? round(($today_profit / $today_revenue) * 100, 2)
            : 0;

        // Sales change
        $sales_change = $yesterday_revenue > 0
            ? round((($today_revenue - $yesterday_revenue) / $yesterday_revenue) * 100, 2)
            : 0;

        // Total orders today
        $total_orders = Order::whereDate('created_at', $today)->count();

        // Products sold today (sum of quantities from order_items via today's orders)
        $orderIdsToday = Order::where('status', 'completed')->whereDate('created_at', $today)->pluck('id');

        $products_sold = DB::table('order_items')
            ->whereIn('order_id', $orderIdsToday)
            ->where('status', '!=', 'cancelled')
            ->select(DB::raw('SUM(CAST(JSON_UNQUOTE(JSON_EXTRACT(order_item, "$.quantity")) AS UNSIGNED)) as total_quantity'))
            ->value('total_quantity');

        // Order Type Distribution
        $orderTypes = ['dineIn', 'takeaway', 'pickup', 'delivery'];
        $order_types = [];

        foreach ($orderTypes as $type) {
            $count = Order::whereDate('created_at', $today)
                ->where('order_type', $type)
                ->count();
            $percentage = $total_orders > 0
                ? round(($count / $total_orders) * 100, 2)
                : 0;

            $order_types[$type] = [
                'count' => $count,
                'percentage' => $percentage,
            ];
        }

        // Total transactions
        $total_transactions = Invoices::whereDate('created_at', $today)->count();

        return Inertia::render('App/Dashboard/Dashboardm', [
            'today_revenue' => $today_revenue,
            'yesterday_profit' => $yesterday_profit,
            'yesterday_revenue' => $yesterday_revenue,
            'sales_change' => $sales_change,
            'today_profit' => $today_profit,
            'today_profit_margin' => $today_profit_margin,
            'order_types' => $order_types,
            'total_transactions' => $total_transactions,
            'products_sold' => $products_sold,
            'total_orders' => $total_orders,
        ]);
    }

    // Order Reservations
    public function orderReservations(Request $request)
    {
        $date = $request->query('date') ?: date('Y-m-d');
        $limit = $request->query('limit');

        $orders = Order::where('order_type', 'reservation')->whereDate('start_date', $date)->with(['user:id,name', 'table:id,table_no'])->withCount('orderItems')->limit($limit)->get();

        return response()->json(['success' => true, 'orders' => $orders]);
    }
}