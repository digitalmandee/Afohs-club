<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // Search for members
    public function searchMember(Request $request)
    {
        $query = $request->input('query');
        $memberType = $request->input('member_type');
        $roleType = $request->input('role', 'user');

        $members = User::where('name', 'like', "%{$query}%")->role($roleType);

        // Only apply member_type filter if role is 'user' and member_type is provided
        if ($roleType === 'user' && !empty($memberType)) {
            $members->where('member_type_id', $memberType);
        }

        $results = $members->select('id', 'name', 'email')->get();

        return response()->json(['success' => true, 'results' => $results], 200);
    }
    // get waiters
    public function waiters()
    {
        $waiters = User::role('waiter')->select('id', 'name', 'email')->get();

        return response()->json(['success' => true, 'waiters' => $waiters], 200);
    }
}