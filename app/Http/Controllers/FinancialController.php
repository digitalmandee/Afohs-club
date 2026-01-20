<?php

namespace App\Http\Controllers;

use App\Constants\AppConstants;
use App\Models\FinancialInvoice;
use App\Models\FinancialInvoiceItem;
use App\Models\FinancialReceipt;
use App\Models\Member;
use App\Models\MemberCategory;
use App\Models\Transaction;
use App\Models\TransactionRelation;
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

        // Transaction Statistics
        $totalTransactions = FinancialInvoice::count();

        // Revenue Breakdown using Item-Level Transactions (Credits)
        // Group by TransactionType->type field matching AppConstants
        $revenueByType = DB::table('transactions')
            ->join('financial_invoice_items', 'transactions.reference_id', '=', 'financial_invoice_items.id')
            ->join('transaction_types', 'financial_invoice_items.fee_type', '=', 'transaction_types.id')
            ->where('transactions.reference_type', 'App\Models\FinancialInvoiceItem')
            ->where('transactions.type', 'credit')
            ->select('transaction_types.type', DB::raw('sum(transactions.amount) as total'))
            ->groupBy('transaction_types.type')
            ->pluck('total', 'type');

        $membershipFeeRevenue = $revenueByType[AppConstants::TRANSACTION_TYPE_ID_MEMBERSHIP] ?? 0;
        $maintenanceFeeRevenue = $revenueByType[AppConstants::TRANSACTION_TYPE_ID_MAINTENANCE] ?? 0;
        $subscriptionFeeRevenue = $revenueByType[AppConstants::TRANSACTION_TYPE_ID_SUBSCRIPTION] ?? 0;

        // Reinstating Fee - specific lookup by name if needed, assuming it falls under Type 6 (Financial Charge) or similar
        // For now, we will try to find it by name for legacy support compatibility
        $reinstatingTypeId = \App\Models\TransactionType::where('name', 'Reinstating Fee')->value('id');
        $reinstatingFeeRevenue = 0;
        if ($reinstatingTypeId) {
            $reinstatingFeeRevenue = DB::table('transactions')
                ->join('financial_invoice_items', 'transactions.reference_id', '=', 'financial_invoice_items.id')
                ->where('transactions.reference_type', 'App\Models\FinancialInvoiceItem')
                ->where('transactions.type', 'credit')
                ->where('financial_invoice_items.fee_type', $reinstatingTypeId)
                ->sum('transactions.amount');
        }

        $totalMembershipRevenue = $membershipFeeRevenue + $maintenanceFeeRevenue + $subscriptionFeeRevenue + $reinstatingFeeRevenue;

        // Booking Revenue - Still relying on Invoice Type for now as migration continues
        $roomRevenue = FinancialInvoice::where('status', 'paid')  // approximate
            ->where('invoice_type', 'room_booking')
            ->sum('total_price');

        $eventRevenue = FinancialInvoice::where('status', 'paid')  // approximate
            ->where('invoice_type', 'event_booking')
            ->sum('total_price');

        $totalBookingRevenue = $roomRevenue + $eventRevenue;

        // Food Revenue
        $foodRevenue = FinancialInvoice::where('status', 'paid')
            ->where('invoice_type', 'food_order')
            ->sum('total_price');

        // Total Collected Revenue
        $totalRevenue = DB::table('transactions')
            ->where('type', 'credit')
            ->sum('amount');

        // Recent transactions
        $recentTransactions = FinancialInvoice::with([
            'member:id,full_name,membership_no,mobile_number_a',
            'customer:id,name,email',
            'createdBy:id,name',
            'items.transactions'  // Load item transactions
        ])
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($invoice) {
                // Determine display type
                if ($invoice->items && $invoice->items->count() > 0) {
                    $types = $invoice->items->pluck('fee_type')->unique();
                    if ($types->count() === 1) {
                        // Resolve type name if possible, or just use ID (which won't look good unless mapped)
                        // Ideally we map ID to name here, but for dashboard simplicity we might need a quick helper or leave it.
                        // Let's assume frontend maps it or we provide formatting.
                        $invoice->fee_type_formatted = 'Single Type';  // Placeholder, improved below
                    } else {
                        $invoice->fee_type_formatted = 'Multiple Items';
                    }
                } else {
                    $invoice->fee_type_formatted = $invoice->fee_type
                        ? ucwords(str_replace('_', ' ', $invoice->fee_type))
                        : ucwords(str_replace('_', ' ', $invoice->invoice_type));
                }

                // Calculate Paid Amount from items
                $invoice->paid_amount = $invoice->items->sum(function ($item) {
                    return $item->transactions->where('type', 'credit')->sum('amount');
                });
                $invoice->balance = $invoice->total_price - $invoice->paid_amount;

                return $invoice;
            });

        return Inertia::render('App/Admin/Finance/Dashboard', [
            'statistics' => [
                'total_members' => $totalMembers,
                'active_members' => $activeMembers,
                'expired_members' => $expiredMembers,
                'canceled_members' => $canceledMembers,
                'total_revenue' => $totalRevenue,
                'total_transactions' => $totalTransactions,
                'membership_fee_revenue' => $membershipFeeRevenue,
                'maintenance_fee_revenue' => $maintenanceFeeRevenue,
                'subscription_fee_revenue' => $subscriptionFeeRevenue,
                'reinstating_fee_revenue' => $reinstatingFeeRevenue,
                'total_membership_revenue' => $totalMembershipRevenue,
                'room_revenue' => $roomRevenue,
                'event_revenue' => $eventRevenue,
                'total_booking_revenue' => $totalBookingRevenue,
                'food_revenue' => $foodRevenue,
            ],
            'recent_transactions' => $recentTransactions
        ]);
    }

    public function fetchRevenue()
    {
        // Similar update for fetchRevenue endpoint if used by charts
        $totalRevenue = DB::table('transactions')->where('type', 'credit')->sum('amount');

        return response()->json([
            'totalRevenue' => $totalRevenue,
        ]);
    }

    public function getAllTransactions(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search', '');

        $query = FinancialInvoice::with([
            'member:id,full_name,membership_no,mobile_number_a',
            'corporateMember:id,full_name,membership_no',
            'customer:id,name,email',
            'createdBy:id,name',
            'invoiceable',
            'items.transactions'  // Eager load items and their transactions
        ]);

        // Apply status filter
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Apply type filter
        if ($request->filled('type') && $request->type !== 'all') {
            $type = $request->type;
            // Note: 'fee_type' is now an integer ID. Filtering by string will fail if not handled.
            // Ideally we should filter by TransactionType ID.
            // If $request->type is a string/slug, translate it.
            // Assuming frontend sends ID or we need to handle legacy strings?
            // For now, keep as is assuming user filters by ID or simple fields.
            $query->where(function ($q) use ($type) {
                $q
                    ->where('fee_type', $type)
                    ->orWhere('invoice_type', $type);
            });
        }

        // Apply date range filter
        if ($request->filled('start_date')) {
            $query->whereDate('issue_date', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('issue_date', '<=', $request->end_date);
        }

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q
                    ->where('invoice_no', 'like', "%{$search}%")
                    ->orWhere('payment_method', 'like', "%{$search}%")  // Fee type is ID, searching 'like' string won't work well
                    ->orWhere('invoice_type', 'like', "%{$search}%")
                    ->orWhereHas('member', function ($q) use ($search) {
                        $q
                            ->where('full_name', 'like', "%{$search}%")
                            ->orWhere('membership_no', 'like', "%{$search}%");
                    })
                    ->orWhereHas('customer', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    })
                    // Search in items (description)
                    ->orWhereHas('items', function ($q) use ($search) {
                        $q->where('description', 'like', "%{$search}%");
                    });
            });
        }

        $transactions = $query->latest()->paginate($perPage)->withQueryString();

        // Get all transaction types for lookup
        $transactionTypes = \App\Models\TransactionType::pluck('name', 'id')->toArray();

        // Transform transactions
        $transactions->getCollection()->transform(function ($invoice) use ($transactionTypes) {
            $resolveType = function ($type) use ($transactionTypes) {
                if (isset($transactionTypes[$type])) {
                    return $transactionTypes[$type];
                }
                return ucwords(str_replace('_', ' ', $type));
            };

            if ($invoice->items && $invoice->items->count() > 0) {
                $types = $invoice->items->pluck('fee_type')->unique();
                if ($types->count() === 1) {
                    $invoice->fee_type_formatted = $resolveType($types->first());
                } else {
                    $invoice->fee_type_formatted = 'Multiple Items';
                    $invoice->items->transform(function ($item) use ($resolveType) {
                        $item->fee_type_formatted = $resolveType($item->fee_type);
                        return $item;
                    });
                }
            } else {
                $type = $invoice->fee_type ?? $invoice->invoice_type;
                $invoice->fee_type_formatted = $resolveType($type);
            }

            // Calculate Paid & Balance
            $paid = $invoice->items->sum(function ($item) {
                return $item->transactions->where('type', 'credit')->sum('amount');
            });
            $invoice->paid_amount = $paid;
            $invoice->balance = $invoice->total_price - $paid;

            return $invoice;
        });

        return Inertia::render('App/Admin/Finance/Transaction', [
            'transactions' => $transactions,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
                'status' => $request->input('status', 'all'),
                'type' => $request->input('type', 'all'),
                'start_date' => $request->input('start_date'),
                'end_date' => $request->input('end_date'),
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
            'corporateMember',
            'customer',
            'subscriptionType',
            'subscriptionCategory',
            'invoiceable',
            'items',
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
        } elseif ($invoice->corporateMember) {
            $invoice->corporateMember->loadCount('familyMembers');
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
            'payment_date' => now(),
            'status' => 'paid',
        ]);

        // ✅ Create Invoice Item
        FinancialInvoiceItem::create([
            'invoice_id' => $invoice->id,
            'fee_type' => 'manual_invoice',
            'description' => 'Manual Invoice Charges',
            'qty' => 1,
            'amount' => $amount,
            'sub_total' => $amount,
            'total' => $amount,
        ]);

        // ✅ Ledger Logic for Manual Invoice Creation & Payment
        $payerType = \App\Models\Customer::class;
        $payerId = $data['customer_id'];

        // Note: User requested to treat customer_id as Customer module always for guest/default.
        // Removing User lookup to avoid confusion.

        // 1. Debit Transaction (Invoice)
        Transaction::create([
            'type' => 'debit',
            'amount' => $amount,
            'date' => now(),
            'description' => 'Manual Invoice #' . $invoice->invoice_no,
            'payable_type' => $payerType,
            'payable_id' => $payerId,
            'reference_type' => FinancialInvoice::class,
            'reference_id' => $invoice->id,
            'created_by' => Auth::id(),
        ]);

        // 2. Receipt
        $receipt = FinancialReceipt::create([
            'receipt_no' => time(),
            'payer_type' => $payerType,
            'payer_id' => $payerId,
            'amount' => $amount,
            'payment_method' => $data['method'],
            'receipt_date' => now(),
            'status' => 'active',
            'remarks' => 'Payment for Manual Invoice #' . $invoice->invoice_no,
            'created_by' => Auth::id(),
        ]);

        // 3. Credit Transaction (Payment)
        Transaction::create([
            'type' => 'credit',
            'amount' => $amount,
            'date' => now(),
            'description' => 'Payment Received (Rec #' . $receipt->receipt_no . ')',
            'payable_type' => $payerType,
            'payable_id' => $payerId,
            'reference_type' => FinancialReceipt::class,
            'reference_id' => $receipt->id,
            'created_by' => Auth::id(),
        ]);

        // 4. Link
        TransactionRelation::create([
            'invoice_id' => $invoice->id,
            'receipt_id' => $receipt->id,
            'amount' => $amount,
        ]);

        // ✅ Ledger Logic for Manual Invoice Creation & Payment
        $user = User::find($data['customer_id']);
        $payerType = \App\Models\Customer::class;
        $payerId = $data['customer_id'];
        if ($user && $user->member) {
            $payerType = \App\Models\Member::class;
            $payerId = $user->member->id;
            // Update invoice to use member_id correctly?
            // The create method above uses 'customer_id' column, likely as user_id.
            // We can optionally update it:
            $invoice->update(['member_id' => $payerId]);
        }

        // 1. Debit Transaction (Invoice)
        Transaction::create([
            'type' => 'debit',
            'amount' => $amount,  // The create method uses $amount for 'amount' and 'total_price', assuming fully paid
            'date' => now(),
            'description' => 'Manual Invoice #' . $invoice->invoice_no,
            'payable_type' => $payerType,
            'payable_id' => $payerId,
            'reference_type' => FinancialInvoice::class,
            'reference_id' => $invoice->id,
            'created_by' => Auth::id(),
        ]);

        // 2. Receipt
        $receipt = FinancialReceipt::create([
            'receipt_no' => time(),
            'payer_type' => $payerType,
            'payer_id' => $payerId,
            'amount' => $amount,
            'payment_method' => $data['method'],
            'receipt_date' => now(),
            'status' => 'active',
            'remarks' => 'Payment for Manual Invoice #' . $invoice->invoice_no,
            'created_by' => Auth::id(),
        ]);

        // 3. Credit Transaction (Payment)
        Transaction::create([
            'type' => 'credit',
            'amount' => $amount,
            'date' => now(),
            'description' => 'Payment Received (Rec #' . $receipt->receipt_no . ')',
            'payable_type' => $payerType,
            'payable_id' => $payerId,
            'reference_type' => FinancialReceipt::class,
            'reference_id' => $receipt->id,
            'created_by' => Auth::id(),
        ]);

        // 4. Link
        TransactionRelation::create([
            'invoice_id' => $invoice->id,
            'receipt_id' => $receipt->id,
            'amount' => $amount,
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

            // ✅ Create Invoice Item
            FinancialInvoiceItem::create([
                'invoice_id' => $invoice->id,
                'fee_type' => 'membership_quarterly_fee',
                'description' => 'Quarterly Membership Fee (Q' . $q . ')',
                'qty' => 1,
                'amount' => 3 * $fee,
                'sub_total' => 3 * $fee,
                'total' => 3 * $fee,
            ]);

            // ✅ Ledger Logic (Debit Transaction) per Quarter Invoice
            Transaction::create([
                'type' => 'debit',
                'amount' => 3 * $fee,
                'date' => now(),
                'description' => 'Quarterly Membership Invoice #' . $invoice->invoice_no,
                'payable_type' => \App\Models\Member::class,
                'payable_id' => $memberId,
                'reference_type' => FinancialInvoice::class,
                'reference_id' => $invoice->id,
                'created_by' => Auth::id(),
            ]);

            // ✅ Ledger Logic (Debit Transaction) per Quarter Invoice
            Transaction::create([
                'type' => 'debit',
                'amount' => 3 * $fee,
                'date' => now(),
                'description' => 'Quarterly Membership Invoice #' . $invoice->invoice_no,
                'payable_type' => \App\Models\Member::class,
                'payable_id' => $memberId,  // Assuming this is member->id not user_id, based on usage '$user->member->memberCategory'
                'reference_type' => FinancialInvoice::class,
                'reference_id' => $invoice->id,
                'created_by' => Auth::id(),  // Note: $req->user()->id if Auth::id() is not set in API context, but assumed ok
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
