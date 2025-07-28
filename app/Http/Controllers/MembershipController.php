<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use App\Models\CardPayment;
use App\Models\FinancialInvoice;
use App\Models\Member;
use App\Models\MemberCategory;
use App\Models\MemberStatusHistory;
use App\Models\MemberType;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class MembershipController extends Controller
{
    public function index()
    {
        $members = User::role('user')->whereNull('parent_user_id')->with('member', 'member.memberType:id,name', 'member.memberCategory:id,name')->latest()->limit(6)->get();

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
        $membershipNo = Member::generateNextMembershipNumber();
        $applicationNo = Member::generateNextApplicationNo();

        $memberTypesData = MemberType::select('id', 'name')->get();
        $membercategories = MemberCategory::select('id', 'name', 'fee', 'subscription_fee')->where('status', 'active')->get();
        return Inertia::render('App/Admin/Membership/MembershipForm', compact('userNo', 'membershipNo', 'applicationNo', 'memberTypesData', 'membercategories'));
    }

    public function edit(Request $request)
    {
        $user = User::where('id', $request->id)->with('member', 'member.memberType')->first();
        $familyMembers = $user->familyMembers->map(function ($member) {
            return [
                'user_id' => $member->id,
                'full_name' => $member->name,
                'relation' => $member->member->relation,
                'cnic' => $member->member->cnic,
                'phone_number' => $member->phone_number,
                'email' => $member->email,
                'start_date' => $member->member->start_date,
                'end_date' => $member->member->end_date,
                'picture' => $member->profile_photo,
            ];
        });
        $memberTypesData = MemberType::all();
        $membercategories = MemberCategory::select('id', 'name', 'fee', 'subscription_fee')->where('status', 'active')->get();
        return Inertia::render('App/Admin/Membership/MembershipForm', compact('user', 'familyMembers', 'memberTypesData', 'membercategories'));
    }

    public function allMembers(Request $request)
    {
        $query = User::role('user')
            ->whereNull('parent_user_id')
            ->with(['member', 'member.memberType:id,name', 'member.memberCategory:id,name']);

        // Filter: Membership Number
        if ($request->filled('membership_no')) {
            $query->whereHas('member', function ($q) use ($request) {
                $q->where('membership_no', 'like', '%' . $request->membership_no . '%');
            });
        }

        // Filter: Name (first_name only or combine first+last if needed)
        if ($request->filled('name')) {
            $query->where(function ($q) use ($request) {
                $q
                    ->where('first_name', 'like', '%' . $request->name . '%')
                    ->orWhere('last_name', 'like', '%' . $request->name . '%');
            });
        }

        // Filter: CNIC
        if ($request->filled('cnic')) {
            $query->whereHas('member', function ($q) use ($request) {
                $q->where('cnic_no', 'like', '%' . $request->cnic . '%');
            });
        }

        // Filter: Contact
        if ($request->filled('contact')) {
            $query->whereHas('member', function ($q) use ($request) {
                $q->where('mobile_number_a', 'like', '%' . $request->contact . '%');
            });
        }

        // Filter: Status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->whereHas('member', function ($q) use ($request) {
                $q->where('card_status', $request->status);
            });
        }

        // Filter: Member Type
        if ($request->filled('member_type') && $request->member_type !== 'all') {
            $query->whereHas('member.memberType', function ($q) use ($request) {
                $q->where('name', $request->member_type);
            });
        }

        // Sorting
        $sortBy = $request->input('sortBy', 'id');
        $sortDirection = $request->input('sort', 'asc');

        if ($sortBy === 'name') {
            $query->orderBy('first_name', $sortDirection);
        } elseif ($sortBy === 'membership_no') {
            $query->whereHas('member', function ($q) use ($sortDirection) {
                $q->orderBy('membership_no', $sortDirection);
            });
        } else {
            $query->orderBy('id', $sortDirection);
        }

        $members = $query->paginate(10)->withQueryString();

        return Inertia::render('App/Admin/Membership/Members', [
            'members' => $members,
            'filters' => $request->only([
                'membership_no', 'name', 'cnic', 'contact',
                'status', 'member_type', 'sort', 'sortBy'
            ]),
        ]);
    }

    public function membershipHistory()
    {
        $members = User::role('user')->whereNull('parent_user_id')->with('member', 'member.memberType:id,name', 'member.memberCategory:id,name')->get();

        return Inertia::render('App/Admin/Membership/Members', compact('members'));
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email|unique:users,email',
                'family_members' => 'array',
                'family_members.*.email' => 'required|email|distinct|different:email|unique:users,email',
                'member.cnic_no' => 'required|string|regex:/^\d{5}-\d{7}-\d{1}$/|unique:members,cnic_no',
                'family_members.*.cnic' => 'nullable|string|regex:/^\d{5}-\d{7}-\d{1}$/|unique:members,cnic_no',
            ], [
                'member.cnic_no.unique' => "The primary user's CNIC already exists.",
                'family_members.*.cnic.unique' => "The family member's CNIC already exists.",
            ], [
                'members.cnic_no' => 'Primary User CNIC',
                'family_members.*.cnic' => 'Family Member CNIC',
            ]);

            // Custom validation to check if family member CNIC matches primary user CNIC
            $validator->after(function ($validator) use ($request) {
                $primaryCnic = $request->member['cnic_no'] ?? null;
                if (!empty($request->family_members)) {
                    foreach ($request->family_members as $index => $familyMember) {
                        if (!empty($familyMember['cnic']) && $familyMember['cnic'] === $primaryCnic) {
                            $validator->errors()->add(
                                "family_members.$index.cnic",
                                'Family member CNIC must not be the same as the primary user CNIC.'
                            );
                        }
                    }
                }
            });

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            DB::beginTransaction();

            $memberImagePath = null;
            if ($request->hasFile('profile_photo')) {
                $memberImagePath = FileHelper::saveImage($request->file('profile_photo'), 'member_images');
            }

            $documentPaths = [];
            if ($request->hasFile('member.documents')) {
                foreach ($request->file('member.documents') as $file) {
                    $documentPaths[] = FileHelper::saveImage($file, 'member_documents');
                }
            }

            // Create primary user
            $primaryUser = User::create([
                'email' => $request->email,
                'name' => $request->member['first_name'] . ' ' . $request->member['last_name'],
                'phone_number' => $request->member['mobile_number_a'],
                'profile_photo' => $memberImagePath
            ]);
            $primaryUser->assignRole('user');

            $membershipNo = Member::generateNextMembershipNumber();
            $applicationNo = Member::generateNextApplicationNo();

            $qrCodeData = route('member.profile', ['id' => $primaryUser->id]);

            // Create QR code image and save it
            $qrBinary = QrCode::format('png')->size(300)->generate($qrCodeData);
            $qrImagePath = FileHelper::saveBinaryImage($qrBinary, 'qr_codes');

            $memberCategory = MemberCategory::find($request->member['membership_category'], ['id', 'name', 'fee', 'subscription_fee']);
            // Create primary member record

            Log::info(json_encode($request->member));
            Member::create([
                'user_id' => $primaryUser->id,
                'application_no' => $applicationNo,
                'first_name' => $request->member['first_name'],
                'middle_name' => $request->member['middle_name'],
                'last_name' => $request->member['last_name'],
                'kinship' => $request->member['kinship']['id'] ?? null,
                'membership_no' => $request->member['membership_no'] ?? $membershipNo,
                'member_type_id' => $request->member['member_type_id'],
                'member_category_id' => $request->member['membership_category'],
                'membership_date' => $request->member['membership_date'],
                'card_status' => $request->member['card_status'],
                'status' => $request->member['status'],
                'card_issue_date' => $request->member['card_issue_date'],
                'card_expiry_date' => $request->member['card_expiry_date'],
                'qr_code' => $qrImagePath,
                'is_document_missing' => filter_var($request->member['is_document_missing'] ?? false, FILTER_VALIDATE_BOOLEAN),
                'missing_documents' => $request->member['missing_documents'] ?? null,
                'coa_account' => $request->member['coa_account'],
                'title' => $request->member['title'],
                'guardian_name' => $request->member['guardian_name'],
                'guardian_membership' => $request->member['guardian_membership'],
                'nationality' => $request->member['nationality'],
                'cnic_no' => $request->member['cnic_no'],
                'passport_no' => $request->member['passport_no'],
                'gender' => $request->member['gender'],
                'ntn' => $request->member['ntn'],
                'date_of_birth' => $request->member['date_of_birth'],
                'education' => json_encode($request->member['education'] ?? []),
                'mobile_number_a' => $request->member['mobile_number_a'],
                'mobile_number_b' => $request->member['mobile_number_b'],
                'mobile_number_c' => $request->member['mobile_number_c'],
                'telephone_number' => $request->member['telephone_number'],
                'personal_email' => $request->email,
                'critical_email' => $request->member['critical_email'],
                'emergency_name' => $request->member['emergency_name'],
                'emergency_relation' => $request->member['emergency_relation'],
                'emergency_contact' => $request->member['emergency_contact'],
                'current_address' => $request->member['current_address'],
                'current_city' => $request->member['current_city'],
                'current_country' => $request->member['current_country'],
                'permanent_address' => $request->member['permanent_address'],
                'permanent_city' => $request->member['permanent_city'],
                'permanent_country' => $request->member['permanent_country'],
                'country' => $request->member['country'],
                'documents' => $documentPaths,
            ]);
            Log::info('yes');
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
                        'email' => $familyMemberData['email'],
                        'password' => isset($validated['password']) ? $validated['password'] : null,
                        'name' => $familyMemberData['full_name'],
                        'phone_number' => $familyMemberData['phone_number'],
                        'parent_user_id' => $primaryUser->id,
                        'profile_photo' => $familyMemberImagePath
                    ]);

                    $familyUser->assignRole('user');

                    Member::create([
                        'user_id' => $familyUser->id,
                        'application_no' => Member::generateNextApplicationNo(),
                        'first_name' => $familyMemberData['full_name'],
                        'relation' => $familyMemberData['relation'],
                        'family_suffix' => $familyMemberData['family_suffix'],
                        'card_status' => $request->member['card_status'],
                        'start_date' => $familyMemberData['start_date'] ?? null,
                        'end_date' => $familyMemberData['end_date'] ?? null,
                        'cnic_no' => $familyMemberData['cnic'],
                        'mobile_number_a' => $familyMemberData['phone_number'],
                    ]);
                }
            }

            $memberTypeArray = $memberCategory->toArray();  // includes all fields from DB
            $memberTypeArray['amount'] = $memberCategory->fee;
            $memberTypeArray['invoice_type'] = 'membership';

            $data = [$memberTypeArray];

            // Create membership invoice
            $now = Carbon::now();
            $quarter = ceil($now->month / 3);  // Calculate quarter number (1 to 4)
            $paidForQuarter = $now->year . '-Q' . $quarter;

            $invoice = FinancialInvoice::create([
                'invoice_no' => $this->getInvoiceNo(),
                'customer_id' => $primaryUser->id,
                'amount' => $memberCategory->fee,
                'member_id' => Auth::user()->id,
                'subscription_type' => 'quarter',
                'invoice_type' => 'membership',
                'issue_date' => $now,
                'paid_for_quarter' => $paidForQuarter,
                'data' => $data,
                'status' => 'unpaid',
            ]);

            // Add membership invoice id to member
            $member = Member::where('user_id', $primaryUser->id)->first();
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
                'name' => $request->member['first_name'] . ' ' . $request->member['last_name'],
                'phone_number' => $request->user_details['mobile_number_a'],
            ]);

            // Update UserDetail (assumes one-to-one relation)
            $memberDetail = $user->member;

            if ($memberDetail) {
                $memberDetail->update([
                    'kinship' => $request->member['kinship']['id'] ?? null,
                    'membership_no' => $request->member['membership_no'],
                    'member_type_id' => $request->member['member_type_id'],
                    'first_name' => $request->member['first_name'],
                    'middle_name' => $request->member['middle_name'],
                    'last_name' => $request->member['last_name'],
                    'member_category_id' => $request->member['membership_category'],
                    'membership_date' => $request->member['membership_date'],
                    'card_status' => $request->member['card_status'],
                    'status' => $request->member['status'],
                    'card_issue_date' => $request->member['card_issue_date'],
                    'card_expiry_date' => $request->member['card_expiry_date'],
                    'is_document_missing' => filter_var($request->member['is_document_missing'] ?? false, FILTER_VALIDATE_BOOLEAN),
                    'missing_documents' => $request->member['missing_documents'] ?? null,
                    'coa_account' => $request->member['coa_account'],
                    'title' => $request->member['title'],
                    'guardian_name' => $request->member['guardian_name'],
                    'guardian_membership' => $request->member['guardian_membership'],
                    'nationality' => $request->member['nationality'],
                    'cnic_no' => $request->member['cnic_no'],
                    'passport_no' => $request->member['passport_no'],
                    'gender' => $request->member['gender'],
                    'ntn' => $request->member['ntn'],
                    'date_of_birth' => $request->member['date_of_birth'],
                    'education' => json_encode($request->member['education'] ?? []),
                    'mobile_number_a' => $request->member['mobile_number_a'],
                    'mobile_number_b' => $request->member['mobile_number_b'],
                    'mobile_number_c' => $request->member['mobile_number_c'],
                    'telephone_number' => $request->member['telephone_number'],
                    'personal_email' => $request->email,
                    'critical_email' => $request->member['critical_email'],
                    'emergency_name' => $request->member['emergency_name'],
                    'emergency_relation' => $request->member['emergency_relation'],
                    'emergency_contact' => $request->member['emergency_contact'],
                    'current_address' => $request->member['current_address'],
                    'current_city' => $request->member['current_city'],
                    'current_country' => $request->member['current_country'],
                    'permanent_address' => $request->member['permanent_address'],
                    'permanent_city' => $request->member['permanent_city'],
                    'permanent_country' => $request->member['permanent_country'],
                    'country' => $request->member['country'],
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
            $q
                ->where('user_id', 'like', "%{$query}%")
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
        $user = User::with(['member', 'member.memberType'])->findOrFail($id);

        return Inertia::render('App/Membership/Show', ['user' => $user]);
    }

    public function updateStatus(Request $request)
    {
        $request->validate([
            'member_id' => 'required|exists:members,id',
            'status' => 'required|in:active,suspended,cancelled,pause',
            'reason' => 'nullable|string',
            'duration_type' => 'nullable|in:1Day,1Monthly,1Year,CustomDate',
            'custom_end_date' => 'nullable|date',
        ]);

        $member = Member::findOrFail($request->member_id);

        $startDate = now();
        $endDate = null;

        if (in_array($request->status, ['suspended'])) {
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
            $member->update([
                'card_status' => $request->status,
                'paused_at' => $request->status === 'pause' ? now() : null,
            ]);

            $member->user->statusHistories()->whereNull('end_date')->update(['end_date' => now()]);

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
            Log::error('Status update failed', ['error' => $e->getMessage()]);
            DB::rollBack();
            return response()->json(['error' => 'Failed to update status'], 500);
        }
    }

    // Membership Pause
    public function membershipPause(Request $request)
    {
        $member = User::with('member')->findOrFail($request->member_id);

        Log::info($member);

        // End previous status
        $member->statusHistories()->whereNull('ended_at')->update(['ended_at' => now()]);

        // Create new status
        $member->statusHistories()->create([
            'status' => 'pause',
            'started_at' => now(),
        ]);

        // Update current card_status in member table
        if ($member->member) {
            $member->member->update(['card_status' => 'pause']);
        } else {
            // Log or handle the case when member is missing
            Log::warning("No member record found for user ID: {$member->id}");
        }

        return back()->with('success', 'Membership paused successfully.');
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
