<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CardController extends Controller
{
    public function index()
    {
        $users = User::with([
            'userDetail.members.memberType'
        ])->get();

        return Inertia::render('App/Admin/Card/Dashboard', [
            'membersData' => $users,
        ]);
    }
}
