<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\Invoices;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();

        // Revenue calculations
        $today_revenue = Invoices::whereDate('created_at', $today)->sum('total_price');
        $yesterday_revenue = Invoices::whereDate('created_at', $yesterday)->sum('total_price');

        // Sales percentage change (compared to yesterday)
        $sales_change = $yesterday_revenue > 0
            ? round((($today_revenue - $yesterday_revenue) / $yesterday_revenue) * 100, 2)
            : null; // null if no data for yesterday

        // Example: Profit could be defined like this if you have cost field
        $today_cost = Invoices::whereDate('created_at', $today)->sum('cost_price'); // Add cost_price column if not present
        $today_profit = $today_revenue - $today_cost;

        return Inertia::render('App/Dashboard/Dashboardm', [
            'today_revenue' => $today_revenue,
            'yesterday_revenue' => $yesterday_revenue,
            'sales_change' => $sales_change,
            'today_profit' => $today_profit,
        ]);
    }
}