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
            ->where('invoice_type', 'food_order')
            ->sum('total_price');

        // Total Revenue (All Sources)
        $totalRevenue = FinancialInvoice::where('status', 'paid')->sum('total_price');

        // Total Expenses (placeholder - you can implement expense tracking later)
        $totalExpenses = 0;  // TODO: Implement expense tracking

        // Recent transactions (all types) with polymorphic booking data
        $recentTransactions = FinancialInvoice::with([
            'member:id,full_name,membership_no,mobile_number_a',
            'customer:id,name,email',
            'createdBy:id,name'
        ])
            ->select('id', 'invoice_no', 'invoice_type', 'invoiceable_id', 'invoiceable_type',
                'member_id', 'customer_id', 'fee_type', 'amount', 'total_price',
                'paid_amount', 'status', 'payment_method', 'payment_date',
                'valid_to', 'created_at', 'created_by',
                'valid_from', 'tax_amount', 'tax_percentage', 'overdue_amount', 'overdue_percentage', 'remarks')
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
        ])
            ->select('id', 'invoice_no', 'invoice_type', 'invoiceable_id', 'invoiceable_type',
                'member_id', 'customer_id', 'fee_type', 'amount', 'total_price',
                'paid_amount', 'status', 'payment_method', 'payment_date',
                'valid_to', 'valid_from', 'created_at', 'created_by',
                'tax_amount', 'tax_percentage', 'overdue_amount', 'overdue_percentage', 'remarks');

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q
                    ->where('invoice_no', 'like', "%{$search}%")
                    ->orWhere('fee_type', 'like', "%{$search}%")
                    ->orWhere('invoice_type', 'like', "%{$search}%")
                    ->orWhere('payment_method', 'like', "%{$search}%")
                    ->orWhereHas('member', function ($q) use ($search) {
                        $q
                            ->where('full_name', 'like', "%{$search}%")
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

    // Get Member Invoices - Accepts either member_id or invoice_id
    public function getFinancialInvoices($id)
    {
        // Common relations to load
        $relations = [
            'member',
            'member.memberType',
            'subscriptionType',
            'subscriptionCategory'
        ];

        // 1. Try to find by invoice ID directly
        $invoice = FinancialInvoice::with($relations)->find($id);

        // 2. If not found by invoice ID, try to find by member ID (latest membership invoice)
        if (!$invoice) {
            $invoice = FinancialInvoice::where('member_id', $id)
                ->where('invoice_type', 'membership')
                ->with($relations)
                ->latest()
                ->first();
        }

        if (!$invoice) {
            return response()->json(['message' => 'Invoice not found'], 404);
        }

        // Load family members count if member exists
        if ($invoice->member) {
            $invoice->member->loadCount('familyMembers');
        }

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

    private function getInvoiceNo()
    {
        $invoiceNo = FinancialInvoice::max('invoice_no');
        $invoiceNo = $invoiceNo + 1;
        return $invoiceNo;
    }
}
