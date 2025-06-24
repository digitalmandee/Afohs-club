<?php

namespace App\Http\Controllers;

use App\Models\FinancialInvoice;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index(Request $request)
    {
        $totalRevenue = FinancialInvoice::where('status', 'paid')->sum('total_price');
        $totalRoomRevenue = FinancialInvoice::where('invoice_type', 'room_booking')->where('status', 'paid')->sum('total_price');
        $totalEventRevenue = FinancialInvoice::where('invoice_type', 'event_booking')->where('status', 'paid')->sum('total_price');

        return Inertia::render('App/Admin/Dashboard', compact('totalRevenue', 'totalRoomRevenue', 'totalEventRevenue'));
    }
}
