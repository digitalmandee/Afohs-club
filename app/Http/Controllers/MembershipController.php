<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use App\Models\User;
use App\Models\UserDetail;
use App\Models\Member;
use App\Models\MembershipInvoice;
use App\Models\MemberType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class MembershipController extends Controller
{



    public function index()
    {
        $member = User::role('user', 'web')->whereNull('parent_user_id')->with('userDetail', 'member.memberType')->get();

        $total_members = User::role('user', 'web')->whereNull('parent_user_id')->count();
        $total_payment = MembershipInvoice::where('status', 'paid')->sum('amount');

        return Inertia::render('App/Admin/Membership/Dashboard', compact('member', 'total_members', 'total_payment'));
    }
    public function getAllMemberTypes()
    {
        $memberTypes = MemberType::all(['name']);
        return Inertia::render('App/Admin/Membership/Profile', [
            'memberTypesData' => $memberTypes,
        ]);
    }
    public function create()
    {
        $userNo = $this->getUserNo();
        $memberTypesData = MemberType::all();
        return Inertia::render('App/Admin/Membership/MembershipForm', compact('userNo', 'memberTypesData'));
    }
    public function allMembers()
    {
        $users = User::with([
            'userDetail.members.memberType'
        ])->get();

        return Inertia::render('App/Admin/Membership/Members', [
            'member' => $users,
        ]);
    }
    public function membershipHistory()
    {
        $users = User::with([
            'userDetail',
            'member.memberType'
        ])->get();

        return Inertia::render('App/Admin/Membership/Members', [
            'member' => $users,
        ]);
    }
    public function paymentMembersHistory()
    {
        $users = User::with([
            'userDetail.members.memberType'
        ])->get();

        return Inertia::render('App/Admin/Membership/History', [
            'membersdata' => $users,
        ]);
    }
    public function membershipFinance()
    {
        $users = User::with([
            'userDetail.members.memberType'
        ])->get();

        return Inertia::render('App/Admin/Membership/Finance', [
            'membersdata' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'coa_account' => 'nullable|string|max:255',
            'title' => 'nullable|string|in:Mr,Mrs,Ms,dr,Female,Other',
            'first_name' => 'nullable|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'application_number' => 'nullable|max:255',
            'name_comments' => 'nullable|string',
            'guardian_name' => 'nullable|string|max:255',
            'guardian_membership' => 'nullable|string|max:255',
            'nationality' => 'nullable|string|max:255',
            'cnic_no' => 'nullable|string|size:13',
            'passport_no' => 'nullable|string|max:255',
            'gender' => 'nullable|string|in:Male,Female,Other',
            'ntn' => 'nullable|string|max:255',
            'date_of_birth' => 'nullable|date',
            'education' => 'nullable|array',
            'membership_reason' => 'nullable|string',
            'mobile_number_a' => 'nullable|string|max:255',
            'mobile_number_b' => 'nullable|string|max:255',
            'mobile_number_c' => 'nullable|string|max:255',
            'telephone_number' => 'nullable|string|max:255',
            'personal_email' => 'nullable|email|max:255',
            'critical_email' => 'nullable|email|max:255',
            'emergency_name' => 'nullable|string|max:255',
            'emergency_relation' => 'nullable|string|max:255',
            'emergency_contact' => 'nullable|string|max:255',
            'current_address' => 'nullable|string',
            'current_city' => 'nullable|string|max:255',
            'current_country' => 'nullable|string|max:255',
            'permanent_address' => 'nullable|string',
            'permanent_city' => 'nullable|string|max:255',
            'permanent_country' => 'nullable|string|max:255',
            // 'member_types' => 'required|string|max:255|exists:member_types,name',
            'member_type' => 'required|string|max:255',
            'membership_category' => 'nullable|string|max:255',
            'membership_number' => 'required|max:255',
            'membership_date' => 'date',
            'card_status' => 'nullable|string|in:Active,Inactive',
            'card_issue_date' => 'nullable|date',
            'card_expiry_date' => 'nullable|date',
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date',
            'family_members' => 'nullable|array',
            'family_members.*.full_name' => 'required|string|max:255',
            'family_members.*.relation' => 'required|string|max:255',
            'family_members.*.email' => 'required|email|max:255|unique:users,email',
            'family_members.*.cnic' => 'nullable|string|max:255',
            'family_members.*.phone_number' => 'nullable|string|max:255',
            'family_members.*.membership_type' => 'nullable|string|max:255|exists:member_types,name',
            'family_members.*.membership_category' => 'nullable|string|max:255',
            'family_members.*.start_date' => 'nullable|date',
            'family_members.*.end_date' => 'nullable|date',
            'family_members.*.picture' => 'nullable',
            'member_image' => 'nullable|string',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        // $memberType = MemberType::where('name', $request->member_type)->firstOrFail();
        // $member_type_id = $memberType->id;
        try {
            DB::beginTransaction();

            $member_type_id = $request->member_type;
            $memberType = MemberType::where('id', $member_type_id)->firstOrFail();

            // Create primary user
            $primaryUser = User::create([
                'user_id' => $this->getUserNo(),
                'email' => $validated['personal_email'],
                'password' => isset($validated['password']) ? $validated['password'] : null,
                'first_name' => $validated['first_name'],
                'middle_name' => $validated['middle_name'],
                'last_name' => $validated['last_name'],
                'phone_number' => $validated['mobile_number_a'],
                'user_id' => $this->getUserNo(),
                'member_type_id' => $member_type_id,
            ]);

            // Create UserDetail for primary user
            UserDetail::create([
                'user_id' => $primaryUser->id,
                'coa_account' => $validated['coa_account'],
                'title' => $validated['title'],
                'state' => 'Punjab',
                'application_number' => $validated['application_number'],
                'name_comments' => $validated['name_comments'],
                'guardian_name' => $validated['guardian_name'],
                'guardian_membership' => $validated['guardian_membership'],
                'nationality' => $validated['nationality'],
                'cnic_no' => $validated['cnic_no'],
                'passport_no' => $validated['passport_no'],
                'gender' => $validated['gender'],
                'ntn' => $validated['ntn'],
                'date_of_birth' => $validated['date_of_birth'],
                'education' => json_encode($validated['education'] ?? []),
                'membership_reason' => $validated['membership_reason'],
                'mobile_number_a' => $validated['mobile_number_a'],
                'mobile_number_b' => $validated['mobile_number_b'],
                'mobile_number_c' => $validated['mobile_number_c'],
                'telephone_number' => $validated['telephone_number'],
                'personal_email' => $validated['personal_email'],
                'critical_email' => $validated['critical_email'],
                'emergency_name' => $validated['emergency_name'],
                'emergency_relation' => $validated['emergency_relation'],
                'emergency_contact' => $validated['emergency_contact'],
                'current_address' => $validated['current_address'],
                'current_city' => $validated['current_city'],
                'current_country' => $validated['current_country'],
                'permanent_address' => $validated['permanent_address'],
                'permanent_city' => $validated['permanent_city'],
                'permanent_country' => $validated['permanent_country'],
                'country' => $validated['current_country'],
            ]);

            // Handle primary member image
            $memberImagePath = null;
            if ($request->hasFile('profile_photo')) {
                $memberImagePath = FileHelper::saveImage($request->file('profile_photo'), 'member_images');
            }

            $qrCodeData = route('member.profile', ['id' => $primaryUser->id]);

            // Create QR code image and save it
            $qrBinary = QrCode::format('png')->size(300)->generate($qrCodeData);
            $qrImagePath = FileHelper::saveBinaryImage($qrBinary, 'qr_codes');

            // Create primary member record
            Member::create([
                'user_id' => $primaryUser->id,
                'member_type_id' => $member_type_id,
                'membership_category' => $validated['membership_category'],
                'membership_number' => $validated['membership_number'],
                'membership_date' => $validated['membership_date'],
                // 'card_status' => $validated['card_status'],
                'card_issue_date' => $validated['card_issue_date'],
                'card_expiry_date' => $validated['card_expiry_date'],
                'from_date' => $validated['from_date'],
                'to_date' => $validated['to_date'],
                'picture' => $memberImagePath,
                'qr_code' => $qrImagePath
            ]);

            // Handle family members
            if (!empty($validated['family_members'])) {
                foreach ($validated['family_members'] as $familyMemberData) {
                    // Fetch member_type_id for family member
                    $familyMemberType = isset($familyMemberData['membership_type'])
                        ? MemberType::where('name', $familyMemberData['membership_type'])->first()
                        : null;
                    $family_member_type_id = $familyMemberType ? $familyMemberType->id : $member_type_id;

                    // Create User for family member (no password)
                    $familyUser = User::create([
                        'user_id' => $this->getUserNo(),
                        'email' => $familyMemberData['email'],
                        'password' => isset($validated['password']) ? $validated['password'] : null,
                        'first_name' => $familyMemberData['full_name'],
                        'phone_number' => $familyMemberData['phone_number'],
                        'member_type_id' => $family_member_type_id,
                        'parent_user_id' => $primaryUser->id
                    ]);

                    // Create UserDetail for family member
                    UserDetail::create([
                        'user_id' => $familyUser->id,
                        'cnic_no' => $familyMemberData['cnic'],
                        'personal_email' => $familyMemberData['email'],
                        'mobile_number_a' => $familyMemberData['phone_number'],
                        // 'current_address' => $validated['current_address'],
                        // 'current_city' => $validated['current_city'],
                        // 'current_country' => $validated['current_country'],
                        // 'permanent_address' => $validated['permanent_address'],
                        // 'permanent_city' => $validated['permanent_city'],
                        // 'permanent_country' => $validated['permanent_country'],
                        // 'country' => $validated['current_country'],
                        // 'state' => 'Punjab',
                    ]);

                    // Handle family member image
                    $familyMemberImagePath = null;
                    if (!empty($familyMemberData['picture'])) {
                        $familyMemberImagePath = FileHelper::saveImage($familyMemberData['picture'], 'family_member_images');
                    }

                    // Create Member record for family member
                    Member::create([
                        'user_id' => $familyUser->id,
                        'member_type_id' => $family_member_type_id,
                        'full_name' => $familyMemberData['full_name'],
                        'relation' => $familyMemberData['relation'],
                        // 'cnic' => $familyMemberData['cnic'],
                        // 'phone_number' => $familyMemberData['phone_number'],
                        'membership_type' => $familyMemberData['membership_type'],
                        'membership_category' => $familyMemberData['membership_category'],
                        'start_date' => $familyMemberData['start_date'],
                        'end_date' => $familyMemberData['end_date'],
                        'picture' => $familyMemberImagePath,
                        // 'primary_member_id' => $primaryMember->id,
                    ]);
                }
            }

            MembershipInvoice::create([
                'user_id' => $primaryUser->id,
                'total_price' => $memberType->fee,
            ]);

            DB::commit();

            return response()->json(['message' => 'Membership created successfully.', 'member_id' => $primaryUser->id]);
        } catch (\Throwable $th) {
            Log::error('Error submitting membership details: ' . $th->getMessage());
            return response()->json(['error' => 'Failed to submit membership details: ' . $th->getMessage()], 500);
        }
    }

    public function updateMemberStatus(Request $request, $id)
    {
        $request->validate([
            'card_status' => 'required|string|in:Active,In Active,Expired',
        ]);

        try {
            $member = Member::findOrFail($id);
            $member->card_status = $request->card_status;
            $member->save();

            return response()->json(['message' => 'Member status updated successfully']);
        } catch (\Exception $e) {
            Log::error('Error updating member status: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update member status'], 500);
        }
    }

    // Show Public Profile

    public function viewProfile($id)
    {
        $user = User::with(['member', 'member.memberType', 'userDetail'])->findOrFail($id);

        return Inertia::render('App/Membership/Show', ['user' => $user]);
    }

    // User No
    private function getUserNo()
    {
        $userNo = User::max('user_id');
        $userNo = $userNo + 1;
        return $userNo;
    }
}