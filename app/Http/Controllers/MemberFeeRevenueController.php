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

        $query = MemberCategory::query()->with(['members' => function ($q) use ($statusFilter) {
            if ($statusFilter) {
                $q->whereIn('status', (array) $statusFilter);
            }
        }]);

        if ($categoryFilter) {
            $query->whereIn('id', (array) $categoryFilter);
        }

        $categories = $query->get()->map(function ($category) {
            $memberUserIds = $category->members->pluck('user_id');

            $totalMaintenance = FinancialInvoice::where('invoice_type', 'membership')
                ->where('subscription_type', '!=', 'one_time')
                ->whereIn('member_id', $memberUserIds)
                ->sum('total_price');

            return [
                'id' => $category->id,
                'name' => $category->name,
                'code' => $category->description,
                'total_members' => $category->members->count(),
                'total_maintenance_fee' => $totalMaintenance,
            ];
        });

        return Inertia::render('App/Admin/Membership/MaintenanceFeeRevenue', [
            'categories' => $categories,
            'filters' => [
                'status' => $statusFilter ?? [],
                'categories' => $categoryFilter ?? [],
            ],
            'all_statuses' => Member::distinct()->pluck('status')->filter()->values(),
            'all_categories' => MemberCategory::select('id', 'name')->get(),
        ]);
    }
}
