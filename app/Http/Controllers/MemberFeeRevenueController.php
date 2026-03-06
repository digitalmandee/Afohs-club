<?php

namespace App\Http\Controllers;

use App\Models\FinancialInvoice;
use App\Models\Member;
use App\Models\MemberCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MemberFeeRevenueController extends Controller
{
    private function parseDateToYmd(?string $value): ?string
    {
        if (!$value) {
            return null;
        }

        $value = trim((string) $value);
        if ($value === '') {
            return null;
        }

        $formats = ['d-m-Y', 'm-d-Y', 'Y-m-d', 'd/m/Y', 'm/d/Y'];

        foreach ($formats as $format) {
            try {
                return \Carbon\Carbon::createFromFormat($format, $value)->format('Y-m-d');
            } catch (\Exception $e) {
            }
        }

        return null;
    }

    public function maintenanceFeeRevenue(Request $request)
    {
        $statusFilter = $request->input('status');  // array of statuses
        $categoryFilter = $request->input('categories');  // array of category IDs
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $dateFromParsed = $this->parseDateToYmd($dateFrom);
        $dateToParsed = $this->parseDateToYmd($dateTo);

        // Get member categories with their members
        $query = MemberCategory::query()->with(['members' => function ($q) use ($statusFilter) {
            if ($statusFilter) {
                $q->whereIn('status', (array) $statusFilter);
            }
        }]);

        if ($categoryFilter) {
            $query->whereIn('id', (array) $categoryFilter);
        }

        $categories = $query->get()->map(function ($category) use ($dateFromParsed, $dateToParsed) {
            $memberUserIds = $category->members->pluck('id');

            // Calculate maintenance fee revenue from FinancialInvoiceItems
            // We join users/members to ensure we only get items for members in this category?
            // Actually we have $memberUserIds, so we can filter by invoice.member_id

            $maintenanceQuery = \App\Models\FinancialInvoiceItem::where('fee_type', '4')
                ->whereHas('invoice', function ($q) use ($memberUserIds, $dateFromParsed, $dateToParsed) {
                    $q
                        ->where('status', 'paid')
                        ->whereIn('member_id', $memberUserIds);

                    if ($dateFromParsed) {
                        $q->where(function ($sub) use ($dateFromParsed) {
                            $sub
                                ->whereDate('payment_date', '>=', $dateFromParsed)
                                ->orWhereHas('transactions', function ($t) use ($dateFromParsed) {
                                    $t->where('type', 'credit')->whereDate('date', '>=', $dateFromParsed);
                                });
                        });
                    }

                    if ($dateToParsed) {
                        $q->where(function ($sub) use ($dateToParsed) {
                            $sub
                                ->whereDate('payment_date', '<=', $dateToParsed)
                                ->orWhereHas('transactions', function ($t) use ($dateToParsed) {
                                    $t->where('type', 'credit')->whereDate('date', '<=', $dateToParsed);
                                });
                        });
                    }
                });

            // Sum totals. 'total' column in items should include tax/discount adjustments.
            $totalMaintenance = $maintenanceQuery->sum('total');

            // Count members who have paid maintenance fees
            $membersWithMaintenanceFees = FinancialInvoice::query()
                ->where('status', 'paid')
                ->whereIn('member_id', $memberUserIds)
                ->whereHas('items', function ($itemQ) {
                    $itemQ->where('fee_type', '4');
                })
                ->when($dateFromParsed, function ($q) use ($dateFromParsed) {
                    $q->where(function ($sub) use ($dateFromParsed) {
                        $sub
                            ->whereDate('payment_date', '>=', $dateFromParsed)
                            ->orWhereHas('transactions', function ($t) use ($dateFromParsed) {
                                $t->where('type', 'credit')->whereDate('date', '>=', $dateFromParsed);
                            });
                    });
                })
                ->when($dateToParsed, function ($q) use ($dateToParsed) {
                    $q->where(function ($sub) use ($dateToParsed) {
                        $sub
                            ->whereDate('payment_date', '<=', $dateToParsed)
                            ->orWhereHas('transactions', function ($t) use ($dateToParsed) {
                                $t->where('type', 'credit')->whereDate('date', '<=', $dateToParsed);
                            });
                    });
                })
                ->distinct('member_id')
                ->count('member_id');

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
        $dateFromParsed = $this->parseDateToYmd($dateFrom);
        $dateToParsed = $this->parseDateToYmd($dateTo);

        // Get member categories with their members
        $query = MemberCategory::query()->with(['members' => function ($q) use ($statusFilter) {
            if ($statusFilter) {
                $q->whereIn('status', (array) $statusFilter);
            }
        }]);

        if ($categoryFilter) {
            $query->whereIn('id', (array) $categoryFilter);
        }

        $categories = $query->get()->map(function ($category) use ($dateFromParsed, $dateToParsed) {
            $memberUserIds = $category->members->pluck('id');

            // Calculate maintenance fee revenue from FinancialInvoiceItems
            $maintenanceQuery = \App\Models\FinancialInvoiceItem::where('fee_type', '4')
                ->whereHas('invoice', function ($q) use ($memberUserIds, $dateFromParsed, $dateToParsed) {
                    $q
                        ->where('status', 'paid')
                        ->whereIn('member_id', $memberUserIds);

                    if ($dateFromParsed) {
                        $q->where(function ($sub) use ($dateFromParsed) {
                            $sub
                                ->whereDate('payment_date', '>=', $dateFromParsed)
                                ->orWhereHas('transactions', function ($t) use ($dateFromParsed) {
                                    $t->where('type', 'credit')->whereDate('date', '>=', $dateFromParsed);
                                });
                        });
                    }

                    if ($dateToParsed) {
                        $q->where(function ($sub) use ($dateToParsed) {
                            $sub
                                ->whereDate('payment_date', '<=', $dateToParsed)
                                ->orWhereHas('transactions', function ($t) use ($dateToParsed) {
                                    $t->where('type', 'credit')->whereDate('date', '<=', $dateToParsed);
                                });
                        });
                    }
                });

            $totalMaintenance = $maintenanceQuery->sum('total');

            // Count members who have paid maintenance fees
            $membersWithMaintenanceFees = FinancialInvoice::query()
                ->where('status', 'paid')
                ->whereIn('member_id', $memberUserIds)
                ->whereHas('items', function ($itemQ) {
                    $itemQ->where('fee_type', '4');
                })
                ->when($dateFromParsed, function ($q) use ($dateFromParsed) {
                    $q->where(function ($sub) use ($dateFromParsed) {
                        $sub
                            ->whereDate('payment_date', '>=', $dateFromParsed)
                            ->orWhereHas('transactions', function ($t) use ($dateFromParsed) {
                                $t->where('type', 'credit')->whereDate('date', '>=', $dateFromParsed);
                            });
                    });
                })
                ->when($dateToParsed, function ($q) use ($dateToParsed) {
                    $q->where(function ($sub) use ($dateToParsed) {
                        $sub
                            ->whereDate('payment_date', '<=', $dateToParsed)
                            ->orWhereHas('transactions', function ($t) use ($dateToParsed) {
                                $t->where('type', 'credit')->whereDate('date', '<=', $dateToParsed);
                            });
                    });
                })
                ->distinct('member_id')
                ->count('member_id');

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

        $untilDate = $this->parseDateToYmd($request->input('date')) ?: now()->format('Y-m-d');

        $memberSearch = $request->input('member_search');
        $memberId = $request->input('member_id');
        $cnicSearch = $request->input('cnic_search');
        $contactSearch = $request->input('contact_search');
        $quartersFilter = (string) ($request->input('quarters_pending') ?? '');
        if ($quartersFilter === '') {
            $quartersFilter = '1';
        }
        $perPage = $request->input('per_page', 15);

        // Subquery to get the latest valid_to date for maintenance fees per member using Items
        $latestMaintenance = \App\Models\FinancialInvoiceItem::select(
            'financial_invoices.member_id',
            \Illuminate\Support\Facades\DB::raw('MAX(financial_invoice_items.end_date) as last_valid_date'),
            \Illuminate\Support\Facades\DB::raw('MAX(transactions.date) as last_payment_date')
        )
            ->join('financial_invoices', 'financial_invoice_items.invoice_id', '=', 'financial_invoices.id')
            ->leftJoin('transactions', function ($join) {
                $join
                    ->on('financial_invoices.id', '=', 'transactions.invoice_id')
                    ->where('transactions.type', 'credit');
            })
            ->where('financial_invoice_items.fee_type', '4')
            ->where('financial_invoices.status', 'paid')
            ->groupBy('financial_invoices.member_id');

        $maintenanceLedger = DB::table('transactions')
            ->join('financial_invoices', 'transactions.invoice_id', '=', 'financial_invoices.id')
            ->join('financial_invoice_items', function ($join) {
                $join
                    ->on('transactions.reference_id', '=', 'financial_invoice_items.id')
                    ->where('transactions.reference_type', '=', \App\Models\FinancialInvoiceItem::class);
            })
            ->whereNull('transactions.deleted_at')
            ->whereNull('financial_invoice_items.deleted_at')
            ->where('financial_invoice_items.fee_type', '4')
            ->whereNotIn('financial_invoices.status', ['cancelled', 'refunded'])
            ->groupBy('financial_invoices.member_id')
            ->select(
                'financial_invoices.member_id',
                DB::raw("SUM(CASE WHEN transactions.type = 'debit' THEN transactions.amount ELSE 0 END) as maintenance_debit"),
                DB::raw("SUM(CASE WHEN transactions.type = 'credit' THEN transactions.amount ELSE 0 END) as maintenance_credit")
            );

        $maintenanceDiscounts = DB::table('financial_invoice_items')
            ->join('financial_invoices', 'financial_invoice_items.invoice_id', '=', 'financial_invoices.id')
            ->whereNull('financial_invoice_items.deleted_at')
            ->where('financial_invoice_items.fee_type', '4')
            ->whereNotIn('financial_invoices.status', ['cancelled', 'refunded'])
            ->groupBy('financial_invoices.member_id')
            ->select(
                'financial_invoices.member_id',
                DB::raw('SUM(COALESCE(financial_invoice_items.discount_amount, 0)) as maintenance_discount')
            );

        // Main Query
        $query = Member::with(['memberCategory:id,name,description,subscription_fee'])
            ->leftJoinSub($latestMaintenance, 'latest_maintenance', function ($join) {
                $join->on('members.id', '=', 'latest_maintenance.member_id');
            })
            ->leftJoinSub($maintenanceLedger, 'maintenance_ledger', function ($join) {
                $join->on('members.id', '=', 'maintenance_ledger.member_id');
            })
            ->leftJoinSub($maintenanceDiscounts, 'maintenance_discounts', function ($join) {
                $join->on('members.id', '=', 'maintenance_discounts.member_id');
            })
            ->whereNull('parent_id')
            ->select(
                'members.*',
                'latest_maintenance.last_valid_date',
                'latest_maintenance.last_payment_date',
                'maintenance_ledger.maintenance_debit',
                'maintenance_ledger.maintenance_credit',
                'maintenance_discounts.maintenance_discount'
            );

        // Apply filters
        if ($categoryFilter) {
            $query->whereIn('member_category_id', (array) $categoryFilter);
        }

        if ($statusFilter) {
            $query->whereIn('status', (array) $statusFilter);
        }

        $nameSearch = $request->input('name_search');
        $noSearch = $request->input('membership_no_search');
        $memberIds = $request->input('member_ids');
        if ($memberIds) {
            $query->whereIn('members.id', (array) $memberIds);
        }

        if ($memberId) {
            $query->where('members.id', $memberId);
        } elseif ($memberSearch) {
            $query->where(function ($q) use ($memberSearch) {
                $q
                    ->where('full_name', 'like', "%{$memberSearch}%")
                    ->orWhere('membership_no', 'like', "%{$memberSearch}%");
            });
        }

        if ($nameSearch) {
            $query->where('full_name', 'like', "%{$nameSearch}%");
        }

        if ($noSearch) {
            $query->where('membership_no', 'like', "%{$noSearch}%");
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

        $query->where(function ($q) use ($untilDate) {
            $q
                ->whereNull('latest_maintenance.last_valid_date')
                ->orWhereDate('latest_maintenance.last_valid_date', '<=', $untilDate);
        });

        // Calculate Pending Months/Quarters in SQL for filtering and sorting
        // Logic: CEIL(TIMESTAMPDIFF(MONTH, start_date, NOW()) / 3)
        // start_date = COALESCE(last_valid_date, membership_date, created_at)
        $currentDate = \Carbon\Carbon::parse($untilDate)->format('Y-m-d');
        $query->selectRaw("
            CEIL( GREATEST(0, TIMESTAMPDIFF(MONTH,
                COALESCE(latest_maintenance.last_valid_date, members.membership_date, members.created_at),
                '$currentDate'
            )) / 3 ) as pending_quarters_calc
        ");

        // Filter for PENDING members (pending_quarters > 0)
        // This replaces the complex PHP/Collection logic
        $query->having('pending_quarters_calc', '>', 0);

        // Apply Quarters Filter
        if ($quartersFilter === '6+') {
            $query->having('pending_quarters_calc', '>=', 6);
        } else {
            $query->having('pending_quarters_calc', '=', (int) $quartersFilter);
        }

        // Pagination
        if ($perPage === 'all') {
            $collection = $query->get();
            $mapped = $collection->map(function ($member) {
                $monthlyFee = (float) ($member->total_maintenance_fee ?? 0);
                if ($monthlyFee <= 0) {
                    $monthlyFee = (float) ($member->maintenance_fee ?? 0);
                }
                if ($monthlyFee <= 0 && $member->memberCategory) {
                    $monthlyFee = (float) ($member->memberCategory->subscription_fee ?? 0);
                }
                $pendingQuarters = (int) ($member->pending_quarters_calc ?? 0);
                $quarterlyFee = $monthlyFee * 3;
                $totalPendingAmount = $quarterlyFee * $pendingQuarters;

                $discount = (float) ($member->maintenance_discount ?? 0);
                $debit = (float) ($member->maintenance_debit ?? 0);
                $credit = (float) ($member->maintenance_credit ?? 0);
                $balance = $debit - $credit;

                return [
                    'id' => $member->id,
                    'membership_no' => $member->membership_no,
                    'full_name' => $member->full_name,
                    'contact' => $member->mobile_number_a,
                    'address' => $member->current_address,
                    'cnic' => $member->cnic_no,
                    'status' => $member->status,
                    'last_payment_date' => $member->last_payment_date,
                    'paid_until_date' => $member->last_valid_date,
                    'monthly_fee' => $monthlyFee,
                    'quarterly_fee' => $quarterlyFee,
                    'discount' => $discount,
                    'debit' => $debit,
                    'credit' => $credit,
                    'balance' => $balance,
                    'total_pending_amount' => $totalPendingAmount,
                    'category' => $member->memberCategory ? $member->memberCategory->name : '',
                ];
            });

            $paginatedMembers = new \Illuminate\Pagination\LengthAwarePaginator(
                $mapped,
                $mapped->count(),
                max(1, $mapped->count()),
                1,
                [
                    'path' => \Illuminate\Pagination\Paginator::resolveCurrentPath(),
                    'query' => $request->query(),
                ]
            );
        } else {
            $perPageInt = max(1, (int) $perPage);
            $paginatedMembers = $query->paginate($perPageInt)->withQueryString();

            $paginatedMembers->getCollection()->transform(function ($member) {
                $monthlyFee = (float) ($member->total_maintenance_fee ?? 0);
                if ($monthlyFee <= 0) {
                    $monthlyFee = (float) ($member->maintenance_fee ?? 0);
                }
                if ($monthlyFee <= 0 && $member->memberCategory) {
                    $monthlyFee = (float) ($member->memberCategory->subscription_fee ?? 0);
                }
                $pendingQuarters = (int) ($member->pending_quarters_calc ?? 0);
                $quarterlyFee = $monthlyFee * 3;
                $totalPendingAmount = $quarterlyFee * $pendingQuarters;

                $discount = (float) ($member->maintenance_discount ?? 0);
                $debit = (float) ($member->maintenance_debit ?? 0);
                $credit = (float) ($member->maintenance_credit ?? 0);
                $balance = $debit - $credit;

                return [
                    'id' => $member->id,
                    'membership_no' => $member->membership_no,
                    'full_name' => $member->full_name,
                    'contact' => $member->mobile_number_a,
                    'address' => $member->current_address,
                    'cnic' => $member->cnic_no,
                    'status' => $member->status,
                    'last_payment_date' => $member->last_payment_date,
                    'paid_until_date' => $member->last_valid_date,
                    'monthly_fee' => $monthlyFee,
                    'quarterly_fee' => $quarterlyFee,
                    'discount' => $discount,
                    'debit' => $debit,
                    'credit' => $credit,
                    'balance' => $balance,
                    'total_pending_amount' => $totalPendingAmount,
                    'category' => $member->memberCategory ? $member->memberCategory->name : '',
                ];
            });
        }

        $rows = collect($paginatedMembers->items());
        $statistics = [
            'total_members' => $paginatedMembers->total(),
            'total_pending_amount' => $rows->sum('total_pending_amount'),
            'total_discount' => $rows->sum('discount'),
            'total_debit' => $rows->sum('debit'),
            'total_credit' => $rows->sum('credit'),
            'total_balance' => $rows->sum('balance'),
        ];

        return Inertia::render('App/Admin/Membership/PendingMaintenanceReport', [
            'members' => $paginatedMembers,
            'statistics' => $statistics,
            'filters' => [
                'status' => $statusFilter,
                'categories' => $categoryFilter,
                'member_search' => $memberSearch,
                'member_id' => $memberId,
                'name_search' => $nameSearch,
                'membership_no_search' => $noSearch,
                'cnic_search' => $cnicSearch,
                'contact_search' => $contactSearch,
                'quarters_pending' => $quartersFilter,
                'per_page' => $perPage,
                'date' => $untilDate,
            ],
            'all_statuses' => Member::distinct()->pluck('status')->filter()->values(),
            'all_categories' => MemberCategory::select('id', 'name')->get(),
        ]);
    }

    public function pendingMaintenanceReportPrint(Request $request)
    {
        $statusFilter = $request->input('status');
        $categoryFilter = $request->input('categories');

        $untilDate = $this->parseDateToYmd($request->input('date')) ?: now()->format('Y-m-d');

        $memberSearch = $request->input('member_search');
        $memberId = $request->input('member_id');
        $cnicSearch = $request->input('cnic_search');
        $contactSearch = $request->input('contact_search');
        $quartersFilter = (string) ($request->input('quarters_pending') ?? '');
        if ($quartersFilter === '') {
            $quartersFilter = '1';
        }

        // Subquery to get the latest valid_to date for maintenance fees per member
        // Subquery to get the latest valid_to date for maintenance fees per member using Items
        $latestMaintenance = \App\Models\FinancialInvoiceItem::select(
            'financial_invoices.member_id',
            \Illuminate\Support\Facades\DB::raw('MAX(financial_invoice_items.end_date) as last_valid_date'),
            \Illuminate\Support\Facades\DB::raw('MAX(transactions.date) as last_payment_date')
        )
            ->join('financial_invoices', 'financial_invoice_items.invoice_id', '=', 'financial_invoices.id')
            ->leftJoin('transactions', function ($join) {
                $join
                    ->on('financial_invoices.id', '=', 'transactions.invoice_id')
                    ->where('transactions.type', 'credit');
            })
            ->where('financial_invoice_items.fee_type', '4')
            ->where('financial_invoices.status', 'paid')
            ->groupBy('financial_invoices.member_id');

        $maintenanceLedger = DB::table('transactions')
            ->join('financial_invoices', 'transactions.invoice_id', '=', 'financial_invoices.id')
            ->join('financial_invoice_items', function ($join) {
                $join
                    ->on('transactions.reference_id', '=', 'financial_invoice_items.id')
                    ->where('transactions.reference_type', '=', \App\Models\FinancialInvoiceItem::class);
            })
            ->whereNull('transactions.deleted_at')
            ->whereNull('financial_invoice_items.deleted_at')
            ->where('financial_invoice_items.fee_type', '4')
            ->whereNotIn('financial_invoices.status', ['cancelled', 'refunded'])
            ->groupBy('financial_invoices.member_id')
            ->select(
                'financial_invoices.member_id',
                DB::raw("SUM(CASE WHEN transactions.type = 'debit' THEN transactions.amount ELSE 0 END) as maintenance_debit"),
                DB::raw("SUM(CASE WHEN transactions.type = 'credit' THEN transactions.amount ELSE 0 END) as maintenance_credit")
            );

        $maintenanceDiscounts = DB::table('financial_invoice_items')
            ->join('financial_invoices', 'financial_invoice_items.invoice_id', '=', 'financial_invoices.id')
            ->whereNull('financial_invoice_items.deleted_at')
            ->where('financial_invoice_items.fee_type', '4')
            ->whereNotIn('financial_invoices.status', ['cancelled', 'refunded'])
            ->groupBy('financial_invoices.member_id')
            ->select(
                'financial_invoices.member_id',
                DB::raw('SUM(COALESCE(financial_invoice_items.discount_amount, 0)) as maintenance_discount')
            );

        // Main Query
        $query = Member::with(['memberCategory:id,name,description,subscription_fee'])
            ->leftJoinSub($latestMaintenance, 'latest_maintenance', function ($join) {
                $join->on('members.id', '=', 'latest_maintenance.member_id');
            })
            ->leftJoinSub($maintenanceLedger, 'maintenance_ledger', function ($join) {
                $join->on('members.id', '=', 'maintenance_ledger.member_id');
            })
            ->leftJoinSub($maintenanceDiscounts, 'maintenance_discounts', function ($join) {
                $join->on('members.id', '=', 'maintenance_discounts.member_id');
            })
            ->whereNull('parent_id')
            ->select(
                'members.*',
                'latest_maintenance.last_valid_date',
                'latest_maintenance.last_payment_date',
                'maintenance_ledger.maintenance_debit',
                'maintenance_ledger.maintenance_credit',
                'maintenance_discounts.maintenance_discount'
            );

        // Apply member category filter
        if ($categoryFilter) {
            $query->whereIn('member_category_id', (array) $categoryFilter);
        }

        // Apply status filter
        if ($statusFilter) {
            $query->whereIn('status', (array) $statusFilter);
        }

        // Apply search filters
        $nameSearch = $request->input('name_search');
        $noSearch = $request->input('membership_no_search');
        $memberIds = $request->input('member_ids');
        if ($memberIds) {
            $query->whereIn('members.id', (array) $memberIds);
        }

        if ($memberId) {
            $query->where('members.id', $memberId);
        } elseif ($memberSearch) {
            $query->where(function ($q) use ($memberSearch) {
                $q
                    ->where('full_name', 'like', "%{$memberSearch}%")
                    ->orWhere('membership_no', 'like', "%{$memberSearch}%");
            });
        }

        if ($nameSearch) {
            $query->where('full_name', 'like', "%{$nameSearch}%");
        }

        if ($noSearch) {
            $query->where('membership_no', 'like', "%{$noSearch}%");
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

        $query->where(function ($q) use ($untilDate) {
            $q
                ->whereNull('latest_maintenance.last_valid_date')
                ->orWhereDate('latest_maintenance.last_valid_date', '<=', $untilDate);
        });

        $currentDate = \Carbon\Carbon::parse($untilDate)->format('Y-m-d');
        $query->selectRaw("
            CEIL( GREATEST(0, TIMESTAMPDIFF(MONTH,
                COALESCE(latest_maintenance.last_valid_date, members.membership_date, members.created_at),
                '$currentDate'
            )) / 3 ) as pending_quarters_calc
        ");
        $query->having('pending_quarters_calc', '>', 0);
        if ($quartersFilter === '6+') {
            $query->having('pending_quarters_calc', '>=', 6);
        } else {
            $query->having('pending_quarters_calc', '=', (int) $quartersFilter);
        }

        $members = $query->get();

        $printRows = $members->map(function ($member) use ($untilDate) {
            $monthlyFee = (float) ($member->total_maintenance_fee ?? 0);
            if ($monthlyFee <= 0) {
                $monthlyFee = (float) ($member->maintenance_fee ?? 0);
            }
            if ($monthlyFee <= 0 && $member->memberCategory) {
                $monthlyFee = (float) ($member->memberCategory->subscription_fee ?? 0);
            }
            $pendingQuarters = (int) ($member->pending_quarters_calc ?? 0);
            $quarterlyFee = $monthlyFee * 3;
            $pendingAmount = $quarterlyFee * $pendingQuarters;

            $discount = (float) ($member->maintenance_discount ?? 0);
            $debit = (float) ($member->maintenance_debit ?? 0);
            $credit = (float) ($member->maintenance_credit ?? 0);
            $balance = $debit - $credit;

            $invoice = $this->ensurePendingMaintenanceInvoice($member, $pendingQuarters, $untilDate, $pendingAmount);

            return [
                'id' => $member->id,
                'membership_no' => $member->membership_no,
                'membership_date' => $member->membership_date,
                'full_name' => $member->full_name,
                'contact' => $member->mobile_number_a,
                'cnic' => $member->cnic_no,
                'address' => $member->current_address,
                'category' => $member->memberCategory ? $member->memberCategory->name : 'N/A',
                'monthly_fee' => $monthlyFee,
                'quarterly_fee' => $quarterlyFee,
                'discount' => $discount,
                'debit' => $debit,
                'credit' => $credit,
                'balance' => $balance,
                'total_pending_amount' => $pendingAmount,
                'last_payment_date' => $member->last_payment_date,
                'paid_until_date' => $member->last_valid_date,
                'status' => $member->status,
                'invoice_id' => $invoice ? $invoice->id : null,
                'invoice_no' => $invoice ? $invoice->invoice_no : null,
            ];
        });

        // Calculate summary statistics
        $totalMembers = $printRows->count();
        $totalPendingAmount = $printRows->sum('total_pending_amount');

        return Inertia::render('App/Admin/Membership/PendingMaintenanceReportPrint', [
            'members' => $printRows,
            'statistics' => [
                'total_members' => $totalMembers,
                'total_pending_amount' => $totalPendingAmount,
                'total_discount' => $printRows->sum('discount'),
                'total_debit' => $printRows->sum('debit'),
                'total_credit' => $printRows->sum('credit'),
                'total_balance' => $printRows->sum('balance'),
                'average_pending_per_member' => $totalMembers > 0 ? round($totalPendingAmount / $totalMembers, 2) : 0,
            ],
            'filters' => [
                'status' => $statusFilter ?? [],
                'categories' => $categoryFilter ?? [],
                'date' => $untilDate,
                'member_search' => $memberSearch,
                'member_id' => $memberId,
                'cnic_search' => $cnicSearch,
                'contact_search' => $contactSearch,
                'quarters_pending' => $quartersFilter,
            ],
            'all_categories' => MemberCategory::select('id', 'name')->get(),
        ]);
    }

    public function pendingMaintenanceBulkStatusChange(Request $request)
    {
        $request->validate([
            'member_ids' => 'required|array',
            'member_ids.*' => 'exists:members,id',
            'status' => 'required|string',
            'reason' => 'nullable|string',
        ]);

        $memberIds = $request->input('member_ids');
        $status = $request->input('status');
        $reason = $request->input('reason');

        // Logic to update status
        Member::whereIn('id', $memberIds)->update([
            'status' => $status,
            // 'status_change_reason' => $reason // Assuming there's a column or log for this. If not, we skip or add it.
        ]);

        // Log the change (Optional implementation detail)
        // if ($reason) { ... }

        return redirect()->back()->with('success', 'Members status updated successfully.');
    }

    public function pendingMaintenanceBulkPrint(Request $request)
    {
        $untilDate = $this->parseDateToYmd($request->input('date')) ?: now()->format('Y-m-d');
        $request->merge(['member_ids' => (array) $request->input('member_ids', [])]);

        return $this->pendingMaintenanceReportPrint($request);
    }

    public function pendingMaintenanceReportExport(Request $request)
    {
        $statusFilter = $request->input('status');
        $categoryFilter = $request->input('categories');

        $untilDate = $this->parseDateToYmd($request->input('date')) ?: now()->format('Y-m-d');

        $memberSearch = $request->input('member_search');
        $memberId = $request->input('member_id');
        $cnicSearch = $request->input('cnic_search');
        $contactSearch = $request->input('contact_search');
        $quartersFilter = (string) ($request->input('quarters_pending') ?? '');
        if ($quartersFilter === '') {
            $quartersFilter = '1';
        }

        $latestMaintenance = \App\Models\FinancialInvoiceItem::select(
            'financial_invoices.member_id',
            \Illuminate\Support\Facades\DB::raw('MAX(financial_invoice_items.end_date) as last_valid_date'),
            \Illuminate\Support\Facades\DB::raw('MAX(transactions.date) as last_payment_date')
        )
            ->join('financial_invoices', 'financial_invoice_items.invoice_id', '=', 'financial_invoices.id')
            ->leftJoin('transactions', function ($join) {
                $join
                    ->on('financial_invoices.id', '=', 'transactions.invoice_id')
                    ->where('transactions.type', 'credit');
            })
            ->where('financial_invoice_items.fee_type', '4')
            ->where('financial_invoices.status', 'paid')
            ->groupBy('financial_invoices.member_id');

        $maintenanceLedger = DB::table('transactions')
            ->join('financial_invoices', 'transactions.invoice_id', '=', 'financial_invoices.id')
            ->join('financial_invoice_items', function ($join) {
                $join
                    ->on('transactions.reference_id', '=', 'financial_invoice_items.id')
                    ->where('transactions.reference_type', '=', \App\Models\FinancialInvoiceItem::class);
            })
            ->whereNull('transactions.deleted_at')
            ->whereNull('financial_invoice_items.deleted_at')
            ->where('financial_invoice_items.fee_type', '4')
            ->whereNotIn('financial_invoices.status', ['cancelled', 'refunded'])
            ->groupBy('financial_invoices.member_id')
            ->select(
                'financial_invoices.member_id',
                DB::raw("SUM(CASE WHEN transactions.type = 'debit' THEN transactions.amount ELSE 0 END) as maintenance_debit"),
                DB::raw("SUM(CASE WHEN transactions.type = 'credit' THEN transactions.amount ELSE 0 END) as maintenance_credit")
            );

        $maintenanceDiscounts = DB::table('financial_invoice_items')
            ->join('financial_invoices', 'financial_invoice_items.invoice_id', '=', 'financial_invoices.id')
            ->whereNull('financial_invoice_items.deleted_at')
            ->where('financial_invoice_items.fee_type', '4')
            ->whereNotIn('financial_invoices.status', ['cancelled', 'refunded'])
            ->groupBy('financial_invoices.member_id')
            ->select(
                'financial_invoices.member_id',
                DB::raw('SUM(COALESCE(financial_invoice_items.discount_amount, 0)) as maintenance_discount')
            );

        $query = Member::with(['memberCategory:id,name,description,subscription_fee'])
            ->leftJoinSub($latestMaintenance, 'latest_maintenance', function ($join) {
                $join->on('members.id', '=', 'latest_maintenance.member_id');
            })
            ->leftJoinSub($maintenanceLedger, 'maintenance_ledger', function ($join) {
                $join->on('members.id', '=', 'maintenance_ledger.member_id');
            })
            ->leftJoinSub($maintenanceDiscounts, 'maintenance_discounts', function ($join) {
                $join->on('members.id', '=', 'maintenance_discounts.member_id');
            })
            ->whereNull('parent_id')
            ->select(
                'members.*',
                'latest_maintenance.last_valid_date',
                'latest_maintenance.last_payment_date',
                'maintenance_ledger.maintenance_debit',
                'maintenance_ledger.maintenance_credit',
                'maintenance_discounts.maintenance_discount'
            );

        if ($categoryFilter) {
            $query->whereIn('member_category_id', (array) $categoryFilter);
        }

        if ($statusFilter) {
            $query->whereIn('status', (array) $statusFilter);
        }

        $nameSearch = $request->input('name_search');
        $noSearch = $request->input('membership_no_search');
        $memberIds = $request->input('member_ids');
        if ($memberIds) {
            $query->whereIn('members.id', (array) $memberIds);
        }

        if ($memberId) {
            $query->where('members.id', $memberId);
        } elseif ($memberSearch) {
            $query->where(function ($q) use ($memberSearch) {
                $q
                    ->where('full_name', 'like', "%{$memberSearch}%")
                    ->orWhere('membership_no', 'like', "%{$memberSearch}%");
            });
        }

        if ($nameSearch) {
            $query->where('full_name', 'like', "%{$nameSearch}%");
        }

        if ($noSearch) {
            $query->where('membership_no', 'like', "%{$noSearch}%");
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

        $query->where(function ($q) use ($untilDate) {
            $q
                ->whereNull('latest_maintenance.last_valid_date')
                ->orWhereDate('latest_maintenance.last_valid_date', '<=', $untilDate);
        });

        $currentDate = \Carbon\Carbon::parse($untilDate)->format('Y-m-d');
        $query->selectRaw("
            CEIL( GREATEST(0, TIMESTAMPDIFF(MONTH,
                COALESCE(latest_maintenance.last_valid_date, members.membership_date, members.created_at),
                '$currentDate'
            )) / 3 ) as pending_quarters_calc
        ");
        $query->having('pending_quarters_calc', '>', 0);
        if ($quartersFilter === '6+') {
            $query->having('pending_quarters_calc', '>=', 6);
        } else {
            $query->having('pending_quarters_calc', '=', (int) $quartersFilter);
        }

        $members = $query->get();
        $rows = $members->map(function ($member) {
            $monthlyFee = (float) ($member->total_maintenance_fee ?? 0);
            if ($monthlyFee <= 0) {
                $monthlyFee = (float) ($member->maintenance_fee ?? 0);
            }
            if ($monthlyFee <= 0 && $member->memberCategory) {
                $monthlyFee = (float) ($member->memberCategory->subscription_fee ?? 0);
            }
            $pendingQuarters = (int) ($member->pending_quarters_calc ?? 0);
            $quarterlyFee = $monthlyFee * 3;
            $totalPendingAmount = $quarterlyFee * $pendingQuarters;

            $discount = (float) ($member->maintenance_discount ?? 0);
            $debit = (float) ($member->maintenance_debit ?? 0);
            $credit = (float) ($member->maintenance_credit ?? 0);
            $balance = $debit - $credit;

            return [
                'id' => $member->id,
                'membership_no' => $member->membership_no,
                'full_name' => $member->full_name,
                'contact' => $member->mobile_number_a,
                'address' => $member->current_address,
                'category' => $member->memberCategory ? $member->memberCategory->name : '',
                'quarterly_fee' => $quarterlyFee,
                'discount' => $discount,
                'debit' => $debit,
                'credit' => $credit,
                'balance' => $balance,
                'total_pending_amount' => $totalPendingAmount,
                'status' => $member->status,
            ];
        });

        $filename = 'pending-maintenance-report-' . now()->format('Ymd-His') . '.csv';

        return response()->streamDownload(function () use ($rows) {
            $out = fopen('php://output', 'w');
            fputcsv($out, [
                'ID',
                'Membership No',
                'Name',
                'Contact',
                'Address',
                'Category',
                'Per Quarter',
                'Discount',
                'Debit',
                'Credit',
                'Balance',
                'Pending Amount',
                'Status',
            ]);

            foreach ($rows as $row) {
                fputcsv($out, [
                    $row['id'] ?? '',
                    $row['membership_no'] ?? '',
                    $row['full_name'] ?? '',
                    $row['contact'] ?? '',
                    $row['address'] ?? '',
                    $row['category'] ?? '',
                    $row['quarterly_fee'] ?? 0,
                    $row['discount'] ?? 0,
                    $row['debit'] ?? 0,
                    $row['credit'] ?? 0,
                    $row['balance'] ?? 0,
                    $row['total_pending_amount'] ?? 0,
                    $row['status'] ?? '',
                ]);
            }

            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    private function ensurePendingMaintenanceInvoice($member, int $pendingQuarters, string $untilDate, float $amount): ?FinancialInvoice
    {
        if ($pendingQuarters <= 0 || $amount <= 0) {
            return null;
        }

        $baseStart = null;
        if (!empty($member->last_valid_date)) {
            $baseStart = \Carbon\Carbon::parse($member->last_valid_date)->addDay();
        } elseif (!empty($member->membership_date)) {
            $baseStart = \Carbon\Carbon::parse($member->membership_date);
        } else {
            $baseStart = \Carbon\Carbon::parse($member->created_at);
        }

        $startDate = $baseStart->copy()->startOfDay();
        $endDate = $startDate->copy()->addMonths($pendingQuarters * 3)->subDay()->startOfDay();

        $existingItem = \App\Models\FinancialInvoiceItem::query()
            ->where('fee_type', '4')
            ->whereDate('start_date', $startDate->toDateString())
            ->whereDate('end_date', $endDate->toDateString())
            ->whereHas('invoice', function ($q) use ($member) {
                $q
                    ->where('member_id', $member->id)
                    ->whereNotIn('status', ['cancelled', 'refunded']);
            })
            ->with('invoice')
            ->first();

        if ($existingItem && $existingItem->invoice) {
            return $existingItem->invoice;
        }

        return DB::transaction(function () use ($member, $startDate, $endDate, $untilDate, $amount) {
            $issueDate = \Carbon\Carbon::parse($untilDate)->startOfDay();
            $invoiceNo = $this->generateNextInvoiceNumber();

            $invoice = FinancialInvoice::create([
                'invoice_no' => $invoiceNo,
                'member_id' => $member->id,
                'invoiceable_id' => $member->id,
                'invoiceable_type' => Member::class,
                'fee_type' => 'maintenance_fee',
                'invoice_type' => 'invoice',
                'amount' => (int) round($amount, 0),
                'total_price' => (int) round($amount, 0),
                'paid_amount' => 0,
                'customer_charges' => (int) round($amount, 0),
                'status' => 'unpaid',
                'issue_date' => $issueDate,
                'due_date' => $issueDate->copy()->addDays(10),
                'created_by' => \Illuminate\Support\Facades\Auth::id(),
                'data' => [
                    'member_name' => $member->full_name,
                    'action' => 'pending_maintenance_report_print',
                ],
            ]);

            $item = \App\Models\FinancialInvoiceItem::create([
                'invoice_id' => $invoice->id,
                'fee_type' => '4',
                'description' => 'Maintenance Fee (Pending)',
                'qty' => 1,
                'amount' => (int) round($amount, 0),
                'sub_total' => (int) round($amount, 0),
                'tax_percentage' => 0,
                'tax_amount' => 0,
                'discount_amount' => 0,
                'total' => (int) round($amount, 0),
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
            ]);

            \App\Models\Transaction::create([
                'payable_type' => Member::class,
                'payable_id' => $member->id,
                'type' => 'debit',
                'amount' => (int) round($amount, 0),
                'reference_type' => \App\Models\FinancialInvoiceItem::class,
                'reference_id' => $item->id,
                'invoice_id' => $invoice->id,
                'description' => "Invoice #{$invoice->invoice_no} - Maintenance Fee (Pending)",
                'date' => $issueDate,
                'created_by' => \Illuminate\Support\Facades\Auth::id(),
            ]);

            return $invoice;
        });
    }

    private function generateNextInvoiceNumber(): string
    {
        $lastInvoice = FinancialInvoice::withTrashed()
            ->orderBy('invoice_no', 'desc')
            ->whereNotNull('invoice_no')
            ->first();

        $nextNumber = 1;
        if ($lastInvoice && $lastInvoice->invoice_no !== null) {
            $nextNumber = (int) $lastInvoice->invoice_no + 1;
        }

        while (FinancialInvoice::withTrashed()->where('invoice_no', (string) $nextNumber)->exists()) {
            $nextNumber++;
        }

        return (string) $nextNumber;
    }

    public function supplementaryCardReport(Request $request)
    {
        $categoryFilter = $request->input('categories');
        $cardStatusFilter = $request->input('card_status');

        // Get all family members (supplementary members with parent_id)
        // AND who have a valid Subscription record (where they are the family_member_id)
        $supplementaryQuery = Member::whereNotNull('parent_id')
            ->whereHas('subscriptions', function ($q) {
                $q->whereColumn('family_member_id', 'members.id');
            });

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
        // AND who have a valid Subscription record
        $supplementaryQuery = Member::whereNotNull('parent_id')
            ->whereHas('subscriptions', function ($q) {
                $q->whereColumn('family_member_id', 'members.id');
            });

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
        $membershipNoSearch = $request->input('membership_no_search');
        $invoiceSearch = $request->input('invoice_search');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $dateFromParsed = $dateFrom ? \Carbon\Carbon::createFromFormat('d-m-Y', $dateFrom)->format('Y-m-d') : null;
        $dateToParsed = $dateTo ? \Carbon\Carbon::createFromFormat('d-m-Y', $dateTo)->format('Y-m-d') : null;
        $cityFilter = $request->input('city');
        $paymentMethodFilter = $request->input('payment_method');
        $categoryFilter = $request->input('categories');
        $genderFilter = $request->input('gender');
        $cashierFilter = $request->input('cashier');

        // Get maintenance fee transactions - using Items for Mixed support
        // Include createdBy relation to show who created the receipt
        $query = \App\Models\FinancialInvoiceItem::with(['invoice.member.memberCategory', 'invoice.createdBy'])
            ->where('fee_type', '4')
            // Only paid invoices
            ->whereHas('invoice', function ($q) {
                $q->where('status', 'paid');
            })
            ->select('financial_invoice_items.*');

        // Apply member search filter
        if ($memberSearch) {
            $query->whereHas('invoice.member', function ($q) use ($memberSearch) {
                $q->where('full_name', 'like', "%{$memberSearch}%");
            });
        }

        // Apply membership number search filter
        if ($membershipNoSearch) {
            $query->whereHas('invoice.member', function ($q) use ($membershipNoSearch) {
                $q->where('membership_no', 'like', "%{$membershipNoSearch}%");
            });
        }

        // Apply invoice search filter
        if ($invoiceSearch) {
            $query->whereHas('invoice', function ($q) use ($invoiceSearch) {
                $q->where('invoice_no', 'like', "%{$invoiceSearch}%");
            });
        }

        // Apply date range filter by payment (credit) date
        if ($dateFromParsed) {
            $query->whereHas('invoice.transactions', function ($q) use ($dateFromParsed) {
                $q->where('type', 'credit')->whereDate('date', '>=', $dateFromParsed);
            });
        }
        if ($dateToParsed) {
            $query->whereHas('invoice.transactions', function ($q) use ($dateToParsed) {
                $q->where('type', 'credit')->whereDate('date', '<=', $dateToParsed);
            });
        }

        // Apply city filter
        if ($cityFilter) {
            $query->whereHas('invoice.member', function ($q) use ($cityFilter) {
                $q->where('current_city', $cityFilter);
            });
        }

        // Apply payment method filter (normalize labels to stored values)
        if ($paymentMethodFilter) {
            $map = [
                'Cash' => ['cash'],
                'Credit Card' => ['credit_card'],
                'Cheque' => ['cheque'],
                'Bank Transfer' => ['bank_online', 'online'],
            ];
            $methods = $map[$paymentMethodFilter] ?? [$paymentMethodFilter];
            $query->whereHas('invoice', function ($q) use ($methods) {
                $q->whereIn('payment_method', $methods);
            });
        }

        // Apply category filter
        if ($categoryFilter) {
            $query->whereHas('invoice.member', function ($q) use ($categoryFilter) {
                $q->whereIn('member_category_id', (array) $categoryFilter);
            });
        }

        // Apply gender filter
        if ($genderFilter) {
            $query->whereHas('invoice.member', function ($q) use ($genderFilter) {
                $q->where('gender', $genderFilter);
            });
        }

        // Apply cashier filter (user who created the receipt)
        if ($cashierFilter) {
            $query->whereHas('invoice', function ($q) use ($cashierFilter) {
                $q->where('created_by', $cashierFilter);
            });
        }

        // Get paginated results
        $transactions = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        // Calculate statistics
        // Need to sum ITEM amounts now, or 'total'.
        $statsQuery = clone $query;
        // Optimization: Don't load relations for stats
        $statsQuery->with = [];

        $totalAmount = $statsQuery->sum('total');
        $totalTransactions = $statsQuery->count();
        $averageAmount = $totalTransactions > 0 ? round($totalAmount / $totalTransactions, 2) : 0;

        // Get filter options
        $allCities = Member::distinct()->pluck('current_city')->filter()->values();
        $allPaymentMethods = ['Cash', 'Credit Card', 'Bank Transfer', 'Cheque'];
        $allGenders = ['Male', 'Female'];
        // Get all users for cashier filter
        $allCashiers = \App\Models\User::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('App/Admin/Membership/MonthlyMaintenanceFeeReport', [
            'transactions' => $transactions,
            'statistics' => [
                'total_amount' => $totalAmount,
                'total_transactions' => $totalTransactions,
                'average_amount' => $averageAmount,
            ],
            'filters' => [
                'member_search' => $memberSearch,
                'membership_no_search' => $membershipNoSearch,
                'invoice_search' => $invoiceSearch,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'city' => $cityFilter,
                'payment_method' => $paymentMethodFilter,
                'categories' => $categoryFilter ?? [],
                'gender' => $genderFilter,
                'cashier' => $cashierFilter,
            ],
            'all_cities' => $allCities,
            'all_payment_methods' => $allPaymentMethods,
            'all_categories' => MemberCategory::select('id', 'name')->get(),
            'all_genders' => $allGenders,
            'all_cashiers' => $allCashiers,
        ]);
    }

    public function monthlyMaintenanceFeeReportPrint(Request $request)
    {
        $memberSearch = $request->input('member_search');
        $membershipNoSearch = $request->input('membership_no_search');
        $invoiceSearch = $request->input('invoice_search');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $dateFromParsed = $dateFrom ? \Carbon\Carbon::createFromFormat('d-m-Y', $dateFrom)->format('Y-m-d') : null;
        $dateToParsed = $dateTo ? \Carbon\Carbon::createFromFormat('d-m-Y', $dateTo)->format('Y-m-d') : null;
        $cityFilter = $request->input('city');
        $paymentMethodFilter = $request->input('payment_method');
        $categoryFilter = $request->input('categories');
        $genderFilter = $request->input('gender');
        $page = $request->input('page', 1);

        // Get maintenance fee transactions with pagination - using Items for Mixed support
        $query = \App\Models\FinancialInvoiceItem::with(['invoice.member.memberCategory', 'invoice'])
            ->where('fee_type', '4')
            // Only paid invoices
            ->whereHas('invoice', function ($q) {
                $q->where('status', 'paid');
            })
            ->select('financial_invoice_items.*');

        // Apply member search filter
        if ($memberSearch) {
            $query->whereHas('invoice.member', function ($q) use ($memberSearch) {
                $q->where('full_name', 'like', "%{$memberSearch}%");
            });
        }

        // Apply membership number search filter
        if ($membershipNoSearch) {
            $query->whereHas('invoice.member', function ($q) use ($membershipNoSearch) {
                $q->where('membership_no', 'like', "%{$membershipNoSearch}%");
            });
        }

        // Apply invoice search filter
        if ($invoiceSearch) {
            $query->whereHas('invoice', function ($q) use ($invoiceSearch) {
                $q->where('invoice_no', 'like', "%{$invoiceSearch}%");
            });
        }

        // Apply date range filter by payment (credit) date
        if ($dateFromParsed) {
            $query->whereHas('invoice.transactions', function ($q) use ($dateFromParsed) {
                $q->where('type', 'credit')->whereDate('date', '>=', $dateFromParsed);
            });
        }
        if ($dateToParsed) {
            $query->whereHas('invoice.transactions', function ($q) use ($dateToParsed) {
                $q->where('type', 'credit')->whereDate('date', '<=', $dateToParsed);
            });
        }

        // Apply city filter
        if ($cityFilter) {
            $query->whereHas('invoice.member', function ($q) use ($cityFilter) {
                $q->where('current_city', $cityFilter);
            });
        }

        // Apply payment method filter (normalize labels to stored values)
        if ($paymentMethodFilter) {
            $map = [
                'Cash' => ['cash'],
                'Credit Card' => ['credit_card'],
                'Cheque' => ['cheque'],
                'Bank Transfer' => ['bank_online', 'online'],
            ];
            $methods = $map[$paymentMethodFilter] ?? [$paymentMethodFilter];
            $query->whereHas('invoice', function ($q) use ($methods) {
                $q->whereIn('payment_method', $methods);
            });
        }

        // Apply category filter
        if ($categoryFilter) {
            $query->whereHas('invoice.member', function ($q) use ($categoryFilter) {
                $q->whereIn('member_category_id', (array) $categoryFilter);
            });
        }

        // Apply gender filter
        if ($genderFilter) {
            $query->whereHas('invoice.member', function ($q) use ($genderFilter) {
                $q->where('gender', $genderFilter);
            });
        }

        // Get paginated results (same 15 per page)
        $transactions = $query->orderBy('created_at', 'desc')->paginate(15, ['*'], 'page', $page);

        // Calculate statistics from all filtered transactions
        $allTransactions = $query->get();
        $totalAmount = $allTransactions->sum('total');
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
                'membership_no_search' => $membershipNoSearch,
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
        $cashierFilter = $request->input('cashier');

        // Query FinancialInvoiceItem with fee_type = 6 (Charges) and financial_charge_type_id IN (3, 4) for New Year Eve
        $query = \App\Models\FinancialInvoiceItem::with(['invoice.member.memberCategory', 'invoice.createdBy'])
            ->where('fee_type', '6')  // 6 = Charges
            ->whereIn('financial_charge_type_id', [3, 4])  // 3 = New Year Eve (Member), 4 = New Year Eve (Guest)
            ->select('financial_invoice_items.*');

        // Apply member search filter
        if ($memberSearch) {
            $query->whereHas('invoice.member', function ($q) use ($memberSearch) {
                $q
                    ->where('full_name', 'like', "%{$memberSearch}%")
                    ->orWhere('membership_no', 'like', "%{$memberSearch}%");
            });
        }

        // Apply invoice search filter
        if ($invoiceSearch) {
            $query->whereHas('invoice', function ($q) use ($invoiceSearch) {
                $q->where('invoice_no', 'like', "%{$invoiceSearch}%");
            });
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
            $query->whereHas('invoice.member', function ($q) use ($cityFilter) {
                $q->where('current_city', $cityFilter);
            });
        }

        // Apply payment method filter
        if ($paymentMethodFilter) {
            $query->whereHas('invoice', function ($q) use ($paymentMethodFilter) {
                $q->where('payment_method', $paymentMethodFilter);
            });
        }

        // Apply category filter
        if ($categoryFilter) {
            $query->whereHas('invoice.member', function ($q) use ($categoryFilter) {
                $q->whereIn('member_category_id', (array) $categoryFilter);
            });
        }

        // Apply gender filter
        if ($genderFilter) {
            $query->whereHas('invoice.member', function ($q) use ($genderFilter) {
                $q->where('gender', $genderFilter);
            });
        }

        // Apply cashier filter
        if ($cashierFilter) {
            $query->whereHas('invoice', function ($q) use ($cashierFilter) {
                $q->where('created_by', $cashierFilter);
            });
        }

        // Get paginated results
        $transactions = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        // Calculate statistics
        $allTransactions = $query->get();
        $totalAmount = $allTransactions->sum('total');
        $totalTransactions = $allTransactions->count();
        $averageAmount = $totalTransactions > 0 ? round($totalAmount / $totalTransactions, 2) : 0;

        // Get filter options
        $allCities = Member::distinct()->pluck('current_city')->filter()->values();
        $allPaymentMethods = ['Cash', 'Credit Card', 'Bank Transfer', 'Cheque'];
        $allGenders = ['Male', 'Female'];
        $allCashiers = \App\Models\User::select('id', 'name')->orderBy('name')->get();

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
                'cashier' => $cashierFilter,
            ],
            'all_cities' => $allCities,
            'all_payment_methods' => $allPaymentMethods,
            'all_categories' => MemberCategory::select('id', 'name')->get(),
            'all_genders' => $allGenders,
            'all_cashiers' => $allCashiers,
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
        // Query FinancialInvoiceItem with fee_type = 6 (Charges) and financial_charge_type_id IN (3, 4) for New Year Eve
        $query = \App\Models\FinancialInvoiceItem::with(['invoice.member.memberCategory', 'invoice.createdBy'])
            ->where('fee_type', '6')  // 6 = Charges
            ->whereIn('financial_charge_type_id', [3, 4])  // 3 = New Year Eve (Member), 4 = New Year Eve (Guest)
            ->select('financial_invoice_items.*');

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
        $cashierFilter = $request->input('cashier');
        $page = $request->input('page', 1);

        // Get reinstating fee transactions with pagination
        // Query FinancialInvoiceItem with fee_type = 6 (Charges) and financial_charge_type_id = 2 (Reinstating Fee)
        $query = \App\Models\FinancialInvoiceItem::with(['invoice.member.memberCategory', 'invoice.createdBy'])
            ->where('fee_type', '6')  // 6 = Charges
            ->where('financial_charge_type_id', 2)  // 2 = Reinstating Fee
            ->select('financial_invoice_items.*');

        // Apply member search filter
        if ($memberSearch) {
            $query->whereHas('invoice.member', function ($q) use ($memberSearch) {
                $q
                    ->where('full_name', 'like', "%{$memberSearch}%")
                    ->orWhere('membership_no', 'like', "%{$memberSearch}%");
            });
        }

        // Apply invoice search filter
        if ($invoiceSearch) {
            $query->whereHas('invoice', function ($q) use ($invoiceSearch) {
                $q->where('invoice_no', 'like', "%{$invoiceSearch}%");
            });
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
            $query->whereHas('invoice.member', function ($q) use ($cityFilter) {
                $q->where('current_city', $cityFilter);
            });
        }

        // Apply payment method filter
        if ($paymentMethodFilter) {
            $query->whereHas('invoice', function ($q) use ($paymentMethodFilter) {
                $q->where('payment_method', $paymentMethodFilter);
            });
        }

        // Apply category filter
        if ($categoryFilter) {
            $query->whereHas('invoice.member', function ($q) use ($categoryFilter) {
                $q->whereIn('member_category_id', (array) $categoryFilter);
            });
        }

        // Apply gender filter
        if ($genderFilter) {
            $query->whereHas('invoice.member', function ($q) use ($genderFilter) {
                $q->where('gender', $genderFilter);
            });
        }

        // Apply cashier filter
        if ($cashierFilter) {
            $query->whereHas('invoice', function ($q) use ($cashierFilter) {
                $q->where('created_by', $cashierFilter);
            });
        }

        // Get paginated results
        $transactions = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        // Calculate statistics
        $allTransactions = $query->get();
        $totalAmount = $allTransactions->sum('total');
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
            'all_cashiers' => \App\Models\User::select('id', 'name')->orderBy('name')->get(),
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
        $cashierFilter = $request->input('cashier');
        $page = $request->input('page', 1);

        // Get reinstating fee transactions with pagination
        // Get reinstating fee transactions with pagination
        $query = \App\Models\FinancialInvoiceItem::with(['invoice.member.memberCategory', 'invoice.createdBy'])
            ->where('fee_type', '6')  // 6 = Charges
            ->where('financial_charge_type_id', 2)  // 2 = Reinstating Fee
            ->select('financial_invoice_items.*');

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

        // Apply cashier filter
        if ($cashierFilter) {
            $query->whereHas('invoice', function ($q) use ($cashierFilter) {
                $q->where('created_by', $cashierFilter);
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
                'cashier' => $cashierFilter,
            ],
            'all_categories' => MemberCategory::select('id', 'name')->get(),
            'all_cashiers' => \App\Models\User::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function sportsSubscriptionsReport(Request $request)
    {
        $memberSearch = $request->input('member_search');
        $membershipNoSearch = $request->input('membership_no_search');
        $invoiceSearch = $request->input('invoice_search');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $dateFromParsed = $this->parseDateToYmd($dateFrom);
        $dateToParsed = $this->parseDateToYmd($dateTo);
        $cityFilter = $request->input('city');
        $paymentMethodFilter = $request->input('payment_method');
        $categoryFilter = $request->input('categories');
        $genderFilter = $request->input('gender');
        $familyMemberFilter = $request->input('family_member');
        $customerTypeFilter = $request->input('customer_type');  // member or guest
        $subscriptionCategoryFilter = $request->input('subscription_category_id');
        $cashierFilter = $request->input('cashier');

        // Get subscription fee transactions only - using Items for Mixed Invoice support
        // Include createdBy for payment receiver and customer for guest subscriptions
        $query = \App\Models\FinancialInvoiceItem::with(['invoice.member.memberCategory', 'invoice.corporateMember', 'invoice.customer', 'invoice.createdBy', 'subscriptionType', 'subscriptionCategory', 'familyMember'])
            ->where('fee_type', '5')  // 5 = Subscription
            // Only paid invoices
            ->whereHas('invoice', function ($q) {
                $q->where('status', 'paid');
            })
            ->select('financial_invoice_items.*');

        // Apply member search filter
        if ($memberSearch) {
            if ($customerTypeFilter === 'member') {
                $query->whereHas('invoice.member', function ($q) use ($memberSearch) {
                    $q->where('full_name', 'like', "%{$memberSearch}%");
                });
            } elseif ($customerTypeFilter === 'corporate') {
                $query->whereHas('invoice.corporateMember', function ($q) use ($memberSearch) {
                    $q->where('full_name', 'like', "%{$memberSearch}%");
                });
            } elseif ($customerTypeFilter === 'guest') {
                $query->whereHas('invoice.customer', function ($q) use ($memberSearch) {
                    $q->where('name', 'like', "%{$memberSearch}%");
                });
            } else {
                $query->whereHas('invoice', function ($q) use ($memberSearch) {
                    $q
                        ->whereHas('member', function ($m) use ($memberSearch) {
                            $m->where('full_name', 'like', "%{$memberSearch}%");
                        })
                        ->orWhereHas('corporateMember', function ($m) use ($memberSearch) {
                            $m->where('full_name', 'like', "%{$memberSearch}%");
                        })
                        ->orWhereHas('customer', function ($c) use ($memberSearch) {
                            $c->where('name', 'like', "%{$memberSearch}%");
                        });
                });
            }
        }

        // Apply membership number search filter
        if ($membershipNoSearch) {
            if ($customerTypeFilter === 'member') {
                $query->whereHas('invoice.member', function ($q) use ($membershipNoSearch) {
                    $q->where('membership_no', 'like', "%{$membershipNoSearch}%");
                });
            } elseif ($customerTypeFilter === 'corporate') {
                $query->whereHas('invoice.corporateMember', function ($q) use ($membershipNoSearch) {
                    $q->where('membership_no', 'like', "%{$membershipNoSearch}%");
                });
            } elseif ($customerTypeFilter === 'guest') {
                $query->whereHas('invoice.customer', function ($q) use ($membershipNoSearch) {
                    $q->where('customer_no', 'like', "%{$membershipNoSearch}%");
                });
            } else {
                $query->whereHas('invoice', function ($q) use ($membershipNoSearch) {
                    $q
                        ->whereHas('member', function ($m) use ($membershipNoSearch) {
                            $m->where('membership_no', 'like', "%{$membershipNoSearch}%");
                        })
                        ->orWhereHas('corporateMember', function ($m) use ($membershipNoSearch) {
                            $m->where('membership_no', 'like', "%{$membershipNoSearch}%");
                        })
                        ->orWhereHas('customer', function ($c) use ($membershipNoSearch) {
                            $c->where('customer_no', 'like', "%{$membershipNoSearch}%");
                        });
                });
            }
        }

        // Apply invoice search filter
        if ($invoiceSearch) {
            $query->whereHas('invoice', function ($q) use ($invoiceSearch) {
                $q->where('invoice_no', 'like', "%{$invoiceSearch}%");
            });
        }

        // Apply date range filter by payment date (fallback to credit transaction date)
        if ($dateFromParsed) {
            $query->whereHas('invoice', function ($q) use ($dateFromParsed) {
                $q->where(function ($sub) use ($dateFromParsed) {
                    $sub
                        ->whereDate('payment_date', '>=', $dateFromParsed)
                        ->orWhereHas('transactions', function ($t) use ($dateFromParsed) {
                            $t->where('type', 'credit')->whereDate('date', '>=', $dateFromParsed);
                        });
                });
            });
        }
        if ($dateToParsed) {
            $query->whereHas('invoice', function ($q) use ($dateToParsed) {
                $q->where(function ($sub) use ($dateToParsed) {
                    $sub
                        ->whereDate('payment_date', '<=', $dateToParsed)
                        ->orWhereHas('transactions', function ($t) use ($dateToParsed) {
                            $t->where('type', 'credit')->whereDate('date', '<=', $dateToParsed);
                        });
                });
            });
        }

        // Apply city filter
        if ($cityFilter) {
            $query->whereHas('invoice.member', function ($q) use ($cityFilter) {
                $q->where('current_city', $cityFilter);
            });
        }

        // Apply payment method filter
        if ($paymentMethodFilter) {
            $query->whereHas('invoice', function ($q) use ($paymentMethodFilter) {
                $q->where('payment_method', $paymentMethodFilter);
            });
        }

        // Apply category filter
        if ($categoryFilter) {
            $query->whereHas('invoice.member', function ($q) use ($categoryFilter) {
                $q->whereIn('member_category_id', (array) $categoryFilter);
            });
        }

        // Apply gender filter
        if ($genderFilter) {
            $query->whereHas('invoice.member', function ($q) use ($genderFilter) {
                $q->where('gender', $genderFilter);
            });
        }

        // Apply family member filter
        if ($familyMemberFilter) {
            $query->whereHas('familyMember', function ($q) use ($familyMemberFilter) {
                $q->where('relation', $familyMemberFilter);
            });
        }

        // Apply customer type filter (member, corporate, or guest)
        if ($customerTypeFilter === 'member') {
            $query->whereHas('invoice', function ($q) {
                $q->whereNotNull('member_id');
            });
        } elseif ($customerTypeFilter === 'corporate') {
            $query->whereHas('invoice', function ($q) {
                $q->whereNotNull('corporate_member_id');
            });
        } elseif ($customerTypeFilter === 'guest') {
            $query->whereHas('invoice', function ($q) {
                $q->whereNotNull('customer_id');
            });
        }

        // Apply subscription category filter
        // Apply subscription category filter
        if ($subscriptionCategoryFilter) {
            $query->where('subscription_category_id', $subscriptionCategoryFilter);
        }

        // Apply cashier filter (user who received payment)
        if ($cashierFilter) {
            $query->whereHas('invoice', function ($q) use ($cashierFilter) {
                $q->where('created_by', $cashierFilter);
            });
        }

        // Get paginated results
        $transactions = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        // Calculate statistics
        // Need to sum ITEM amounts now, or 'total'.
        // To avoid re-querying everything efficiently, we can clone the query.
        $statsQuery = clone $query;
        // Optimization: Don't load relations for stats
        $statsQuery->with = [];

        $totalAmount = $statsQuery->sum('total');
        $totalTransactions = $statsQuery->count();
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
                'membership_no_search' => $membershipNoSearch,
                'invoice_search' => $invoiceSearch,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'city' => $cityFilter,
                'payment_method' => $paymentMethodFilter,
                'categories' => $categoryFilter ?? [],
                'gender' => $genderFilter,
                'family_member' => $familyMemberFilter,
                'customer_type' => $customerTypeFilter,
                'subscription_category_id' => $subscriptionCategoryFilter,
                'cashier' => $cashierFilter,
            ],
            'all_cities' => $allCities,
            'all_payment_methods' => $allPaymentMethods,
            'all_categories' => MemberCategory::select('id', 'name')->get(),
            'all_genders' => $allGenders,
            'all_family_members' => $allFamilyMembers,
            'subscription_categories' => \App\Models\SubscriptionCategory::select('id', 'name')->orderBy('name')->get(),
            'all_cashiers' => \App\Models\User::select('id', 'name')->orderBy('name')->get(),
            'all_members' => Member::select('id', 'full_name', 'membership_no', 'status')
                ->orderBy('full_name')
                ->limit(200)
                ->get()
                ->map(function ($member) {
                    return [
                        'id' => $member->id,
                        'full_name' => $member->full_name,
                        'name' => $member->full_name,
                        'membership_no' => $member->membership_no,
                        'customer_no' => null,
                        'status' => $member->status
                    ];
                })
                ->concat(
                    \App\Models\Customer::select('id', 'name', 'customer_no')
                        ->orderBy('name')
                        ->limit(100)
                        ->get()
                        ->map(function ($customer) {
                            return [
                                'id' => 'customer_' . $customer->id,
                                'full_name' => $customer->name,
                                'name' => $customer->name,
                                'membership_no' => null,
                                'customer_no' => $customer->customer_no,
                                'status' => 'guest'
                            ];
                        })
                )
                ->values(),
        ]);
    }

    public function sportsSubscriptionsReportPrint(Request $request)
    {
        $memberSearch = $request->input('member_search');
        $membershipNoSearch = $request->input('membership_no_search');
        $invoiceSearch = $request->input('invoice_search');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $dateFromParsed = $this->parseDateToYmd($dateFrom);
        $dateToParsed = $this->parseDateToYmd($dateTo);
        $cityFilter = $request->input('city');
        $paymentMethodFilter = $request->input('payment_method');
        $categoryFilter = $request->input('categories');
        $genderFilter = $request->input('gender');
        $familyMemberFilter = $request->input('family_member');
        $customerTypeFilter = $request->input('customer_type');
        $subscriptionCategoryFilter = $request->input('subscription_category_id');
        $cashierFilter = $request->input('cashier');
        $page = $request->input('page', 1);

        // Get subscription fee transactions with pagination - using Items for Mixed support
        $query = \App\Models\FinancialInvoiceItem::with(['invoice.member.memberCategory', 'invoice.corporateMember', 'invoice.customer', 'invoice.createdBy', 'subscriptionType', 'subscriptionCategory', 'familyMember'])
            ->where('fee_type', '5')
            // Only paid invoices
            ->whereHas('invoice', function ($q) {
                $q->where('status', 'paid');
            })
            ->select('financial_invoice_items.*');

        // Apply member search filter
        if ($memberSearch) {
            if ($customerTypeFilter === 'member') {
                $query->whereHas('invoice.member', function ($q) use ($memberSearch) {
                    $q->where('full_name', 'like', "%{$memberSearch}%");
                });
            } elseif ($customerTypeFilter === 'corporate') {
                $query->whereHas('invoice.corporateMember', function ($q) use ($memberSearch) {
                    $q->where('full_name', 'like', "%{$memberSearch}%");
                });
            } elseif ($customerTypeFilter === 'guest') {
                $query->whereHas('invoice.customer', function ($q) use ($memberSearch) {
                    $q->where('name', 'like', "%{$memberSearch}%");
                });
            } else {
                $query->whereHas('invoice', function ($q) use ($memberSearch) {
                    $q
                        ->whereHas('member', function ($m) use ($memberSearch) {
                            $m->where('full_name', 'like', "%{$memberSearch}%");
                        })
                        ->orWhereHas('corporateMember', function ($m) use ($memberSearch) {
                            $m->where('full_name', 'like', "%{$memberSearch}%");
                        })
                        ->orWhereHas('customer', function ($c) use ($memberSearch) {
                            $c->where('name', 'like', "%{$memberSearch}%");
                        });
                });
            }
        }

        // Apply membership number search filter
        if ($membershipNoSearch) {
            if ($customerTypeFilter === 'member') {
                $query->whereHas('invoice.member', function ($q) use ($membershipNoSearch) {
                    $q->where('membership_no', 'like', "%{$membershipNoSearch}%");
                });
            } elseif ($customerTypeFilter === 'corporate') {
                $query->whereHas('invoice.corporateMember', function ($q) use ($membershipNoSearch) {
                    $q->where('membership_no', 'like', "%{$membershipNoSearch}%");
                });
            } elseif ($customerTypeFilter === 'guest') {
                $query->whereHas('invoice.customer', function ($q) use ($membershipNoSearch) {
                    $q->where('customer_no', 'like', "%{$membershipNoSearch}%");
                });
            } else {
                $query->whereHas('invoice', function ($q) use ($membershipNoSearch) {
                    $q
                        ->whereHas('member', function ($m) use ($membershipNoSearch) {
                            $m->where('membership_no', 'like', "%{$membershipNoSearch}%");
                        })
                        ->orWhereHas('corporateMember', function ($m) use ($membershipNoSearch) {
                            $m->where('membership_no', 'like', "%{$membershipNoSearch}%");
                        })
                        ->orWhereHas('customer', function ($c) use ($membershipNoSearch) {
                            $c->where('customer_no', 'like', "%{$membershipNoSearch}%");
                        });
                });
            }
        }

        // Apply invoice search filter
        if ($invoiceSearch) {
            $query->whereHas('invoice', function ($q) use ($invoiceSearch) {
                $q->where('invoice_no', 'like', "%{$invoiceSearch}%");
            });
        }

        // Apply date range filter by payment date (fallback to credit transaction date)
        if ($dateFromParsed) {
            $query->whereHas('invoice', function ($q) use ($dateFromParsed) {
                $q->where(function ($sub) use ($dateFromParsed) {
                    $sub
                        ->whereDate('payment_date', '>=', $dateFromParsed)
                        ->orWhereHas('transactions', function ($t) use ($dateFromParsed) {
                            $t->where('type', 'credit')->whereDate('date', '>=', $dateFromParsed);
                        });
                });
            });
        }
        if ($dateToParsed) {
            $query->whereHas('invoice', function ($q) use ($dateToParsed) {
                $q->where(function ($sub) use ($dateToParsed) {
                    $sub
                        ->whereDate('payment_date', '<=', $dateToParsed)
                        ->orWhereHas('transactions', function ($t) use ($dateToParsed) {
                            $t->where('type', 'credit')->whereDate('date', '<=', $dateToParsed);
                        });
                });
            });
        }

        // Apply city filter
        if ($cityFilter) {
            $query->whereHas('invoice.member', function ($q) use ($cityFilter) {
                $q->where('current_city', $cityFilter);
            });
        }

        // Apply payment method filter
        if ($paymentMethodFilter) {
            $query->whereHas('invoice', function ($q) use ($paymentMethodFilter) {
                $q->where('payment_method', $paymentMethodFilter);
            });
        }

        // Apply category filter
        if ($categoryFilter) {
            $query->whereHas('invoice.member', function ($q) use ($categoryFilter) {
                $q->whereIn('member_category_id', (array) $categoryFilter);
            });
        }

        // Apply gender filter
        if ($genderFilter) {
            $query->whereHas('invoice.member', function ($q) use ($genderFilter) {
                $q->where('gender', $genderFilter);
            });
        }

        // Apply family member filter
        // Apply family member filter
        if ($familyMemberFilter) {
            $query->whereHas('familyMember', function ($q) use ($familyMemberFilter) {
                $q->where('relation', $familyMemberFilter);
            });
        }

        // Apply customer type filter (member, corporate, or guest)
        if ($customerTypeFilter === 'member') {
            $query->whereHas('invoice', function ($q) {
                $q->whereNotNull('member_id');
            });
        } elseif ($customerTypeFilter === 'corporate') {
            $query->whereHas('invoice', function ($q) {
                $q->whereNotNull('corporate_member_id');
            });
        } elseif ($customerTypeFilter === 'guest') {
            $query->whereHas('invoice', function ($q) {
                $q->whereNotNull('customer_id');
            });
        }

        // Apply subscription category filter
        if ($subscriptionCategoryFilter) {
            $query->where('subscription_category_id', $subscriptionCategoryFilter);
        }

        // Apply cashier filter (user who received payment)
        if ($cashierFilter) {
            $query->whereHas('invoice', function ($q) use ($cashierFilter) {
                $q->where('created_by', $cashierFilter);
            });
        }

        // Get paginated results (same 15 per page)
        $transactions = $query->orderBy('created_at', 'desc')->paginate(15, ['*'], 'page', $page);

        // Calculate statistics from all filtered transactions
        // Need to sum ITEM amounts now, or 'total'.
        $statsQuery = clone $query;
        // Optimization: Don't load relations for stats
        $statsQuery->with = [];

        $totalAmount = $statsQuery->sum('total');
        $totalTransactions = $statsQuery->count();
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
                'membership_no_search' => $membershipNoSearch,
                'invoice_search' => $invoiceSearch,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'city' => $cityFilter,
                'payment_method' => $paymentMethodFilter,
                'categories' => $categoryFilter ?? [],
                'gender' => $genderFilter,
                'family_member' => $familyMemberFilter,
                'customer_type' => $customerTypeFilter,
                'subscription_category_id' => $subscriptionCategoryFilter,
                'cashier' => $cashierFilter,
            ],
            'all_categories' => MemberCategory::select('id', 'name')->get(),
        ]);
    }

    public function subscriptionsMaintenanceSummary(Request $request)
    {
        $data = $this->getSubscriptionMaintenanceSummaryData($request);
        return Inertia::render('App/Admin/Membership/SubscriptionsMaintenanceSummary', $data);
    }

    public function subscriptionsMaintenanceSummaryPrint(Request $request)
    {
        $data = $this->getSubscriptionMaintenanceSummaryData($request);
        return Inertia::render('App/Admin/Membership/SubscriptionsMaintenanceSummaryPrint', $data);
    }

    private function getSubscriptionMaintenanceSummaryData(Request $request)
    {
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $categoryFilter = $request->input('category');

        // Aggregated query for subscription and maintenance fees - using Items for Mixed support
        // We need to join invoice to get payment_method and status
        $query = \App\Models\FinancialInvoiceItem::join('financial_invoices', 'financial_invoice_items.invoice_id', '=', 'financial_invoices.id')
            ->join('members', 'financial_invoices.member_id', '=', 'members.id')
            ->join('member_categories', 'members.member_category_id', '=', 'member_categories.id')
            ->whereIn('financial_invoice_items.fee_type', ['5', '4'])  // 5 = Subscription, 4 = Maintenance
            ->where('financial_invoices.status', 'paid')
            ->selectRaw('
                member_categories.name as category_name,
                financial_invoices.payment_method as payment_method,
                sum(financial_invoice_items.total) as total_amount
            ')
            ->groupBy('member_categories.name', 'financial_invoices.payment_method');

        // Apply date range filter
        if ($dateFrom) {
            $query->whereDate('financial_invoices.created_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('financial_invoices.created_at', '<=', $dateTo);
        }

        // Apply category filter
        if ($categoryFilter) {
            // Support array or single value for category filter
            if (is_array($categoryFilter)) {
                $query->whereIn('members.member_category_id', $categoryFilter);
            } else {
                $query->where('members.member_category_id', $categoryFilter);
            }
        }

        $aggregatedResults = $query->get();

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

        // Apply category filter to the categories we show if filtered
        if ($categoryFilter) {
            if (is_array($categoryFilter)) {
                $allCategoriesQuery->whereIn('id', $categoryFilter);
            } else {
                $allCategoriesQuery->where('id', $categoryFilter);
            }
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

        foreach ($aggregatedResults as $result) {
            $categoryName = $result->category_name;
            // Handle null payment method safely
            $paymentMethod = strtolower((string) $result->payment_method);
            $amount = $result->total_amount;

            // Skip if category doesn't exist in summary
            if (!isset($summary[$categoryName])) {
                continue;
            }

            // Map payment methods - normalizing inputs
            // Known types: cash, credit_card, debit_card, cheque, online
            if ($paymentMethod === 'cash') {
                $summary[$categoryName]['cash'] += $amount;
                $grandTotals['cash'] += $amount;
            } elseif (in_array($paymentMethod, ['credit_card', 'credit card', 'debit_card', 'debit card'])) {
                // Group Credit and Debit cards together
                $summary[$categoryName]['credit_card'] += $amount;
                $grandTotals['credit_card'] += $amount;
            } else {
                // Bank Transfer, Online, Cheque, etc.
                // Includes: 'online', 'cheque', 'bank transfer'
                $summary[$categoryName]['bank_online'] += $amount;
                $grandTotals['bank_online'] += $amount;
            }

            $summary[$categoryName]['total'] += $amount;
            $grandTotals['total'] += $amount;
        }

        // Get all categories for filter dropdown
        $allCategoriesForFilter = MemberCategory::select('id', 'name')->get();

        return [
            'summary' => $summary,
            'grand_totals' => $grandTotals,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'category' => $categoryFilter,
            ],
            'all_categories' => $allCategoriesForFilter,
        ];
    }

    public function pendingMaintenanceQuartersReport(Request $request)
    {
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $categoryFilter = $request->input('category');

        // Subquery for latest valid maintenance date using Items
        $latestMaintenance = \App\Models\FinancialInvoiceItem::select('financial_invoices.member_id', DB::raw('MAX(financial_invoice_items.end_date) as last_valid_date'))
            ->join('financial_invoices', 'financial_invoice_items.invoice_id', '=', 'financial_invoices.id')
            ->where('financial_invoice_items.fee_type', '4')
            ->where('financial_invoices.status', 'paid')
            ->groupBy('financial_invoices.member_id');

        // Get all members with query optimization
        $membersQuery = Member::with(['memberCategory'])
            ->leftJoinSub($latestMaintenance, 'latest_maintenance', function ($join) {
                $join->on('members.id', '=', 'latest_maintenance.member_id');
            })
            ->select('members.*', 'latest_maintenance.last_valid_date')
            ->where('status', 'active');

        // Apply category filter
        if ($categoryFilter) {
            $membersQuery->where('member_category_id', $categoryFilter);
        }

        $members = $membersQuery->get();

        // Initialize summary structure with ALL categories
        $summary = [];
        $grandTotals = [
            '1_quarter_pending' => ['count' => 0, 'amount' => 0],
            '2_quarters_pending' => ['count' => 0, 'amount' => 0],
            '3_quarters_pending' => ['count' => 0, 'amount' => 0],
            '4_quarters_pending' => ['count' => 0, 'amount' => 0],
            '5_quarters_pending' => ['count' => 0, 'amount' => 0],
            '6_quarters_pending' => ['count' => 0, 'amount' => 0],
            'more_than_6_quarters_pending' => ['count' => 0, 'amount' => 0],
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

        // Initialize all categories in summary with count+amount structure
        foreach ($allCategories as $category) {
            $summary[$category->name] = [
                'category_id' => $category->id,
                '1_quarter_pending' => ['count' => 0, 'amount' => 0],
                '2_quarters_pending' => ['count' => 0, 'amount' => 0],
                '3_quarters_pending' => ['count' => 0, 'amount' => 0],
                '4_quarters_pending' => ['count' => 0, 'amount' => 0],
                '5_quarters_pending' => ['count' => 0, 'amount' => 0],
                '6_quarters_pending' => ['count' => 0, 'amount' => 0],
                'more_than_6_quarters_pending' => ['count' => 0, 'amount' => 0],
                'maintenance_fee_quarterly' => 0,  // Will be calculated dynamically
                'total_values' => 0,
                'total_quarters' => 0  // Track total quarters to calculate average fee
            ];
        }

        $currentDate = now();

        foreach ($members as $member) {
            $categoryName = $member->memberCategory->name ?? 'Unknown';

            if (!isset($summary[$categoryName])) {
                continue;
            }

            // Calculate pending quarters efficiently in memory
            // Logic:
            // Use last_valid_date from subquery.
            // If exists, start date = last_valid_date.
            // If not, start date = membership_date or created_at.

            if ($member->last_valid_date) {
                $startDate = \Carbon\Carbon::parse($member->last_valid_date);
            } else {
                $startDate = $member->membership_date ? \Carbon\Carbon::parse($member->membership_date) : \Carbon\Carbon::parse($member->created_at);
            }

            // If start date is in future, 0 pending
            if ($startDate->gt($currentDate)) {
                $pendingMonths = 0;
            } else {
                $pendingMonths = $startDate->diffInMonths($currentDate);
            }

            // Adjust: if startDate < currentDate, diffInMonths is positive.
            // If last_valid_date exists, it means paid UNTIL that date. So pending starts AFTER that date.
            // If membership_date, pending starts FROM that date.

            // Refined Logic aligned with pendingMaintenanceReport:
            // If last_valid_date is set, pending starts from last_valid_date.
            // We need FULL months/quarters passed since then.

            // Ensure no negative
            $pendingMonths = max(0, $pendingMonths);
            $pendingQuarters = ceil($pendingMonths / 3);

            if ($pendingQuarters > 0) {
                // Calculate pending amount for this member
                // User requested to use member's total_maintenance_fee directly
                $quarterlyFee = $member->total_maintenance_fee ?? 0;
                $totalPendingAmount = $pendingQuarters * $quarterlyFee;

                // Determine bucket key
                $bucketKey = '';
                if ($pendingQuarters == 1) {
                    $bucketKey = '1_quarter_pending';
                } elseif ($pendingQuarters == 2) {
                    $bucketKey = '2_quarters_pending';
                } elseif ($pendingQuarters == 3) {
                    $bucketKey = '3_quarters_pending';
                } elseif ($pendingQuarters == 4) {
                    $bucketKey = '4_quarters_pending';
                } elseif ($pendingQuarters == 5) {
                    $bucketKey = '5_quarters_pending';
                } elseif ($pendingQuarters == 6) {
                    $bucketKey = '6_quarters_pending';
                } else {
                    $bucketKey = 'more_than_6_quarters_pending';
                }

                // Update count and amount for the bucket
                $summary[$categoryName][$bucketKey]['count']++;
                $summary[$categoryName][$bucketKey]['amount'] += $totalPendingAmount;
                $grandTotals[$bucketKey]['count']++;
                $grandTotals[$bucketKey]['amount'] += $totalPendingAmount;

                // Also update total values and quarters
                $summary[$categoryName]['total_values'] += $totalPendingAmount;
                $summary[$categoryName]['total_quarters'] += $pendingQuarters;
                $grandTotals['total_values'] += $totalPendingAmount;
            }
        }

        // Calculate effective average quarterly fee for each category
        foreach ($summary as $key => $data) {
            if ($data['total_quarters'] > 0) {
                $summary[$key]['maintenance_fee_quarterly'] = $data['total_values'] / $data['total_quarters'];
            }
        }

        // Set maintenance fee quarterly for grand totals
        if (!empty($summary)) {
            $fees = array_column($summary, 'maintenance_fee_quarterly');
            // Filter out 0 fees to avoid skewing average if needed, or just average all
            $fees = array_filter($fees, fn($f) => $f > 0);
            $grandTotals['maintenance_fee_quarterly'] = count($fees) > 0 ? array_sum($fees) / count($fees) : 0;
        }

        // Get all categories for filter dropdown
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

        // Subquery for latest valid maintenance date using Items
        $latestMaintenance = \App\Models\FinancialInvoiceItem::select('financial_invoices.member_id', DB::raw('MAX(financial_invoice_items.end_date) as last_valid_date'))
            ->join('financial_invoices', 'financial_invoice_items.invoice_id', '=', 'financial_invoices.id')
            ->where('financial_invoice_items.fee_type', '4')
            ->where('financial_invoices.status', 'paid')
            ->groupBy('financial_invoices.member_id');

        // Get all members with query optimization
        $membersQuery = Member::with(['memberCategory'])
            ->leftJoinSub($latestMaintenance, 'latest_maintenance', function ($join) {
                $join->on('members.id', '=', 'latest_maintenance.member_id');
            })
            ->select('members.*', 'latest_maintenance.last_valid_date')
            ->where('status', 'active');

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
                'maintenance_fee_quarterly' => 0,  // Will be calculated dynamically
                'total_values' => 0,
                'total_quarters' => 0  // Track total quarters
            ];
        }

        $currentDate = now();

        foreach ($members as $member) {
            $categoryName = $member->memberCategory->name ?? 'Unknown';

            if (!isset($summary[$categoryName])) {
                continue;
            }

            // Calculate pending quarters efficiently in memory
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

            $pendingMonths = max(0, $pendingMonths);
            $pendingQuarters = ceil($pendingMonths / 3);

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

                // User requested to use member's total_maintenance_fee directly
                $quarterlyFee = $member->total_maintenance_fee ?? 0;
                $totalPendingAmount = $pendingQuarters * $quarterlyFee;
                $summary[$categoryName]['total_values'] += $totalPendingAmount;
                $summary[$categoryName]['total_quarters'] += $pendingQuarters;
                $grandTotals['total_values'] += $totalPendingAmount;
            }
        }

        // Calculate effective average quarterly fee for each category
        foreach ($summary as $key => $data) {
            if ($data['total_quarters'] > 0) {
                $summary[$key]['maintenance_fee_quarterly'] = $data['total_values'] / $data['total_quarters'];
            }
        }

        // Set maintenance fee quarterly for grand totals
        if (!empty($summary)) {
            $fees = array_column($summary, 'maintenance_fee_quarterly');
            $fees = array_filter($fees, fn($f) => $f > 0);
            $grandTotals['maintenance_fee_quarterly'] = count($fees) > 0 ? array_sum($fees) / count($fees) : 0;
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
            ->where('fee_type', '4')
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
                'title' => 'Pending Maintenance Quarters Summary (Category-wise)',
                'description' => 'Quarter-wise analysis of pending maintenance payments by category',
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
