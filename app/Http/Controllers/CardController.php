<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\MemberCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CardController extends Controller
{
    public function index(Request $request)
    {
        // Fetch both primary members and family members
        $query = Member::with([
                'memberType:id,name',
                'memberCategory:id,name,description',
                'membershipInvoice:id,member_id,invoice_no,status,total_price',
                'profilePhoto:id,mediable_id,mediable_type,file_path',
                'parent:id,full_name,membership_no' // For family members to show parent info
            ])
            ->withCount('familyMembers');

        // Filter: Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('membership_no', 'like', "%{$search}%")
                    ->orWhere('mobile_number_a', 'like', "%{$search}%");
            });
        }

        // Filter: Card Status
        if ($request->filled('card_status') && $request->card_status !== 'all') {
            $query->where('card_status', $request->card_status);
        }

        // Filter: Member Status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter: Member Category
        if ($request->filled('member_category') && $request->member_category !== 'all') {
            $query->where('member_category_id', $request->member_category);
        }

        // Filter: Member Type (Primary or Family)
        if ($request->filled('member_type_filter')) {
            if ($request->member_type_filter === 'primary') {
                $query->whereNull('parent_id');
            } elseif ($request->member_type_filter === 'family') {
                $query->whereNotNull('parent_id');
            }
            // 'all' shows both
        }else{
            $query->whereNull('parent_id');
        }

        // Sorting
        $sortBy = $request->input('sortBy', 'id');
        $sortDirection = $request->input('sort', 'desc');

        if ($sortBy === 'name') {
            $query->orderBy('full_name', $sortDirection);
        } elseif ($sortBy === 'membership_no') {
            $query->orderBy('membership_no', $sortDirection);
        } else {
            $query->orderBy('id', $sortDirection);
        }

        $members = $query->paginate(10)->withQueryString();

        // Statistics
        $total_active_members = Member::whereNull('parent_id')
            ->where('status', 'active')
            ->count();
        
        $total_active_family_members = Member::whereNotNull('parent_id')
            ->where('status', 'active')
            ->count();

        return Inertia::render('App/Admin/Card/Dashboard', [
            'members' => $members,
            'total_active_members' => $total_active_members,
            'total_active_family_members' => $total_active_family_members,
            'memberCategories' => MemberCategory::select('id', 'name', 'description')->where('status', 'active')->get(),
            'filters' => $request->only(['search', 'card_status', 'status', 'member_category', 'member_type_filter', 'sort', 'sortBy'])
        ]);
    }
}
