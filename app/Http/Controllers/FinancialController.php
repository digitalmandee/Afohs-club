<?php

namespace App\Http\Controllers;

use App\Models\FinancialInvoice;
use App\Models\Member;
use App\Models\MemberCategory;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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

    public function status($memberId)
    {
        $year = now()->year;

        // Fetch invoices for this member & membership type
        $invoices = FinancialInvoice::where('member_id', $memberId)
            ->where('invoice_type', 'membership')
            ->whereYear('issue_date', $year)
            ->get();

        // quarter paid
        $paid_quarters = $invoices
            ->where('subscription_type', 'quarter')
            ->pluck('paid_for_quarter')
            ->unique()
            ->sort()
            ->values()
            ->all();

        // Monthly paid: group by quarter
        $paid_months = $invoices
            ->where('subscription_type', 'monthly')
            ->pluck('paid_for_month')
            ->unique()
            ->values()
            ->all();
        $paid_months = array_map(fn($m) => (int) $m, $paid_months);
        $paid_quarters_from_m = collect($paid_months)
            ->map(fn($m) => ceil($m / 3))
            ->unique()
            ->values()
            ->all();

        // Combine quarter paid from both
        $paid_quarters = array_unique(array_merge($paid_quarters, $paid_quarters_from_m));
        sort($paid_quarters);

        // All quarters 1-4
        $all = [1, 2, 3, 4];
        $remaining = array_values(array_diff($all, $paid_quarters));

        $currentQuarter = ceil(now()->month / 3);

        // Mark statuses
        $statuses = array_map(fn($q) => [
            'quarter' => $q,
            'paid' => in_array($q, $paid_quarters),
            'overdue' => !$thisYear = false,
            'from_monthly_missing' => $this->checkMonthlyMissing($q, $paid_months),
        ], $all);

        foreach ($statuses as &$st) {
            $st['overdue'] = (!$st['paid']) && $st['quarter'] < $currentQuarter;
        }

        return response()->json([
            'statuses' => $statuses,
            'remaining' => $remaining,
            'current_quarter' => $currentQuarter,
        ]);
    }

    private function checkMonthlyMissing($quart, $paid_months)
    {
        // For a quarter block, check months are all paid
        $start = ($quart - 1) * 3 + 1;
        $block = range($start, 3 * $quart);
        return !empty(array_diff($block, $paid_months));
    }

    public function createInvoices(Request $req, $memberId)
    {
        $quarters = $req->quarters;  // e.g. [2,3]
        $month = now()->month;
        $year = now()->year;
        $user = User::findOrFail($memberId);
        $fee = $user->member->memberCategory->subscription_fee;

        foreach ($quarters as $q) {
            // Create one invoice per quarter
            $invoice = FinancialInvoice::create([
                'member_id' => $memberId,
                'invoice_type' => 'membership',
                'subscription_type' => 'quarter',
                'amount' => 3 * $fee,
                'issue_date' => now(),
                'due_date' => now()->endOfQuarter(),
                'paid_for_quarter' => $q,
                'status' => 'unpaid',
            ]);
        }

        return response()->json(['success' => true]);
    }

    public function getMemberInvoices(Request $request)
    {
        $userId = $request->input('user_id');

        if (!$userId) {
            return response()->json(['error' => 'User ID is required'], 400);
        }

        $now = Carbon::now();
        $currentYear = $now->year;

        // Fetch member category price
        $member = Member::where('user_id', $userId)->first();
        $memberPrice = null;
        if ($member && $member->member_category_id) {
            $category = MemberCategory::find($member->member_category_id);
            $memberPrice = $category?->subscription_fee;
        }

        $invoices = FinancialInvoice::where('customer_id', $userId)
            ->whereIn('invoice_type', ['membership', 'subscription'])
            ->orderBy('issue_date', 'desc')
            ->get();

        // Filter existing invoices: only current year OR unpaid from past years
        $existing = $invoices->filter(function ($invoice) use ($currentYear) {
            $invoiceYear = Carbon::parse($invoice->issue_date)->year;

            return $invoiceYear === $currentYear || ($invoiceYear < $currentYear && $invoice->status !== 'paid');
        })->values();

        $due = [];
        $future = [];

        // Only use latest invoice per subscription_type
        $latestInvoices = $invoices->groupBy('subscription_type')->map(function ($group) {
            return $group->first();
        });

        foreach ($latestInvoices as $invoice) {
            $subscriptionType = $invoice->subscription_type;
            $invoiceStatus = $invoice->status;

            $invoiceAmount = ($invoice->invoice_type === 'membership' && $memberPrice !== null)
                ? $memberPrice
                : $invoice->amount;

            switch ($subscriptionType) {
                case 'one_time':
                    if ($invoiceStatus !== 'paid') {
                        $due[] = $invoice;
                    }
                    break;

                case 'monthly':
                    if ($invoice->paid_for_month) {
                        $paidMonth = Carbon::parse($invoice->paid_for_month)->startOfMonth()->addMonth();
                        $currentMonth = $now->copy()->startOfMonth();

                        while ($paidMonth->lte($currentMonth)) {
                            $quarterStartMonth = (int) (floor(($paidMonth->month - 1) / 3) * 3 + 1);
                            $quarterStart = Carbon::create($paidMonth->year, $quarterStartMonth, 1);
                            $quarterEnd = $quarterStart->copy()->addMonths(3)->subDay();

                            $unpaidMonths = [];
                            $tempMonth = $paidMonth->copy();

                            while ($tempMonth->lte($quarterEnd) && $tempMonth->lte($currentMonth)) {
                                $unpaidMonths[] = $tempMonth->copy();
                                $tempMonth->addMonth();
                            }

                            $quarterLabel = $quarterStart->format('Y') . '-Q' . ceil($quarterStart->month / 3);

                            if ($quarterEnd->gte($now)) {
                                $due[] = [
                                    'id' => 'new',
                                    'invoice_type' => $invoice->invoice_type,
                                    'subscription_type' => 'quarter',
                                    'paid_for_quarter' => $quarterLabel,
                                    'amount' => $invoiceAmount * 3,
                                    'status' => 'overdue'
                                ];
                                break;
                            } else {
                                if (count($unpaidMonths) < 3) {
                                    foreach ($unpaidMonths as $m) {
                                        $due[] = [
                                            'id' => 'new',
                                            'invoice_type' => $invoice->invoice_type,
                                            'subscription_type' => 'monthly',
                                            'paid_for_month' => $m->format('Y-m-d'),
                                            'amount' => $invoiceAmount,
                                            'status' => 'overdue'
                                        ];
                                    }
                                } else {
                                    $due[] = [
                                        'id' => 'new',
                                        'invoice_type' => $invoice->invoice_type,
                                        'subscription_type' => 'quarter',
                                        'paid_for_quarter' => $quarterLabel,
                                        'amount' => $invoiceAmount * 3,
                                        'status' => 'overdue'
                                    ];
                                }

                                $paidMonth = $tempMonth->copy();
                            }
                        }

                        $nextQuarterStart = $currentMonth->copy()->firstOfQuarter()->addQuarter();
                        $future[] = [
                            'id' => 'new',
                            'invoice_type' => $invoice->invoice_type,
                            'subscription_type' => 'quarter',
                            'paid_for_quarter' => $nextQuarterStart->format('Y') . '-Q' . ceil($nextQuarterStart->month / 3),
                            'amount' => $invoiceAmount * 3,
                            'status' => 'upcoming'
                        ];
                    }
                    break;

                case 'quarter':
                    if ($invoice->paid_for_quarter &&
                            preg_match('/^(\d{4})-Q(\d)$/', $invoice->paid_for_quarter, $matches)) {
                        $year = (int) $matches[1];
                        $quarter = (int) $matches[2];

                        $month = ($quarter - 1) * 3 + 1;
                        $lastPaid = Carbon::createFromDate($year, $month, 1);
                        $nowQuarter = ceil($now->month / 3);
                        $paidQuarter = ceil($lastPaid->month / 3);

                        $lastPaidDate = Carbon::createFromDate($year, $month, 1)->startOfQuarter()->addQuarter();
                        $currentQuarterStart = $now->copy()->startOfQuarter();

                        while ($lastPaidDate->lte($currentQuarterStart)) {
                            $quarterLabel = $lastPaidDate->format('Y') . '-Q' . ceil($lastPaidDate->month / 3);

                            $due[] = [
                                'id' => 'new',
                                'invoice_type' => $invoice->invoice_type,
                                'subscription_type' => 'quarter',
                                'paid_for_quarter' => $quarterLabel,
                                'amount' => $invoiceAmount,
                                'status' => 'overdue'
                            ];

                            $lastPaidDate->addQuarter();
                        }

                        $nextQuarterDate = $now->copy()->addQuarter();
                        $future[] = [
                            'id' => 'new',
                            'invoice_type' => $invoice->invoice_type,
                            'subscription_type' => 'quarter',
                            'paid_for_quarter' => $nextQuarterDate->year . '-Q' . ceil($nextQuarterDate->month / 3),
                            'amount' => $invoiceAmount,
                            'status' => 'upcoming'
                        ];
                    }
                    break;

                case 'yearly':
                    if ($invoice->paid_for_yearly) {
                        $paidYear = (int) $invoice->paid_for_yearly;

                        if ($paidYear < $currentYear) {
                            for ($q = 1; $q <= 4; $q++) {
                                $quarterStartMonth = ($q - 1) * 3 + 1;
                                $quarterStart = Carbon::create($currentYear, $quarterStartMonth, 1);
                                $quarterLabel = $currentYear . '-Q' . $q;

                                $invoiceData = [
                                    'id' => 'new',
                                    'invoice_type' => $invoice->invoice_type,
                                    'subscription_type' => 'quarter',
                                    'paid_for_quarter' => $quarterLabel,
                                    'amount' => $invoiceAmount * 3,
                                    'status' => $quarterStart->lte($now) ? 'due' : 'upcoming'
                                ];

                                if ($quarterStart->lte($now)) {
                                    $due[] = $invoiceData;
                                } else {
                                    $future[] = $invoiceData;
                                }
                            }
                        }

                        if ($now->month >= 10) {
                            $nextYear = $currentYear + 1;
                            for ($q = 1; $q <= 4; $q++) {
                                $future[] = [
                                    'id' => 'new',
                                    'invoice_type' => $invoice->invoice_type,
                                    'subscription_type' => 'quarter',
                                    'paid_for_quarter' => $nextYear . '-Q' . $q,
                                    'amount' => $invoiceAmount * 3,
                                    'status' => 'upcoming'
                                ];
                            }
                        }
                    }
                    break;
            }
        }

        $allInvoices = collect()
            ->merge($existing)
            ->merge($due)
            ->merge($future)
            ->sortBy(function ($invoice) {
                if (isset($invoice['paid_for_quarter'])) {
                    [$year, $q] = explode('-Q', $invoice['paid_for_quarter']);
                    return Carbon::create($year, ($q - 1) * 3 + 1, 1);
                }
                if (isset($invoice['paid_for_month'])) {
                    return Carbon::parse($invoice['paid_for_month']);
                }
                return Carbon::parse($invoice['issue_date'] ?? now());
            })
            ->values();

        return response()->json([
            'success' => true,
            'invoices' => $allInvoices
        ]);
    }

    public function payInvoices(Request $request)
    {
        $validated = Validator::make($request->all(), [
            'customer_id' => 'required|exists:users,id',
            'payment_method' => 'required|in:cash,credit_card',
            'amount_paid' => 'required|numeric|min:0',
            'invoices' => 'required|json',
            'receipt' => 'nullable|file|mimes:jpg,jpeg,png,pdf',
        ])->validate();

        $customerId = $request->customer_id;
        $paymentMethod = $request->payment_method;
        $amountPaid = $request->amount_paid;
        $invoices = json_decode($request->invoices, true);
        $receiptPath = null;

        if ($paymentMethod === 'credit_card' && $request->hasFile('receipt')) {
            $receiptPath = $request->file('receipt')->store('receipts');
        }

        foreach ($invoices as $invoiceData) {
            // If invoice exists, update it
            if ($invoiceData['id'] !== 'new') {
                $invoice = FinancialInvoice::find($invoiceData['id']);
                if ($invoice && $invoice->status !== 'paid') {
                    $invoice->status = 'paid';
                    $invoice->payment_method = $paymentMethod;
                    $invoice->paid_amount = $amountPaid;
                    $invoice->reciept = $receiptPath;
                    $invoice->payment_date = now();
                    $invoice->save();
                }
                continue;
            }
            $invoiceNo = $this->getInvoiceNo();  // 👈 use your method here

            // Otherwise create new invoice
            $new = new FinancialInvoice();
            $new->customer_id = $customerId;
            $new->invoice_no = $invoiceNo;
            $new->invoice_type = $invoiceData['invoice_type'];
            $new->subscription_type = $invoiceData['subscription_type'];
            $new->status = 'paid';
            $new->amount = $invoiceData['amount'];
            $new->paid_amount = $amountPaid;
            $new->payment_method = $paymentMethod;
            $new->reciept = $receiptPath;
            $new->payment_date = now();
            $new->issue_date = now();

            if (isset($invoiceData['paid_for_month'])) {
                $new->paid_for_month = $invoiceData['paid_for_month'];
            }
            if (isset($invoiceData['paid_for_quarter'])) {
                $new->paid_for_quarter = $invoiceData['paid_for_quarter'];
            }
            if (isset($invoiceData['paid_for_yearly'])) {
                $new->paid_for_yearly = $invoiceData['paid_for_yearly'];
            }

            $new->save();
        }

        return response()->json(['message' => 'Invoices paid successfully']);
    }

    private function getInvoiceNo()
    {
        $invoiceNo = FinancialInvoice::max('invoice_no');
        $invoiceNo = $invoiceNo + 1;
        return $invoiceNo;
    }
}
