<?php

namespace App\Http\Controllers\App;

use App\Helpers\FileHelper;
use App\Http\Controllers\Controller;
use App\Models\AddressType;
use App\Models\Member;
use App\Models\MemberType;
use App\Models\User;
use App\Models\UserDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class MembersController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->query('limit') ?? 10;

        $users = User::with(['memberType', 'userDetail'])->role('user', 'web')->latest()->paginate($limit);

        return Inertia::render('App/Member/Dashboard', compact('users'));
    }

    public function byUser($userId)
    {
        $member = Member::with([
            'memberCategory',
            'pausedHistories' => function ($q) {
                $q->orderBy('start_date');
            }
        ])->where('user_id', $userId)->firstOrFail();

        return response()->json($member);
    }

    public function checkDuplicateCnic(Request $request)
    {
        $request->validate([
            'cnic_no' => 'required|string',
            'member_id' => 'nullable|integer'
        ]);

        $query = Member::where('cnic_no', $request->cnic_no);

        // Exclude current member if editing
        if ($request->member_id) {
            $query->where('id', '!=', $request->member_id);
        }

        $exists = $query->exists();

        return response()->json([
            'exists' => $exists,
            'message' => $exists ? 'CNIC already exists' : 'CNIC is available'
        ]);
    }

    public function checkDuplicateBarcode(Request $request)
    {
        $barcode = $request->barcode_no;
        $memberId = $request->member_id;

        if (!$barcode) {
            return response()->json(['exists' => false]);
        }

        $query = Member::where('barcode_no', $barcode);

        if ($memberId) {
            $query->where('id', '!=', $memberId);
        }

        $exists = $query->exists();

        return response()->json(['exists' => $exists]);
    }

    public function checkDuplicateMembershipNo(Request $request)
    {
        $request->validate([
            'membership_no' => 'required|string',
            'member_id' => 'nullable|integer'
        ]);

        // Extract the number part from membership number (e.g., "123" from "OP 123" or "123-1" from "AR/S 123-1")
        $membershipNo = $request->membership_no;
        $numberPart = '';

        // Split by space and get the last part (the number part)
        $parts = explode(' ', trim($membershipNo));
        if (count($parts) >= 2) {
            $numberPart = end($parts);  // Get the last part (e.g., "123" or "123-1")
        } else {
            $numberPart = $membershipNo;  // If no space, use the whole string
        }

        // Search for any membership number that ends with this number part
        $query = Member::where(function ($q) use ($numberPart) {
            $q
                ->where('membership_no', 'LIKE', '% ' . $numberPart)
                ->orWhere('membership_no', $numberPart);
        });

        // Exclude current member if editing
        if (!empty($request->member_id)) {
            $query->where('id', '!=', $request->member_id);
        }

        $existingMembers = $query->get(['id', 'membership_no', 'first_name', 'last_name']);

        $exists = $existingMembers->count() > 0;

        // Generate next available number suggestion
        $suggestion = null;
        if ($exists) {
            // Find the highest number in use
            $allNumbers = Member::select('membership_no')->get()->pluck('membership_no');
            $maxNumber = 0;

            foreach ($allNumbers as $membershipNumber) {
                $parts = explode(' ', trim($membershipNumber));
                $numPart = count($parts) >= 2 ? end($parts) : $membershipNumber;

                // Extract base number (before any dash)
                $baseNum = explode('-', $numPart)[0];
                if (is_numeric($baseNum)) {
                    $maxNumber = max($maxNumber, (int) $baseNum);
                }
            }

            $suggestion = $maxNumber + 1;
        }

        return response()->json([
            'exists' => $exists,
            'number_part' => $numberPart,
            'existing_members' => $existingMembers,
            'suggestion' => $suggestion,
            'message' => $exists ? 'Membership number already exists' : 'Membership number is available'
        ]);
    }

    public function getNextMembershipNumber()
    {
        // Find the highest number in use
        $allNumbers = Member::select('membership_no')->get()->pluck('membership_no');
        $maxNumber = 0;

        foreach ($allNumbers as $membershipNumber) {
            $parts = explode(' ', trim($membershipNumber));
            $numPart = count($parts) >= 2 ? end($parts) : $membershipNumber;

            // Extract base number (before any dash)
            $baseNum = explode('-', $numPart)[0];
            if (is_numeric($baseNum)) {
                $maxNumber = max($maxNumber, (int) $baseNum);
            }
        }

        $nextNumber = $maxNumber + 1;

        return response()->json([
            'next_number' => $nextNumber,
            'message' => 'Next available membership number generated'
        ]);
    }

    public function search(Request $request)
    {
        $query = $request->input('query');

        if (!$query) {
            return response()->json(['members' => []]);
        }

        $members = Member::whereNull('parent_id')
            ->where(function ($q) use ($query) {
                $q
                    ->where('full_name', 'like', "%{$query}%")
                    ->orWhere('membership_no', 'like', "%{$query}%")
                    ->orWhere('cnic_no', 'like', "%{$query}%");
            })
            ->select('id', 'full_name', 'membership_no', 'cnic_no', 'status', 'mobile_number_a')
            ->limit(10)
            ->get();

        return response()->json(['members' => $members]);
    }
}
