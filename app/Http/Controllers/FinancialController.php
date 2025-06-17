<?php

namespace App\Http\Controllers;
use Inertia\Inertia;
use App\Models\FinancialInvoice;
use App\Models\MemberCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FinancialController extends Controller
{
      public function index()
    {
        $FinancialInvoice = FinancialInvoice::latest()->get();
        return Inertia::render('App/Admin/Finance/Dashboard', [
            'FinancialInvoice' => $FinancialInvoice,
        ]);
    }
    // public function index()
    // {
    //     $FinancialInvoice = FinancialInvoice::where('status', 'active')->get();
    //     return Inertia::render('App/Admin/Finance/Dashboard', compact('FinancialInvoice'));
    // }

    public function create()
    {
        $categories = MemberCategory::select(['id', 'name', 'fee', 'subscription_fee', 'status'])
                                   ->where('status', 'active')
                                   ->get();

        // Define payment methods from financial_invoices table enum
        $paymentMethods = ['cash', 'credit_card', 'bank', 'split_payment'];

        // Define subscription types
        $subscriptionTypes = [
            ['label' => 'One Time', 'value' => 'one_time'],
            ['label' => 'Monthly', 'value' => 'monthly'],
            ['label' => 'Annual', 'value' => 'annual'],
        ];

        return Inertia::render('App/Admin/Finance/AddTransaction', [
            'categories2' => $categories,
            'paymentMethods' => $paymentMethods,
            'subscriptionTypes' => $subscriptionTypes,
        ]);
    }

    public function store(Request $request)
    {
        // Validate the incoming request
        $validator = Validator::make($request->all(), [
            'guestName' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'category' => 'nullable|exists:member_categories,id',
            'subscriptionType' => 'required|in:one_time,monthly,annual',
            'paymentType' => 'required|in:cash,credit_card,bank,split_payment',
            'startDate' => 'required|date',
            'expiryDate' => 'nullable|date|after_or_equal:startDate',
            'amount' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        // Find category for subscription_type
        $category = MemberCategory::find($request->category);
        $subscription_type = $category ? $category->name : null;

        // Generate a unique invoice number
        $invoice_no = 'INV-' . time();

        // Save to financial_invoices table
        FinancialInvoice::create([
            'invoice_no' => $invoice_no,
            'customer_id' => null,
            'guest_name' => $request->guestName,
            'subscription_type' => $subscription_type,
            'invoice_type' => 'subscription',
            'amount' => $request->amount,
            'total_price' => $request->amount,
            'customer_charges' => 0,
            'issue_date' => $request->startDate,
            'due_date' => $request->expiryDate ?? now()->addDays(30),
            'payment_date' => $request->startDate,
            'payment_method' => $request->paymentType,
            'status' => 'unpaid',
            'data' => json_encode([
                'subscriptionType' => $request->subscriptionType,
                'phone' => $request->phone,
            ]),
        ]);

        return redirect()->route('finance.dashboard')->with('success', 'Transaction added successfully');
    }

}
