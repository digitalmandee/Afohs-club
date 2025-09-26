<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\MemberType;
use App\Models\User;
use App\Models\UserDetail;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FamilyMembersArchiveConroller extends Controller
{
    public function index(Request $request)
    {
        $query = Member::whereNotNull('parent_id')
            ->select('id', 'full_name', 'membership_no', 'parent_id', 'family_suffix', 'personal_email', 'mobile_number_a', 'cnic_no', 'date_of_birth', 'card_issue_date', 'card_status', 'relation', 'status')
            ->with(['parent:id,user_id,member_type_id,full_name,membership_no']);

        // Membership No
        if ($request->filled('membership_no')) {
            $query->where('membership_no', 'like', '%' . $request->membership_no . '%');
        }

        // Name (own name)
        if ($request->filled('name')) {
            $query->where('full_name', 'like', '%' . $request->name . '%');
        }

        // CNIC
        if ($request->filled('cnic')) {
            $cnic = str_replace('-', '', $request->cnic);

            $query->whereRaw("REPLACE(cnic_no, '-', '') LIKE ?", ["%{$cnic}%"]);
        }

        // Contact
        if ($request->filled('contact')) {
            $query->where('mobile_number_a', 'like', '%' . $request->contact . '%');
        }

        // Parent Name (Member Name)
        if ($request->filled('parent_name')) {
            $query->whereHas('parent', function ($q) use ($request) {
                $q->where('full_name', 'like', '%' . $request->parent_name . '%');
            });
        }

        // Relation
        if ($request->filled('relation') && $request->relation !== 'all') {
            $query->where('relation', $request->relation);
        }

        // Card Status
        if ($request->filled('card_status') && $request->card_status !== 'all') {
            $query->where('card_status', $request->card_status);
        }

        // Status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Member Type
        if ($request->filled('member_type') && $request->member_type !== 'all') {
            $query->whereHas('parent', function ($q) use ($request) {
                $q->where('member_type_id', $request->member_type);
            });
        }

        // Over 25 Age Checkbox
        if ($request->boolean('age_over_25')) {
            $query->whereDate('date_of_birth', '<=', Carbon::now()->subYears(25)->toDateString());
        }

        // Min Age
        if ($request->filled('min_age')) {
            $query->whereDate('date_of_birth', '<=', Carbon::now()->subYears($request->min_age)->toDateString());
        }

        // Max Age
        if ($request->filled('max_age')) {
            $query->whereDate('date_of_birth', '>=', Carbon::now()->subYears($request->max_age + 1)->addDay()->toDateString());
        }

        $familyGroups = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('App/Admin/Membership/FamilyMembersArchive', [
            'familyGroups' => $familyGroups,
            'memberTypes' => MemberType::all(['id', 'name']),
            'filters' => $request->all(),
        ]);
    }
}