<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    // Search for members
    public function searchMember(Request $request)
    {
        $query = $request->input('query');
        $memberType = $request->input('member_type');
        $roleType = $request->input('role', 'user');

        $members = User::role($roleType, 'web')
            ->where(function ($queryBuilder) use ($query) {
                $queryBuilder->where('name', 'like', "%{$query}%")
                    ->orWhere('user_id', 'like', "%{$query}%");
            });


        // Only apply member_type filter if role is 'user' and member_type is provided
        if ($roleType === 'user' && !empty($memberType)) {
            $members->where('member_type_id', $memberType);
        }

        $results = $members->select('id', 'user_id', 'name', 'email')->get();

        Log::info($results);

        return response()->json(['success' => true, 'results' => $results], 200);
    }
    // get waiters
    public function waiters()
    {
        $waiters = User::role('waiter', 'web')->select('id', 'name', 'email')->get();

        return response()->json(['success' => true, 'waiters' => $waiters], 200);
    }
    public function kitchens()
    {
        $kitchens = User::role('kitchen', 'web')->select('id', 'name', 'email')->get();

        return response()->json(['success' => true, 'kitchens' => $kitchens], 200);
    }
}
