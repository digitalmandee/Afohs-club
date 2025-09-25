<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Employee;
use App\Models\Member;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class UserController extends Controller
{
    // Search for members
    public function searchMember(Request $request)
    {
        $query = $request->input('q');
        $memberType = $request->input('type');

        $members = Member::select(
            'members.id',
            'members.user_id',
            'members.first_name',
            'members.last_name',
            'members.membership_no',
            'members.cnic_no',
            'members.current_address',
            'member_categories.name as category_name'
        )
            ->leftJoin('member_categories', 'members.member_category_id', '=', 'member_categories.id')
            ->leftJoin('users', 'members.user_id', '=', 'users.id')
            ->whereNull('members.parent_id')
            ->where(function ($q) use ($query) {
                $q
                    ->where('members.full_name', 'like', "%{$query}%")
                    ->orWhere('members.membership_no', 'like', "%{$query}%");
            });

        // Apply member_type filter if provided (only for 'user' role)
        if (!empty($memberType)) {
            $members->where('members.member_type_id', $memberType);
        }

        $members = $members->limit(10)->get();

        $results = $members->map(function ($user) {
            $fullName = trim("{$user->first_name} {$user->last_name}");
            return [
                'id' => $user->user_id,
                'name' => $fullName,
                'label' => "{$fullName} ({$user->membership_no})",
                'membership_no' => $user->membership_no,
                'email' => $user->personal_email,
                'cnic' => $user->cnic_no,
                'phone' => $user->mobile_number_a,
                'address' => $user->current_address,
            ];
        });

        return response()->json(['success' => true, 'results' => $results]);
    }

    // get waiters
    public function waiters()
    {
        $waiters = Employee::whereHas('employeeType', function ($q) {
            $q->where('slug', 'waiter');
        })->select('id', 'employee_id', 'name', 'email')->get();

        return response()->json([
            'success' => true,
            'waiters' => $waiters
        ], 200);
    }

    public function kitchens()
    {
        $kitchens = User::role('kitchen', 'web')->select('id', 'name', 'email')->get();

        return response()->json(['success' => true, 'kitchens' => $kitchens], 200);
    }

    // Search users
    public function searchUsers(Request $request)
    {
        $query = $request->input('q');
        $bookingType = $request->query('type') ?? '0';

        // Prevent empty search from returning all results
        if (!$query || trim($query) === '') {
            return response()->json(['success' => true, 'results' => []]);
        }

        // Case 1: bookingType = 0 => Search in Users table (members)
        if ($bookingType === '0' || $bookingType === '2') {
            $members = User::role('user', 'web')
                ->select(
                    'users.id',
                    'users.email',
                    'users.phone_number',
                    'members.full_name',
                    'members.membership_no',
                    'members.cnic_no',
                    'members.current_address',
                    'member_categories.name as category_name',
                    DB::raw('(SELECT COUNT(*) FROM members AS fm WHERE fm.kinship = users.id) as total_kinships')
                )
                ->leftJoin('members', 'users.id', '=', 'members.user_id')
                ->leftJoin('member_categories', 'members.member_category_id', '=', 'member_categories.id')
                ->whereNull('members.parent_id')
                ->where(function ($q) use ($query) {
                    $q
                        ->where('members.full_name', 'like', "%{$query}%")
                        ->orWhere('members.membership_no', 'like', "%{$query}%");
                })
                ->limit(10)
                ->get();

            $results = $members->map(function ($user) {
                return [
                    'id' => $user->id,
                    'booking_type' => 'member',
                    'total_kinships' => $user->total_kinships,
                    'name' => $user->full_name,
                    'label' => "{$user->full_name} ({$user->membership_no})",
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

            $customers = Customer::select(
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
        } else {
            return response()->json(['success' => false, 'message' => 'Invalid booking type'], 400);
        }

        return response()->json(['success' => true, 'results' => $results], 200);
    }
}