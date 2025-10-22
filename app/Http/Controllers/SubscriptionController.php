<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use App\Models\Category;
use App\Models\FinancialInvoice;
use App\Models\Member;
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
        // Get subscription fee statistics from the new transaction system
        $totalActiveSubscriptions = FinancialInvoice::where('fee_type', 'subscription_fee')
            ->where('status', 'paid')
            ->where(function($query) {
                $query->whereNull('valid_to')
                      ->orWhere('valid_to', '>=', now());
            })
            ->count();

        // New subscriptions today
        $newSubscriptionsToday = FinancialInvoice::where('fee_type', 'subscription_fee')
            ->where('status', 'paid')
            ->whereDate('created_at', today())
            ->count();

        // Total subscription revenue
        $totalRevenue = FinancialInvoice::where('fee_type', 'subscription_fee')
            ->where('status', 'paid')
            ->sum('total_price');

        // Recent subscription transactions (latest 10)
        $recentSubscriptions = FinancialInvoice::where('fee_type', 'subscription_fee')
            ->with([
                'member:id,full_name,membership_no',
                'subscriptionType:id,name',
                'subscriptionCategory:id,name,fee'
            ])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('App/Admin/Subscription/Dashboard', [
            'statistics' => [
                'total_active_subscriptions' => $totalActiveSubscriptions,
                'new_subscriptions_today' => $newSubscriptionsToday,
                'total_revenue' => $totalRevenue,
            ],
            'recent_subscriptions' => $recentSubscriptions
        ]);
    }

    public function management(Request $request)
    {
        // Get subscription fee statistics for management page
        $totalSubscriptions = FinancialInvoice::where('fee_type', 'subscription_fee')->count();
        
        $activeSubscriptions = FinancialInvoice::where('fee_type', 'subscription_fee')
            ->where('status', 'paid')
            ->where(function($query) {
                $query->whereNull('valid_to')
                      ->orWhere('valid_to', '>=', now());
            })
            ->count();

        $expiredSubscriptions = FinancialInvoice::where('fee_type', 'subscription_fee')
            ->where('status', 'paid')
            ->where('valid_to', '<', now())
            ->whereNotNull('valid_to')
            ->count();

        $totalRevenue = FinancialInvoice::where('fee_type', 'subscription_fee')
            ->where('status', 'paid')
            ->sum('total_price');

        // Get paginated subscription transactions with search
        $query = FinancialInvoice::where('fee_type', 'subscription_fee')
            ->with([
                'member:id,full_name,membership_no',
                'subscriptionType:id,name',
                'subscriptionCategory:id,name,fee'
            ]);

        // Add search functionality
        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $query->whereHas('member', function($q) use ($searchTerm) {
                $q->where('full_name', 'like', "%{$searchTerm}%")
                  ->orWhere('membership_no', 'like', "%{$searchTerm}%");
            });
        }

        $subscriptions = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('App/Admin/Subscription/Management', [
            'statistics' => [
                'total_subscriptions' => $totalSubscriptions,
                'active_subscriptions' => $activeSubscriptions,
                'expired_subscriptions' => $expiredSubscriptions,
                'total_revenue' => $totalRevenue,
            ],
            'subscriptions' => $subscriptions,
            'filters' => $request->only(['search'])
        ]);
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
            'member_id' => $request->customer['id'],
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

    public function createAndPay(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|exists:users,id',
            'invoice_type' => 'required|in:membership,subscription',
            'subscription_type' => 'required|in:one_time,monthly,quarter,yearly',
            'amount' => 'required|numeric|min:0',
            'discount_type' => 'nullable|in:fixed,percentage',
            'discount_value' => 'nullable|numeric|min:0',
            'method' => 'required|string',
            'subscription_id' => 'nullable|exists:subscriptions,id',
            'receipt' => 'nullable|file',
            'prepay_quarters' => 'nullable|array',
        ]);

        DB::beginTransaction();

        try {
            $invoiceNo = $this->getInvoiceNo();
            $paidAmount = $request->amount;
            $discountDetails = null;
            $receiptPath = null;

            if ($request->discount_type && $request->discount_value) {
                if ($request->discount_type === 'fixed') {
                    $paidAmount -= $request->discount_value;
                } elseif ($request->discount_type === 'percentage') {
                    $paidAmount -= ($paidAmount * $request->discount_value / 100);
                }
                $discountDetails = json_encode([
                    'type' => $request->discount_type,
                    'value' => $request->discount_value,
                ]);
            }

            if ($request->hasFile('receipt')) {
                $receiptPath = FileHelper::saveImage($request->file('receipt'), 'reciepts');
            }

            $now = now();
            $paidForMonth = null;
            $paidForQuarter = null;

            if ($request->subscription_type === 'monthly') {
                $paidForMonth = $now->format('Y-m');
            }

            if ($request->subscription_type === 'quarter') {
                $paidForQuarter = $request->prepay_quarters ?? [];
            }

            // ✅ Check paused status for current period
            $member = Member::with('pausedHistories')->where('id', $request->customer_id)->first();
            $billingStart = $now->copy()->startOfMonth();
            $billingEnd = $now->copy()->endOfMonth();
            $wasPaused = false;

            foreach ($member->pausedHistories as $history) {
                $pausedFrom = \Carbon\Carbon::parse($history->start_date);
                $pausedTo = $history->end_date ? \Carbon\Carbon::parse($history->end_date) : now();

                if ($billingStart->lte($pausedTo) && $billingEnd->gte($pausedFrom)) {
                    $wasPaused = true;
                    $paidAmount *= 0.5;
                    break;
                }
            }

            $invoice = FinancialInvoice::create([
                'invoice_no' => $invoiceNo,
                'customer_id' => $request->customer_id,
                'invoice_type' => $request->invoice_type,
                'subscription_type' => $request->subscription_type,
                'discount_type' => $request->discount_type,
                'discount_value' => $request->discount_value,
                'discount_details' => $discountDetails,
                'amount' => $request->amount,
                'total_price' => $paidAmount,
                'paid_amount' => $paidAmount,
                'customer_charges' => 0,
                'issue_date' => $now,
                'due_date' => $now,
                'paid_for_month' => $paidForMonth,
                'paid_for_quarter' => $paidForQuarter ? json_encode($paidForQuarter) : null,
                'payment_method' => $request->method,
                'payment_date' => $now,
                'reciept' => $receiptPath,
                'status' => 'paid',
            ]);

            DB::commit();
            return response()->json(['message' => 'Invoice created and paid successfully.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Something went wrong.', 'details' => $e->getMessage()], 500);
        }
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