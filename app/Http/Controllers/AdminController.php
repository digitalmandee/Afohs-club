<?php

namespace App\Http\Controllers;

use App\Models\FinancialInvoice;
use App\Models\RoomBooking;
use App\Models\EventBooking;
use App\Models\Member;
use App\Models\Customer;
use App\Models\Employee;
use App\Models\Order;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function index(Request $request)
    {
        // Just render the page, data will be fetched via API
        return Inertia::render('App/Admin/Dashboard');
    }

    public function getDashboardStats(Request $request)
    {
        $month = $request->query('month', now()->format('Y-m'));
        $year = $request->query('year', now()->year);

        // Parse month-year (e.g., "Jan-2025" or "2025-01")
        try {
            $date = Carbon::createFromFormat('M-Y', $month);
        } catch (\Exception $e) {
            $date = Carbon::createFromFormat('Y-m', $month);
        }

        $startOfMonth = $date->copy()->startOfMonth();
        $endOfMonth = $date->copy()->endOfMonth();

        // Revenue & Profit
        $totalRevenue = FinancialInvoice::where('status', 'paid')
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->sum('total_price');

        $totalExpenses = 0; // You can calculate from expenses table if you have one
        $totalProfit = $totalRevenue - $totalExpenses;

        // Bookings
        $totalRoomBookings = RoomBooking::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();
        $totalEventBookings = EventBooking::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();
        $totalBookings = $totalRoomBookings + $totalEventBookings;

        // Members & Employees
        // Members are those with parent_id = null
        $totalMembers = Member::whereNull('parent_id')->count();
        $totalCustomers = Customer::count();
        $totalEmployees = Employee::count();

        // Product Orders
        $totalProductOrders = Order::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();

        // Subscription Orders
        $totalSubscriptionOrders = Subscription::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();

        // Monthly chart data for the year
        $chartData = [];
        for ($m = 1; $m <= 12; $m++) {
            $monthStart = Carbon::create($year, $m, 1)->startOfMonth();
            $monthEnd = Carbon::create($year, $m, 1)->endOfMonth();

            $income = FinancialInvoice::where('status', 'paid')
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->sum('total_price');

            $expenses = 0; // Calculate from your expenses table
            $profit = $income - $expenses;

            $chartData[] = [
                'name' => $monthStart->format('M'),
                'income' => (float) $income,
                'expenses' => (float) $expenses,
                'profit' => (float) $profit,
            ];
        }

        return response()->json([
            'success' => true,
            'stats' => [
                'totalRevenue' => (float) $totalRevenue,
                'totalProfit' => (float) $totalProfit,
                'totalBookings' => $totalBookings,
                'totalRoomBookings' => $totalRoomBookings,
                'totalEventBookings' => $totalEventBookings,
                'totalMembers' => $totalMembers,
                'totalCustomers' => $totalCustomers,
                'totalEmployees' => $totalEmployees,
                'totalProductOrders' => $totalProductOrders,
                'totalSubscriptionOrders' => $totalSubscriptionOrders,
            ],
            'chartData' => $chartData,
        ]);
    }

    public function printDashboard(Request $request)
    {
        $month = $request->query('month', now()->format('M-Y'));
        $year = $request->query('year', now()->year);

        // Parse month-year
        try {
            $date = Carbon::createFromFormat('M-Y', $month);
        } catch (\Exception $e) {
            $date = Carbon::createFromFormat('Y-m', $month);
        }

        $startOfMonth = $date->copy()->startOfMonth();
        $endOfMonth = $date->copy()->endOfMonth();

        // Revenue & Profit
        $totalRevenue = FinancialInvoice::where('status', 'paid')
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->sum('total_price');

        $totalExpenses = 0;
        $totalProfit = $totalRevenue - $totalExpenses;

        // Bookings
        $totalRoomBookings = RoomBooking::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();
        $totalEventBookings = EventBooking::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();
        $totalBookings = $totalRoomBookings + $totalEventBookings;

        // Members & Employees
        $totalMembers = Member::whereNull('parent_id')->count();
        $totalCustomers = Customer::count();
        $totalEmployees = Employee::count();

        // Product Orders
        $totalProductOrders = Order::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();

        // Subscription Orders
        $totalSubscriptionOrders = Subscription::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();

        // Monthly chart data for the year
        $chartData = [];
        for ($m = 1; $m <= 12; $m++) {
            $monthStart = Carbon::create($year, $m, 1)->startOfMonth();
            $monthEnd = Carbon::create($year, $m, 1)->endOfMonth();

            $income = FinancialInvoice::where('status', 'paid')
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->sum('total_price');

            $expenses = 0;
            $profit = $income - $expenses;

            $chartData[] = [
                'name' => $monthStart->format('M'),
                'income' => (float) $income,
                'expenses' => (float) $expenses,
                'profit' => (float) $profit,
            ];
        }

        $stats = [
            'totalRevenue' => (float) $totalRevenue,
            'totalProfit' => (float) $totalProfit,
            'totalBookings' => $totalBookings,
            'totalRoomBookings' => $totalRoomBookings,
            'totalEventBookings' => $totalEventBookings,
            'totalMembers' => $totalMembers,
            'totalCustomers' => $totalCustomers,
            'totalEmployees' => $totalEmployees,
            'totalProductOrders' => $totalProductOrders,
            'totalSubscriptionOrders' => $totalSubscriptionOrders,
        ];

        return view('admin.dashboard-print', compact('stats', 'chartData', 'month', 'year'));
    }
}
