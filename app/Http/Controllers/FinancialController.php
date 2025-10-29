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
    public function __construct()
    {
        $this->middleware('permission:financial.dashboard.view')->only('index');
        $this->middleware('permission:financial.view')->only('getAllTransactions', 'fetchRevenue', 'getMemberInvoices');
        $this->middleware('permission:financial.create')->only('createAndPay');
    }

    public function index()
    {
        // Member Statistics
        $totalMembers = Member::whereNull('parent_id')->count();
        $activeMembers = Member::whereNull('parent_id')->where('status', 'active')->count();
        $expiredMembers = Member::whereNull('parent_id')->where('status', 'expired')->count();
        $canceledMembers = Member::whereNull('parent_id')->whereIn('status', ['cancelled', 'suspended', 'terminated'])->count();

        // Transaction Statistics (Membership Fees)
        $totalTransactions = FinancialInvoice::whereIn('fee_type', ['membership_fee', 'maintenance_fee', 'subscription_fee', 'reinstating_fee'])->count();
        
        // Membership Fee Revenue
        $membershipFeeRevenue = FinancialInvoice::where('fee_type', 'membership_fee')
            ->where('status', 'paid')
            ->sum('total_price');
        
        $maintenanceFeeRevenue = FinancialInvoice::where('fee_type', 'maintenance_fee')
            ->where('status', 'paid')
            ->sum('total_price');

        $subscriptionFeeRevenue = FinancialInvoice::where('fee_type', 'subscription_fee')
            ->where('status', 'paid')
            ->sum('total_price');

        $reinstatingFeeRevenue = FinancialInvoice::where('fee_type', 'reinstating_fee')
            ->where('status', 'paid')
            ->sum('total_price');

        // Total Membership Revenue (membership + maintenance + subscription + reinstating)
        $totalMembershipRevenue = $membershipFeeRevenue + $maintenanceFeeRevenue + $subscriptionFeeRevenue + $reinstatingFeeRevenue;

        // Booking Revenue
        $roomRevenue = FinancialInvoice::where('status', 'paid')
            ->where('invoice_type', 'room_booking')
            ->sum('total_price');

        $eventRevenue = FinancialInvoice::where('status', 'paid')
            ->where('invoice_type', 'event_booking')
            ->sum('total_price');

        $totalBookingRevenue = $roomRevenue + $eventRevenue;

        // Food Revenue
        $foodRevenue = FinancialInvoice::where('status', 'paid')
            ->where('invoice_type', 'food')
            ->sum('total_price');

        // Total Revenue (All Sources)
        $totalRevenue = FinancialInvoice::where('status', 'paid')->sum('total_price');

        // Total Expenses (placeholder - you can implement expense tracking later)
        $totalExpenses = 0; // TODO: Implement expense tracking

        // Recent transactions (all types)
        $recentTransactions = FinancialInvoice::with([
                'member:id,full_name,membership_no,mobile_number_a',
                'customer:id,name,email',
                'createdBy:id,name'
            ])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($invoice) {
                // Add formatted fee type for frontend
                $invoice->fee_type_formatted = $invoice->fee_type 
                    ? ucwords(str_replace('_', ' ', $invoice->fee_type))
                    : null;
                return $invoice;
            });

        return Inertia::render('App/Admin/Finance/Dashboard', [
            'statistics' => [
                // Member Statistics
                'total_members' => $totalMembers,
                'active_members' => $activeMembers,
                'expired_members' => $expiredMembers,
                'canceled_members' => $canceledMembers,
                
                // Revenue Statistics
                'total_revenue' => $totalRevenue,
                'total_expenses' => $totalExpenses,
                'total_transactions' => $totalTransactions,
                
                // Membership Revenue Breakdown
                'membership_fee_revenue' => $membershipFeeRevenue,
                'maintenance_fee_revenue' => $maintenanceFeeRevenue,
                'subscription_fee_revenue' => $subscriptionFeeRevenue,
                'reinstating_fee_revenue' => $reinstatingFeeRevenue,
                'total_membership_revenue' => $totalMembershipRevenue,
                
                // Booking Revenue Breakdown
                'room_revenue' => $roomRevenue,
                'event_revenue' => $eventRevenue,
                'total_booking_revenue' => $totalBookingRevenue,
                
                // Other Revenue
                'food_revenue' => $foodRevenue,
            ],
            'recent_transactions' => $recentTransactions
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

    public function getAllTransactions(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search', '');

        $query = FinancialInvoice::with([
            'member:id,full_name,membership_no,mobile_number_a',
            'customer:id,name,email',
            'createdBy:id,name'
        ]);

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('invoice_no', 'like', "%{$search}%")
                  ->orWhere('fee_type', 'like', "%{$search}%")
                  ->orWhere('invoice_type', 'like', "%{$search}%")
                  ->orWhere('payment_method', 'like', "%{$search}%")
                  ->orWhereHas('member', function ($q) use ($search) {
                      $q->where('full_name', 'like', "%{$search}%")
                        ->orWhere('membership_no', 'like', "%{$search}%");
                  })
                  ->orWhereHas('customer', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $transactions = $query->latest()->paginate($perPage)->withQueryString();

        return Inertia::render('App/Admin/Finance/Transaction', [
            'transactions' => $transactions,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    // Get Member Invoices
    public function getFinancialInvoices($id)
    {
        $invoice = FinancialInvoice::where('member_id', $id)->where('invoice_type', 'membership')->with('member', 'member.memberType')->latest()->first();

        if (!$invoice) {
            return response()->json(['message' => 'Invoice not found'], 404);
        }

        $invoice->member->loadCount('familyMembers');

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

        $member = Member::where('id', $userId)->first();
        $memberPrice = null;
        if ($member && $member->member_category_id) {
            $category = MemberCategory::find($member->member_category_id);
            $memberPrice = $category?->subscription_fee;
        }
        $invoices = FinancialInvoice::where('member_id', $userId)
            ->whereIn('invoice_type', ['membership'])
            ->orderBy('issue_date', 'desc')
            ->get();

        $existing = $invoices->filter(function ($invoice) use ($currentYear) {
            $invoiceYear = Carbon::parse($invoice->issue_date)->year;
            return $invoiceYear === $currentYear || ($invoiceYear < $currentYear && $invoice->status !== 'paid');
        })->values();

        $due = [];
        $future = [];

        $latestInvoices = $invoices->groupBy('subscription_type')->map(function ($group) {
            return $group->first();
        });

        foreach ($latestInvoices as $invoice) {
            $subscriptionType = $invoice->subscription_type;
            $invoiceAmount = ($invoice->invoice_type === 'membership' && $memberPrice !== null)
                ? $memberPrice
                : $invoice->amount;

            switch ($subscriptionType) {
                case 'one_time':
                    if ($invoice->status !== 'paid') {
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
                case 'yearly':
                    $paidQuarters = collect((array) json_decode($invoice->paid_for_quarter))->filter(function ($q) {
                        return preg_match('/^\d{4}-Q[1-4]$/', $q);
                    });

                    $startYear = $member ? Carbon::parse($member->membership_date)->year : $currentYear;

                    // Only include next year if current month is October, November, or December
                    $includeNextYear = $now->month >= 10;
                    $endYear = $includeNextYear ? $currentYear + 1 : $currentYear;

                    $membershipDate = $member ? Carbon::parse($member->membership_date) : $now;

                    for ($year = $startYear; $year <= $endYear; $year++) {
                        for ($q = 1; $q <= 4; $q++) {
                            $quarterStart = Carbon::create($year, ($q - 1) * 3 + 1, 1);
                            $quarterEnd = $quarterStart->copy()->addMonths(3)->subDay();

                            // Skip if quarter ends before membership starts
                            if ($quarterEnd->lt($membershipDate)) {
                                continue;
                            }

                            $quarterLabel = "{$year}-Q{$q}";
                            $isFuture = $quarterStart->gt($now);

                            if (!$paidQuarters->contains($quarterLabel)) {
                                $entry = [
                                    'id' => 'new',
                                    'invoice_type' => $invoice->invoice_type,
                                    'subscription_type' => 'quarter',
                                    'paid_for_quarter' => $quarterLabel,
                                    'amount' => $subscriptionType === 'yearly' ? $invoiceAmount * 3 : $invoiceAmount,
                                    'status' => $isFuture ? 'upcoming' : 'overdue',
                                ];

                                if ($isFuture) {
                                    $future[] = $entry;
                                } else {
                                    $due[] = $entry;
                                }
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
                    $paidQuarters = is_array($invoice['paid_for_quarter'])
                        ? $invoice['paid_for_quarter']
                        : (is_string($invoice['paid_for_quarter']) ? [$invoice['paid_for_quarter']] : []);

                    // Pick the earliest quarter in the array
                    $firstQuarter = $paidQuarters[0] ?? null;

                    if ($firstQuarter && preg_match('/^(\d{4})-Q([1-4])$/', $firstQuarter, $matches)) {
                        $year = (int) $matches[1];
                        $q = (int) $matches[2];
                        return Carbon::create($year, ($q - 1) * 3 + 1, 1);
                    }
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