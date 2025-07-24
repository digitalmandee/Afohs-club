<?php

namespace App\Http\Controllers;

use App\Models\MembershipInvoice;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CardController extends Controller
{
    public function index()
    {
        $members = User::role('user')->whereNull('parent_user_id')->with(['userDetail', 'member', 'member.memberType:id,name', 'member.memberCategory:id,name'])->paginate(10);

        $total_active_members = User::role('user')->whereNull('parent_user_id')->whereHas('member', function ($query) {
            $query->where('card_status', 'active');
        })->count();

        return Inertia::render('App/Admin/Card/Dashboard', compact('members', 'total_active_members'));
    }
}