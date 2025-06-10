<?php

namespace App\Http\Controllers;

use App\Models\FinancialInvoice;
use App\Models\MemberCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    public function index()
    {
        return Inertia::render('App/Admin/Subscription/Dashboard');
    }

    public function create()
    {
        $categories = MemberCategory::where('status', 'active')->get();
        $invoice_no = $this->getInvoiceNo();
        return Inertia::render('App/Admin/Subscription/AddSubscription', compact('categories', 'invoice_no'));
    }

    private function getInvoiceNo()
    {
        $invoiceNo = (int)FinancialInvoice::max('invoice_no');
        $invoiceNo = $invoiceNo + 1;
        return $invoiceNo;
    }
}
