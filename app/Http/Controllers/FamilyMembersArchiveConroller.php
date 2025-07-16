<?php

namespace App\Http\Controllers;
use App\Models\User;
use Inertia\Inertia;
use App\Models\UserDetail;
use Illuminate\Http\Request;

class FamilyMembersArchiveConroller extends Controller
{
//     public function index()
// {
//     $primaryMembers = User::role('user')->whereNull('parent_user_id')->with(['familyMembers'])->get();
//     return Inertia::render('App/Admin/Membership/FamilyMembersArchive', [
//         'familyGroups' => $primaryMembers
//     ]);
// }

public function index()
    {
        $primaryMembers = User::role('user')->whereNull('parent_user_id')->with(['familyMembers.memberType', 'memberType'])
            ->get();
        return Inertia::render('App/Admin/Membership/FamilyMembersArchive', [
            'familyGroups' => $primaryMembers
        ]);
    }

}


