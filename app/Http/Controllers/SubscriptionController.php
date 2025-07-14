<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use App\Models\Category;
use App\Models\FinancialInvoice;
use App\Models\Subscription;
use App\Models\SubscriptionCategory;
use App\Models\SubscriptionType;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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
            ->whereIn(DB::raw("JSON_UNQUOTE(JSON_EXTRACT(data, '\$.subscription_id'))"), $monthlySubscriptionIds)
            ->sum('total_price');

        // Pending Fee: unpaid/due invoices
        $pendingFee = FinancialInvoice::whereIn('status', ['unpaid', 'due'])  // adjust if you use other terms
            ->where('invoice_type', 'subscription')
            ->whereIn(DB::raw("JSON_UNQUOTE(JSON_EXTRACT(data, '\$.subscription_id'))"), $monthlySubscriptionIds)
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
        $subscriberTypes = SubscriptionType::all();
        $invoice_no = $this->getInvoiceNo();
        return Inertia::render('App/Admin/Subscription/AddSubscription', compact('subscriberTypes', 'categories', 'invoice_no'));
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

        $data = $subscription->toArray();  // Convert Eloquent model to array
        $data['invoice_type'] = 'subscription';  // Add custom fiel
        $data['amount'] = $request->amount;  // Add custom fiel

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

    public function customerInvoices($userId)
    {
        $invoices = FinancialInvoice::with('customer')
            ->where('customer_id', $userId)
            ->whereIn('invoice_type', ['membership', 'subscription'])
            ->orderBy('issue_date', 'desc')
            ->get()
            ->map(function ($invoice) {
                $invoice->is_overdue = $invoice->due_date && $invoice->status !== 'paid' && now()->gt($invoice->due_date);
                return $invoice;
            });

        return response()->json($invoices);
    }

    public function payMultipleInvoices(Request $request)
    {
        $request->validate([
            'invoice_ids' => 'required|array',
            'invoice_ids.*' => 'exists:financial_invoices,id',
            'method' => 'required|in:cash,card',
        ]);

        foreach ($request->invoice_ids as $id) {
            $invoice = FinancialInvoice::find($id);

            if (!$invoice || $invoice->status === 'paid')
                continue;

            $invoice->update([
                'status' => 'paid',
                'payment_method' => $request->method,
                'payment_date' => now(),
            ]);
        }

        return response()->json(['message' => 'Selected invoices marked as paid.']);
    }

    public function createAndPayInvoice(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'member_id' => 'nullable|exists:members,id',
            'amount' => 'required|numeric|min:0',
            'invoice_type' => 'required|in:membership,subscription',
            'subscription_type' => 'required|in:one_time,monthly,quarter,yearly',
            'method' => 'required|in:cash,card',
            'prepay_quarters' => 'nullable|integer|min:0|max:4'
        ]);

        $today = now();

        $invoice = FinancialInvoice::create([
            'invoice_no' => 'INV-' . strtoupper(uniqid()),
            'customer_id' => $request->customer_id,
            'member_id' => $request->member_id,
            'invoice_type' => $request->invoice_type,
            'subscription_type' => $request->subscription_type,
            'amount' => $request->amount,
            'total_price' => $request->amount,
            'paid_amount' => $request->amount,
            'issue_date' => $today,
            'due_date' => $today->copy()->addDays(10),
            'status' => 'paid',
            'payment_method' => $request->method,
            'payment_date' => $today,
        ]);

        if ($request->subscription_type === 'quarter' && $request->prepay_quarters) {
            for ($i = 1; $i <= $request->prepay_quarters; $i++) {
                $futureDate = $today->copy()->addMonths($i * 3);
                $quarter = ceil($futureDate->month / 3);
                $quarterLabel = 'Q' . $quarter . ' ' . $futureDate->year;

                FinancialInvoice::create([
                    'invoice_no' => 'INV-' . strtoupper(uniqid()),
                    'customer_id' => $request->customer_id,
                    'member_id' => $request->member_id,
                    'invoice_type' => $request->invoice_type,
                    'subscription_type' => 'quarter',
                    'amount' => $request->amount,
                    'total_price' => $request->amount,
                    'paid_amount' => $request->amount,
                    'issue_date' => $futureDate,
                    'due_date' => $futureDate->copy()->addDays(10),
                    'paid_for_quarter' => $quarterLabel,
                    'status' => 'paid',
                    'payment_method' => $request->method,
                    'payment_date' => now(),
                ]);
            }
        }

        return response()->json(['message' => 'Invoice created and paid.', 'invoice' => $invoice]);
    }

    public function payInvoice($invoiceId)
    {
        $invoice = FinancialInvoice::findOrFail($invoiceId);

        if ($invoice->status === 'paid') {
            return response()->json(['message' => 'Already paid'], 400);
        }

        $invoice->status = 'paid';
        $invoice->payment_date = now();
        $invoice->save();

        return response()->json(['message' => 'Invoice paid successfully']);
    }

    public function search(Request $request)
    {
        $query = $request->get('q');
        $customers = User::where('name', 'like', "%$query%")
            ->role('user')
            ->whereNull('parent_user_id')
            ->orWhere('email', 'like', "%$query%")
            ->limit(10)
            ->get(['id', 'name', 'email']);

        return response()->json($customers);
    }

    public function byUser($userId)
    {
        $subscriptions = Subscription::where('user_id', $userId)->get()->map(function ($s) {
            return [
                'id' => $s->id,
                'subscription_type' => $s->subscription_type,
                'category' => SubscriptionCategory::where('id', $s->category['id']),
            ];
        });

        return response()->json($subscriptions);
    }

    private function getInvoiceNo()
    {
        $invoiceNo = FinancialInvoice::max('invoice_no');
        $invoiceNo = $invoiceNo + 1;
        return $invoiceNo;
    }
}