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

    // Search users
    public function searchUsers(Request $request)
    {
        $query = $request->input('query');

        $members = User::role('user', 'web')
            ->select(
                'users.id',
                'users.first_name',
                'users.last_name',
                'users.email',
                'users.phone_number',
                'members.membership_no',
                'user_details.cnic_no',
                'user_details.current_address',
                'member_categories.name as category_name' // added line
            )
            ->leftJoin('members', 'users.id', '=', 'members.user_id')
            ->leftJoin('user_details', 'users.id', '=', 'user_details.user_id')
            ->leftJoin('member_categories', 'members.member_category_id', '=', 'member_categories.id') // added join
            ->whereNull('users.parent_user_id')
            ->where(function ($q) use ($query) {
                $q->where('users.first_name', 'like', "%{$query}%")
                    ->orWhere('users.last_name', 'like', "%{$query}%")
                    ->orWhereRaw("CONCAT(users.first_name, ' ', users.last_name) LIKE ?", ["%{$query}%"])
                    ->orWhere('members.membership_no', 'like', "%{$query}%")
                    ->orWhere('users.email', 'like', "%{$query}%");
            })
            ->limit(10)
            ->get();

        // Format for frontend
        $results = $members->map(function ($user) {
            $fullName = trim("{$user->first_name} {$user->last_name}");
            return [
                'id' => $user->id,
                'name' => $fullName,
                'label' => "{$fullName} ({$user->category_name}  {$user->membership_no}) ({$user->email})",
                'membership_no' => $user->membership_no,
                'email' => $user->email,
                'cnic' => $user->cnic_no,
                'phone' => $user->phone_number,
                'address' => $user->current_address,
            ];
        });


        return response()->json(['success' => true, 'results' => $results], 200);
    }
}
