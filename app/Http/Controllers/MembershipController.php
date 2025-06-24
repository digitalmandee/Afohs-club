<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use App\Models\CardPayment;
use App\Models\FamilyMember;
use App\Models\FinancialInvoice;
use App\Models\User;
use App\Models\UserDetail;
use App\Models\Member;
use App\Models\MemberCategory;
use App\Models\MembershipInvoice;
use App\Models\MemberStatusHistory;
use App\Models\MemberType;
use App\Models\Subscription;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class MembershipController extends Controller
{
    public function index()
    {
        $members = User::role('user')->whereNull('parent_user_id')->with('userDetail', 'member', 'member.memberType')->get();

        $total_members = User::role('user')->whereNull('parent_user_id')->count();
        $total_payment = FinancialInvoice::where('invoice_type', 'membership')->where('status', 'paid')->sum('total_price');

        return Inertia::render('App/Admin/Membership/Dashboard', compact('members', 'total_members', 'total_payment'));
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
        $memberTypesData = MemberType::select('id', 'name')->get();
        $membercategories = MemberCategory::select('id', 'name', 'fee', 'subscription_fee')->where('status', 'active')->get();
        return Inertia::render('App/Admin/Membership/MembershipForm', compact('userNo', 'memberTypesData', 'membercategories'));
    }

    public function edit(Request $request)
    {
        $user = User::where('id', $request->id)->with('userDetail', 'member', 'member.memberType')->first();
        $memberTypesData = MemberType::all();
        $membercategories = MemberCategory::select('id', 'name', 'fee', 'subscription_fee')->where('status', 'active')->get();
        return Inertia::render('App/Admin/Membership/EditMembershipForm', compact('user', 'memberTypesData', 'membercategories'));
    }

    public function allMembers()
    {
        $members = User::role('user')->whereNull('parent_user_id')->with('userDetail', 'member', 'member.memberType')->get();

        return Inertia::render('App/Admin/Membership/Members', compact('members'));
    }
    public function membershipHistory()
    {
        $members = User::role('user')->whereNull('parent_user_id')->with('userDetail', 'member', 'member.memberType')->get();

        return Inertia::render('App/Admin/Membership/Members', compact('members'));
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
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email|unique:users,email',
                'family_members' => 'array',
                'family_members.*.email' => 'required|email|distinct|different:email|unique:users,email',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            DB::beginTransaction();

            // $member_type_id = $request->member_type;
            // $memberType = MemberType::where('id', $member_type_id)->firstOrFail();
            $memberImagePath = null;
            if ($request->hasFile('profile_photo')) {
                $memberImagePath = FileHelper::saveImage($request->file('profile_photo'), 'member_images');
            }

            // Create primary user
            $primaryUser = User::create([
                'user_id' => $this->getUserNo(),
                'email' => $request->email,
                'first_name' => $request->first_name,
                'middle_name' => $request->middle_name,
                'last_name' => $request->last_name,
                'phone_number' => $request->user_details['mobile_number_a'],
                'member_type_id' => $request->member['member_type_id'],
                'profile_photo' => $memberImagePath
            ]);

            $primaryUser->assignRole('user');

            // Create UserDetail for primary user
            UserDetail::create([
                'user_id' => $primaryUser->id,
                'coa_account' => $request->user_details['coa_account'],
                'title' => $request->user_details['title'],
                'application_number' => $request->user_details['application_number'],
                'name_comments' => $request->user_details['name_comments'],
                'guardian_name' => $request->user_details['guardian_name'],
                'guardian_membership' => $request->user_details['guardian_membership'],
                'nationality' => $request->user_details['nationality'],
                'cnic_no' => $request->user_details['cnic_no'],
                'passport_no' => $request->user_details['passport_no'],
                'gender' => $request->user_details['gender'],
                'ntn' => $request->user_details['ntn'],
                'date_of_birth' => $request->user_details['date_of_birth'],
                'education' => json_encode($request->user_details['education'] ?? []),
                'membership_reason' => $request->user_details['membership_reason'],
                'mobile_number_a' => $request->user_details['mobile_number_a'],
                'mobile_number_b' => $request->user_details['mobile_number_b'],
                'mobile_number_c' => $request->user_details['mobile_number_c'],
                'telephone_number' => $request->user_details['telephone_number'],
                'critical_email' => $request->user_details['critical_email'],
                'emergency_name' => $request->user_details['emergency_name'],
                'emergency_relation' => $request->user_details['emergency_relation'],
                'emergency_contact' => $request->user_details['emergency_contact'],
                'current_address' => $request->user_details['current_address'],
                'current_city' => $request->user_details['current_city'],
                'current_country' => $request->user_details['current_country'],
                'permanent_address' => $request->user_details['permanent_address'],
                'permanent_city' => $request->user_details['permanent_city'],
                'permanent_country' => $request->user_details['permanent_country'],
                'country' => $request->user_details['country'],
            ]);

            // Handle primary member image

            $qrCodeData = route('member.profile', ['id' => $primaryUser->id]);

            // Create QR code image and save it
            $qrBinary = QrCode::format('png')->size(300)->generate($qrCodeData);
            $qrImagePath = FileHelper::saveBinaryImage($qrBinary, 'qr_codes');

            $memberType = MemberType::find($request->member['member_type_id']);
            // Create primary member record
            Member::create([
                'user_id' => $primaryUser->id,
                'member_type_id' => $request->member['member_type_id'],
                'member_type' => $memberType,
                'membership_date' => $request->member['membership_date'],
                'card_status' => $request->member['card_status'],
                'card_issue_date' => $request->member['card_issue_date'],
                'card_expiry_date' => $request->member['card_expiry_date'],
                'from_date' => $request->member['from_date'],
                'to_date' => $request->member['to_date'],
                'qr_code' => $qrImagePath
            ]);

            $subscription = null;

            if ($request->member['membership_category']) {
                $category = MemberCategory::find($request->member['membership_category']);
                $subscription = Subscription::create([
                    'user_id' => $primaryUser->id,
                    'category' => $category,
                    'start_date' => $request->member['from_date'] ?? Carbon::now(),
                    'expiry_date' => $request->member['to_date'],
                    'status' => 'in_active',
                ]);
            }


            // Handle family members
            if (!empty($request->family_members)) {
                foreach ($request->family_members as $familyMemberData) {
                    // Handle family member image
                    $familyMemberImagePath = null;
                    if (!empty($familyMemberData['picture'])) {
                        $familyMemberImagePath = FileHelper::saveImage($familyMemberData['picture'], 'member_images');
                    }
                    // Create User for family member (no password)
                    $familyUser = User::create([
                        'user_id' => $this->getUserNo(),
                        'email' => $familyMemberData['email'],
                        'password' => isset($validated['password']) ? $validated['password'] : null,
                        'first_name' => $familyMemberData['full_name'],
                        'phone_number' => $familyMemberData['phone_number'],
                        'member_type_id' => $request->member['member_type_id'],
                        'parent_user_id' => $primaryUser->id,
                        'profile_photo' => $familyMemberImagePath
                    ]);

                    $familyUser->assignRole('user');

                    $qrCodeData = route('member.profile', ['id' => $familyUser->id]);

                    // Create QR code image and save it
                    $qrBinary = QrCode::format('png')->size(300)->generate($qrCodeData);
                    $qrImagePath = FileHelper::saveBinaryImage($qrBinary, 'qr_codes');

                    // Create UserDetail for family member
                    UserDetail::create([
                        'user_id' => $familyUser->id,
                        'cnic_no' => $familyMemberData['cnic'],
                        'mobile_number_a' => $familyMemberData['phone_number'],
                    ]);

                    Member::create([
                        'user_id' => $familyUser->id,
                        'category_ids' => [$familyMemberData['membership_category']],
                        'card_status' => $request->member['card_status'],
                        'card_issue_date' => $familyMemberData['start_date'] ?? null,
                        'card_expiry_date' => $familyMemberData['end_date'] ?? null,
                        'qr_code' => $qrImagePath
                    ]);
                }
            }

            $memberTypeArray = $memberType->toArray(); // includes all fields from DB
            $memberTypeArray['amount'] = 0;
            $memberTypeArray['invoice_type'] = 'membership';

            $data = [$memberTypeArray];
            if ($subscription) {
                $subscriptionArray = $subscription->toArray();
                $subscriptionArray['amount'] = 0;
                $subscriptionArray['invoice_type'] = 'subscription';
                $data[] = $subscriptionArray;
            }

            // Create membership invoice
            $invoice = FinancialInvoice::create([
                'invoice_no' => $this->getInvoiceNo(),
                'customer_id' => $primaryUser->id,
                'member_id' => Auth::user()->id,
                'invoice_type' => 'membership',
                'issue_date' => Carbon::now(),
                'data' => $data,
                'status' => 'unpaid',
            ]);

            $subscription = Subscription::find($subscription->id);
            $subscription->invoice_id = $invoice->id;
            $subscription->save();

            // Add membership invoice id to member
            $member = Member::where('user_id', $primaryUser->id)->first();
            Log::info($invoice->id);
            $member->invoice_id = $invoice->id;
            $member->save();

            DB::commit();

            return response()->json(['message' => 'Membership created successfully.', 'invoice_no' => $invoice->invoice_no], 200);
        } catch (\Throwable $th) {
            Log::error('Error submitting membership details: ' . $th->getMessage());
            return response()->json(['error' => 'Failed to submit membership details: ' . $th->getMessage()], 500);
        }
    }

    public function updateMember(Request $request)
    {
        try {
            Log::info($request->all());
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id',
                'email' => 'required|email|unique:users,email,' . $request->user_id,
                'family_members' => 'array',
                'family_members.*.email' => 'required|email|distinct|different:email|unique:users,email',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            DB::beginTransaction();

            $user = User::findOrFail($request->user_id);

            // Save new profile photo if uploaded
            if ($request->hasFile('profile_photo')) {
                $memberImagePath = FileHelper::saveImage($request->file('profile_photo'), 'member_images');
                $user->profile_photo = $memberImagePath;
            }

            // Update User basic info
            $user->update([
                'email' => $request->email,
                'first_name' => $request->first_name,
                'middle_name' => $request->middle_name,
                'last_name' => $request->last_name,
                'phone_number' => $request->user_details['mobile_number_a'],
                'member_type_id' => $request->member['member_type_id'],
            ]);

            // Update UserDetail (assumes one-to-one relation)
            $userDetail = $user->userDetail;

            if ($userDetail) {
                $userDetail->update([
                    'coa_account' => $request->user_details['coa_account'],
                    'title' => $request->user_details['title'],
                    'application_number' => $request->user_details['application_number'],
                    'name_comments' => $request->user_details['name_comments'],
                    'guardian_name' => $request->user_details['guardian_name'],
                    'guardian_membership' => $request->user_details['guardian_membership'],
                    'nationality' => $request->user_details['nationality'],
                    'cnic_no' => $request->user_details['cnic_no'],
                    'passport_no' => $request->user_details['passport_no'],
                    'gender' => $request->user_details['gender'],
                    'ntn' => $request->user_details['ntn'],
                    'date_of_birth' => $request->user_details['date_of_birth'],
                    'education' => json_encode($request->user_details['education'] ?? []),
                    'membership_reason' => $request->user_details['membership_reason'],
                    'mobile_number_a' => $request->user_details['mobile_number_a'],
                    'mobile_number_b' => $request->user_details['mobile_number_b'],
                    'mobile_number_c' => $request->user_details['mobile_number_c'],
                    'telephone_number' => $request->user_details['telephone_number'],
                    'critical_email' => $request->user_details['critical_email'],
                    'emergency_name' => $request->user_details['emergency_name'],
                    'emergency_relation' => $request->user_details['emergency_relation'],
                    'emergency_contact' => $request->user_details['emergency_contact'],
                    'current_address' => $request->user_details['current_address'],
                    'current_city' => $request->user_details['current_city'],
                    'current_country' => $request->user_details['current_country'],
                    'permanent_address' => $request->user_details['permanent_address'],
                    'permanent_city' => $request->user_details['permanent_city'],
                    'permanent_country' => $request->user_details['permanent_country'],
                    'country' => $request->user_details['country'],
                ]);
            }

            DB::commit();

            return response()->json(['message' => 'Membership updated successfully.']);
        } catch (\Throwable $th) {
            DB::rollBack();
            Log::error('Error updating member: ' . $th->getMessage());
            return response()->json(['error' => 'Failed to update membership details.'], 500);
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

    // Get Member Invoices
    public function getMemberInvoices($id)
    {
        $invoice = CardPayment::where('user_id', $id)->first();

        if (!$invoice) {
            return response()->json(['message' => 'Invoice not found'], 404);
        }

        return response()->json(['invoice' => $invoice]);
    }

    // Filter Member
    public function filterMember(Request $request)
    {
        $query = $request->input('query');

        $members = User::role('user')->whereNotNull('first_name')->where(function ($q) use ($query) {
            $q->where('user_id', 'like', "%{$query}%")
                ->orWhere('email', 'like', "%{$query}%")
                ->orWhere('first_name', 'like', "%{$query}%")
                ->orWhere('last_name', 'like', "%{$query}%")
                ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$query}%"])
                ->orWhereRaw("CONCAT(first_name, ' ', middle_name, ' ', last_name) LIKE ?", ["%{$query}%"]);
        })->select('id', 'user_id', 'first_name', 'middle_name', 'last_name', 'email', 'phone_number')->get();

        Log::info($members);

        return response()->json(['results' => $members]);
    }


    // Show Public Profile
    public function viewProfile($id)
    {
        $user = User::with(['member', 'member.memberType', 'userDetail'])->findOrFail($id);

        return Inertia::render('App/Membership/Show', ['user' => $user]);
    }

    public function updateStatus(Request $request)
    {
        $request->validate([
            'member_id' => 'required|exists:members,id',
            'status' => 'required|in:active,suspended,cancelled',
            'reason' => 'nullable|string',
            'duration_type' => 'nullable|in:1Day,1Monthly,1Year,CustomDate',
            'custom_end_date' => 'nullable|date',
        ]);

        Log::info($request->all());

        $member = Member::findOrFail($request->member_id);

        // Determine end date
        $startDate = now();
        $endDate = null;

        if ($request->status === 'suspended') {
            switch ($request->duration_type) {
                case '1Day':
                    $endDate = now()->addDay();
                    break;
                case '1Monthly':
                    $endDate = now()->addMonth();
                    break;
                case '1Year':
                    $endDate = now()->addYear();
                    break;
                case 'CustomDate':
                    $endDate = Carbon::parse($request->custom_end_date);
                    break;
            }
        }

        DB::beginTransaction();
        try {
            $member->update(['card_status' => $request->status]);

            MemberStatusHistory::create([
                'user_id' => $member->user_id,
                'status' => $request->status,
                'reason' => $request->reason,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]);

            DB::commit();
            return response()->json(['message' => 'Status updated successfully']);
        } catch (\Exception $e) {
            Log::info($e);
            DB::rollBack();
            return response()->json(['error' => 'Failed to update status'], 500);
        }
    }

    // User No
    private function getUserNo()
    {
        $userNo = User::max('user_id');
        $userNo = $userNo + 1;
        return $userNo;
    }

    private function getInvoiceNo()
    {
        $invoiceNo = FinancialInvoice::max('invoice_no');
        $invoiceNo = $invoiceNo + 1;
        return $invoiceNo;
    }
}