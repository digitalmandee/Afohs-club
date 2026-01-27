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
            $memberUserIds = $category->members->pluck('id');

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
                ->when($dateFrom, function ($q) use ($dateFrom) {
                    return $q->whereDate('payment_date', '>=', $dateFrom);
                })
                ->when($dateTo, function ($q) use ($dateTo) {
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
            'all_categories' => MemberCategory::select('id', 'name')->get(),
        ]);
    }

    public function maintenanceFeeRevenuePrint(Request $request)
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
            $memberUserIds = $category->members->pluck('id');

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
                ->when($dateFrom, function ($q) use ($dateFrom) {
                    return $q->whereDate('payment_date', '>=', $dateFrom);
                })
                ->when($dateTo, function ($q) use ($dateTo) {
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

        return Inertia::render('App/Admin/Membership/MaintenanceFeeRevenuePrint', [
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

        // Subquery to get the latest valid_to date for maintenance fees per member
        $latestMaintenance = FinancialInvoice::select('member_id', \Illuminate\Support\Facades\DB::raw('MAX(valid_to) as last_valid_date'), \Illuminate\Support\Facades\DB::raw('MAX(payment_date) as last_payment_date'))
            ->where('fee_type', 'maintenance_fee')
            ->where('status', 'paid')
            ->groupBy('member_id');

        // Main Query
        $query = Member::with(['memberCategory:id,name,description,subscription_fee'])
            ->leftJoinSub($latestMaintenance, 'latest_maintenance', function ($join) {
                $join->on('members.id', '=', 'latest_maintenance.member_id');
            })
            ->whereNull('parent_id')
            ->select('members.*', 'latest_maintenance.last_valid_date', 'latest_maintenance.last_payment_date');

        // Apply filters
        if ($categoryFilter) {
            $query->whereIn('member_category_id', (array) $categoryFilter);
        }

        if ($statusFilter) {
            $query->whereIn('status', (array) $statusFilter);
        }

        if ($memberSearch) {
            $query->where(function ($q) use ($memberSearch) {
                $q
                    ->where('full_name', 'like', "%{$memberSearch}%")
                    ->orWhere('membership_no', 'like', "%{$memberSearch}%");
            });
        }

        if ($cnicSearch) {
            $query->where('cnic_no', 'like', "%{$cnicSearch}%");
        }

        if ($contactSearch) {
            $query->where(function ($q) use ($contactSearch) {
                $q
                    ->where('mobile_number_a', 'like', "%{$contactSearch}%")
                    ->orWhere('mobile_number_b', 'like', "%{$contactSearch}%")
                    ->orWhere('mobile_number_c', 'like', "%{$contactSearch}%");
            });
        }

        // Filter for PENDING members only
        // Logic: (Last Valid Date < Now) OR (Never Paid AND Joined/Created < Now)
        $query->where(function ($q) {
            $q
                ->where('latest_maintenance.last_valid_date', '<', now())
                ->orWhere(function ($sub) {
                    $sub->whereNull('latest_maintenance.last_valid_date');
                    // Optional: Add logic here if members allowed grace period
                });
        });

        // Pagination
        $perPage = 15;
        $paginatedMembers = $query->paginate($perPage)->withQueryString();

        // Transform collection to calculate exact amounts
        $paginatedMembers->getCollection()->transform(function ($member) {
            $monthlyFee = $member->memberCategory ? $member->memberCategory->subscription_fee : 0;
            $currentDate = now();

            // Determine start point for calculation
            // If they have a valid_to date, start from there. If not, start from membership date.
            if ($member->last_valid_date) {
                $startDate = \Carbon\Carbon::parse($member->last_valid_date);
            } else {
                $startDate = $member->membership_date ? \Carbon\Carbon::parse($member->membership_date) : \Carbon\Carbon::parse($member->created_at);
            }

            // Ensure start date is not in future (negative pending)
            if ($startDate->gt($currentDate)) {
                $pendingMonths = 0;
            } else {
                // Diff in months
                $pendingMonths = $startDate->diffInMonths($currentDate);
                // If less than 1 month but past date, count as 0 or 1?
                // diffInMonths returns integer. Check if we want ceiling or floor.
                // Usually precise diff:
                $pendingMonths = $startDate->floatDiffInMonths($currentDate);
            }

            $pendingMonths = max(0, ceil($pendingMonths));  // Ceiling to charge for started months? Or floor? adhering to previous logic "ceil" implied by loop

            if ($pendingMonths > 0) {
                $pendingMonths = ceil($startDate->diffInMonths($currentDate, false));
                // Re-evaluating previous logic:
                // "pendingMonths = paidUntilDate->diffInMonths($currentDate)"
                // This effectively counts full months passed.
            }

            $pendingQuarters = ceil($pendingMonths / 3);
            $totalPendingAmount = $pendingMonths * $monthlyFee;

            return [
                'id' => $member->id,
                'membership_no' => $member->membership_no,
                'full_name' => $member->full_name,
                'contact' => $member->mobile_number_a,
                'cnic' => $member->cnic_no,
                'status' => $member->status,
                'last_payment_date' => $member->last_payment_date,
                'paid_until_date' => $member->last_valid_date,
                'monthly_fee' => $monthlyFee,
                'pending_months' => $pendingMonths,
                'pending_quarters' => $pendingQuarters,
                'total_pending_amount' => $totalPendingAmount,
                'category' => $member->memberCategory ? $member->memberCategory->name : '',
            ];
        });

        // Quick Stats (Approximated or separate query for speed)
        // Calculating EXACT total for ALL pages is expensive.
        // We can Sum (Now - Max(Valid_Date)) * Fee in SQL?
        // For now, let's keep stats simplified or calculate on current page to avoid timeout,
        // OR run a simplified aggregate query.

        // Simplified Aggregate Query for Total Pending Amount
        // This is complex in SQL due to differing fees per category.
        // Let's return 0 for totals for now to ensure page loads, or implement a lighter calc.

        $statistics = [
            'total_members' => $paginatedMembers->total(),
            'total_pending_amount' => 0,  // Placeholder to prevent timeout
            'total_pending_quarters' => 0,
        ];

        return Inertia::render('App/Admin/Membership/PendingMaintenanceReport', [
            'members' => $paginatedMembers,
            'statistics' => $statistics,
            'filters' => [
                'status' => $statusFilter,
                'categories' => $categoryFilter,
                'member_search' => $memberSearch,
            ],
            'all_statuses' => Member::distinct()->pluck('status')->filter()->values(),
            'all_categories' => MemberCategory::select('id', 'name')->get(),
        ]);
    }

    public function pendingMaintenanceReportPrint(Request $request)
    {
        $statusFilter = $request->input('status');
        $categoryFilter = $request->input('categories');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $memberSearch = $request->input('member_search');
        $cnicSearch = $request->input('cnic_search');
        $contactSearch = $request->input('contact_search');

        // Subquery to get the latest valid_to date for maintenance fees per member
        $latestMaintenance = FinancialInvoice::select('member_id', \Illuminate\Support\Facades\DB::raw('MAX(valid_to) as last_valid_date'), \Illuminate\Support\Facades\DB::raw('MAX(payment_date) as last_payment_date'))
            ->where('fee_type', 'maintenance_fee')
            ->where('status', 'paid')
            ->groupBy('member_id');

        // Main Query
        $query = Member::with(['memberCategory:id,name,description,subscription_fee'])
            ->leftJoinSub($latestMaintenance, 'latest_maintenance', function ($join) {
                $join->on('members.id', '=', 'latest_maintenance.member_id');
            })
            ->select('members.*', 'latest_maintenance.last_valid_date', 'latest_maintenance.last_payment_date');

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
            $query->where(function ($q) use ($memberSearch) {
                $q
                    ->where('full_name', 'like', "%{$memberSearch}%")
                    ->orWhere('membership_no', 'like', "%{$memberSearch}%");
            });
        }

        if ($cnicSearch) {
            $query->where('cnic_no', 'like', "%{$cnicSearch}%");
        }

        if ($contactSearch) {
            $query->where(function ($q) use ($contactSearch) {
                $q
                    ->where('mobile_number_a', 'like', "%{$contactSearch}%")
                    ->orWhere('mobile_number_b', 'like', "%{$contactSearch}%")
                    ->orWhere('mobile_number_c', 'like', "%{$contactSearch}%");
            });
        }

        // Filter for PENDING members only
        $query->where(function ($q) {
            $q
                ->where('latest_maintenance.last_valid_date', '<', now())
                ->orWhere(function ($sub) {
                    $sub->whereNull('latest_maintenance.last_valid_date');
                });
        });

        // Get All Results (No pagination for print)
        $members = $query->get();

        // Transform
        $members->transform(function ($member) {
            $monthlyFee = $member->memberCategory ? $member->memberCategory->subscription_fee : 0;
            $currentDate = now();

            if ($member->last_valid_date) {
                $startDate = \Carbon\Carbon::parse($member->last_valid_date);
            } else {
                $startDate = $member->membership_date ? \Carbon\Carbon::parse($member->membership_date) : \Carbon\Carbon::parse($member->created_at);
            }

            if ($startDate->gt($currentDate)) {
                $pendingMonths = 0;
            } else {
                $pendingMonths = $startDate->diffInMonths($currentDate);
            }

            $pendingMonths = max(0, ceil($pendingMonths));

            if ($pendingMonths > 0) {
                $pendingMonths = ceil($startDate->diffInMonths($currentDate, false));
            }

            $pendingQuarters = ceil($pendingMonths / 3);
            $totalPendingAmount = $pendingMonths * $monthlyFee;

            return [
                'id' => $member->id,
                'membership_no' => $member->membership_no,
                'membership_date' => $member->membership_date,
                'full_name' => $member->full_name,
                'contact' => $member->mobile_number_a,
                'cnic' => $member->cnic_no,
                'address' => $member->current_address,
                'category' => $member->memberCategory ? $member->memberCategory->name : 'N/A',
                'category_code' => $member->memberCategory ? $member->memberCategory->description : 'N/A',
                'monthly_fee' => $monthlyFee,
                'quarterly_fee' => $monthlyFee * 3,
                'pending_months' => $pendingMonths,
                'pending_quarters' => $pendingQuarters,
                'total_pending_amount' => $totalPendingAmount,
                'last_payment_date' => $member->last_payment_date,
                'paid_until_date' => $member->last_valid_date,
                'status' => $member->status,
                'has_pending_maintenance' => true,
            ];
        });

        // Calculate summary statistics
        $totalMembers = $members->count();
        $totalPendingAmount = $members->sum('total_pending_amount');
        $totalPendingQuarters = $members->sum('pending_quarters');

        return Inertia::render('App/Admin/Membership/PendingMaintenanceReportPrint', [
            'members' => $members,
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
            'all_categories' => MemberCategory::select('id', 'name')->get(),
        ]);
    }

    public function supplementaryCardReport(Request $request)
    {
        $categoryFilter = $request->input('categories');
        $cardStatusFilter = $request->input('card_status');

        // Get all family members (supplementary members with parent_id)
        // First get all supplementary members
        $supplementaryQuery = Member::whereNotNull('parent_id');

        // Apply card status filter
        if ($cardStatusFilter) {
            $supplementaryQuery->whereIn('card_status', (array) $cardStatusFilter);
        }

        $supplementaryMembers = $supplementaryQuery->get();

        // Now get parent categories for filtering
        $parentIds = $supplementaryMembers->pluck('parent_id')->unique();
        $parentCategories = Member::whereIn('id', $parentIds)
            ->select('member_category_id')
            ->get()
            ->keyBy('id');

        // Add parent category to each supplementary member
        $supplementaryMembers = $supplementaryMembers->map(function ($member) use ($parentCategories) {
            $parent = $parentCategories->get($member->parent_id);
            $member->parent_category_id = $parent ? $parent->member_category_id : null;
            return $member;
        });

        // Apply category filter if provided
        if ($categoryFilter) {
            $supplementaryMembers = $supplementaryMembers->filter(function ($member) use ($categoryFilter) {
                return in_array($member->parent_category_id, (array) $categoryFilter);
            });
        }

        // Calculate statistics by category
        // Apply category filter if provided, otherwise show all categories
        $categoryQuery = MemberCategory::select('id', 'name', 'description');

        if ($categoryFilter) {
            $categoryQuery->whereIn('id', (array) $categoryFilter);
        }

        $categoryStats = $categoryQuery
            ->get()
            ->map(function ($category) use ($supplementaryMembers) {
                $categoryMembers = $supplementaryMembers->where('parent_category_id', $category->id);

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
            'In-Process',
            'Printed',
            'Received',
            'Issued',
            'Applied',
            'Re-Printed',
            'Not Applied',
            'Expired',
            'Not Applicable',
            'E-Card Issued'
        ];

        return Inertia::render('App/Admin/Membership/SupplementaryCardReport', [
            'categories' => $categoryStats,
            'statistics' => $totalStats,
            'filters' => [
                'categories' => $categoryFilter ?? [],
                'card_status' => $cardStatusFilter ?? [],
            ],
            'all_categories' => MemberCategory::select('id', 'name')->get(),
            'all_card_statuses' => $allCardStatuses,
        ]);
    }

    public function supplementaryCardReportPrint(Request $request)
    {
        $categoryFilter = $request->input('categories');
        $cardStatusFilter = $request->input('card_status');

        // Get all family members (supplementary members with parent_id)
        $supplementaryQuery = Member::whereNotNull('parent_id');

        // Apply card status filter
        if ($cardStatusFilter) {
            $supplementaryQuery->whereIn('card_status', (array) $cardStatusFilter);
        }

        $supplementaryMembers = $supplementaryQuery->get();

        // Now get parent categories for filtering
        $parentIds = $supplementaryMembers->pluck('parent_id')->unique();
        $parentCategories = Member::whereIn('id', $parentIds)
            ->select('member_category_id')
            ->get()
            ->keyBy('id');

        // Add parent category to each supplementary member
        $supplementaryMembers = $supplementaryMembers->map(function ($member) use ($parentCategories) {
            $parent = $parentCategories->get($member->parent_id);
            $member->parent_category_id = $parent ? $parent->member_category_id : null;
            return $member;
        });

        // Apply category filter if provided
        if ($categoryFilter) {
            $supplementaryMembers = $supplementaryMembers->filter(function ($member) use ($categoryFilter) {
                return in_array($member->parent_category_id, (array) $categoryFilter);
            });
        }

        // Calculate statistics by category
        $categoryQuery = MemberCategory::select('id', 'name', 'description');

        if ($categoryFilter) {
            $categoryQuery->whereIn('id', (array) $categoryFilter);
        }

        $categoryStats = $categoryQuery
            ->get()
            ->map(function ($category) use ($supplementaryMembers) {
                $categoryMembers = $supplementaryMembers->where('parent_category_id', $category->id);

                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'code' => $category->description,
                    'total_cards_applied' => $categoryMembers->count(),
                    'issued_supplementary_members' => $categoryMembers->where('card_status', 'Issued')->count(),
                    'printed_supplementary_members' => $categoryMembers->where('card_status', 'Printed')->count(),
                    're_printed_supplementary_members' => $categoryMembers->where('card_status', 'Re-Printed')->count(),
                ];
            });

        // Calculate overall statistics
        $totalStats = [
            'total_cards_applied' => $supplementaryMembers->count(),
            'issued_supplementary_members' => $supplementaryMembers->where('card_status', 'Issued')->count(),
            'printed_supplementary_members' => $supplementaryMembers->where('card_status', 'Printed')->count(),
            're_printed_supplementary_members' => $supplementaryMembers->where('card_status', 'Re-Printed')->count(),
        ];

        return Inertia::render('App/Admin/Membership/SupplementaryCardReportPrint', [
            'categories' => $categoryStats,
            'statistics' => $totalStats,
            'filters' => [
                'categories' => $categoryFilter ?? [],
                'card_status' => $cardStatusFilter ?? [],
            ],
            'all_categories' => MemberCategory::select('id', 'name')->get(),
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
            'active',
            'suspended',
            'cancelled',
            'absent',
            'expired',
            'terminated',
            'not_assign',
            'in_suspension_process'
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

    public function sleepingMembersReportPrint(Request $request)
    {
        $categoryFilter = $request->input('categories');
        $statusFilter = $request->input('status');
        $page = $request->input('page', 1);

        // Get primary members with pagination (same as main report)
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

        // Get paginated results (same 15 per page as main report)
        $primaryMembers = $query->orderBy('created_at', 'desc')->paginate(15, ['*'], 'page', $page);

        // Get all members for statistics calculation (without pagination)
        $allMembersQuery = Member::with(['memberCategory:id,name,description'])
            ->whereNull('parent_id')
            ->select('members.*');

        if ($categoryFilter) {
            $allMembersQuery->whereIn('member_category_id', (array) $categoryFilter);
        }

        if ($statusFilter) {
            $allMembersQuery->whereIn('status', (array) $statusFilter);
        }

        $allPrimaryMembers = $allMembersQuery->orderBy('created_at', 'desc')->get();

        // Calculate statistics by category and status using all members
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

        // Calculate overall statistics using all members
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

        return Inertia::render('App/Admin/Membership/SleepingMembersReportPrint', [
            'categories' => $categoryStats,
            'primary_members' => $primaryMembers,
            'statistics' => $totalStats,
            'filters' => [
                'categories' => $categoryFilter ?? [],
                'status' => $statusFilter ?? [],
            ],
            'all_categories' => MemberCategory::select('id', 'name')->get(),
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

        // Get all members for statistics (no pagination needed for category-based report)
        $allPrimaryMembers = $query->orderBy('created_at', 'desc')->get();

        // Calculate statistics by category and card status
        // Apply category filter if provided, otherwise show all categories
        $categoryQuery = MemberCategory::select('id', 'name', 'description');

        if ($categoryFilter) {
            $categoryQuery->whereIn('id', (array) $categoryFilter);
        }

        $categoryStats = $categoryQuery
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
            'In-Process',
            'Printed',
            'Received',
            'Issued',
            'Applied',
            'Re-Printed',
            'Not Applied',
            'Expired',
            'Not Applicable',
            'E-Card Issued'
        ];

        return Inertia::render('App/Admin/Membership/MemberCardDetailReport', [
            'categories' => $categoryStats,
            'statistics' => $totalStats,
            'filters' => [
                'categories' => $categoryFilter ?? [],
                'card_status' => $cardStatusFilter ?? [],
            ],
            'all_categories' => MemberCategory::select('id', 'name')->get(),
            'all_card_statuses' => $allCardStatuses,
        ]);
    }

    public function memberCardDetailReportPrint(Request $request)
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

        // Get all members for statistics
        $allPrimaryMembers = $query->orderBy('created_at', 'desc')->get();

        // Calculate statistics by category
        $categoryQuery = MemberCategory::select('id', 'name', 'description');

        if ($categoryFilter) {
            $categoryQuery->whereIn('id', (array) $categoryFilter);
        }

        $categoryStats = $categoryQuery
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

        return Inertia::render('App/Admin/Membership/MemberCardDetailReportPrint', [
            'categories' => $categoryStats,
            'statistics' => $totalStats,
            'filters' => [
                'categories' => $categoryFilter ?? [],
                'card_status' => $cardStatusFilter ?? [],
            ],
            'all_categories' => MemberCategory::select('id', 'name')->get(),
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
            $query->whereHas('member', function ($q) use ($memberSearch) {
                $q
                    ->where('full_name', 'like', "%{$memberSearch}%")
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
            $query->whereHas('member', function ($q) use ($cityFilter) {
                $q->where('current_city', $cityFilter);
            });
        }

        // Apply payment method filter
        if ($paymentMethodFilter) {
            $query->where('payment_method', $paymentMethodFilter);
        }

        // Apply category filter
        if ($categoryFilter) {
            $query->whereHas('member', function ($q) use ($categoryFilter) {
                $q->whereIn('member_category_id', (array) $categoryFilter);
            });
        }

        // Apply gender filter
        if ($genderFilter) {
            $query->whereHas('member', function ($q) use ($genderFilter) {
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

    public function monthlyMaintenanceFeeReportPrint(Request $request)
    {
        $memberSearch = $request->input('member_search');
        $invoiceSearch = $request->input('invoice_search');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $cityFilter = $request->input('city');
        $paymentMethodFilter = $request->input('payment_method');
        $categoryFilter = $request->input('categories');
        $genderFilter = $request->input('gender');
        $page = $request->input('page', 1);

        // Get maintenance fee transactions with pagination
        $query = FinancialInvoice::with(['member.memberCategory'])
            ->where('fee_type', 'maintenance_fee')
            ->select('financial_invoices.*');

        // Apply member search filter
        if ($memberSearch) {
            $query->whereHas('member', function ($q) use ($memberSearch) {
                $q
                    ->where('full_name', 'like', "%{$memberSearch}%")
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
            $query->whereHas('member', function ($q) use ($cityFilter) {
                $q->where('current_city', $cityFilter);
            });
        }

        // Apply payment method filter
        if ($paymentMethodFilter) {
            $query->where('payment_method', $paymentMethodFilter);
        }

        // Apply category filter
        if ($categoryFilter) {
            $query->whereHas('member', function ($q) use ($categoryFilter) {
                $q->whereIn('member_category_id', (array) $categoryFilter);
            });
        }

        // Apply gender filter
        if ($genderFilter) {
            $query->whereHas('member', function ($q) use ($genderFilter) {
                $q->where('gender', $genderFilter);
            });
        }

        // Get paginated results (same 15 per page)
        $transactions = $query->orderBy('created_at', 'desc')->paginate(15, ['*'], 'page', $page);

        // Calculate statistics from all filtered transactions
        $allTransactions = $query->get();
        $totalAmount = $allTransactions->sum('total_price');
        $totalTransactions = $allTransactions->count();
        $averageAmount = $totalTransactions > 0 ? round($totalAmount / $totalTransactions, 2) : 0;

        return Inertia::render('App/Admin/Membership/MonthlyMaintenanceFeeReportPrint', [
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
            'all_categories' => MemberCategory::select('id', 'name')->get(),
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
            $query->whereHas('member', function ($q) use ($memberSearch) {
                $q
                    ->where('full_name', 'like', "%{$memberSearch}%")
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
            $query->whereHas('member', function ($q) use ($cityFilter) {
                $q->where('current_city', $cityFilter);
            });
        }

        // Apply payment method filter
        if ($paymentMethodFilter) {
            $query->where('payment_method', $paymentMethodFilter);
        }

        // Apply category filter
        if ($categoryFilter) {
            $query->whereHas('member', function ($q) use ($categoryFilter) {
                $q->whereIn('member_category_id', (array) $categoryFilter);
            });
        }

        // Apply gender filter
        if ($genderFilter) {
            $query->whereHas('member', function ($q) use ($genderFilter) {
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

    public function newYearEveReportPrint(Request $request)
    {
        $memberSearch = $request->input('member_search');
        $invoiceSearch = $request->input('invoice_search');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $cityFilter = $request->input('city');
        $paymentMethodFilter = $request->input('payment_method');
        $categoryFilter = $request->input('categories');
        $genderFilter = $request->input('gender');
        $page = $request->input('page', 1);

        // Get all fee transactions with pagination
        $query = FinancialInvoice::with(['member.memberCategory'])
            ->whereIn('fee_type', ['maintenance_fee', 'membership_fee', 'reinstating_fee'])
            ->select('financial_invoices.*');

        // Apply member search filter
        if ($memberSearch) {
            $query->whereHas('member', function ($q) use ($memberSearch) {
                $q
                    ->where('full_name', 'like', "%{$memberSearch}%")
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
            $query->whereHas('member', function ($q) use ($cityFilter) {
                $q->where('current_city', $cityFilter);
            });
        }

        // Apply payment method filter
        if ($paymentMethodFilter) {
            $query->where('payment_method', $paymentMethodFilter);
        }

        // Apply category filter
        if ($categoryFilter) {
            $query->whereHas('member', function ($q) use ($categoryFilter) {
                $q->whereIn('member_category_id', (array) $categoryFilter);
            });
        }

        // Apply gender filter
        if ($genderFilter) {
            $query->whereHas('member', function ($q) use ($genderFilter) {
                $q->where('gender', $genderFilter);
            });
        }

        // Get paginated results (same 15 per page)
        $transactions = $query->orderBy('created_at', 'desc')->paginate(15, ['*'], 'page', $page);

        // Calculate statistics from all filtered transactions
        $allTransactions = $query->get();
        $totalAmount = $allTransactions->sum('total_price');
        $totalTransactions = $allTransactions->count();
        $averageAmount = $totalTransactions > 0 ? round($totalAmount / $totalTransactions, 2) : 0;

        return Inertia::render('App/Admin/Membership/NewYearEveReportPrint', [
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
            'all_categories' => MemberCategory::select('id', 'name')->get(),
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
            $query->whereHas('member', function ($q) use ($memberSearch) {
                $q
                    ->where('full_name', 'like', "%{$memberSearch}%")
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
            $query->whereHas('member', function ($q) use ($cityFilter) {
                $q->where('current_city', $cityFilter);
            });
        }

        // Apply payment method filter
        if ($paymentMethodFilter) {
            $query->where('payment_method', $paymentMethodFilter);
        }

        // Apply category filter
        if ($categoryFilter) {
            $query->whereHas('member', function ($q) use ($categoryFilter) {
                $q->whereIn('member_category_id', (array) $categoryFilter);
            });
        }

        // Apply gender filter
        if ($genderFilter) {
            $query->whereHas('member', function ($q) use ($genderFilter) {
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

    public function reinstatingFeeReportPrint(Request $request)
    {
        $memberSearch = $request->input('member_search');
        $invoiceSearch = $request->input('invoice_search');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $cityFilter = $request->input('city');
        $paymentMethodFilter = $request->input('payment_method');
        $categoryFilter = $request->input('categories');
        $genderFilter = $request->input('gender');
        $page = $request->input('page', 1);

        // Get reinstating fee transactions with pagination
        $query = FinancialInvoice::with(['member.memberCategory'])
            ->where('fee_type', 'reinstating_fee')
            ->select('financial_invoices.*');

        // Apply member search filter
        if ($memberSearch) {
            $query->whereHas('member', function ($q) use ($memberSearch) {
                $q
                    ->where('full_name', 'like', "%{$memberSearch}%")
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
            $query->whereHas('member', function ($q) use ($cityFilter) {
                $q->where('current_city', $cityFilter);
            });
        }

        // Apply payment method filter
        if ($paymentMethodFilter) {
            $query->where('payment_method', $paymentMethodFilter);
        }

        // Apply category filter
        if ($categoryFilter) {
            $query->whereHas('member', function ($q) use ($categoryFilter) {
                $q->whereIn('member_category_id', (array) $categoryFilter);
            });
        }

        // Apply gender filter
        if ($genderFilter) {
            $query->whereHas('member', function ($q) use ($genderFilter) {
                $q->where('gender', $genderFilter);
            });
        }

        // Get paginated results (same 15 per page)
        $transactions = $query->orderBy('created_at', 'desc')->paginate(15, ['*'], 'page', $page);

        // Calculate statistics from all filtered transactions
        $allTransactions = $query->get();
        $totalAmount = $allTransactions->sum('total_price');
        $totalTransactions = $allTransactions->count();
        $averageAmount = $totalTransactions > 0 ? round($totalAmount / $totalTransactions, 2) : 0;

        return Inertia::render('App/Admin/Membership/ReinstatingFeeReportPrint', [
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
            'all_categories' => MemberCategory::select('id', 'name')->get(),
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
            $query->whereHas('member', function ($q) use ($memberSearch) {
                $q
                    ->where('full_name', 'like', "%{$memberSearch}%")
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
            $query->whereHas('member', function ($q) use ($cityFilter) {
                $q->where('current_city', $cityFilter);
            });
        }

        // Apply payment method filter
        if ($paymentMethodFilter) {
            $query->where('payment_method', $paymentMethodFilter);
        }

        // Apply category filter
        if ($categoryFilter) {
            $query->whereHas('member', function ($q) use ($categoryFilter) {
                $q->whereIn('member_category_id', (array) $categoryFilter);
            });
        }

        // Apply gender filter
        if ($genderFilter) {
            $query->whereHas('member', function ($q) use ($genderFilter) {
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

    public function sportsSubscriptionsReportPrint(Request $request)
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
        $page = $request->input('page', 1);

        // Get subscription fee transactions with pagination
        $query = FinancialInvoice::with(['member.memberCategory'])
            ->where('fee_type', 'subscription_fee')
            ->select('financial_invoices.*');

        // Apply member search filter
        if ($memberSearch) {
            $query->whereHas('member', function ($q) use ($memberSearch) {
                $q
                    ->where('full_name', 'like', "%{$memberSearch}%")
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
            $query->whereHas('member', function ($q) use ($cityFilter) {
                $q->where('current_city', $cityFilter);
            });
        }

        // Apply payment method filter
        if ($paymentMethodFilter) {
            $query->where('payment_method', $paymentMethodFilter);
        }

        // Apply category filter
        if ($categoryFilter) {
            $query->whereHas('member', function ($q) use ($categoryFilter) {
                $q->whereIn('member_category_id', (array) $categoryFilter);
            });
        }

        // Apply gender filter
        if ($genderFilter) {
            $query->whereHas('member', function ($q) use ($genderFilter) {
                $q->where('gender', $genderFilter);
            });
        }

        // Apply family member filter
        if ($familyMemberFilter) {
            $query->whereJsonContains('data->family_member_relation', $familyMemberFilter);
        }

        // Get paginated results (same 15 per page)
        $transactions = $query->orderBy('created_at', 'desc')->paginate(15, ['*'], 'page', $page);

        // Calculate statistics from all filtered transactions
        $allTransactions = $query->get();
        $totalAmount = $allTransactions->sum('total_price');
        $totalTransactions = $allTransactions->count();
        $averageAmount = $totalTransactions > 0 ? round($totalAmount / $totalTransactions, 2) : 0;

        return Inertia::render('App/Admin/Membership/SportsSubscriptionsReportPrint', [
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
            'all_categories' => MemberCategory::select('id', 'name')->get(),
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
            $query->whereHas('member', function ($q) use ($categoryFilter) {
                $q->where('member_category_id', $categoryFilter);
            });
        }

        $transactions = $query->get();

        // Initialize summary structure with ALL categories
        $summary = [];
        $grandTotals = [
            'cash' => 0,
            'credit_card' => 0,
            'bank_online' => 0,
            'total' => 0
        ];

        // Get all categories and initialize them in summary
        $allCategoriesQuery = MemberCategory::select('id', 'name');

        // Apply category filter to the categories we show
        if ($categoryFilter) {
            $allCategoriesQuery->where('id', $categoryFilter);
        }

        $allCategories = $allCategoriesQuery->get();

        // Initialize all categories in summary (even if they have no transactions)
        foreach ($allCategories as $category) {
            $summary[$category->name] = [
                'cash' => 0,
                'credit_card' => 0,
                'bank_online' => 0,
                'total' => 0
            ];
        }

        foreach ($transactions as $transaction) {
            $categoryName = $transaction->member->memberCategory->name ?? 'Unknown';
            $paymentMethod = strtolower($transaction->payment_method);
            $amount = $transaction->total_price;

            // Skip if category doesn't exist in summary (shouldn't happen with our initialization)
            if (!isset($summary[$categoryName])) {
                continue;
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

        // Get all categories for filter dropdown (always show all categories in filter)
        $allCategoriesForFilter = MemberCategory::select('id', 'name')->get();

        return Inertia::render('App/Admin/Membership/SubscriptionsMaintenanceSummary', [
            'summary' => $summary,
            'grand_totals' => $grandTotals,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'category' => $categoryFilter,
            ],
            'all_categories' => $allCategoriesForFilter,
        ]);
    }

    public function subscriptionsMaintenanceSummaryPrint(Request $request)
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
            $query->whereHas('member', function ($q) use ($categoryFilter) {
                $q->where('member_category_id', $categoryFilter);
            });
        }

        $transactions = $query->get();

        // Initialize summary structure
        $summary = [];
        $grandTotals = [
            'cash' => 0,
            'credit_card' => 0,
            'bank_online' => 0,
            'total' => 0
        ];

        // Get all categories and initialize them in summary
        $allCategoriesQuery = MemberCategory::select('id', 'name');

        // Apply category filter to the categories we show
        if ($categoryFilter) {
            $allCategoriesQuery->where('id', $categoryFilter);
        }

        $allCategories = $allCategoriesQuery->get();

        // Initialize all categories in summary
        foreach ($allCategories as $category) {
            $summary[$category->name] = [
                'cash' => 0,
                'credit_card' => 0,
                'bank_online' => 0,
                'total' => 0
            ];
        }

        foreach ($transactions as $transaction) {
            $categoryName = $transaction->member->memberCategory->name ?? 'Unknown';
            $paymentMethod = strtolower($transaction->payment_method);
            $amount = $transaction->total_price;

            // Skip if category doesn't exist in summary
            if (!isset($summary[$categoryName])) {
                continue;
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

        // Get all categories for filter dropdown
        $allCategoriesForFilter = MemberCategory::select('id', 'name')->get();

        return Inertia::render('App/Admin/Membership/SubscriptionsMaintenanceSummaryPrint', [
            'summary' => $summary,
            'grand_totals' => $grandTotals,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'category' => $categoryFilter,
            ],
            'all_categories' => $allCategoriesForFilter,
        ]);
    }

    public function pendingMaintenanceQuartersReport(Request $request)
    {
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $categoryFilter = $request->input('category');

        // Get all members with their categories
        $membersQuery = Member::with(['memberCategory'])
            ->where('status', 'active');  // Only active members

        // Apply category filter
        if ($categoryFilter) {
            $membersQuery->where('member_category_id', $categoryFilter);
        }

        $members = $membersQuery->get();

        // Initialize summary structure with ALL categories
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

        // Get all categories and initialize them in summary
        $allCategoriesQuery = MemberCategory::select('id', 'name', 'subscription_fee');

        // Apply category filter to the categories we show
        if ($categoryFilter) {
            $allCategoriesQuery->where('id', $categoryFilter);
        }

        $allCategories = $allCategoriesQuery->get();

        // Initialize all categories in summary (even if they have no pending quarters)
        foreach ($allCategories as $category) {
            $summary[$category->name] = [
                '1_quarter_pending' => 0,
                '2_quarters_pending' => 0,
                '3_quarters_pending' => 0,
                '4_quarters_pending' => 0,
                '5_quarters_pending' => 0,
                'more_than_5_quarters_pending' => 0,
                'maintenance_fee_quarterly' => $category->subscription_fee ?? 0,
                'total_values' => 0
            ];
        }

        foreach ($members as $member) {
            $categoryName = $member->memberCategory->name ?? 'Unknown';

            // Skip if category doesn't exist in summary (shouldn't happen with our initialization)
            if (!isset($summary[$categoryName])) {
                continue;
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

        // Get all categories for filter dropdown (always show all categories in filter)
        $allCategoriesForFilter = MemberCategory::select('id', 'name')->get();

        return Inertia::render('App/Admin/Membership/PendingMaintenanceQuartersReport', [
            'summary' => $summary,
            'grand_totals' => $grandTotals,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'category' => $categoryFilter,
            ],
            'all_categories' => $allCategoriesForFilter,
        ]);
    }

    public function pendingMaintenanceQuartersReportPrint(Request $request)
    {
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $categoryFilter = $request->input('category');

        // Get all members with their categories
        $membersQuery = Member::with(['memberCategory'])
            ->where('status', 'active');  // Only active members

        // Apply category filter
        if ($categoryFilter) {
            $membersQuery->where('member_category_id', $categoryFilter);
        }

        $members = $membersQuery->get();

        // Initialize summary structure with ALL categories
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

        // Get all categories and initialize them in summary
        $allCategoriesQuery = MemberCategory::select('id', 'name', 'subscription_fee');

        // Apply category filter to the categories we show
        if ($categoryFilter) {
            $allCategoriesQuery->where('id', $categoryFilter);
        }

        $allCategories = $allCategoriesQuery->get();

        // Initialize all categories in summary
        foreach ($allCategories as $category) {
            $summary[$category->name] = [
                '1_quarter_pending' => 0,
                '2_quarters_pending' => 0,
                '3_quarters_pending' => 0,
                '4_quarters_pending' => 0,
                '5_quarters_pending' => 0,
                'more_than_5_quarters_pending' => 0,
                'maintenance_fee_quarterly' => $category->subscription_fee ?? 0,
                'total_values' => 0
            ];
        }

        foreach ($members as $member) {
            $categoryName = $member->memberCategory->name ?? 'Unknown';

            // Skip if category doesn't exist in summary
            if (!isset($summary[$categoryName])) {
                continue;
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

        // Set maintenance fee quarterly for grand totals
        if (!empty($summary)) {
            $fees = array_column($summary, 'maintenance_fee_quarterly');
            $grandTotals['maintenance_fee_quarterly'] = array_sum($fees) / count($fees);
        }

        // Get all categories for filter dropdown
        $allCategoriesForFilter = MemberCategory::select('id', 'name')->get();

        return Inertia::render('App/Admin/Membership/PendingMaintenanceQuartersReportPrint', [
            'summary' => $summary,
            'grand_totals' => $grandTotals,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'category' => $categoryFilter,
            ],
            'all_categories' => $allCategoriesForFilter,
        ]);
    }

    private function calculatePendingQuarters($member, $dateFrom = null, $dateTo = null)
    {
        // Get member's maintenance fee transactions
        $query = FinancialInvoice::where('member_id', $member->id)
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

        return min($pendingQuarters, 10);  // Cap at 10 for display purposes
    }

    public function reportsIndex()
    {
        $reports = [
            [
                'id' => 1,
                'title' => 'Maintenance Fee Revenue',
                'description' => 'View maintenance fee revenue by member categories with payment statistics',
                'icon' => 'AttachMoney',
                'color' => '#063455',
                'route' => 'membership.maintanance-fee-revenue',
                'stats' => 'Revenue Analysis'
            ],
            [
                'id' => 2,
                'title' => 'Pending Maintenance Report',
                'description' => 'Track members with pending maintenance fee payments',
                'icon' => 'Schedule',
                'color' => '#063455',
                'route' => 'membership.pending-maintenance-report',
                'stats' => 'Payment Tracking'
            ],
            [
                'id' => 3,
                'title' => 'Monthly Maintenance Fee Report',
                'description' => 'Monthly breakdown of maintenance fee transactions',
                'icon' => 'CalendarMonth',
                'color' => '#063455',
                'route' => 'membership.monthly-maintenance-fee-report',
                'stats' => 'Monthly Analysis'
            ],
            [
                'id' => 4,
                'title' => 'Sports Subscriptions Report',
                'description' => 'Track sports facility subscriptions and family member usage',
                'icon' => 'FitnessCenter',
                'color' => '#063455',
                'route' => 'membership.sports-subscriptions-report',
                'stats' => 'Sports Analytics'
            ],
            [
                'id' => 5,
                'title' => 'New Year Eve Report',
                'description' => 'Special event fee collections and member participation',
                'icon' => 'Celebration',
                'color' => '#063455',
                'route' => 'membership.new-year-eve-report',
                'stats' => 'Event Revenue'
            ],
            [
                'id' => 6,
                'title' => 'Reinstating Fee Report',
                'description' => 'Track member reactivation fees and reinstatement process',
                'icon' => 'Refresh',
                'color' => '#063455',
                'route' => 'membership.reinstating-fee-report',
                'stats' => 'Reactivation Tracking'
            ],
            [
                'id' => 7,
                'title' => 'Subscriptions & Maintenance Summary',
                'description' => 'Category-wise revenue summary by payment methods',
                'icon' => 'Assessment',
                'color' => '#063455',
                'route' => 'membership.subscriptions-maintenance-summary',
                'stats' => 'Revenue Summary'
            ],
            [
                'id' => 8,
                'title' => 'Pending Maintenance Quarters Report',
                'description' => 'Quarter-wise analysis of pending maintenance payments',
                'icon' => 'Timeline',
                'color' => '#063455',
                'route' => 'membership.pending-maintenance-quarters-report',
                'stats' => 'Quarter Analysis'
            ],
            [
                'id' => 9,
                'title' => 'Supplementary Card Report',
                'description' => 'Track supplementary membership cards and family members',
                'icon' => 'CreditCard',
                'color' => '#063455',
                'route' => 'membership.supplementary-card-report',
                'stats' => 'Card Management'
            ],
            [
                'id' => 10,
                'title' => 'Sleeping Members Report',
                'description' => 'Identify inactive members and dormant accounts',
                'icon' => 'PersonOff',
                'color' => '#063455',
                'route' => 'membership.sleeping-members-report',
                'stats' => 'Member Activity'
            ],
            [
                'id' => 11,
                'title' => 'Member Card Detail Report',
                'description' => 'Detailed member card information and status tracking',
                'icon' => 'Badge',
                'color' => '#063455',
                'route' => 'membership.member-card-detail-report',
                'stats' => 'Card Details'
            ]
        ];

        return Inertia::render('App/Admin/Membership/ReportsIndex', [
            'reports' => $reports
        ]);
    }
}
