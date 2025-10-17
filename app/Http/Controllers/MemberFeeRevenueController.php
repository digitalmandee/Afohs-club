<?php

namespace App\Http\Controllers;

use App\Models\FinancialInvoice;
use App\Models\Member;
use App\Models\MemberCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MemberFeeRevenueController extends Controller
{
    public function maintenanceFeeRevenue(Request $request)
    {
        $statusFilter = $request->input('status');  // array of statuses
        $categoryFilter = $request->input('categories');  // array of category IDs
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        // Get member categories with their members
        $query = MemberCategory::query()->with(['members' => function ($q) use ($statusFilter) {
            if ($statusFilter) {
                $q->whereIn('status', (array) $statusFilter);
            }
        }]);

        if ($categoryFilter) {
            $query->whereIn('id', (array) $categoryFilter);
        }

        $categories = $query->get()->map(function ($category) use ($dateFrom, $dateTo) {
            $memberUserIds = $category->members->pluck('user_id');

            // Calculate maintenance fee revenue from new transaction system
            $maintenanceQuery = FinancialInvoice::where('fee_type', 'maintenance_fee')
                ->where('status', 'paid')
                ->whereIn('member_id', $memberUserIds);

            // Apply date filters if provided
            if ($dateFrom) {
                $maintenanceQuery->whereDate('payment_date', '>=', $dateFrom);
            }
            if ($dateTo) {
                $maintenanceQuery->whereDate('payment_date', '<=', $dateTo);
            }

            $totalMaintenance = $maintenanceQuery->sum('total_price');

            // Count members who have paid maintenance fees
            $membersWithMaintenanceFees = FinancialInvoice::where('fee_type', 'maintenance_fee')
                ->where('status', 'paid')
                ->whereIn('member_id', $memberUserIds)
                ->when($dateFrom, function($q) use ($dateFrom) {
                    return $q->whereDate('payment_date', '>=', $dateFrom);
                })
                ->when($dateTo, function($q) use ($dateTo) {
                    return $q->whereDate('payment_date', '<=', $dateTo);
                })
                ->distinct('member_id')
                ->count();

            return [
                'id' => $category->id,
                'name' => $category->name,
                'code' => $category->code ?? $category->description,
                'total_members' => $category->members->count(),
                'members_with_maintenance' => $membersWithMaintenanceFees,
                'total_maintenance_fee' => $totalMaintenance,
                'average_fee_per_member' => $membersWithMaintenanceFees > 0 ? round($totalMaintenance / $membersWithMaintenanceFees, 2) : 0,
            ];
        });

        // Calculate overall statistics
        $totalMembers = $categories->sum('total_members');
        $totalMembersWithMaintenance = $categories->sum('members_with_maintenance');
        $totalMaintenanceRevenue = $categories->sum('total_maintenance_fee');

        return Inertia::render('App/Admin/Membership/MaintenanceFeeRevenue', [
            'categories' => $categories,
            'statistics' => [
                'total_members' => $totalMembers,
                'total_members_with_maintenance' => $totalMembersWithMaintenance,
                'total_maintenance_revenue' => $totalMaintenanceRevenue,
                'average_revenue_per_member' => $totalMembersWithMaintenance > 0 ? round($totalMaintenanceRevenue / $totalMembersWithMaintenance, 2) : 0,
            ],
            'filters' => [
                'status' => $statusFilter ?? [],
                'categories' => $categoryFilter ?? [],
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
            'all_statuses' => Member::distinct()->pluck('status')->filter()->values(),
            'all_categories' => MemberCategory::select('id', 'name')->get(),
        ]);
    }

    public function pendingMaintenanceReport(Request $request)
    {
        $statusFilter = $request->input('status');
        $categoryFilter = $request->input('categories');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $memberSearch = $request->input('member_search');
        $cnicSearch = $request->input('cnic_search');
        $contactSearch = $request->input('contact_search');

        // Get all members with their categories and latest maintenance fee payments
        $query = Member::with(['memberCategory:id,name,description,subscription_fee'])
            ->select('members.*');

        // Apply member category filter
        if ($categoryFilter) {
            $query->whereIn('member_category_id', (array) $categoryFilter);
        }

        // Apply status filter
        if ($statusFilter) {
            $query->whereIn('status', (array) $statusFilter);
        }

        // Apply search filters
        if ($memberSearch) {
            $query->where(function($q) use ($memberSearch) {
                $q->where('full_name', 'like', "%{$memberSearch}%")
                  ->orWhere('membership_no', 'like', "%{$memberSearch}%");
            });
        }

        if ($cnicSearch) {
            $query->where('cnic_no', 'like', "%{$cnicSearch}%");
        }

        if ($contactSearch) {
            $query->where(function($q) use ($contactSearch) {
                $q->where('mobile_number_a', 'like', "%{$contactSearch}%")
                  ->orWhere('mobile_number_b', 'like', "%{$contactSearch}%")
                  ->orWhere('mobile_number_c', 'like', "%{$contactSearch}%");
            });
        }

        $members = $query->get()->map(function ($member) use ($dateFrom, $dateTo) {
            // Get latest maintenance fee payment for this member
            $latestPaymentQuery = FinancialInvoice::where('fee_type', 'maintenance_fee')
                ->where('member_id', $member->user_id)
                ->where('status', 'paid')
                ->orderBy('valid_to', 'desc');

            if ($dateFrom) {
                $latestPaymentQuery->whereDate('payment_date', '>=', $dateFrom);
            }
            if ($dateTo) {
                $latestPaymentQuery->whereDate('payment_date', '<=', $dateTo);
            }

            $latestPayment = $latestPaymentQuery->first();

            // Calculate pending amount (quarterly maintenance fee from member category)
            $quarterlyFee = $member->memberCategory ? $member->memberCategory->subscription_fee : 0;
            
            // Determine if member has pending maintenance
            $hasPendingMaintenance = false;
            $pendingQuarters = 0;
            $totalPendingAmount = 0;
            $lastPaymentDate = null;
            $nextDueDate = null;

            if ($latestPayment) {
                $lastPaymentDate = $latestPayment->valid_to;
                $nextDueDate = \Carbon\Carbon::parse($lastPaymentDate)->addMonths(3);
                
                // Calculate overdue quarters
                $monthsOverdue = \Carbon\Carbon::now()->diffInMonths($nextDueDate, false);
                if ($monthsOverdue > 0) {
                    $pendingQuarters = ceil($monthsOverdue / 3);
                    $totalPendingAmount = $pendingQuarters * $quarterlyFee;
                    $hasPendingMaintenance = true;
                }
            } else {
                // No payment found, calculate from joining date
                $joiningDate = \Carbon\Carbon::parse($member->created_at);
                $monthsSinceJoining = \Carbon\Carbon::now()->diffInMonths($joiningDate);
                $pendingQuarters = ceil($monthsSinceJoining / 3);
                $totalPendingAmount = $pendingQuarters * $quarterlyFee;
                $hasPendingMaintenance = $pendingQuarters > 0;
                $nextDueDate = $joiningDate->addMonths(3);
            }

            return [
                'id' => $member->id,
                'user_id' => $member->user_id,
                'membership_no' => $member->membership_no,
                'membership_date' => $member->created_at,
                'full_name' => $member->full_name,
                'contact' => $member->mobile_number_a ?? $member->mobile_number_b ?? $member->mobile_number_c,
                'cnic' => $member->cnic_no,
                'address' => $member->current_address,
                'category' => $member->memberCategory ? $member->memberCategory->name : 'N/A',
                'category_code' => $member->memberCategory ? $member->memberCategory->description : 'N/A',
                'quarterly_fee' => $quarterlyFee,
                'pending_quarters' => $pendingQuarters,
                'total_pending_amount' => $totalPendingAmount,
                'last_payment_date' => $lastPaymentDate,
                'next_due_date' => $nextDueDate,
                'status' => $member->status,
                'has_pending_maintenance' => $hasPendingMaintenance,
            ];
        })->filter(function ($member) {
            // Only return members with pending maintenance
            return $member['has_pending_maintenance'];
        })->values();

        // Calculate summary statistics
        $totalMembers = $members->count();
        $totalPendingAmount = $members->sum('total_pending_amount');
        $totalPendingQuarters = $members->sum('pending_quarters');

        // Convert to paginated collection
        $perPage = 15;
        $currentPage = $request->input('page', 1);
        $offset = ($currentPage - 1) * $perPage;
        $paginatedMembers = $members->slice($offset, $perPage)->values();
        
        // Create pagination data
        $paginationData = new \Illuminate\Pagination\LengthAwarePaginator(
            $paginatedMembers,
            $totalMembers,
            $perPage,
            $currentPage,
            [
                'path' => $request->url(),
                'pageName' => 'page',
            ]
        );
        $paginationData->withQueryString();

        return Inertia::render('App/Admin/Membership/PendingMaintenanceReport', [
            'members' => $paginationData,
            'statistics' => [
                'total_members' => $totalMembers,
                'total_pending_amount' => $totalPendingAmount,
                'total_pending_quarters' => $totalPendingQuarters,
                'average_pending_per_member' => $totalMembers > 0 ? round($totalPendingAmount / $totalMembers, 2) : 0,
            ],
            'filters' => [
                'status' => $statusFilter ?? [],
                'categories' => $categoryFilter ?? [],
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'member_search' => $memberSearch,
                'cnic_search' => $cnicSearch,
                'contact_search' => $contactSearch,
            ],
            'all_statuses' => Member::distinct()->pluck('status')->filter()->values(),
            'all_categories' => MemberCategory::select('id', 'name')->get(),
        ]);
    }

    public function supplementaryCardReport(Request $request)
    {
        $categoryFilter = $request->input('categories');
        $cardStatusFilter = $request->input('card_status');

        // Get all family members (supplementary members with parent_id)
        $query = Member::with(['memberCategory:id,name,description'])
            ->whereNotNull('parent_id')
            ->select('members.*');

        // Apply member category filter
        if ($categoryFilter) {
            $query->whereIn('member_category_id', (array) $categoryFilter);
        }

        // Apply card status filter
        if ($cardStatusFilter) {
            $query->whereIn('card_status', (array) $cardStatusFilter);
        }

        $supplementaryMembers = $query->get();

        // Calculate statistics by category
        $categoryStats = MemberCategory::select('id', 'name', 'description')
            ->get()
            ->map(function ($category) use ($supplementaryMembers) {
                $categoryMembers = $supplementaryMembers->where('member_category_id', $category->id);
                
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'code' => $category->description,
                    'total_cards_applied' => $categoryMembers->count(),
                    'issued_supplementary_members' => $categoryMembers->where('card_status', 'Issued')->count(),
                    'printed_supplementary_members' => $categoryMembers->where('card_status', 'Printed')->count(),
                    're_printed_supplementary_members' => $categoryMembers->where('card_status', 'Re-Printed')->count(),
                    'in_process' => $categoryMembers->where('card_status', 'In-Process')->count(),
                    'received' => $categoryMembers->where('card_status', 'Received')->count(),
                    'applied' => $categoryMembers->where('card_status', 'Applied')->count(),
                    'not_applied' => $categoryMembers->where('card_status', 'Not Applied')->count(),
                    'expired' => $categoryMembers->where('card_status', 'Expired')->count(),
                    'not_applicable' => $categoryMembers->where('card_status', 'Not Applicable')->count(),
                    'e_card_issued' => $categoryMembers->where('card_status', 'E-Card Issued')->count(),
                ];
            });

        // Calculate overall statistics
        $totalStats = [
            'total_cards_applied' => $supplementaryMembers->count(),
            'issued_supplementary_members' => $supplementaryMembers->where('card_status', 'Issued')->count(),
            'printed_supplementary_members' => $supplementaryMembers->where('card_status', 'Printed')->count(),
            're_printed_supplementary_members' => $supplementaryMembers->where('card_status', 'Re-Printed')->count(),
        ];

        // Get all possible card statuses
        $allCardStatuses = [
            'In-Process', 'Printed', 'Received', 'Issued', 'Applied', 
            'Re-Printed', 'Not Applied', 'Expired', 'Not Applicable', 'E-Card Issued'
        ];

        return Inertia::render('App/Admin/Membership/SupplementaryCardReport', [
            'categories' => $categoryStats,
            'supplementary_members' => $supplementaryMembers,
            'statistics' => $totalStats,
            'filters' => [
                'categories' => $categoryFilter ?? [],
                'card_status' => $cardStatusFilter ?? [],
            ],
            'all_categories' => MemberCategory::select('id', 'name')->get(),
            'all_card_statuses' => $allCardStatuses,
        ]);
    }

    public function sleepingMembersReport(Request $request)
    {
        $categoryFilter = $request->input('categories');
        $statusFilter = $request->input('status');

        // Get all primary members (members with parent_id = null)
        $query = Member::with(['memberCategory:id,name,description'])
            ->whereNull('parent_id')
            ->select('members.*');

        // Apply member category filter
        if ($categoryFilter) {
            $query->whereIn('member_category_id', (array) $categoryFilter);
        }

        // Apply status filter
        if ($statusFilter) {
            $query->whereIn('status', (array) $statusFilter);
        }

        // Get paginated results
        $primaryMembers = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        // Get all members for statistics (without pagination)
        $allPrimaryMembers = $query->orderBy('created_at', 'desc')->get();

        // Calculate statistics by category and status using all members (not paginated)
        $categoryStats = MemberCategory::select('id', 'name', 'description')
            ->get()
            ->map(function ($category) use ($allPrimaryMembers) {
                $categoryMembers = $allPrimaryMembers->where('member_category_id', $category->id);
                
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'code' => $category->description,
                    'total_members' => $categoryMembers->count(),
                    'active' => $categoryMembers->where('status', 'active')->count(),
                    'suspended' => $categoryMembers->where('status', 'suspended')->count(),
                    'cancelled' => $categoryMembers->where('status', 'cancelled')->count(),
                    'absent' => $categoryMembers->where('status', 'absent')->count(),
                    'expired' => $categoryMembers->where('status', 'expired')->count(),
                    'terminated' => $categoryMembers->where('status', 'terminated')->count(),
                    'not_assign' => $categoryMembers->where('status', 'not_assign')->count(),
                    'in_suspension_process' => $categoryMembers->where('status', 'in_suspension_process')->count(),
                ];
            });

        // Calculate overall statistics using all members (not paginated)
        $totalStats = [
            'total_members' => $allPrimaryMembers->count(),
            'active' => $allPrimaryMembers->where('status', 'active')->count(),
            'suspended' => $allPrimaryMembers->where('status', 'suspended')->count(),
            'cancelled' => $allPrimaryMembers->where('status', 'cancelled')->count(),
            'absent' => $allPrimaryMembers->where('status', 'absent')->count(),
            'expired' => $allPrimaryMembers->where('status', 'expired')->count(),
            'terminated' => $allPrimaryMembers->where('status', 'terminated')->count(),
            'not_assign' => $allPrimaryMembers->where('status', 'not_assign')->count(),
            'in_suspension_process' => $allPrimaryMembers->where('status', 'in_suspension_process')->count(),
        ];

        // Get all possible member statuses
        $allMemberStatuses = [
            'active', 'suspended', 'cancelled', 'absent', 'expired', 
            'terminated', 'not_assign', 'in_suspension_process'
        ];

        return Inertia::render('App/Admin/Membership/SleepingMembersReport', [
            'categories' => $categoryStats,
            'primary_members' => $primaryMembers,
            'statistics' => $totalStats,
            'filters' => [
                'categories' => $categoryFilter ?? [],
                'status' => $statusFilter ?? [],
            ],
            'all_categories' => MemberCategory::select('id', 'name')->get(),
            'all_member_statuses' => $allMemberStatuses,
        ]);
    }

    public function memberCardDetailReport(Request $request)
    {
        $categoryFilter = $request->input('categories');
        $cardStatusFilter = $request->input('card_status');

        // Get all primary members (members with parent_id = null)
        $query = Member::with(['memberCategory:id,name,description'])
            ->whereNull('parent_id')
            ->select('members.*');

        // Apply member category filter
        if ($categoryFilter) {
            $query->whereIn('member_category_id', (array) $categoryFilter);
        }

        // Apply card status filter
        if ($cardStatusFilter) {
            $query->whereIn('card_status', (array) $cardStatusFilter);
        }

        // Get paginated results
        $primaryMembers = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        // Get all members for statistics (without pagination)
        $allPrimaryMembers = $query->orderBy('created_at', 'desc')->get();

        // Calculate statistics by category and card status
        $categoryStats = MemberCategory::select('id', 'name', 'description')
            ->get()
            ->map(function ($category) use ($allPrimaryMembers) {
                $categoryMembers = $allPrimaryMembers->where('member_category_id', $category->id);
                
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'code' => $category->description,
                    'total_cards_applied' => $categoryMembers->count(),
                    'issued_primary_members' => $categoryMembers->where('card_status', 'Issued')->count(),
                    'printed_primary_members' => $categoryMembers->where('card_status', 'Printed')->count(),
                    're_printed_primary_members' => $categoryMembers->where('card_status', 'Re-Printed')->count(),
                    'e_card_issued_primary_members' => $categoryMembers->where('card_status', 'E-Card Issued')->count(),
                    'pending_cards' => $categoryMembers->whereIn('card_status', ['In-Process', 'Applied', 'Not Applied'])->count(),
                    'in_process' => $categoryMembers->where('card_status', 'In-Process')->count(),
                    'received' => $categoryMembers->where('card_status', 'Received')->count(),
                    'applied' => $categoryMembers->where('card_status', 'Applied')->count(),
                    'not_applied' => $categoryMembers->where('card_status', 'Not Applied')->count(),
                    'expired' => $categoryMembers->where('card_status', 'Expired')->count(),
                    'not_applicable' => $categoryMembers->where('card_status', 'Not Applicable')->count(),
                ];
            });

        // Calculate overall statistics
        $totalStats = [
            'total_cards_applied' => $allPrimaryMembers->count(),
            'issued_primary_members' => $allPrimaryMembers->where('card_status', 'Issued')->count(),
            'printed_primary_members' => $allPrimaryMembers->where('card_status', 'Printed')->count(),
            're_printed_primary_members' => $allPrimaryMembers->where('card_status', 'Re-Printed')->count(),
            'e_card_issued_primary_members' => $allPrimaryMembers->where('card_status', 'E-Card Issued')->count(),
            'pending_cards' => $allPrimaryMembers->whereIn('card_status', ['In-Process', 'Applied', 'Not Applied'])->count(),
        ];

        // Get all possible card statuses
        $allCardStatuses = [
            'In-Process', 'Printed', 'Received', 'Issued', 'Applied', 
            'Re-Printed', 'Not Applied', 'Expired', 'Not Applicable', 'E-Card Issued'
        ];

        return Inertia::render('App/Admin/Membership/MemberCardDetailReport', [
            'categories' => $categoryStats,
            'primary_members' => $primaryMembers,
            'statistics' => $totalStats,
            'filters' => [
                'categories' => $categoryFilter ?? [],
                'card_status' => $cardStatusFilter ?? [],
            ],
            'all_categories' => MemberCategory::select('id', 'name')->get(),
            'all_card_statuses' => $allCardStatuses,
        ]);
    }

    public function monthlyMaintenanceFeeReport(Request $request)
    {
        $memberSearch = $request->input('member_search');
        $invoiceSearch = $request->input('invoice_search');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $cityFilter = $request->input('city');
        $paymentMethodFilter = $request->input('payment_method');
        $categoryFilter = $request->input('categories');
        $genderFilter = $request->input('gender');

        // Get maintenance fee transactions
        $query = FinancialInvoice::with(['member.memberCategory'])
            ->where('fee_type', 'maintenance_fee')
            ->select('financial_invoices.*');

        // Apply member search filter
        if ($memberSearch) {
            $query->whereHas('member', function($q) use ($memberSearch) {
                $q->where('full_name', 'like', "%{$memberSearch}%")
                  ->orWhere('membership_no', 'like', "%{$memberSearch}%");
            });
        }

        // Apply invoice search filter
        if ($invoiceSearch) {
            $query->where('invoice_no', 'like', "%{$invoiceSearch}%");
        }

        // Apply date range filter
        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        // Apply city filter
        if ($cityFilter) {
            $query->whereHas('member', function($q) use ($cityFilter) {
                $q->where('current_city', $cityFilter);
            });
        }

        // Apply payment method filter
        if ($paymentMethodFilter) {
            $query->where('payment_method', $paymentMethodFilter);
        }

        // Apply category filter
        if ($categoryFilter) {
            $query->whereHas('member', function($q) use ($categoryFilter) {
                $q->whereIn('member_category_id', (array) $categoryFilter);
            });
        }

        // Apply gender filter
        if ($genderFilter) {
            $query->whereHas('member', function($q) use ($genderFilter) {
                $q->where('gender', $genderFilter);
            });
        }

        // Get paginated results
        $transactions = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        // Calculate statistics
        $allTransactions = $query->get();
        $totalAmount = $allTransactions->sum('total_price');
        $totalTransactions = $allTransactions->count();
        $averageAmount = $totalTransactions > 0 ? round($totalAmount / $totalTransactions, 2) : 0;

        // Get filter options
        $allCities = Member::distinct()->pluck('current_city')->filter()->values();
        $allPaymentMethods = ['Cash', 'Credit Card', 'Bank Transfer', 'Cheque'];
        $allGenders = ['Male', 'Female'];

        return Inertia::render('App/Admin/Membership/MonthlyMaintenanceFeeReport', [
            'transactions' => $transactions,
            'statistics' => [
                'total_amount' => $totalAmount,
                'total_transactions' => $totalTransactions,
                'average_amount' => $averageAmount,
            ],
            'filters' => [
                'member_search' => $memberSearch,
                'invoice_search' => $invoiceSearch,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'city' => $cityFilter,
                'payment_method' => $paymentMethodFilter,
                'categories' => $categoryFilter ?? [],
                'gender' => $genderFilter,
            ],
            'all_cities' => $allCities,
            'all_payment_methods' => $allPaymentMethods,
            'all_categories' => MemberCategory::select('id', 'name')->get(),
            'all_genders' => $allGenders,
        ]);
    }

    public function newYearEveReport(Request $request)
    {
        $memberSearch = $request->input('member_search');
        $invoiceSearch = $request->input('invoice_search');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $cityFilter = $request->input('city');
        $paymentMethodFilter = $request->input('payment_method');
        $categoryFilter = $request->input('categories');
        $genderFilter = $request->input('gender');

        // Get all fee transactions (membership, maintenance, and reinstating)
        $query = FinancialInvoice::with(['member.memberCategory'])
            ->whereIn('fee_type', ['maintenance_fee', 'membership_fee', 'reinstating_fee'])
            ->select('financial_invoices.*');

        // Apply member search filter
        if ($memberSearch) {
            $query->whereHas('member', function($q) use ($memberSearch) {
                $q->where('full_name', 'like', "%{$memberSearch}%")
                  ->orWhere('membership_no', 'like', "%{$memberSearch}%");
            });
        }

        // Apply invoice search filter
        if ($invoiceSearch) {
            $query->where('invoice_no', 'like', "%{$invoiceSearch}%");
        }

        // Apply date range filter
        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        // Apply city filter
        if ($cityFilter) {
            $query->whereHas('member', function($q) use ($cityFilter) {
                $q->where('current_city', $cityFilter);
            });
        }

        // Apply payment method filter
        if ($paymentMethodFilter) {
            $query->where('payment_method', $paymentMethodFilter);
        }

        // Apply category filter
        if ($categoryFilter) {
            $query->whereHas('member', function($q) use ($categoryFilter) {
                $q->whereIn('member_category_id', (array) $categoryFilter);
            });
        }

        // Apply gender filter
        if ($genderFilter) {
            $query->whereHas('member', function($q) use ($genderFilter) {
                $q->where('gender', $genderFilter);
            });
        }

        // Get paginated results
        $transactions = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        // Calculate statistics
        $allTransactions = $query->get();
        $totalAmount = $allTransactions->sum('total_price');
        $totalTransactions = $allTransactions->count();
        $averageAmount = $totalTransactions > 0 ? round($totalAmount / $totalTransactions, 2) : 0;

        // Get filter options
        $allCities = Member::distinct()->pluck('current_city')->filter()->values();
        $allPaymentMethods = ['Cash', 'Credit Card', 'Bank Transfer', 'Cheque'];
        $allGenders = ['Male', 'Female'];

        return Inertia::render('App/Admin/Membership/NewYearEveReport', [
            'transactions' => $transactions,
            'statistics' => [
                'total_amount' => $totalAmount,
                'total_transactions' => $totalTransactions,
                'average_amount' => $averageAmount,
            ],
            'filters' => [
                'member_search' => $memberSearch,
                'invoice_search' => $invoiceSearch,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'city' => $cityFilter,
                'payment_method' => $paymentMethodFilter,
                'categories' => $categoryFilter ?? [],
                'gender' => $genderFilter,
            ],
            'all_cities' => $allCities,
            'all_payment_methods' => $allPaymentMethods,
            'all_categories' => MemberCategory::select('id', 'name')->get(),
            'all_genders' => $allGenders,
        ]);
    }

    public function reinstatingFeeReport(Request $request)
    {
        $memberSearch = $request->input('member_search');
        $invoiceSearch = $request->input('invoice_search');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $cityFilter = $request->input('city');
        $paymentMethodFilter = $request->input('payment_method');
        $categoryFilter = $request->input('categories');
        $genderFilter = $request->input('gender');

        // Get reinstating fee transactions only
        $query = FinancialInvoice::with(['member.memberCategory'])
            ->where('fee_type', 'reinstating_fee')
            ->select('financial_invoices.*');

        // Apply member search filter
        if ($memberSearch) {
            $query->whereHas('member', function($q) use ($memberSearch) {
                $q->where('full_name', 'like', "%{$memberSearch}%")
                  ->orWhere('membership_no', 'like', "%{$memberSearch}%");
            });
        }

        // Apply invoice search filter
        if ($invoiceSearch) {
            $query->where('invoice_no', 'like', "%{$invoiceSearch}%");
        }

        // Apply date range filter
        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        // Apply city filter
        if ($cityFilter) {
            $query->whereHas('member', function($q) use ($cityFilter) {
                $q->where('current_city', $cityFilter);
            });
        }

        // Apply payment method filter
        if ($paymentMethodFilter) {
            $query->where('payment_method', $paymentMethodFilter);
        }

        // Apply category filter
        if ($categoryFilter) {
            $query->whereHas('member', function($q) use ($categoryFilter) {
                $q->whereIn('member_category_id', (array) $categoryFilter);
            });
        }

        // Apply gender filter
        if ($genderFilter) {
            $query->whereHas('member', function($q) use ($genderFilter) {
                $q->where('gender', $genderFilter);
            });
        }

        // Get paginated results
        $transactions = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        // Calculate statistics
        $allTransactions = $query->get();
        $totalAmount = $allTransactions->sum('total_price');
        $totalTransactions = $allTransactions->count();
        $averageAmount = $totalTransactions > 0 ? round($totalAmount / $totalTransactions, 2) : 0;

        // Get filter options
        $allCities = Member::distinct()->pluck('current_city')->filter()->values();
        $allPaymentMethods = ['Cash', 'Credit Card', 'Bank Transfer', 'Cheque', 'Online'];
        $allGenders = ['Male', 'Female'];

        return Inertia::render('App/Admin/Membership/ReinstatingFeeReport', [
            'transactions' => $transactions,
            'statistics' => [
                'total_amount' => $totalAmount,
                'total_transactions' => $totalTransactions,
                'average_amount' => $averageAmount,
            ],
            'filters' => [
                'member_search' => $memberSearch,
                'invoice_search' => $invoiceSearch,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'city' => $cityFilter,
                'payment_method' => $paymentMethodFilter,
                'categories' => $categoryFilter ?? [],
                'gender' => $genderFilter,
            ],
            'all_cities' => $allCities,
            'all_payment_methods' => $allPaymentMethods,
            'all_categories' => MemberCategory::select('id', 'name')->get(),
            'all_genders' => $allGenders,
        ]);
    }

    public function sportsSubscriptionsReport(Request $request)
    {
        $memberSearch = $request->input('member_search');
        $invoiceSearch = $request->input('invoice_search');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $cityFilter = $request->input('city');
        $paymentMethodFilter = $request->input('payment_method');
        $categoryFilter = $request->input('categories');
        $genderFilter = $request->input('gender');
        $familyMemberFilter = $request->input('family_member');

        // Get subscription fee transactions only
        $query = FinancialInvoice::with(['member.memberCategory'])
            ->where('fee_type', 'subscription_fee')
            ->select('financial_invoices.*');

        // Apply member search filter
        if ($memberSearch) {
            $query->whereHas('member', function($q) use ($memberSearch) {
                $q->where('full_name', 'like', "%{$memberSearch}%")
                  ->orWhere('membership_no', 'like', "%{$memberSearch}%");
            });
        }

        // Apply invoice search filter
        if ($invoiceSearch) {
            $query->where('invoice_no', 'like', "%{$invoiceSearch}%");
        }

        // Apply date range filter
        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        // Apply city filter
        if ($cityFilter) {
            $query->whereHas('member', function($q) use ($cityFilter) {
                $q->where('current_city', $cityFilter);
            });
        }

        // Apply payment method filter
        if ($paymentMethodFilter) {
            $query->where('payment_method', $paymentMethodFilter);
        }

        // Apply category filter
        if ($categoryFilter) {
            $query->whereHas('member', function($q) use ($categoryFilter) {
                $q->whereIn('member_category_id', (array) $categoryFilter);
            });
        }

        // Apply gender filter
        if ($genderFilter) {
            $query->whereHas('member', function($q) use ($genderFilter) {
                $q->where('gender', $genderFilter);
            });
        }

        // Apply family member filter
        if ($familyMemberFilter) {
            $query->whereJsonContains('data->family_member_relation', $familyMemberFilter);
        }

        // Get paginated results
        $transactions = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        // Calculate statistics
        $allTransactions = $query->get();
        $totalAmount = $allTransactions->sum('total_price');
        $totalTransactions = $allTransactions->count();
        $averageAmount = $totalTransactions > 0 ? round($totalAmount / $totalTransactions, 2) : 0;

        // Get filter options
        $allCities = Member::distinct()->pluck('current_city')->filter()->values();
        $allPaymentMethods = ['Cash', 'Credit Card', 'Bank Transfer', 'Cheque'];
        $allGenders = ['Male', 'Female'];
        $allFamilyMembers = ['SELF', 'Father', 'Son', 'Daughter', 'Wife', 'Mother', 'Grand Son', 'Grand Daughter', 'Second Wife', 'Husband', 'Sister', 'Brother', 'Nephew', 'Niece', 'Father in law', 'Mother in Law'];

        return Inertia::render('App/Admin/Membership/SportsSubscriptionsReport', [
            'transactions' => $transactions,
            'statistics' => [
                'total_amount' => $totalAmount,
                'total_transactions' => $totalTransactions,
                'average_amount' => $averageAmount,
            ],
            'filters' => [
                'member_search' => $memberSearch,
                'invoice_search' => $invoiceSearch,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'city' => $cityFilter,
                'payment_method' => $paymentMethodFilter,
                'categories' => $categoryFilter ?? [],
                'gender' => $genderFilter,
                'family_member' => $familyMemberFilter,
            ],
            'all_cities' => $allCities,
            'all_payment_methods' => $allPaymentMethods,
            'all_categories' => MemberCategory::select('id', 'name')->get(),
            'all_genders' => $allGenders,
            'all_family_members' => $allFamilyMembers,
        ]);
    }

    public function subscriptionsMaintenanceSummary(Request $request)
    {
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $categoryFilter = $request->input('category');

        // Base query for subscription and maintenance fees
        $query = FinancialInvoice::with(['member.memberCategory'])
            ->whereIn('fee_type', ['subscription_fee', 'maintenance_fee'])
            ->where('status', 'paid');

        // Apply date range filter
        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        // Apply category filter
        if ($categoryFilter) {
            $query->whereHas('member', function($q) use ($categoryFilter) {
                $q->where('member_category_id', $categoryFilter);
            });
        }

        $transactions = $query->get();

        // Group by category and payment method
        $summary = [];
        $grandTotals = [
            'cash' => 0,
            'credit_card' => 0,
            'bank_online' => 0,
            'total' => 0
        ];

        foreach ($transactions as $transaction) {
            $categoryName = $transaction->member->memberCategory->name ?? 'Unknown';
            $paymentMethod = strtolower($transaction->payment_method);
            $amount = $transaction->total_price;

            // Initialize category if not exists
            if (!isset($summary[$categoryName])) {
                $summary[$categoryName] = [
                    'cash' => 0,
                    'credit_card' => 0,
                    'bank_online' => 0,
                    'total' => 0
                ];
            }

            // Map payment methods
            if ($paymentMethod === 'cash') {
                $summary[$categoryName]['cash'] += $amount;
                $grandTotals['cash'] += $amount;
            } elseif ($paymentMethod === 'credit card') {
                $summary[$categoryName]['credit_card'] += $amount;
                $grandTotals['credit_card'] += $amount;
            } else {
                // Bank Transfer, Online, etc.
                $summary[$categoryName]['bank_online'] += $amount;
                $grandTotals['bank_online'] += $amount;
            }

            $summary[$categoryName]['total'] += $amount;
            $grandTotals['total'] += $amount;
        }

        // Get all categories for filter
        $allCategories = MemberCategory::select('id', 'name')->get();

        return Inertia::render('App/Admin/Membership/SubscriptionsMaintenanceSummary', [
            'summary' => $summary,
            'grand_totals' => $grandTotals,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'category' => $categoryFilter,
            ],
            'all_categories' => $allCategories,
        ]);
    }

    public function pendingMaintenanceQuartersReport(Request $request)
    {
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $categoryFilter = $request->input('category');

        // Get all members with their categories
        $membersQuery = Member::with(['memberCategory'])
            ->where('status', 'active'); // Only active members

        // Apply category filter
        if ($categoryFilter) {
            $membersQuery->where('member_category_id', $categoryFilter);
        }

        $members = $membersQuery->get();

        // Initialize summary structure
        $summary = [];
        $grandTotals = [
            '1_quarter_pending' => 0,
            '2_quarters_pending' => 0,
            '3_quarters_pending' => 0,
            '4_quarters_pending' => 0,
            '5_quarters_pending' => 0,
            'more_than_5_quarters_pending' => 0,
            'maintenance_fee_quarterly' => 0,
            'total_values' => 0
        ];

        foreach ($members as $member) {
            $categoryName = $member->memberCategory->name ?? 'Unknown';
            
            // Initialize category if not exists
            if (!isset($summary[$categoryName])) {
                $summary[$categoryName] = [
                    '1_quarter_pending' => 0,
                    '2_quarters_pending' => 0,
                    '3_quarters_pending' => 0,
                    '4_quarters_pending' => 0,
                    '5_quarters_pending' => 0,
                    'more_than_5_quarters_pending' => 0,
                    'maintenance_fee_quarterly' => $member->memberCategory->subscription_fee ?? 0,
                    'total_values' => 0
                ];
            }

            // Calculate pending quarters for this member
            $pendingQuarters = $this->calculatePendingQuarters($member, $dateFrom, $dateTo);
            
            if ($pendingQuarters > 0) {
                if ($pendingQuarters == 1) {
                    $summary[$categoryName]['1_quarter_pending']++;
                    $grandTotals['1_quarter_pending']++;
                } elseif ($pendingQuarters == 2) {
                    $summary[$categoryName]['2_quarters_pending']++;
                    $grandTotals['2_quarters_pending']++;
                } elseif ($pendingQuarters == 3) {
                    $summary[$categoryName]['3_quarters_pending']++;
                    $grandTotals['3_quarters_pending']++;
                } elseif ($pendingQuarters == 4) {
                    $summary[$categoryName]['4_quarters_pending']++;
                    $grandTotals['4_quarters_pending']++;
                } elseif ($pendingQuarters == 5) {
                    $summary[$categoryName]['5_quarters_pending']++;
                    $grandTotals['5_quarters_pending']++;
                } else {
                    $summary[$categoryName]['more_than_5_quarters_pending']++;
                    $grandTotals['more_than_5_quarters_pending']++;
                }

                // Calculate total pending amount for this member
                $quarterlyFee = $member->memberCategory->subscription_fee ?? 0;
                $totalPendingAmount = $pendingQuarters * $quarterlyFee;
                $summary[$categoryName]['total_values'] += $totalPendingAmount;
                $grandTotals['total_values'] += $totalPendingAmount;
            }
        }

        // Set maintenance fee quarterly for grand totals (average or most common)
        if (!empty($summary)) {
            $fees = array_column($summary, 'maintenance_fee_quarterly');
            $grandTotals['maintenance_fee_quarterly'] = array_sum($fees) / count($fees);
        }

        // Get all categories for filter
        $allCategories = MemberCategory::select('id', 'name')->get();

        return Inertia::render('App/Admin/Membership/PendingMaintenanceQuartersReport', [
            'summary' => $summary,
            'grand_totals' => $grandTotals,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'category' => $categoryFilter,
            ],
            'all_categories' => $allCategories,
        ]);
    }

    private function calculatePendingQuarters($member, $dateFrom = null, $dateTo = null)
    {
        // Get member's maintenance fee transactions
        $query = FinancialInvoice::where('member_id', $member->user_id)
            ->where('fee_type', 'maintenance_fee')
            ->where('status', 'paid');

        // Apply date filters if provided
        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $paidTransactions = $query->get();

        // Calculate quarters since membership started
        $membershipDate = \Carbon\Carbon::parse($member->membership_date);
        $currentDate = now();
        $quartersSinceMembership = $membershipDate->diffInMonths($currentDate) / 3;
        $totalQuartersExpected = floor($quartersSinceMembership);

        // Count paid quarters
        $paidQuarters = $paidTransactions->count();

        // Calculate pending quarters
        $pendingQuarters = max(0, $totalQuartersExpected - $paidQuarters);

        return min($pendingQuarters, 10); // Cap at 10 for display purposes
    }

    public function reportsIndex()
    {
        $reports = [
            [
                'id' => 1,
                'title' => 'Maintenance Fee Revenue',
                'description' => 'View maintenance fee revenue by member categories with payment statistics',
                'icon' => 'AttachMoney',
                'color' => '#059669',
                'route' => 'membership.maintanance-fee-revenue',
                'stats' => 'Revenue Analysis'
            ],
            [
                'id' => 2,
                'title' => 'Pending Maintenance Report',
                'description' => 'Track members with pending maintenance fee payments',
                'icon' => 'Schedule',
                'color' => '#dc2626',
                'route' => 'membership.pending-maintenance-report',
                'stats' => 'Payment Tracking'
            ],
            [
                'id' => 3,
                'title' => 'Monthly Maintenance Fee Report',
                'description' => 'Monthly breakdown of maintenance fee transactions',
                'icon' => 'CalendarMonth',
                'color' => '#0ea5e9',
                'route' => 'membership.monthly-maintenance-fee-report',
                'stats' => 'Monthly Analysis'
            ],
            [
                'id' => 4,
                'title' => 'Sports Subscriptions Report',
                'description' => 'Track sports facility subscriptions and family member usage',
                'icon' => 'FitnessCenter',
                'color' => '#8b5cf6',
                'route' => 'membership.sports-subscriptions-report',
                'stats' => 'Sports Analytics'
            ],
            [
                'id' => 5,
                'title' => 'New Year Eve Report',
                'description' => 'Special event fee collections and member participation',
                'icon' => 'Celebration',
                'color' => '#f59e0b',
                'route' => 'membership.new-year-eve-report',
                'stats' => 'Event Revenue'
            ],
            [
                'id' => 6,
                'title' => 'Reinstating Fee Report',
                'description' => 'Track member reactivation fees and reinstatement process',
                'icon' => 'Refresh',
                'color' => '#10b981',
                'route' => 'membership.reinstating-fee-report',
                'stats' => 'Reactivation Tracking'
            ],
            [
                'id' => 7,
                'title' => 'Subscriptions & Maintenance Summary',
                'description' => 'Category-wise revenue summary by payment methods',
                'icon' => 'Assessment',
                'color' => '#6366f1',
                'route' => 'membership.subscriptions-maintenance-summary',
                'stats' => 'Revenue Summary'
            ],
            [
                'id' => 8,
                'title' => 'Pending Maintenance Quarters Report',
                'description' => 'Quarter-wise analysis of pending maintenance payments',
                'icon' => 'Timeline',
                'color' => '#ef4444',
                'route' => 'membership.pending-maintenance-quarters-report',
                'stats' => 'Quarter Analysis'
            ],
            [
                'id' => 9,
                'title' => 'Supplementary Card Report',
                'description' => 'Track supplementary membership cards and family members',
                'icon' => 'CreditCard',
                'color' => '#06b6d4',
                'route' => 'membership.supplementary-card-report',
                'stats' => 'Card Management'
            ],
            [
                'id' => 10,
                'title' => 'Sleeping Members Report',
                'description' => 'Identify inactive members and dormant accounts',
                'icon' => 'PersonOff',
                'color' => '#64748b',
                'route' => 'membership.sleeping-members-report',
                'stats' => 'Member Activity'
            ],
            [
                'id' => 11,
                'title' => 'Member Card Detail Report',
                'description' => 'Detailed member card information and status tracking',
                'icon' => 'Badge',
                'color' => '#7c3aed',
                'route' => 'membership.member-card-detail-report',
                'stats' => 'Card Details'
            ]
        ];

        return Inertia::render('App/Admin/Membership/ReportsIndex', [
            'reports' => $reports
        ]);
    }
}
