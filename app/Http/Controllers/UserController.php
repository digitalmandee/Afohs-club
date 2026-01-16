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

        $results = [];

        if ($memberType == 1) {
            $members = Member::select(
                'members.id',
                'members.full_name',
                'members.membership_no',
                'members.cnic_no',
                'members.current_address',
                'members.personal_email',
                'members.mobile_number_a',
                'members.status',
                'member_categories.name as category_name',
            )
                ->leftJoin('member_categories', 'members.member_category_id', '=', 'member_categories.id')
                ->whereNull('members.parent_id')
                ->where(function ($q) use ($query) {
                    $q
                        ->where('members.full_name', 'like', "%{$query}%")
                        ->orWhere('members.membership_no', 'like', "%{$query}%");
                });

            $members = $members->limit(10)->get();

            $results = $members->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->full_name,
                    'booking_type' => 'member',
                    'label' => "{$user->full_name} ({$user->membership_no}) - " . ucfirst($user->status),
                    'membership_no' => $user->membership_no,
                    'email' => $user->personal_email,
                    'cnic' => $user->cnic_no,
                    'phone' => $user->mobile_number_a,
                    'address' => $user->current_address,
                    'status' => $user->status ?? 'active',  // Added status
                ];
            });

            return response()->json(['success' => true, 'results' => $results]);
        } else if ($memberType == 2) {
            $customers = Customer::select(
                'id',
                'customer_no',
                'name',
                'email',
                'contact',
                'cnic',
                'address',
                'member_name',
                'member_no',
                'guest_type_id'
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
        } else if ($memberType == 3) {
            $employees = Employee::select(
                'id',
                'employee_id',
                'name',
                'email',
                'phone_no',
            )
                ->where(function ($q) use ($query) {
                    $q
                        ->where('name', 'like', "%{$query}%")
                        ->orWhere('email', 'like', "%{$query}%")
                        ->orWhere('employee_id', 'like', "%{$query}%");
                })
                ->limit(10)
                ->get();

            $results = $employees->map(function ($employee) {
                return [
                    'id' => $employee->id,
                    'booking_type' => 'employee',
                    'name' => $employee->name,
                    'label' => "{$employee->name} ({$employee->employee_id})",
                    'customer_no' => $employee->employee_id,
                    'email' => $employee->email,
                    'phone' => $employee->phone_no,
                ];
            });
        }

        return response()->json(['success' => true, 'results' => $results]);
    }

    // get waiters
    public function waiters()
    {
        $waiters = Employee::whereHas('subdepartment', function ($q) {
            $q->where('name', 'Waiter');
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
        // Case 4: bookingType = 'employee' => Search in Employees table
        if ($bookingType === 'employee') {
            $employees = Employee::select('id', 'name', 'employee_id', 'email', 'designation', 'phone_no')
                ->where(function ($q) use ($query) {
                    $q
                        ->where('name', 'like', "%{$query}%")
                        ->orWhere('employee_id', 'like', "%{$query}%")
                        ->orWhere('email', 'like', "%{$query}%");
                })
                ->limit(10)
                ->get();

            $results = $employees->map(function ($employee) {
                return [
                    'id' => $employee->id,
                    'booking_type' => 'employee',
                    'name' => $employee->name,
                    'label' => "{$employee->name} ({$employee->employee_id})",
                    'employee_id' => $employee->employee_id,
                    'email' => $employee->email,
                    'phone' => $employee->phone_no,
                    'designation' => $employee->designation,
                ];
            });
        } elseif ($bookingType === '0') {
            $members = Member::select(
                'members.id',
                'members.full_name',
                'members.membership_no',
                'members.cnic_no',
                'members.current_address',
                'members.personal_email',
                'members.mobile_number_a',
                'members.status',
                'member_categories.name as category_name',
                DB::raw('(SELECT COUNT(*) FROM members AS fm WHERE fm.kinship = members.id) as total_kinships')
            )
                ->leftJoin('member_categories', 'members.member_category_id', '=', 'member_categories.id')
                ->whereNull('members.parent_id')
                ->where(function ($q) use ($query) {
                    $q
                        ->where('members.full_name', 'like', "%{$query}%")
                        ->orWhere('members.membership_no', 'like', "%{$query}%");
                });

            $members = $members->limit(10)->get();

            $results = $members->map(function ($user) {
                return [
                    'id' => $user->id,
                    'booking_type' => 'member',
                    'name' => $user->full_name,
                    'total_kinships' => $user->total_kinships,
                    'label' => "{$user->full_name} ({$user->membership_no})",
                    'membership_no' => $user->membership_no,
                    'email' => $user->personal_email,
                    'cnic' => $user->cnic_no,
                    'phone' => $user->mobile_number_a,
                    'address' => $user->current_address,
                    'status' => $user->status ?? 'active',
                ];
            });
        } elseif ($bookingType === '2') {
            $members = \App\Models\CorporateMember::select(
                'corporate_members.id',
                'corporate_members.full_name',
                'corporate_members.membership_no',
                'corporate_members.cnic_no',
                'corporate_members.current_address',
                'corporate_members.personal_email',
                'corporate_members.mobile_number_a',
                'corporate_members.status',
                'member_categories.name as category_name',
                DB::raw('(SELECT COUNT(*) FROM corporate_members AS fm WHERE fm.kinship = corporate_members.id) as total_kinships')
            )
                ->leftJoin('member_categories', 'corporate_members.member_category_id', '=', 'member_categories.id')
                ->whereNull('corporate_members.parent_id')
                ->where(function ($q) use ($query) {
                    $q
                        ->where('corporate_members.full_name', 'like', "%{$query}%")
                        ->orWhere('corporate_members.membership_no', 'like', "%{$query}%");
                });

            $members = $members->limit(10)->get();

            $results = $members->map(function ($user) {
                return [
                    'id' => $user->id,
                    'booking_type' => 'member',  // Use 'member' to keep frontend logic consistent if it relies on this
                    'is_corporate' => true,
                    'name' => $user->full_name,
                    'total_kinships' => $user->total_kinships,
                    'label' => "{$user->full_name} ({$user->membership_no})",
                    'membership_no' => $user->membership_no,
                    'email' => $user->personal_email,
                    'cnic' => $user->cnic_no,
                    'phone' => $user->mobile_number_a,
                    'address' => $user->current_address,
                    'status' => $user->status ?? 'active',
                ];
            });

            // Case 2: bookingType = 1 => Search in customers
        } elseif ($bookingType === '1') {
            $customers = Customer::select(
                'id',
                'customer_no',
                'name',
                'email',
                'contact',
                'cnic',
                'address',
                'member_name',
                'member_no',
                'guest_type_id'
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
                'id',
                'customer_no',
                'name',
                'email',
                'contact',
                'cnic',
                'address',
                'member_name',
                'member_no',
                'guest_type_id'
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
