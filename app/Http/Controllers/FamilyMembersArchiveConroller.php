<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserDetail;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FamilyMembersArchiveConroller extends Controller
{
    public function index()
    {
        $primaryMembers = User::role('user')
            ->whereNull('parent_user_id')
            ->with(['member', 'familyMembers.memberType', 'memberType'])
            ->get();
        return Inertia::render('App/Admin/Membership/FamilyMembersArchive', [
            'familyGroups' => $primaryMembers
        ]);
    }
}