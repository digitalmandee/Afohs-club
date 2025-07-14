<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

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
                $queryBuilder
                    ->where('name', 'like', "%{$query}%")
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
        $bookingType = $request->query('type') ?? '0';

        // Case 1: bookingType = 0 => Search in Users table (members)
        if ($bookingType === '0') {
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
                    'member_categories.name as category_name'
                )
                ->leftJoin('members', 'users.id', '=', 'members.user_id')
                ->leftJoin('user_details', 'users.id', '=', 'user_details.user_id')
                ->leftJoin('member_categories', 'members.member_category_id', '=', 'member_categories.id')
                ->whereNull('users.parent_user_id')
                ->where(function ($q) use ($query) {
                    $q
                        ->where('users.first_name', 'like', "%{$query}%")
                        ->orWhere('users.last_name', 'like', "%{$query}%")
                        ->orWhereRaw("CONCAT(users.first_name, ' ', users.last_name) LIKE ?", ["%{$query}%"])
                        ->orWhere('members.membership_no', 'like', "%{$query}%");
                })
                ->limit(10)
                ->get();

            $results = $members->map(function ($user) {
                $fullName = trim("{$user->first_name} {$user->last_name}");
                return [
                    'id' => $user->id,
                    'booking_type' => 'member',
                    'name' => $fullName,
                    'label' => "{$fullName} ({$user->membership_no})",
                    'membership_no' => $user->membership_no,
                    'email' => $user->email,
                    'cnic' => $user->cnic_no,
                    'phone' => $user->phone_number,
                    'address' => $user->current_address,
                ];
            });

            // Case 2: bookingType = 1 => Search in customers
        } elseif ($bookingType === '1') {
            $customers = Customer::select(
                'id', 'customer_no', 'name', 'email', 'contact', 'cnic', 'address', 'member_name', 'member_no', 'guest_type_id'
            )
                ->where(function ($q) use ($query) {
                    $q
                        ->where('name', 'like', "%{$query}%")
                        ->orWhere('email', 'like', "%{$query}%")
                        ->orWhere('customer_no', 'like', "%{$query}%")
                        ->orWhere('cnic', 'like', "%{$query}%");
                })
                ->limit(10)
                ->get();

            $results = $customers->map(function ($customer) {
                return [
                    'id' => $customer->id,
                    'booking_type' => 'guest',
                    'name' => $customer->name,
                    'label' => "{$customer->name} ({$customer->customer_no})",
                    'customer_no' => $customer->customer_no,
                    'email' => $customer->email,
                    'cnic' => $customer->cnic,
                    'phone' => $customer->contact,
                    'address' => $customer->address,
                ];
            });

            // Case 3: bookingType like guest-1, guest-2 => Filter customers by guest_type_id
        } elseif (Str::startsWith($bookingType, 'guest-')) {
            $guestTypeId = (int) Str::after($bookingType, 'guest-');

            $guests = Customer::select(
                'id', 'customer_no', 'name', 'email', 'contact', 'cnic', 'address', 'member_name', 'member_no', 'guest_type_id'
            )
                ->where('guest_type_id', $guestTypeId)
                ->where(function ($q) use ($query) {
                    $q
                        ->where('name', 'like', "%{$query}%")
                        ->orWhere('email', 'like', "%{$query}%")
                        ->orWhere('customer_no', 'like', "%{$query}%")
                        ->orWhere('cnic', 'like', "%{$query}%");
                })
                ->limit(10)
                ->get();

            $results = $guests->map(function ($guest) {
                return [
                    'id' => $guest->id,
                    'booking_type' => 'guest',
                    'name' => $guest->name,
                    'label' => "{$guest->name} ({$guest->guest_no})",
                    'customer_no' => $guest->customer_no,
                    'email' => $guest->email,
                    'cnic' => $guest->cnic,
                    'phone' => $guest->contact,
                    'address' => $guest->address,
                ];
            });
        } else {
            return response()->json(['success' => false, 'message' => 'Invalid booking type'], 400);
        }

        return response()->json(['success' => true, 'results' => $results], 200);
    }
}