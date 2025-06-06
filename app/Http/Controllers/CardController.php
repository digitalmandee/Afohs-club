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
        $members = User::role('user', 'web')->whereNull('parent_user_id')->with('userDetail', 'member.memberType')->get();

        return Inertia::render('App/Admin/Card/Dashboard', compact('members'));
    }
}
