<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\User;
use App\Models\UserDetail;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FamilyMembersArchiveConroller extends Controller
{
    public function index()
    {
        $familyGroups = Member::whereNotNull('parent_id')
            ->select('id', 'full_name', 'membership_no', 'parent_id', 'family_suffix', 'personal_email', 'mobile_number_a', 'cnic_no', 'date_of_birth', 'card_issue_date', 'card_status', 'relation', 'status', 'card_status')
            ->with(['parent:id,user_id,member_type_id,full_name,membership_no', 'parent.memberType:id,name'])
            ->latest()
            ->get();
        return Inertia::render('App/Admin/Membership/FamilyMembersArchive', compact('familyGroups'));
    }
}