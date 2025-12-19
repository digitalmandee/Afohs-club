<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use App\Models\FinancialInvoice;
use App\Models\MaintenanceFee;
use App\Models\Member;
use App\Models\MemberCategory;
use App\Models\Subscription;
use App\Models\SubscriptionCategory;
use App\Models\SubscriptionType;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class MemberTransactionController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:financial.create')->only('create', 'store');
        $this->middleware('permission:financial.view')->only('searchMembers', 'getMemberTransactions', 'getAllTransactions');
    }

    public function index()
    {
        // Get transaction statistics
        $totalTransactions = FinancialInvoice::whereIn('fee_type', ['membership_fee', 'maintenance_fee', 'subscription_fee', 'reinstating_fee'])->count();
        $totalRevenue = FinancialInvoice::whereIn('fee_type', ['membership_fee', 'maintenance_fee', 'subscription_fee', 'reinstating_fee'])
            ->where('status', 'paid')
            ->sum('total_price');

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

        // Recent transactions
        $recentTransactions = FinancialInvoice::whereIn('fee_type', ['membership_fee', 'maintenance_fee', 'subscription_fee', 'reinstating_fee'])
            ->with('member:id,full_name,membership_no')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('App/Admin/Membership/Transactions/Dashboard', [
            'statistics' => [
                'total_transactions' => $totalTransactions,
                'total_revenue' => $totalRevenue,
                'membership_fee_revenue' => $membershipFeeRevenue,
                'maintenance_fee_revenue' => $maintenanceFeeRevenue,
                'subscription_fee_revenue' => $subscriptionFeeRevenue,
                'reinstating_fee_revenue' => $reinstatingFeeRevenue,
            ],
            'recent_transactions' => $recentTransactions
        ]);
    }

    public function create()
    {
        // Get subscription types and categories for subscription fees
        $subscriptionTypes = SubscriptionType::all(['id', 'name']);
        $subscriptionCategories = SubscriptionCategory::where('status', 'active')
            ->with('subscriptionType:id,name')
            ->get(['id', 'name', 'subscription_type_id', 'fee', 'description']);

        return Inertia::render('App/Admin/Membership/Transactions/Create', [
            'subscriptionTypes' => $subscriptionTypes,
            'subscriptionCategories' => $subscriptionCategories,
        ]);
    }

    public function searchMembers(Request $request)
    {
        $query = $request->input('query');

        $members = Member::whereNull('parent_id')
            ->where(function ($q) use ($query) {
                $q
                    ->where('full_name', 'like', "%{$query}%")
                    ->orWhere('membership_no', 'like', "%{$query}%")
                    ->orWhere('cnic_no', 'like', "%{$query}%")
                    ->orWhere('mobile_number_a', 'like', "%{$query}%");
            })
            ->with(['memberCategory:id,name,fee,subscription_fee'])
            ->select('id', 'full_name', 'membership_no', 'cnic_no', 'mobile_number_a', 'membership_date', 'member_category_id', 'status')
            ->limit(10)
            ->get();

        return response()->json(['members' => $members]);
    }

    public function getMemberTransactions($memberId)
    {
        $member = Member::where('id', $memberId)
            ->with([
                'memberCategory:id,name,fee,subscription_fee',
                'familyMembers:id,parent_id,full_name,relation,membership_no,status'
            ])
            ->first();

        if (!$member) {
            return response()->json(['error' => 'Member not found'], 404);
        }

        $transactions = FinancialInvoice::where('member_id', $memberId)
            ->whereIn('fee_type', ['membership_fee', 'maintenance_fee', 'subscription_fee'])
            ->orderBy('created_at', 'desc')
            ->get();

        $membershipFeePaid = $transactions
            ->where('fee_type', 'membership_fee')
            ->where('status', 'paid')
            ->isNotEmpty();

        return response()->json([
            'member' => $member,
            'transactions' => $transactions,
            'membership_fee_paid' => $membershipFeePaid,
        ]);
    }

    public function store(Request $request)
    {
        try {
            // Logic to handle multiple subscriptions
            $isMultiSubscription = $request->fee_type === 'subscription_fee' && $request->has('subscriptions');

            // Conditional Validation
            $rules = [
                'member_id' => 'required|exists:members,id',
                'fee_type' => 'required|in:membership_fee,maintenance_fee,subscription_fee,reinstating_fee',
                'payment_frequency' => 'required_if:fee_type,maintenance_fee|in:monthly,quarterly,half_yearly,three_quarters,annually',
                'amount' => 'required|numeric|min:0',  // This is total amount
                'discount_type' => 'nullable|in:percent,fixed,percentage',
                'discount_value' => 'nullable|numeric|min:0',
                'tax_percentage' => 'nullable|numeric|min:0|max:100',
                'overdue_percentage' => 'nullable|numeric|min:0|max:100',
                'additional_charges' => 'nullable|numeric|min:0',
                'remarks' => 'nullable|string|max:1000',
                'payment_method' => 'required|in:cash,credit_card',
                // valid_from/to required if NOT multi-subscription (checked below)
                'starting_quarter' => 'nullable|integer|min:1|max:4',
                'credit_card_type' => 'required_if:payment_method,credit_card|in:mastercard,visa',
                'receipt_file' => 'required_if:payment_method,credit_card|file|mimes:jpeg,png,jpg,gif,pdf|max:2048',
                'status' => 'nullable|in:paid,unpaid',
            ];

            if (!$isMultiSubscription) {
                // Standard validation for single item
                $rules['valid_from'] = 'required_if:fee_type,maintenance_fee,subscription_fee|date';
                $rules['valid_to'] = 'nullable|date|after_or_equal:valid_from';
                $rules['subscription_type_id'] = 'required_if:fee_type,subscription_fee|exists:subscription_types,id';
                $rules['subscription_category_id'] = 'required_if:fee_type,subscription_fee|exists:subscription_categories,id';
                $rules['family_member_id'] = 'nullable|exists:members,id';
            } else {
                // Validate array structure if needed, or rely on logic loop
                // We trust the structure from frontend but good to check basic presence
                // We will validate items in loop or assume valid.
            }

            $validator = Validator::make($request->all(), $rules);

            if ($validator->fails()) {
                Log::warning('Validation failed', $validator->errors()->toArray());
                return response()->json(['errors' => $validator->errors()], 422);
            }

            DB::beginTransaction();

            $member = Member::where('id', $request->member_id)->first();

            // Handling Receipts: Upload once if present
            $receiptPath = null;
            if ($request->hasFile('receipt_file')) {
                $receiptPath = FileHelper::saveImage($request->file('receipt_file'), 'receipts');
                // Remove file from request to check duplication in prepareInvoiceData if called,
                // but we will manually set receipt_path in data.
            }

            $invoicesCreated = [];
            $sharedInvoiceNo = $this->generateInvoiceNumber();  // Shared Number (Integer)

            // Prepare items to process
            $itemsToProcess = [];

            if ($isMultiSubscription) {
                $subs = json_decode($request->subscriptions, true);
                foreach ($subs as $sub) {
                    $itemsToProcess[] = [
                        'type' => 'subscription_fee',
                        'data' => $sub,  // contains amount, type, cat, family, valid dates
                        'amount' => $sub['net_amount'] ?? $sub['amount'],  // Use Net Amount for total calculation
                    ];
                }
            } else {
                // Single Item
                $itemsToProcess[] = [
                    'type' => $request->fee_type,
                    'data' => $request->all(),  // Contains everything
                    'amount' => $request->amount,
                ];
            }

            // 1. Calculate Totals and Prepare Data for Single Invoice
            $totalAmount = 0;
            $allItemsData = [];

            foreach ($itemsToProcess as $item) {
                $totalAmount += $item['amount'];

                $itemPayload = $item['data'];
                // Save Base Amount as Original Amount (Frontend sends 'amount' as Base, 'net_amount' as Net)
                $itemPayload['original_amount'] = $itemPayload['amount'];

                $itemPayload['amount'] = $item['amount'];  // Overwrite with Net Amount (from itemsToProcess)
                $itemPayload['invoice_type'] = $item['type'] === 'subscription_fee' ? 'subscription' : str_replace('_', ' ', $item['type']);
                $itemPayload['description'] = ucfirst($itemPayload['invoice_type']);

                // Preserve pricing details if available in data
                // (Assumes frontend sends item_discount_type, item_discount_value in the item object)

                // Lookup Names for Subscription (Prioritize DB, fallback to Frontend provided names)
                if ($item['type'] === 'subscription_fee') {
                    // Initialize with frontend names or N/A
                    $itemPayload['subscription_type_name'] = $itemPayload['type_name'] ?? 'N/A';
                    $itemPayload['subscription_category_name'] = $itemPayload['category_name'] ?? 'N/A';

                    if (!empty($itemPayload['subscription_type_id'])) {
                        $st = \App\Models\SubscriptionType::find($itemPayload['subscription_type_id']);
                        if ($st) {
                            $itemPayload['subscription_type_name'] = $st->name;
                        }
                    }
                    if (!empty($itemPayload['subscription_category_id'])) {
                        $sc = \App\Models\SubscriptionCategory::find($itemPayload['subscription_category_id']);
                        if ($sc) {
                            $itemPayload['subscription_category_name'] = $sc->name;
                        }
                    }
                }

                $allItemsData[] = $itemPayload;
            }

            // 2. Prepare Main Invoice Data
            $mainRequest = $request->duplicate();
            $mainRequest->merge([
                'amount' => $totalAmount,
                // discount/tax are global in $request, prepareInvoiceData will apply them to this Total Amount
            ]);

            $invoiceData = $this->prepareInvoiceData($mainRequest, $member);

            // Ensure unique Invoice Number (Integer)
            $invoiceData['invoice_no'] = $this->generateInvoiceNumber();

            // Embed items into 'data' JSON
            $existingJsonData = $invoiceData['data'] ?? [];
            $existingJsonData['items'] = $allItemsData;

            // If multiple subscriptions, clear specific foreign keys on Invoice level to avoid ambiguity
            if ($isMultiSubscription) {
                $invoiceData['subscription_type_id'] = null;
                $invoiceData['subscription_category_id'] = null;
            }

            $invoiceData['data'] = $existingJsonData;

            // Set Receipt Path if available
            if ($receiptPath) {
                $invoiceData['receipt_path'] = $receiptPath;
            }

            // Pre-Validation: Check for existing maintenance fee BEFORE creating the new invoice to avoid self-collision
            foreach ($itemsToProcess as $item) {
                if ($item['type'] === 'maintenance_fee') {
                    if ($this->checkMaintenanceExists($request->member_id, $item['data']['valid_from'], $item['data']['valid_to'])) {
                        DB::rollBack();
                        return response()->json(['errors' => ['fee_type' => ['Maintenance fee for this period already exists.']]], 422);
                    }
                }
            }

            // 3. Create the ONE Financial Invoice
            $invoice = FinancialInvoice::create($invoiceData);
            $invoicesCreated[] = $invoice;

            // 4. Process Items (Create Subscriptions / MaintenanceFees linked to Invoice)
            foreach ($itemsToProcess as $item) {
                if ($item['type'] === 'subscription_fee') {
                    $subData = $item['data'];

                    $subscription = Subscription::create([
                        'member_id' => $request->member_id,
                        'family_member_id' => $subData['family_member_id'] ?? null,
                        'subscription_category_id' => $subData['subscription_category_id'],
                        'subscription_type_id' => $subData['subscription_type_id'],
                        'valid_from' => $subData['valid_from'],
                        'valid_to' => $subData['valid_to'],
                        'status' => 'active',
                        'invoice_id' => $invoice->id,
                        'qr_code' => null,
                    ]);

                    // Generate QR
                    $qrCodeData = route('subscription.details', ['id' => $subscription->id]);
                    $qrBinary = QrCode::format('png')->size(300)->generate($qrCodeData);
                    $qrImagePath = FileHelper::saveBinaryImage($qrBinary, 'subscription_qr_codes');
                    $subscription->qr_code = $qrImagePath;
                    $subscription->save();

                    // If not multi-subscription, we can set invoiceable for backward compatibility
                    if (!$isMultiSubscription) {
                        $invoice->invoiceable_id = $subscription->id;
                        $invoice->invoiceable_type = Subscription::class;
                        $invoice->save();
                    }
                } elseif ($item['type'] === 'membership_fee') {
                    $invoice->invoiceable_id = $request->member_id;
                    $invoice->invoiceable_type = Member::class;
                    $invoice->save();
                } elseif ($item['type'] === 'maintenance_fee') {
                    // Check handled before invoice creation

                    $currentYear = date('Y', strtotime($item['data']['valid_from']));
                    $currentMonth = date('n', strtotime($item['data']['valid_from']));

                    $maintenanceFee = \App\Models\MaintenanceFee::create([
                        'member_id' => $request->member_id,
                        'year' => $currentYear,
                        'month' => $currentMonth,
                        'amount' => $item['amount'],
                        'status' => 'paid',
                    ]);

                    $invoice->invoiceable_id = $maintenanceFee->id;
                    $invoice->invoiceable_type = \App\Models\MaintenanceFee::class;
                    $invoice->save();
                } elseif ($item['type'] === 'reinstating_fee') {
                    $invoice->invoiceable_id = $request->member_id;
                    $invoice->invoiceable_type = Member::class;
                    $invoice->save();

                    if ($request->fee_type === 'reinstating_fee') {
                        $member->update(['status' => 'active']);
                    }
                }
            }

            // Post-creation actions
            foreach ($invoicesCreated as $invoice) {
                if ($request->status === 'paid') {
                    $this->cancelOverlappingInvoices($invoice);
                }
            }

            DB::commit();

            // Notification (using first invoice for details)
            $firstInvoice = $invoicesCreated[0];
            $transactionType = str_replace('_', ' ', $request->fee_type);
            try {
                $superAdmins = \App\Models\User::role('super-admin')->get();
                \Illuminate\Support\Facades\Notification::send($superAdmins, new \App\Notifications\ActivityNotification(
                    "New Transaction: {$transactionType} - Total {$request->amount}",
                    "Transaction created for Membership #{$member->membership_no} (Invoice: {$sharedInvoiceNo})",
                    route('member.profile', $member->id),
                    \Illuminate\Support\Facades\Auth::user(),
                    'Finance'
                ));
            } catch (\Exception $e) {
                Log::error('Failed to send notification: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Transaction created successfully.',
                'transaction' => $firstInvoice,  // Return first invoice as representative
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Transaction creation failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create transaction: ' . $e->getMessage()], 500);
        }
    }

    private function checkMaintenanceExists($memberId, $from, $to)
    {
        return FinancialInvoice::where('member_id', $memberId)
            ->where('fee_type', 'maintenance_fee')
            ->where('valid_from', $from)
            ->where('valid_to', $to)
            ->where('status', '!=', 'cancelled')
            ->exists();
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

        $baseAmount = $amount - $discountAmount;
        $taxAmount = 0;
        $overdueAmount = 0;

        // Calculate tax
        if ($request->tax_percentage) {
            $taxAmount = ($baseAmount * $request->tax_percentage) / 100;
        }

        // Calculate overdue
        if ($request->overdue_percentage) {
            $overdueAmount = ($baseAmount * $request->overdue_percentage) / 100;
        }

        $additionalCharges = 0;
        if ($request->additional_charges) {
            $additionalCharges = $request->additional_charges;
        }

        $totalPrice = round($baseAmount + $taxAmount + $overdueAmount + $additionalCharges);
        $data = [
            'member_id' => $request->member_id,
            'member_name' => $member->full_name,
            'membership_no' => $member->membership_no,
            'fee_type' => $request->fee_type,
            'payment_frequency' => $request->payment_frequency,
            'starting_quarter' => $request->starting_quarter,
            'remarks' => $request->remarks
        ];

        // Add subscription specific data
        if ($request->fee_type === 'subscription_fee') {
            $subscriptionType = SubscriptionType::find($request->subscription_type_id);
            $subscriptionCategory = SubscriptionCategory::find($request->subscription_category_id);

            $data['subscription_type_id'] = $request->subscription_type_id;
            $data['subscription_category_id'] = $request->subscription_category_id;
            $data['subscription_type_name'] = $subscriptionType ? $subscriptionType->name : null;
            $data['subscription_category_name'] = $subscriptionCategory ? $subscriptionCategory->name : null;

            // Handle family member selection
            if ($request->family_member_id) {
                $familyMember = Member::find($request->family_member_id);
                $data['family_member_id'] = $request->family_member_id;
                $data['family_member_name'] = $familyMember ? $familyMember->full_name : null;
                $data['family_member_relation'] = $familyMember ? $familyMember->relation : null;
            } else {
                $data['family_member_id'] = null;
                $data['family_member_name'] = $member->full_name;
                $data['family_member_relation'] = 'SELF';
            }
        }

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
            'invoice_type' => $request->fee_type === 'membership_fee' ? 'membership' : ($request->fee_type === 'subscription_fee' ? 'subscription' : ($request->fee_type === 'reinstating_fee' ? 'reinstating' : 'maintenance')),
            'amount' => $amount,
            'discount_type' => $request->discount_type,
            'discount_value' => $request->discount_value,
            'tax_percentage' => $request->tax_percentage,
            'tax_amount' => $taxAmount,
            'tax_amount' => $taxAmount,
            'overdue_percentage' => $request->overdue_percentage,
            'overdue_amount' => $overdueAmount,
            'additional_charges' => $additionalCharges,
            'remarks' => $request->remarks,
            'total_price' => $totalPrice,
            'paid_amount' => $totalPrice,
            'payment_method' => $request->payment_method,
            'payment_date' => now(),
            'issue_date' => now(),
            'due_date' => now()->addDays(30),
            'due_date' => now()->addDays(30),
            'status' => $request->status ?? 'paid',
            'data' => $data,
            'created_by' => Auth::id(),
        ];

        // Add subscription foreign keys if subscription fee
        if ($request->fee_type === 'subscription_fee') {
            $invoiceData['subscription_type_id'] = $request->subscription_type_id;
            $invoiceData['subscription_category_id'] = $request->subscription_category_id;
        }

        // Handle dates based on fee type
        if ($request->fee_type === 'membership_fee') {
            // Membership fee is lifetime - set to member's joining date and far future
            $memberJoinDate = Carbon::parse($member->membership_date);
            $invoiceData['valid_from'] = $memberJoinDate->format('Y-m-d');
            $invoiceData['valid_to'] = null;  // Lifetime validity
        } elseif ($request->fee_type === 'subscription_fee') {
            // Use manual validity dates from request for subscription fees
            $invoiceData['valid_from'] = $request->valid_from;
            $invoiceData['valid_to'] = $request->valid_to;  // Can be null for unlimited
        } elseif ($request->fee_type === 'reinstating_fee') {
            // Reinstating fee is a one-time payment with no validity period
            $invoiceData['valid_from'] = now()->format('Y-m-d');
            $invoiceData['valid_to'] = null;  // No expiration for reinstating fee
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

        $quartersToAdd = 1;  // Default for quarterly
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
        $lastInvoice = FinancialInvoice::withTrashed()
            ->orderBy('invoice_no', 'desc')
            ->whereNotNull('invoice_no')
            ->first();

        $nextNumber = 1;
        if ($lastInvoice && $lastInvoice->invoice_no) {
            $nextNumber = $lastInvoice->invoice_no + 1;
        }

        // Double-check that this number doesn't exist (safety check)
        while (FinancialInvoice::withTrashed()->where('invoice_no', $nextNumber)->exists()) {
            $nextNumber++;
        }

        return $nextNumber;
    }

    public function show($id)
    {
        $transaction = FinancialInvoice::with('member:id,full_name,membership_no')
            ->findOrFail($id);

        return Inertia::render('App/Admin/Membership/Transactions/Show', [
            'transaction' => $transaction
        ]);
    }

    public function getAllTransactions(Request $request)
    {
        $query = FinancialInvoice::whereIn('fee_type', ['membership_fee', 'maintenance_fee'])
            ->with('member:id,full_name,membership_no');

        // Filter by member name or membership number
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('member', function ($q) use ($search) {
                $q
                    ->where('full_name', 'like', "%{$search}%")
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

        $transactions = $query
            ->orderBy('created_at', 'desc')
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
            'member_id' => 'required|exists:members,id',
            'payments' => 'required|array|min:1',
            'payments.*.fee_type' => 'required|in:membership_fee,maintenance_fee',
            'payments.*.amount' => 'required|numeric|min:0',
            'payments.*.valid_from' => 'required_if:payments.*.fee_type,maintenance_fee|date',
            'payments.*.valid_to' => 'required_if:payments.*.fee_type,maintenance_fee|date|after_or_equal:payments.*.valid_from',
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
            $member = Member::where('id', $request->member_id)->first();
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
                    $validTo = $memberJoinDate->copy()->addYears(50)->format('Y-m-d');  // Lifetime validity
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
                    'status' => 'paid',  // Assuming migrated data is already paid
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
                'message' => 'Bulk migration completed successfully',
                'count' => count($createdTransactions)
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Migration failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        $transaction = FinancialInvoice::findOrFail($id);

        $request->validate([
            'status' => 'required|in:paid,unpaid,cancelled',
        ]);

        $transaction->status = $request->status;
        if ($request->status === 'paid') {
            $transaction->payment_date = now();
            // Auto-cancel overlapping/duplicate unpaid invoices
            $this->cancelOverlappingInvoices($transaction);
        }
        $transaction->save();

        try {
            $member = \App\Models\Member::find($transaction->member_id);
            $superAdmins = \App\Models\User::role('super-admin')->get();
            \Illuminate\Support\Facades\Notification::send($superAdmins, new \App\Notifications\ActivityNotification(
                "Transaction Status Updated: {$request->status}",
                "Invoice #{$transaction->invoice_no} status changed to {$request->status}",
                route('member.profile', $member->id),
                auth()->user(),
                'Finance'
            ));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send notification: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Transaction status updated successfully',
            'transaction' => $transaction
        ]);
    }

    /**
     * Cancel overlapping or duplicate unpaid invoices
     */
    private function cancelOverlappingInvoices($transaction)
    {
        // Skip if not paid
        if ($transaction->status !== 'paid') {
            return;
        }

        $query = FinancialInvoice::where('member_id', $transaction->member_id)
            ->where('id', '!=', $transaction->id)
            ->where('status', 'unpaid')
            ->where('fee_type', $transaction->fee_type);

        if ($transaction->fee_type === 'membership_fee') {
            return;  // Do not cancel existing membership fee invoices
        }

        // For maintenance, subscription, etc., check for date overlaps
        // Overlap logic: (StartA <= EndB) and (EndA >= StartB)
        $query->where(function ($q) use ($transaction) {
            $q
                ->where('valid_from', '<=', $transaction->valid_to)
                ->where('valid_to', '>=', $transaction->valid_from);
        });

        $invoicesToCancel = $query->get();

        foreach ($invoicesToCancel as $invoice) {
            $invoice->update([
                'status' => 'cancelled',
                'remarks' => $invoice->remarks . " [System: Auto-cancelled due to payment of Invoice #{$transaction->invoice_no}]"
            ]);
        }
    }
}
