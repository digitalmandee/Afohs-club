<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use App\Models\FinancialInvoice;
use App\Models\MemberCategory;
use App\Models\Subscription;
use App\Models\SubscriptionCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class SubscriptionController extends Controller
{
    public function index()
    {
        // today new subscriptions
        $newSubscriptionsToday = Subscription::where('status', 'active')->whereDate('created_at', today())->count();
        $totalRevenue = FinancialInvoice::where('status', 'paid')->where('invoice_type', 'subscription')->sum('total_price');
        // subscriptions
        $subscriptions = Subscription::with('user:id,user_id,first_name,last_name,email,phone_number', 'user.member:id,user_id,membership_no', 'invoice:id,status')->latest()->take(5)->get();

        return Inertia::render('App/Admin/Subscription/Dashboard', compact('subscriptions', 'newSubscriptionsToday', 'totalRevenue'));
    }


    public function monthlyFee()
    {
        // Get all monthly subscriptions
        $monthlySubscriptions = Subscription::where('subscription_type', 'monthly')->get();

        // Total number of monthly subscriptions
        $totalSubscriptions = $monthlySubscriptions->count();

        // Get their IDs
        $monthlySubscriptionIds = $monthlySubscriptions->pluck('id');

        // Collected Fee: paid invoices only
        $collectedFee = FinancialInvoice::where('status', 'paid')
            ->where('invoice_type', 'subscription')
            ->whereIn(DB::raw("JSON_UNQUOTE(JSON_EXTRACT(data, '$.subscription_id'))"), $monthlySubscriptionIds)
            ->sum('total_price');

        // Pending Fee: unpaid/due invoices
        $pendingFee = FinancialInvoice::whereIn('status', ['unpaid', 'due']) // adjust if you use other terms
            ->where('invoice_type', 'subscription')
            ->whereIn(DB::raw("JSON_UNQUOTE(JSON_EXTRACT(data, '$.subscription_id'))"), $monthlySubscriptionIds)
            ->sum('total_price');

        // Latest 5 monthly subscriptions
        $subscriptions = Subscription::with([
            'user:id,user_id,first_name,last_name,email,phone_number',
            'invoice:id,status'
        ])
            ->where('subscription_type', 'monthly')
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('App/Admin/Subscription/Monthly', compact('subscriptions', 'totalSubscriptions', 'collectedFee', 'pendingFee'));
    }

    public function management()
    {
        $subscriptions = Subscription::with('user:id,user_id,first_name,last_name,email')->latest()->get();
        return Inertia::render('App/Admin/Subscription/Management', compact('subscriptions'));
    }

    public function create()
    {
        $categories = SubscriptionCategory::where('status', 'active')->get();
        $invoice_no = $this->getInvoiceNo();
        return Inertia::render('App/Admin/Subscription/AddSubscription', compact('categories', 'invoice_no'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email|max:255|exists:users,email',
            'phone' => 'required|string|max:20',
            'category' => 'required|exists:subscription_categories,id',
            'subscriptionType' => 'required|in:one_time,monthly,annual,quarter',
            'startDate' => 'required|date',
            'expiryDate' => 'nullable|date|after_or_equal:start_date',
        ]);

        $category = SubscriptionCategory::find($request->category);

        DB::beginTransaction();

        $subscription = Subscription::create([
            'user_id' => $request->customer['id'],
            'category' => $category,
            'subscription_type' => $request->subscriptionType,
            'start_date' => $request->startDate,
            'expiry_date' => $request->expiryDate,
            'status' => 'in_active',
        ]);

        $data = $subscription->toArray(); // Convert Eloquent model to array
        $data['invoice_type'] = 'subscription'; // Add custom fiel
        $data['amount'] = $request->amount; // Add custom fiel

        $invoice_no = $this->getInvoiceNo();
        $member_id = Auth::user()->id;

        $invoice = FinancialInvoice::create([
            'invoice_no' => $invoice_no,
            'customer_id' => $request->customer['id'],
            'member_id' => $member_id,
            'subscription_type' => $request->subscriptionType,
            'invoice_type' => 'subscription',
            'amount' => $request->amount,
            'total_price' => $request->amount,
            'issue_date' => now(),
            'status' => 'unpaid',
            'data' => [$data]
        ]);

        $qrCodeData = route('member.profile', ['id' => $request->customer['id']]) . '?' . http_build_query(['subscription_id' => $subscription->id]);

        // Create QR code image and save it
        $qrBinary = QrCode::format('png')->size(300)->generate($qrCodeData);
        $qrImagePath = FileHelper::saveBinaryImage($qrBinary, 'qr_codes');

        $subscription->invoice_id = $invoice->id;
        $subscription->qr_code = $qrImagePath;
        $subscription->save();

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
        if ($request->payment_method == 'credit_card' && $request->has('reciept')) {
            $recieptPath = FileHelper::saveImage($request->file('reciept'), 'reciepts');
        }

        $invoice = FinancialInvoice::where('invoice_no', $request->invoice_no)->first();
        $invoice->payment_date = now();
        $invoice->paid_amount = $request->total_amount;
        $invoice->customer_charges = $request->customer_charges;
        $invoice->payment_method = $request->payment_method;
        $invoice->reciept = $recieptPath;
        $invoice->status = 'paid';
        $invoice->save();

        $subscription = Subscription::find($request->subscription_id);
        $subscription->status = 'active';
        $subscription->save();

        DB::commit();

        return response()->json(['success' => true, 'message' => 'Payment successful']);
    }

    private function getInvoiceNo()
    {
        $invoiceNo = FinancialInvoice::max('invoice_no');
        $invoiceNo = $invoiceNo + 1;
        return $invoiceNo;
    }
}