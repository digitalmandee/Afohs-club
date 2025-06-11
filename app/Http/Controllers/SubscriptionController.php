<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use App\Models\FinancialInvoice;
use App\Models\MemberCategory;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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

    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email|max:255|exists:users,email',
            'phone' => 'required|string|max:20',
            'category' => 'required|exists:member_categories,id',
            'subscriptionType' => 'required|in:one_time,monthly,annual',
            'startDate' => 'required|date',
            'expiryDate' => 'required|date|after_or_equal:start_date',
        ]);

        $category = MemberCategory::find($request->category);

        DB::beginTransaction();

        Subscription::create([
            'user_id' => $request->customer['id'],
            'category' => $category,
            'subscription_type' => $request->subscriptionType,
            'start_date' => $request->startDate,
            'expiry_date' => $request->expiryDate,
            'status' => 'in_active',
        ]);

        $invoice_no = $this->getInvoiceNo();
        $member_id = Auth::user()->id;

        FinancialInvoice::create([
            'invoice_no' => $invoice_no,
            'customer_id' => $request->customer['id'],
            'member_id' => $member_id,
            'subscription_type' => $request->subscriptionType,
            'invoice_type' => 'subscription',
            'amount' => $request->amount,
            'total_price' => $request->amount,
            'issue_date' => now(),
            'status' => 'unpaid',
            'data' => array_merge($request->all(), ['category' => $category->toArray()])
        ]);

        DB::commit();

        return response()->json(['success' => true, 'message' => 'Subscription created successfully', 'invoice_no' => $invoice_no]);
    }

    public function payment(Request $request)
    {
        $request->query('invoice_no');

        $invoice = FinancialInvoice::where('invoice_no', $request->invoice_no)->with('customer:id,first_name,last_name,email', 'customer.member.memberType')->first();
        return Inertia::render('App/Admin/Subscription/Payment', compact('invoice'));
    }

    public function paymentStore(Request $request)
    {
        $request->validate([
            'invoice_no' => 'required|exists:financial_invoices,invoice_no',
            'amount' => 'required|numeric',
        ]);

        DB::beginTransaction();

        $recieptPath = null;
        if ($request->payment_method == 'card' && $request->has('reciept')) {
            $recieptPath = FileHelper::saveImage($request->file('reciept'), 'reciepts');
        }

        $invoice = FinancialInvoice::where('invoice_no', $request->invoice_no)->first();
        $invoice->paid_date = now();
        $invoice->paid_amount = $request->total_amount;
        $invoice->customer_charges = $request->customer_charges;
        $invoice->payment_method = $request->payment_method;
        $invoice->reciept = $recieptPath;
        $invoice->status = 'paid';
        $invoice->save();

        DB::commit();

        return response()->json(['success' => true, 'message' => 'Payment successful']);
    }

    private function getInvoiceNo()
    {
        $invoiceNo = (int)FinancialInvoice::max('invoice_no');
        $invoiceNo = $invoiceNo + 1;
        return $invoiceNo;
    }
}
