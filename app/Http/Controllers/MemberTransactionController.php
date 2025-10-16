<?php

namespace App\Http\Controllers;

use App\Models\FinancialInvoice;
use App\Models\Member;
use App\Models\MemberCategory;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Helpers\FileHelper;
use Inertia\Inertia;

class MemberTransactionController extends Controller
{
    public function index()
    {
        // Get transaction statistics
        $totalTransactions = FinancialInvoice::whereIn('fee_type', ['membership_fee', 'maintenance_fee'])->count();
        $totalRevenue = FinancialInvoice::whereIn('fee_type', ['membership_fee', 'maintenance_fee'])
            ->where('status', 'paid')
            ->sum('total_price');
        
        $membershipFeeRevenue = FinancialInvoice::where('fee_type', 'membership_fee')
            ->where('status', 'paid')
            ->sum('total_price');
        
        $maintenanceFeeRevenue = FinancialInvoice::where('fee_type', 'maintenance_fee')
            ->where('status', 'paid')
            ->sum('total_price');

        // Recent transactions
        $recentTransactions = FinancialInvoice::whereIn('fee_type', ['membership_fee', 'maintenance_fee'])
            ->with('member:user_id,full_name,membership_no')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('App/Admin/Membership/Transactions/Dashboard', [
            'statistics' => [
                'total_transactions' => $totalTransactions,
                'total_revenue' => $totalRevenue,
                'membership_fee_revenue' => $membershipFeeRevenue,
                'maintenance_fee_revenue' => $maintenanceFeeRevenue,
            ],
            'recent_transactions' => $recentTransactions
        ]);
    }

    public function create()
    {
        return Inertia::render('App/Admin/Membership/Transactions/Create');
    }

    public function searchMembers(Request $request)
    {
        $query = $request->input('query');
        
        $members = Member::whereNull('parent_id')
            ->where(function ($q) use ($query) {
                $q->where('full_name', 'like', "%{$query}%")
                  ->orWhere('membership_no', 'like', "%{$query}%")
                  ->orWhere('cnic_no', 'like', "%{$query}%")
                  ->orWhere('mobile_number_a', 'like', "%{$query}%");
            })
            ->with(['memberCategory:id,name,fee,subscription_fee'])
            ->select('id', 'user_id', 'full_name', 'membership_no', 'cnic_no', 'mobile_number_a', 'membership_date', 'member_category_id')
            ->limit(10)
            ->get();

        return response()->json(['members' => $members]);
    }

    public function getMemberTransactions($memberId)
    {
        $member = Member::where('user_id', $memberId)
            ->with(['memberCategory:id,name,fee,subscription_fee'])
            ->first();

        if (!$member) {
            return response()->json(['error' => 'Member not found'], 404);
        }

        $transactions = FinancialInvoice::where('member_id', $memberId)
            ->whereIn('fee_type', ['membership_fee', 'maintenance_fee'])
            ->orderBy('created_at', 'desc')
            ->get();

        $membershipFeePaid = $transactions->where('fee_type', 'membership_fee')
            ->where('status', 'paid')
            ->isNotEmpty();

        return response()->json([
            'member' => $member,
            'transactions' => $transactions,
        ]);
    }

    public function store(Request $request)
    {
        try {
            Log::info('Transaction creation request received', $request->all());

            $validator = Validator::make($request->all(), [
                'member_id' => 'required|exists:members,user_id',
                'fee_type' => 'required|in:membership_fee,maintenance_fee',
                'payment_frequency' => 'required_if:fee_type,maintenance_fee|in:monthly,quarterly,half_yearly,three_quarters,annually',
                'amount' => 'required|numeric|min:0',
                'discount_type' => 'nullable|in:percent,fixed',
                'discount_value' => 'nullable|numeric|min:0',
                'payment_method' => 'required|in:cash,credit_card',
                'valid_from' => 'required_if:fee_type,maintenance_fee|date',
                'valid_to' => 'required_if:fee_type,maintenance_fee|date|after:valid_from',
                'starting_quarter' => 'nullable|integer|min:1|max:4',
                'credit_card_type' => 'required_if:payment_method,credit_card|in:mastercard,visa',
                'receipt_file' => 'required_if:payment_method,credit_card|file|mimes:jpeg,png,jpg,gif,pdf|max:2048'
            ]);

            if ($validator->fails()) {
                Log::warning('Validation failed', $validator->errors()->toArray());
                return response()->json(['errors' => $validator->errors()], 422);
            }
            DB::beginTransaction();

            $member = Member::where('user_id', $request->member_id)->first();
            
            // Check if membership fee already paid for membership fee type
            if ($request->fee_type === 'membership_fee') {
                $existingMembershipFee = FinancialInvoice::where('member_id', $request->member_id)
                    ->where('fee_type', 'membership_fee')
                    ->where('status', 'paid')
                    ->exists();

                if ($existingMembershipFee) {
                    return response()->json(['error' => 'Membership fee already paid for this member'], 422);
                }
            }

            $invoiceData = $this->prepareInvoiceData($request, $member);
            $invoice = FinancialInvoice::create($invoiceData);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Transaction created successfully!',
                'transaction' => $invoice->load('member:user_id,full_name,membership_no')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Transaction creation failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create transaction'], 500);
        }
    }

    private function prepareInvoiceData($request, $member)
    {
        $amount = round($request->amount);
        $discountAmount = 0;

        // Calculate discount
        if ($request->discount_type && $request->discount_value) {
            if ($request->discount_type === 'percent') {
                $discountAmount = ($amount * $request->discount_value) / 100;
            } else {
                $discountAmount = $request->discount_value;
            }
        }

        $totalPrice = round($amount - $discountAmount);
        $data = [
            'member_id' => $request->member_id,
            'member_name' => $member->full_name,
            'membership_no' => $member->membership_no,
            'fee_type' => $request->fee_type,
            'payment_frequency' => $request->payment_frequency,
            'starting_quarter' => $request->starting_quarter
        ];

        // Handle credit card specific data
        if ($request->payment_method === 'credit_card') {
            $data['credit_card_type'] = $request->credit_card_type;
            
            // Handle file upload
            if ($request->hasFile('receipt_file')) {
                $filePath = FileHelper::saveImage($request->file('receipt_file'), 'receipts');
                $data['receipt_path'] = $filePath;
            }
        }
        
        $invoiceData = [
            'invoice_no' => $this->generateInvoiceNumber(),
            'member_id' => $request->member_id,
            'fee_type' => $request->fee_type,
            'invoice_type' => $request->fee_type === 'membership_fee' ? 'membership' : 'maintenance',
            'amount' => $amount,
            'discount_type' => $request->discount_type,
            'discount_value' => $request->discount_value,
            'total_price' => $totalPrice,
            'paid_amount' => $totalPrice,
            'payment_method' => $request->payment_method,
            'payment_date' => now(),
            'issue_date' => now(),
            'due_date' => now()->addDays(30),
            'status' => 'paid',
            'data' => $data,
            'created_by' => Auth::id(),
        ];

        // Handle dates based on fee type
        if ($request->fee_type === 'membership_fee') {
            // Membership fee is lifetime - set to member's joining date and far future
            $memberJoinDate = Carbon::parse($member->membership_date);
            $invoiceData['valid_from'] = $memberJoinDate->format('Y-m-d');
            $invoiceData['valid_to'] = $memberJoinDate->addYears(50)->format('Y-m-d'); // Lifetime validity
        } else {
            // Use manual validity dates from request for maintenance fees
            $invoiceData['valid_from'] = $request->valid_from;
            $invoiceData['valid_to'] = $request->valid_to;
        }

        // Handle maintenance fee specific data
        if ($request->fee_type === 'maintenance_fee') {
            $invoiceData['payment_frequency'] = $request->payment_frequency;
            
            // Use starting quarter from request or calculate based on member's joining date
            if ($request->starting_quarter) {
                $invoiceData['quarter_number'] = $request->starting_quarter;
            } else {
                // Fallback calculation
                $membershipDate = Carbon::parse($member->membership_date);
                $validFrom = Carbon::parse($request->valid_from);
                $monthsSinceMembership = $membershipDate->diffInMonths($validFrom);
                $quarterNumber = floor($monthsSinceMembership / 3) + 1;
                $invoiceData['quarter_number'] = $quarterNumber;
            }
        }

        return $invoiceData;
    }

    private function calculateQuarterData($member, $paymentFrequency)
    {
        $membershipDate = Carbon::parse($member->membership_date);
        $now = now();
        
        // Calculate which quarter we're in based on membership date
        $monthsSinceMembership = $membershipDate->diffInMonths($now);
        $quartersSinceMembership = floor($monthsSinceMembership / 3);
        
        // Calculate current quarter start based on membership date
        $currentQuarterStart = $membershipDate->copy()->addMonths($quartersSinceMembership * 3);
        
        $quartersToAdd = 1; // Default for quarterly
        if ($paymentFrequency === 'half_yearly') {
            $quartersToAdd = 2;
        } elseif ($paymentFrequency === 'three_quarters') {
            $quartersToAdd = 3;
        } elseif ($paymentFrequency === 'annually') {
            $quartersToAdd = 4;
        }
        
        $quarterEnd = $currentQuarterStart->copy()->addMonths($quartersToAdd * 3)->subDay();
        
        return [
            'quarter_number' => $quartersSinceMembership + 1,
            'start_date' => $currentQuarterStart,
            'end_date' => $quarterEnd,
        ];
    }

    private function generateInvoiceNumber()
    {
        // Get the highest invoice_no from all financial_invoices (not just transaction types)
        $lastInvoice = FinancialInvoice::orderBy('invoice_no', 'desc')
            ->whereNotNull('invoice_no')
            ->first();

        $nextNumber = 1;
        if ($lastInvoice && $lastInvoice->invoice_no) {
            $nextNumber = $lastInvoice->invoice_no + 1;
        }

        // Double-check that this number doesn't exist (safety check)
        while (FinancialInvoice::where('invoice_no', $nextNumber)->exists()) {
            $nextNumber++;
        }

        return $nextNumber;
    }

    public function show($id)
    {
        $transaction = FinancialInvoice::with('member:user_id,full_name,membership_no')
            ->findOrFail($id);

        return Inertia::render('App/Admin/Membership/Transactions/Show', [
            'transaction' => $transaction
        ]);
    }

    public function getAllTransactions(Request $request)
    {
        $query = FinancialInvoice::whereIn('fee_type', ['membership_fee', 'maintenance_fee'])
            ->with('member:user_id,full_name,membership_no');

        // Filter by member name or membership number
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('member', function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('membership_no', 'like', "%{$search}%");
            });
        }

        // Filter by fee type
        if ($request->filled('fee_type') && $request->fee_type !== 'all') {
            $query->where('fee_type', $request->fee_type);
        }

        // Filter by status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $transactions = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('App/Admin/Membership/Transactions/Index', [
            'transactions' => $transactions,
            'filters' => $request->only(['search', 'fee_type', 'status', 'date_from', 'date_to'])
        ]);
    }

    /**
     * Show bulk migration form for importing old system data
     */
    public function bulkMigration()
    {
        return Inertia::render('App/Admin/Membership/Transactions/BulkMigration');
    }

    /**
     * Store multiple transactions at once (for data migration)
     */
    public function bulkStore(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'member_id' => 'required|exists:members,user_id',
            'payments' => 'required|array|min:1',
            'payments.*.fee_type' => 'required|in:membership_fee,maintenance_fee',
            'payments.*.amount' => 'required|numeric|min:0',
            'payments.*.valid_from' => 'required_if:payments.*.fee_type,maintenance_fee|date',
            'payments.*.valid_to' => 'required_if:payments.*.fee_type,maintenance_fee|date|after:payments.*.valid_from',
            'payments.*.invoice_no' => 'required|string|unique:financial_invoices,invoice_no',
            'payments.*.payment_date' => 'required|date',
            'payments.*.payment_method' => 'sometimes|in:cash,credit_card',
            'payments.*.credit_card_type' => 'required_if:payments.*.payment_method,credit_card|in:mastercard,visa',
            'payments.*.receipt_file' => 'sometimes|file|mimes:jpeg,png,jpg,gif,pdf|max:2048',
            'payments.*.discount_type' => 'sometimes|in:percent,fixed',
            'payments.*.discount_value' => 'sometimes|numeric|min:0',
            'payments.*.payment_frequency' => 'required_if:payments.*.fee_type,maintenance_fee|in:monthly,quarterly,half_yearly,three_quarters,annually',
            'payments.*.quarter_number' => 'required_if:payments.*.fee_type,maintenance_fee|integer|between:1,4',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Load member data for date calculations
            $member = Member::where('user_id', $request->member_id)->first();
            $createdTransactions = [];

            foreach ($request->payments as $index => $paymentData) {
                // Calculate total amount with discount
                $amount = round(floatval($paymentData['amount']));
                $discountValue = floatval($paymentData['discount_value'] ?? 0);
                $discountType = $paymentData['discount_type'] ?? '';
                
                $totalPrice = $amount;
                if ($discountType && $discountValue > 0) {
                    if ($discountType === 'percent') {
                        $totalPrice = $amount - ($amount * $discountValue / 100);
                    } else {
                        $totalPrice = $amount - $discountValue;
                    }
                }
                
                // Round the final total price
                $totalPrice = round($totalPrice);

                // Handle receipt file upload for credit card payments
                $receiptPath = null;
                if (isset($paymentData['payment_method']) && $paymentData['payment_method'] === 'credit_card') {
                    $receiptFile = $request->file("payments.{$index}.receipt_file");
                    if ($receiptFile) {
                        $receiptPath = FileHelper::saveImage($receiptFile, 'receipts');
                    }
                }

                // Handle dates based on fee type
                $validFrom = $paymentData['valid_from'] ?? null;
                $validTo = $paymentData['valid_to'] ?? null;
                
                if ($paymentData['fee_type'] === 'membership_fee') {
                    // Membership fee is lifetime - set to member's joining date and far future
                    $memberJoinDate = Carbon::parse($member->membership_date);
                    $validFrom = $memberJoinDate->format('Y-m-d');
                    $validTo = $memberJoinDate->copy()->addYears(50)->format('Y-m-d'); // Lifetime validity
                }

                // Create financial invoice
                $transaction = FinancialInvoice::create([
                    'member_id' => $request->member_id,
                    'invoice_no' => $paymentData['invoice_no'],
                    'invoice_type' => $paymentData['fee_type'] === 'membership_fee' ? 'membership' : 'maintenance',
                    'fee_type' => $paymentData['fee_type'],
                    'payment_frequency' => $paymentData['payment_frequency'] ?? null,
                    'quarter_number' => $paymentData['quarter_number'] ?? null,
                    'amount' => $amount,
                    'discount_type' => $discountType ?: null,
                    'discount_value' => $discountValue ?: null,
                    'total_price' => $totalPrice,
                    'paid_amount' => $totalPrice,
                    'payment_method' => $paymentData['payment_method'] ?? 'cash',
                    'credit_card_type' => $paymentData['credit_card_type'] ?? null,
                    'receipt' => $receiptPath,
                    'status' => 'paid', // Assuming migrated data is already paid
                    'payment_date' => $paymentData['payment_date'],
                    'valid_from' => $validFrom,
                    'valid_to' => $validTo,
                    'created_by' => Auth::id(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $createdTransactions[] = $transaction;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Successfully created ' . count($createdTransactions) . ' transactions',
                'transactions' => $createdTransactions
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Bulk transaction creation failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create transactions: ' . $e->getMessage()
            ], 500);
        }
    }
}
