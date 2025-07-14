<?php

namespace App\Http\Controllers;

use App\Models\FinancialInvoice;
use App\Models\MemberCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class FinancialController extends Controller
{
    public function index()
    {
        $FinancialInvoice = FinancialInvoice::with(['user' => function ($query) {
            $query->select('id', 'phone_number', 'name');
        }])->latest()->get();
        return Inertia::render('App/Admin/Finance/Dashboard', [
            'FinancialInvoice' => $FinancialInvoice,
        ]);
    }

    public function fetchRevenue()
    {
        $totalRevenue = FinancialInvoice::where('status', 'paid')
            ->sum('total_price');

        $roomRevenue = FinancialInvoice::where('status', 'paid')
            ->where('invoice_type', 'event_booking')
            ->sum('total_price');

        $eventRevenue = FinancialInvoice::where('status', 'paid')
            ->where('invoice_type', 'room_booking')
            ->sum('total_price');

        $memberShipRevenue = FinancialInvoice::where('status', 'paid')
            ->where('invoice_type', 'membership')
            ->sum('total_price');

        $subscriptionRevenue = FinancialInvoice::where('status', 'paid')
            ->where('invoice_type', 'subscription')
            ->sum('total_price');

        $foodRevenue = FinancialInvoice::where('status', 'paid')
            ->where('invoice_type', 'food')
            ->sum('total_price');

        return response()->json([
            'totalRevenue' => $totalRevenue,
            'roomRevenue' => $roomRevenue,
            'eventRevenue' => $eventRevenue,
            'memberShipRevenue' => $memberShipRevenue,
            'subscriptionRevenue' => $subscriptionRevenue,
            'foodRevenue' => $foodRevenue,
        ]);
    }

    public function getTransaction()
    {
        $FinancialData = FinancialInvoice::with(['user' => function ($query) {
            $query->select('id', 'phone_number', 'name');
        }])->latest()->get();
        return Inertia::render('App/Admin/Finance/Transaction', [
            'FinancialData' => $FinancialData,
        ]);
    }

    public function create()
    {
        $categories = MemberCategory::select(['id', 'name', 'fee', 'subscription_fee', 'status'])
            ->where('status', 'active')
            ->get();

        return Inertia::render('App/Admin/Finance/AddTransaction', [
            'categories2' => $categories,
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
        }

        // Find category for subscription_type
        $category = MemberCategory::find($request->category);
        $subscription_type = $category ? $category->name : null;
        $member_id = Auth::user()->id;

        // Create the invoice without invoice_no and customer_id initially
        $invoice = FinancialInvoice::create([
            'invoice_no' => null,
            'customer_id' => $request->customer['id'] ?? null,
            'member_id' => $member_id,
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

        $invoice->update([
            'invoice_no' => $invoice->id,
        ]);

        return redirect()->route('finance.dashboard')->with('success', 'Transaction added successfully');
    }

    // Get Member Invoices
    public function getFinancialInvoices($id)
    {
        $invoice = FinancialInvoice::where('id', $id)->with('customer:id,user_id,first_name,last_name,email,phone_number', 'customer.member', 'customer.member.memberType', 'customer.userDetail:id,user_id,current_city')->first();

        if (!$invoice) {
            return response()->json(['message' => 'Invoice not found'], 404);
        }

        $invoice->customer->loadCount('familyMembers');

        return response()->json(['invoice' => $invoice]);
    }

    public function createAndPay(Request $request)
    {
        $data = $request->validate([
            'customer_id' => 'required|exists:users,id',
            'invoice_type' => 'required|in:membership,subscription',
            'subscription_type' => 'nullable|in:quarter,monthly,yearly,one_time',
            'amount' => 'required|numeric|min:0',
            'prepay_quarters' => 'nullable|integer|min:0|max:4',
            'method' => 'required|in:cash,card',
            'discount_type' => 'nullable|in:fixed,percentage',
            'discount_value' => 'nullable|numeric|min:0',
        ]);

        $amount = $data['amount'];
        if ($data['discount_type'] && $data['discount_value']) {
            $discount = $data['discount_type'] === 'percentage'
                ? ($amount * $data['discount_value']) / 100
                : $data['discount_value'];

            $amount -= $discount;
        }

        $invoice = FinancialInvoice::create([
            'customer_id' => $data['customer_id'],
            'invoice_type' => $data['invoice_type'],
            'subscription_type' => $data['subscription_type'],
            'amount' => $amount,
            'total_price' => $amount,
            'discount_type' => $data['discount_type'],
            'discount_value' => $data['discount_value'],
            'issue_date' => now(),
            'due_date' => now()->addDays(7),
            'paid_for_quarter' => $data['prepay_quarters'] ?? null,
            'payment_method' => $data['method'],
            'payment_date' => now(),
            'status' => 'paid',
        ]);

        return response()->json(['message' => 'Invoice created and marked as paid', 'invoice' => $invoice]);
    }
}