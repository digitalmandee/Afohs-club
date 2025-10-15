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
        $members = Member::whereNull('parent_id')->with('memberType:id,name', 'memberCategory:id,name,description')->withCount('familyMembers')->latest()->limit(6)->get();

        $total_members = Member::whereNull('parent_id')->count();
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
        $membershipNo = Member::generateNextMembershipNumber();
        $applicationNo = Member::generateNextApplicationNo();

        $memberTypesData = MemberType::select('id', 'name')->get();
        $membercategories = MemberCategory::select('id', 'name', 'description', 'fee', 'subscription_fee')->where('status', 'active')->get();
        return Inertia::render('App/Admin/Membership/MembershipForm', compact('membershipNo', 'applicationNo', 'memberTypesData', 'membercategories'));
    }

    public function edit(Request $request)
    {
        $user = Member::where('id', $request->id)->with('memberType', 'kinshipMember')->first();

        // Replace kinship with only selected fields
        if ($user->kinshipMember) {
            $user->kinship = [
                'id' => $user->kinshipMember['user_id'],
                'booking_type' => 'member',
                'name' => $user->kinshipMember['full_name'],
                'label' => "{$user->kinshipMember['full_name']} ({$user->kinshipMember['membership_no']})",
                'membership_no' => $user->kinshipMember['membership_no'],
                'email' => $user->kinshipMember['personal_email'],
                'cnic' => $user->kinshipMember['cnic_no'],
                'phone' => $user->kinshipMember['mobile_number_a'],
                'address' => $user->kinshipMember['current_address'],
            ];
        }

        $familyMembers = $user->familyMembers->map(function ($member) use ($user) {
            return [
                'id' => $member->id,
                'membership_no' => $member->membership_no,
                'application_no' => $member->application_no,
                'barcode_no' => $member->barcode_no,
                'family_suffix' => $member->family_suffix,
                'full_name' => $member->full_name,
                'member_type_id' => $user->member_type_id,
                'membership_category' => $user->member_category_id,
                'relation' => $member->relation,
                'cnic' => $member->cnic_no,
                'date_of_birth' => optional($member->date_of_birth)->format('Y-m-d'),
                'phone_number' => $member->mobile_number_a,
                'email' => $member->personal_email,
                'start_date' => $member->start_date,
                'end_date' => $member->end_date,
                'card_issue_date' => $member->card_issue_date,
                'card_expiry_date' => $member->card_expiry_date,
                'status' => $member->status,
                'picture' => $member->profile_photo,
            ];
        });
        $memberTypesData = MemberType::all();
        $membercategories = MemberCategory::select('id', 'name', 'description', 'fee', 'subscription_fee')->where('status', 'active')->get();
        return Inertia::render('App/Admin/Membership/MembershipForm', compact('user', 'familyMembers', 'memberTypesData', 'membercategories'));
    }

    public function allMembers(Request $request)
    {
        $query = Member::whereNull('parent_id')
            ->with('memberType:id,name', 'memberCategory:id,name,description')
            ->withCount('familyMembers');

        // Filter: Membership Number
        if ($request->filled('membership_no')) {
            $query->where('membership_no', 'like', '%' . $request->membership_no . '%');
        }

        // Filter: Name
        if ($request->filled('name')) {
            $query->where('full_name', 'like', '%' . $request->name . '%');
        }

        // Filter: CNIC
        if ($request->filled('cnic')) {
            $cnic = str_replace('-', '', $request->cnic);

            $query->whereRaw("REPLACE(cnic_no, '-', '') LIKE ?", ["%{$cnic}%"]);
        }

        // Filter: Contact
        if ($request->filled('contact')) {
            $query->where('mobile_number_a', 'like', '%' . $request->contact . '%');
        }

        // Filter: Status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('card_status') && $request->card_status !== 'all') {
            $query->where('card_status', $request->card_status);
        }

        // Filter: Member Type
        if ($request->filled('member_type') && $request->member_type !== 'all') {
            $query->whereHas('memberType', function ($q) use ($request) {
                $q->where('name', $request->member_type);
            });
        }

        // Sorting (default to newest on top)
        $sortBy = $request->input('sortBy', 'id');
        $sortDirection = $request->input('sort', 'desc');  // latest first

        if ($sortBy === 'name') {
            $query->orderBy('full_name', $sortDirection);
        } elseif ($sortBy === 'membership_no') {
            $query->orderBy('membership_no', $sortDirection);
        } else {
            $query->orderBy('id', $sortDirection);
        }

        $members = $query->paginate(10)->withQueryString();

        return Inertia::render('App/Admin/Membership/Members', [
            'members' => $members,
            'memberTypes' => MemberType::all(['id', 'name']),
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
                'membership_no' => 'nullable|string|unique:members,membership_no',
                'personal_email' => 'nullable|email|unique:members,personal_email',
                'barcode_no' => 'nullable|string|unique:members,barcode_no',
                'family_members' => 'array',
                'family_members.*.email' => 'nullable|email|distinct|different:email|unique:members,personal_email',
                'cnic_no' => 'required|string|regex:/^\d{5}-\d{7}-\d{1}$/|unique:members,cnic_no',
                'family_members.*.cnic' => 'nullable|string|regex:/^\d{5}-\d{7}-\d{1}$/|unique:members,cnic_no',
            ], [
                'membership_no.unique' => 'Membership number already exists.⚠️',
                'cnic_no.unique' => 'Member CNIC already exists.⚠️',
                'family_members.*.cnic.unique' => "Family member's CNIC already exists.⚠️",
            ]);

            // Custom validation to check if family member CNIC matches primary user CNIC
            $validator->after(function ($validator) use ($request) {
                $primaryCnic = $request->cnic_no ?? null;
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
            if ($request->hasFile('documents')) {
                foreach ($request->file('documents') as $file) {
                    $documentPaths[] = FileHelper::saveImage($file, 'member_documents');
                }
            }

            $fullName = trim(preg_replace('/\s+/', ' ', $request->title . ' ' . $request->first_name . ' ' . $request->middle_name . ' ' . $request->last_name));

            // Create primary user
            $primaryUser = User::create([
                'email' => $request->personal_email ?? null,
                'name' => $fullName,
                'password' => null,
                'phone_number' => $request->mobile_number_a,
                'profile_photo' => $memberImagePath
            ]);
            $primaryUser->assignRole('user');

            $membershipNo = Member::generateNextMembershipNumber();
            $applicationNo = Member::generateNextApplicationNo();

            $qrCodeData = route('member.profile', ['id' => $primaryUser->id]);

            // Create QR code image and save it
            $qrBinary = QrCode::format('png')->size(300)->generate($qrCodeData);
            $qrImagePath = FileHelper::saveBinaryImage($qrBinary, 'qr_codes');

            $memberCategory = MemberCategory::find($request->membership_category, ['id', 'name', 'fee', 'subscription_fee']);
            // Create primary member record

            $mainMember = Member::create([
                'user_id' => $primaryUser->id,
                'application_no' => $applicationNo,
                'first_name' => $request->first_name,
                'barcode_no' => $request->barcode_no ?? null,
                'middle_name' => $request->middle_name,
                'last_name' => $request->last_name,
                'full_name' => $fullName,
                'profile_photo' => $memberImagePath,
                'martial_status' => $request->martial_status,
                'kinship' => $request->kinship['id'] ?? null,
                'membership_no' => $request->membership_no ?? $membershipNo,
                'member_type_id' => $request->member_type_id,
                'member_category_id' => $request->membership_category,
                'membership_date' => $request->membership_date,
                'card_status' => $request->card_status,
                'status' => $request->status,
                'card_issue_date' => $request->card_issue_date,
                'card_expiry_date' => $request->card_expiry_date,
                'qr_code' => $qrImagePath,
                'is_document_missing' => filter_var($request->is_document_missing ?? false, FILTER_VALIDATE_BOOLEAN),
                'missing_documents' => $request->missing_documents ?? null,
                'coa_account' => $request->coa_account,
                'title' => $request->title,
                'guardian_name' => $request->guardian_name,
                'guardian_membership' => $request->guardian_membership,
                'nationality' => $request->nationality,
                'cnic_no' => $request->cnic_no,
                'passport_no' => $request->passport_no,
                'gender' => $request->gender,
                'ntn' => $request->ntn,
                'date_of_birth' => $request->date_of_birth,
                'education' => $request->education,
                'mobile_number_a' => $request->mobile_number_a,
                'mobile_number_b' => $request->mobile_number_b,
                'mobile_number_c' => $request->mobile_number_c,
                'telephone_number' => $request->telephone_number,
                'personal_email' => $request->personal_email,
                'critical_email' => $request->critical_email,
                'emergency_name' => $request->emergency_name,
                'emergency_relation' => $request->emergency_relation,
                'emergency_contact' => $request->emergency_contact,
                'current_address' => $request->current_address,
                'current_city' => $request->current_city,
                'current_country' => $request->current_country,
                'permanent_address' => $request->permanent_address,
                'permanent_city' => $request->permanent_city,
                'permanent_country' => $request->permanent_country,
                'country' => $request->country,
                'documents' => $documentPaths,
            ]);
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
                        'email' => $familyMemberData['email'] ?? null,
                        'password' => null,
                        'name' => $familyMemberData['full_name'],
                        'profile_photo' => $familyMemberImagePath
                    ]);

                    $familyUser->assignRole('user');

                    $familyqrCodeData = route('member.profile', ['id' => $familyUser->id]);

                    // Create QR code image and save it
                    $familyqrqrBinary = QrCode::format('png')->size(300)->generate($familyqrCodeData);
                    $qrImagePath = FileHelper::saveBinaryImage($familyqrqrBinary, 'qr_codes');

                    Member::create([
                        'user_id' => $familyUser->id,
                        'barcode_no' => $familyMemberData['barcode_no'] ?? null,
                        'parent_id' => $primaryUser->id,
                        'profile_photo' => $familyMemberImagePath,
                        'membership_no' => $mainMember->membership_no . '-' . $familyMemberData['family_suffix'],
                        'family_suffix' => $familyMemberData['family_suffix'],
                        'full_name' => $familyMemberData['full_name'],
                        'personal_email' => $familyMemberData['email'],
                        'relation' => $familyMemberData['relation'],
                        'date_of_birth' => $familyMemberData['date_of_birth'],
                        'qr_code' => $qrImagePath,
                        'status' => $familyMemberData['status'],
                        'start_date' => $familyMemberData['start_date'] ?? null,
                        'end_date' => $familyMemberData['end_date'] ?? null,
                        'card_issue_date' => $familyMemberData['card_issue_date'] ?? null,
                        'card_expiry_date' => $familyMemberData['card_expiry_date'] ?? null,
                        'cnic_no' => $familyMemberData['cnic'],
                        'mobile_number_a' => $familyMemberData['phone_number'],
                    ]);
                }
            }

            // $memberTypeArray = $memberCategory->toArray();  // includes all fields from DB

            // $memberTypeArray['amount'] = $memberCategory->fee;
            // $memberTypeArray['invoice_type'] = 'membership';

            // $data = [$memberTypeArray];

            // // Create membership invoice
            // $now = Carbon::now();
            // $quarter = ceil($now->month / 3);  // Calculate quarter number (1 to 4)
            // $paidForQuarter = $now->year . '-Q' . $quarter;

            // $invoice = FinancialInvoice::create([
            //     'invoice_no' => $this->getInvoiceNo(),
            //     'member_id' => $primaryUser->id,
            //     'amount' => $memberCategory->subscription_fee * 3,
            //     'subscription_type' => 'quarter',
            //     'invoice_type' => 'membership',
            //     'issue_date' => $now,
            //     'paid_for_quarter' => $paidForQuarter,
            //     'data' => $data,
            //     'status' => 'unpaid',
            // ]);

            // // Add membership invoice id to member
            // $member = Member::where('user_id', $primaryUser->id)->first();
            // $member->invoice_id = $invoice->id;
            // $member->save();

            DB::commit();

            return response()->json(['message' => 'Membership created successfully.'], 200);
        } catch (\Throwable $th) {
            Log::error('Error submitting membership details: ' . $th->getMessage());
            return response()->json(['error' => 'Failed to submit membership details: ' . $th->getMessage()], 500);
        }
    }

    public function updateMember(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'member_id' => 'required|exists:members,id',
                'personal_email' => 'nullable|email|unique:members,personal_email,' . $request->member_id,
                'family_members' => 'array',
                // 'family_members.*.email' => 'required|email|distinct|different:email|unique:members,personal_email',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            DB::beginTransaction();

            $member = Member::findOrFail($request->member_id);

            $memberImagePath = $member->profile_photo;
            // Save new profile photo if uploaded
            if ($request->hasFile('profile_photo')) {
                $memberImagePath = FileHelper::saveImage($request->file('profile_photo'), 'member_images');
                $member->profile_photo = $memberImagePath;
            }

            $oldDocs = $member->documents ?? [];
            $documentPaths = [];

            // ✅ Always cast request documents to array
            $requestDocs = (array) ($request->documents ?? []);

            // Step 1: Loop through request documents
            foreach ($requestDocs as $doc) {
                if ($doc instanceof \Illuminate\Http\UploadedFile) {
                    // It's a new file, save it
                    $documentPaths[] = FileHelper::saveImage($doc, 'member_documents');
                } elseif (!empty($doc)) {
                    // It's an existing path, keep it (skip empties)
                    $documentPaths[] = $doc;
                }
            }

            // Step 2: Find deleted docs
            $deleted = array_diff($oldDocs, $documentPaths);

            // Step 3: Delete them from filesystem
            foreach ($deleted as $docPath) {
                $absolutePath = public_path(ltrim($docPath, '/'));

                if (file_exists($absolutePath)) {
                    @unlink($absolutePath);
                }
            }

            $fullName = trim(preg_replace('/\s+/', ' ', $request->title . ' ' . $request->first_name . ' ' . $request->middle_name . ' ' . $request->last_name));

            // Update User basic info
            $member->user->update([
                'name' => $fullName,
                'email' => $request->personal_email ?? null,
                'phone_number' => $request->mobile_number_a,
            ]);

            // Update UserDetail (assumes one-to-one relation)

            $member->update([
                'membership_no' => $request->membership_no,
                'barcode_no' => $request->barcode_no ?? null,
                'first_name' => $request->first_name,
                'middle_name' => $request->middle_name,
                'last_name' => $request->last_name,
                'full_name' => $fullName,
                'profile_photo' => $memberImagePath,
                'martial_status' => $request->martial_status,
                'kinship' => $request->kinship['id'] ?? null,
                'member_type_id' => $request->member_type_id,
                'member_category_id' => $request->membership_category,
                'membership_date' => $request->membership_date,
                'card_status' => $request->card_status,
                'status' => $request->status,
                'card_issue_date' => $request->card_issue_date,
                'card_expiry_date' => $request->card_expiry_date,
                'is_document_missing' => filter_var($request->is_document_missing ?? false, FILTER_VALIDATE_BOOLEAN),
                'missing_documents' => $request->missing_documents ?? null,
                'coa_account' => $request->coa_account,
                'title' => $request->title,
                'guardian_name' => $request->guardian_name,
                'guardian_membership' => $request->guardian_membership,
                'nationality' => $request->nationality,
                'cnic_no' => $request->cnic_no,
                'passport_no' => $request->passport_no,
                'gender' => $request->gender,
                'ntn' => $request->ntn,
                'date_of_birth' => $request->date_of_birth,
                'education' => $request->education,
                'mobile_number_a' => $request->mobile_number_a,
                'mobile_number_b' => $request->mobile_number_b,
                'mobile_number_c' => $request->mobile_number_c,
                'telephone_number' => $request->telephone_number,
                'personal_email' => $request->personal_email,
                'critical_email' => $request->critical_email,
                'emergency_name' => $request->emergency_name,
                'emergency_relation' => $request->emergency_relation,
                'emergency_contact' => $request->emergency_contact,
                'current_address' => $request->current_address,
                'current_city' => $request->current_city,
                'current_country' => $request->current_country,
                'permanent_address' => $request->permanent_address,
                'permanent_city' => $request->permanent_city,
                'permanent_country' => $request->permanent_country,
                'country' => $request->country,
                'documents' => $documentPaths,
            ]);

            // Update Family Members
            if ($request->filled('family_members')) {
                foreach ($request->family_members as $newMemberData) {
                    // Check if family member is new

                    if (str_starts_with($newMemberData['id'], 'new-')) {
                        // Handle family member image
                        $familyMemberImagePath = null;
                        if (!empty($newMemberData['picture'])) {
                            $familyMemberImagePath = FileHelper::saveImage($newMemberData['picture'], 'member_images');
                        }
                        // Create User for family member (no password)
                        $familyUser = User::create([
                            'email' => $newMemberData['email'] ?? null,
                            'password' => isset($validated['password']) ? $validated['password'] : null,
                            'name' => $newMemberData['full_name'],
                            'profile_photo' => $familyMemberImagePath
                        ]);

                        $familyUser->assignRole('user');

                        $familyqrCodeData = route('member.profile', ['id' => $familyUser->id]);

                        // Create QR code image and save it
                        $familyqrqrBinary = QrCode::format('png')->size(300)->generate($familyqrCodeData);
                        $qrImagePath = FileHelper::saveBinaryImage($familyqrqrBinary, 'qr_codes');

                        Member::create([
                            'user_id' => $familyUser->id,
                            'barcode_no' => $newMemberData['barcode_no'] ?? null,
                            'parent_id' => $member->user_id,
                            'profile_photo' => $familyMemberImagePath,
                            'membership_no' => $request->membership_no . '-' . $newMemberData['family_suffix'],
                            'family_suffix' => $newMemberData['family_suffix'],
                            'full_name' => $newMemberData['full_name'],
                            'personal_email' => $newMemberData['email'] ?? null,
                            'relation' => $newMemberData['relation'],
                            'date_of_birth' => $newMemberData['date_of_birth'],
                            'qr_code' => $qrImagePath,
                            'status' => $newMemberData['status'],
                            'start_date' => $newMemberData['start_date'] ?? null,
                            'end_date' => $newMemberData['end_date'] ?? null,
                            'card_issue_date' => $newMemberData['card_issue_date'] ?? null,
                            'card_expiry_date' => $newMemberData['card_expiry_date'] ?? null,
                            'cnic_no' => $newMemberData['cnic'],
                            'mobile_number_a' => $newMemberData['phone_number'] ?? null,
                        ]);
                    } elseif (!empty($newMemberData['id'])) {
                        // Update existing family member

                        $updateFamily = Member::find($newMemberData['id']);
                        if ($updateFamily) {
                            // Update family member image if changed
                            $familyMemberImagePath = $updateFamily->profile_photo;
                            if (!empty($newMemberData['picture']) && $newMemberData['picture'] !== $updateFamily->profile_photo) {
                                $familyMemberImagePath = FileHelper::saveImage($newMemberData['picture'], 'member_images');
                            }

                            // Update related user info
                            if ($updateFamily->user) {
                                $updateFamily->user->update([
                                    'name' => $newMemberData['full_name'],
                                    'email' => $newMemberData['email'] ?? null,
                                    'profile_photo' => $familyMemberImagePath,
                                ]);
                            }

                            // Update member fields
                            $updateFamily->update([
                                'membership_no' => $request->membership_no . '-' . $newMemberData['family_suffix'],
                                'full_name' => $newMemberData['full_name'],
                                'barcode_no' => $newMemberData['barcode_no'] ?? null,
                                'profile_photo' => $familyMemberImagePath,
                                'personal_email' => $newMemberData['email'] ?? null,
                                'relation' => $newMemberData['relation'],
                                'date_of_birth' => $newMemberData['date_of_birth'],
                                'status' => $newMemberData['status'] ?? null,
                                'start_date' => $newMemberData['start_date'] ?? null,
                                'end_date' => $newMemberData['end_date'] ?? null,
                                'card_issue_date' => $newMemberData['card_issue_date'] ?? null,
                                'card_expiry_date' => $newMemberData['card_expiry_date'] ?? null,
                                'cnic_no' => $newMemberData['cnic'] ?? null,
                                'mobile_number_a' => $newMemberData['phone_number'] ?? null,
                            ]);
                        }
                    }
                }
            }

            // ✅ Handle family member deletions
            if ($request->filled('deleted_family_members')) {
                $idsToDelete = $request->deleted_family_members;

                foreach ($idsToDelete as $familyId) {
                    $family = Member::find($familyId);

                    if ($family && $family->parent_id == $member->user_id) {
                        // Optionally also delete related User
                        if ($family->user) {
                            $family->user->delete();
                        }

                        $family->delete();
                    }
                }
            }

            DB::commit();

            return response()->json(['message' => 'Membership updated successfully.']);
        } catch (\Throwable $th) {
            DB::rollBack();
            Log::error('Error updating member: ' . $th->getMessage());
            return response()->json(['error' => 'Failed to update membership details.'], 500);
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
            'status' => 'required|in:active,suspended,cancelled,absent,expired,terminated,not_assign,in_suspension_process',
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
                'status' => $request->status,
                'paused_at' => $request->status === 'absent' ? now() : null,
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