<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use App\Models\CardPayment;
use App\Models\FinancialInvoice;
use App\Models\Media;
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
        $members = Member::whereNull('parent_id')
            ->with([
                'memberType:id,name',
                'memberCategory:id,name,description',
                'profilePhoto:id,mediable_id,mediable_type,file_path',
                'documents:id,mediable_id,mediable_type,file_path',
                'membershipInvoice:id,member_id,invoice_no,status,total_price' // ✅ Include membership invoice
            ])
            ->withCount('familyMembers')
            ->latest()
            ->limit(6)
            ->get();

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
        $user = Member::where('id', $request->id)
            ->with(['memberType', 'kinshipMember', 'documents', 'profilePhoto'])
            ->first();

        $user->profile_photo = $user->profilePhoto
            ? ['id' => $user->profilePhoto->id, 'file_path' => $user->profilePhoto->file_path]
            : null;

        unset($user->profilePhoto);

        // Load documents media
        $documentsMedia = $user->documents;
        $user->documents = $documentsMedia->map(function ($media) {
            return [
                'id' => $media->id,
                'file_name' => $media->file_name,
                'file_path' => $media->file_path,
                'mime_type' => $media->mime_type,
            ];
        });

        // Replace kinship with only selected fields
        if ($user->kinshipMember) {
            $user->kinship = [
                'id' => $user->kinshipMember['id'],
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

        $familyMembers = $user->familyMembers()->with('profilePhoto')->get()->map(function ($member) use ($user) {
            // Get profile photo media for family member
            $profilePhotoMedia = $member->profilePhoto;
            $pictureUrl = null;
            $pictureId = null;

            if ($profilePhotoMedia) {
                $pictureUrl = $profilePhotoMedia->file_path;
                $pictureId = $profilePhotoMedia->id;
            }

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
                'picture' => $pictureUrl, // Full URL from file_path
                'picture_id' => $pictureId, // Media ID for tracking
            ];
        });

        $memberTypesData = MemberType::all();
        $membercategories = MemberCategory::select('id', 'name', 'description', 'fee', 'subscription_fee')->where('status', 'active')->get();
        return Inertia::render('App/Admin/Membership/MembershipForm', compact('user', 'familyMembers', 'memberTypesData', 'membercategories'));
    }

    public function allMembers(Request $request)
    {
        $query = Member::whereNull('parent_id')
            ->with([
                'memberType:id,name',
                'profilePhoto:id,mediable_id,mediable_type,file_path',
                'documents:id,mediable_id,mediable_type,file_path',
                'memberCategory:id,name,description',
                'membershipInvoice:id,member_id,invoice_no,status,total_price' // ✅ Include membership invoice
            ])
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
                'membership_no',
                'name',
                'cnic',
                'contact',
                'status',
                'member_type',
                'sort',
                'sortBy'
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

            $fullName = trim(preg_replace('/\s+/', ' ', $request->title . ' ' . $request->first_name . ' ' . $request->middle_name . ' ' . $request->last_name));

            $membershipNo = Member::generateNextMembershipNumber();
            $applicationNo = Member::generateNextApplicationNo();

            // Create primary member record
            $mainMember = Member::create([
                'application_no' => $applicationNo,
                'first_name' => $request->first_name,
                'barcode_no' => $request->barcode_no ?? null,
                'middle_name' => $request->middle_name,
                'last_name' => $request->last_name,
                'full_name' => $fullName,
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
                'is_document_missing' => filter_var($request->is_document_missing ?? false, FILTER_VALIDATE_BOOLEAN),
                'missing_documents' => $request->missing_documents ?? null,
                'coa_category_id' => $request->coa_category_id,
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
            ]);

            // Handle profile photo using Media model
            if ($request->hasFile('profile_photo')) {
                $file = $request->file('profile_photo');

                // Get file metadata BEFORE moving the file
                $fileName = $file->getClientOriginalName();
                $mimeType = $file->getMimeType();
                $fileSize = $file->getSize();

                // Now save the file
                $filePath = FileHelper::saveImage($file, 'membership');

                $mainMember->media()->create([
                    'type' => 'profile_photo',
                    'file_name' => $fileName,
                    'file_path' => $filePath,
                    'mime_type' => $mimeType,
                    'file_size' => $fileSize,
                    'disk' => 'public',
                ]);
            }

            // Handle documents using Media model
            if ($request->hasFile('documents')) {
                foreach ($request->file('documents') as $file) {
                    // Get file metadata BEFORE moving the file
                    $fileName = $file->getClientOriginalName();
                    $mimeType = $file->getMimeType();
                    $fileSize = $file->getSize();

                    // Now save the file
                    $filePath = FileHelper::saveImage($file, 'member_documents');

                    $mainMember->media()->create([
                        'type' => 'member_docs',
                        'file_name' => $fileName,
                        'file_path' => $filePath,
                        'mime_type' => $mimeType,
                        'file_size' => $fileSize,
                        'disk' => 'public',
                    ]);
                }
            }

            $qrCodeData = route('member.profile', ['id' => $mainMember->id]);

            // Create QR code image and save it
            $qrBinary = QrCode::format('png')->size(300)->generate($qrCodeData);
            $qrImagePath = FileHelper::saveBinaryImage($qrBinary, 'qr_codes');
            $mainMember->qr_code = $qrImagePath;
            $mainMember->save();

            // Handle family members
            if (!empty($request->family_members)) {
                foreach ($request->family_members as $familyMemberData) {
                    $familyMember = Member::create([
                        'barcode_no' => $familyMemberData['barcode_no'] ?? null,
                        'parent_id' => $mainMember->id,
                        'membership_no' => $mainMember->membership_no . '-' . $familyMemberData['family_suffix'],
                        'family_suffix' => $familyMemberData['family_suffix'],
                        'full_name' => $familyMemberData['full_name'],
                        'personal_email' => $familyMemberData['email'],
                        'relation' => $familyMemberData['relation'],
                        'date_of_birth' => $familyMemberData['date_of_birth'],
                        'status' => $familyMemberData['status'],
                        'start_date' => $familyMemberData['start_date'] ?? null,
                        'end_date' => $familyMemberData['end_date'] ?? null,
                        'card_issue_date' => $familyMemberData['card_issue_date'] ?? null,
                        'card_expiry_date' => $familyMemberData['card_expiry_date'] ?? null,
                        'cnic_no' => $familyMemberData['cnic'],
                        'mobile_number_a' => $familyMemberData['phone_number'],
                    ]);

                    // Handle family member profile photo using Media model
                    if (!empty($familyMemberData['picture'])) {
                        $file = $familyMemberData['picture'];

                        // Get file metadata BEFORE moving the file
                        $fileName = $file->getClientOriginalName();
                        $mimeType = $file->getMimeType();
                        $fileSize = $file->getSize();

                        // Now save the file
                        $filePath = FileHelper::saveImage($file, 'familymembers');

                        $familyMember->media()->create([
                            'type' => 'profile_photo',
                            'file_name' => $fileName,
                            'file_path' => $filePath,
                            'mime_type' => $mimeType,
                            'file_size' => $fileSize,
                            'disk' => 'public',
                        ]);
                    }

                    $familyqrCodeData = route('member.profile', ['id' => $familyMember->id]);

                    // Create QR code image and save it
                    $familyqrqrBinary = QrCode::format('png')->size(300)->generate($familyqrCodeData);
                    $qrImagePath = FileHelper::saveBinaryImage($familyqrqrBinary, 'qr_codes');

                    $familyMember->qr_code = $qrImagePath;
                    $familyMember->save();
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

            // Store original status to check if it changed
            $originalStatus = $member->status;

            // Handle profile photo update using Media model
            if ($request->hasFile('profile_photo')) {
                $file = $request->file('profile_photo');

                // Get file metadata BEFORE moving the file
                $fileName = $file->getClientOriginalName();
                $mimeType = $file->getMimeType();
                $fileSize = $file->getSize();

                // Now save the file
                $filePath = FileHelper::saveImage($file, 'membership');

                // Delete old profile photo media if exists
                $oldProfilePhoto = $member->profilePhoto;
                if ($oldProfilePhoto) {
                    $oldProfilePhoto->deleteFile(); // Delete physical file
                    $oldProfilePhoto->delete(); // Delete media record
                }

                // Create new profile photo media
                $member->media()->create([
                    'type' => 'profile_photo',
                    'file_name' => $fileName,
                    'file_path' => $filePath,
                    'mime_type' => $mimeType,
                    'file_size' => $fileSize,
                    'disk' => 'public',
                ]);
            }

            // Handle documents update using Media model
            if ($request->has('documents')) {
                $requestDocs = (array) ($request->documents ?? []);
                $existingMediaIds = [];
                
                // FIRST: Get current media IDs BEFORE creating new ones
                $currentMediaIds = $member->media()->where('type', 'member_docs')->pluck('id')->toArray();

                // SECOND: Process the request - upload new files and collect IDs to keep
                foreach ($requestDocs as $doc) {
                    if ($doc instanceof \Illuminate\Http\UploadedFile) {
                        // Get file metadata BEFORE moving the file
                        $fileName = $doc->getClientOriginalName();
                        $mimeType = $doc->getMimeType();
                        $fileSize = $doc->getSize();

                        // Now save the file
                        $filePath = FileHelper::saveImage($doc, 'member_documents');

                        // Create new media record (this will NOT be deleted)
                        $member->media()->create([
                            'type' => 'member_docs',
                            'file_name' => $fileName,
                            'file_path' => $filePath,
                            'mime_type' => $mimeType,
                            'file_size' => $fileSize,
                            'disk' => 'public',
                        ]);
                    } elseif (is_numeric($doc)) {
                        // Existing media ID to keep
                        $existingMediaIds[] = $doc;
                    }
                }

                // THIRD: Delete old media that are not in the keep list
                // Only compare against the ORIGINAL media IDs (before we added new ones)
                $mediaIdsToDelete = array_diff($currentMediaIds, $existingMediaIds);
                
                // Delete the media records and their files
                if (!empty($mediaIdsToDelete)) {
                    $member->media()
                        ->whereIn('id', $mediaIdsToDelete)
                        ->each(function ($media) {
                            $media->deleteFile(); // Delete physical file
                            $media->delete(); // Delete media record
                        });
                }
            }

            $fullName = trim(preg_replace('/\s+/', ' ', $request->title . ' ' . $request->first_name . ' ' . $request->middle_name . ' ' . $request->last_name));

            // Update member
            $member->update([
                'membership_no' => $request->membership_no,
                'barcode_no' => $request->barcode_no ?? null,
                'first_name' => $request->first_name,
                'middle_name' => $request->middle_name,
                'last_name' => $request->last_name,
                'full_name' => $fullName,
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
                'coa_category_id' => $request->coa_category_id,
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
            ]);

            // Update Family Members
            if ($request->filled('family_members')) {
                foreach ($request->family_members as $newMemberData) {
                    // Check if family member is new

                    if (str_starts_with($newMemberData['id'], 'new-')) {
                        $familyMember = Member::create([
                            'barcode_no' => $newMemberData['barcode_no'] ?? null,
                            'parent_id' => $member->id,
                            'membership_no' => $request->membership_no . '-' . $newMemberData['family_suffix'],
                            'family_suffix' => $newMemberData['family_suffix'],
                            'full_name' => $newMemberData['full_name'],
                            'personal_email' => $newMemberData['email'] ?? null,
                            'relation' => $newMemberData['relation'],
                            'date_of_birth' => $newMemberData['date_of_birth'],
                            'status' => $newMemberData['status'],
                            'start_date' => $newMemberData['start_date'] ?? null,
                            'end_date' => $newMemberData['end_date'] ?? null,
                            'card_issue_date' => $newMemberData['card_issue_date'] ?? null,
                            'card_expiry_date' => $newMemberData['card_expiry_date'] ?? null,
                            'cnic_no' => $newMemberData['cnic'],
                            'mobile_number_a' => $newMemberData['phone_number'] ?? null,
                        ]);

                        // Handle family member profile photo using Media model
                        if (!empty($newMemberData['picture'])) {
                            $file = $newMemberData['picture'];

                            // Get file metadata BEFORE moving the file
                            $fileName = $file->getClientOriginalName();
                            $mimeType = $file->getMimeType();
                            $fileSize = $file->getSize();

                            // Now save the file
                            $filePath = FileHelper::saveImage($file, 'familymembers');

                            $familyMember->media()->create([
                                'type' => 'profile_photo',
                                'file_name' => $fileName,
                                'file_path' => $filePath,
                                'mime_type' => $mimeType,
                                'file_size' => $fileSize,
                                'disk' => 'public',
                            ]);
                        }

                        $familyqrCodeData = route('member.profile', ['id' => $familyMember->id]);

                        // Create QR code image and save it
                        $familyqrqrBinary = QrCode::format('png')->size(300)->generate($familyqrCodeData);
                        $qrImagePath = FileHelper::saveBinaryImage($familyqrqrBinary, 'qr_codes');

                        $familyMember->qr_code = $qrImagePath;
                        $familyMember->save();
                    } elseif (!empty($newMemberData['id'])) {
                        // Update existing family member

                        $updateFamily = Member::find($newMemberData['id']);
                        if ($updateFamily) {
                            // Handle family member profile photo update using Media model
                            if (!empty($newMemberData['picture']) && $newMemberData['picture'] instanceof \Illuminate\Http\UploadedFile) {
                                $file = $newMemberData['picture'];

                                // Get file metadata BEFORE moving the file
                                $fileName = $file->getClientOriginalName();
                                $mimeType = $file->getMimeType();
                                $fileSize = $file->getSize();

                                // Now save the file
                                $filePath = FileHelper::saveImage($file, 'familymembers');

                                // Delete old profile photo media if exists
                                $oldProfilePhoto = $updateFamily->profilePhoto;
                                if ($oldProfilePhoto) {
                                    $oldProfilePhoto->deleteFile();
                                    $oldProfilePhoto->delete();
                                }

                                // Create new profile photo media
                                $updateFamily->media()->create([
                                    'type' => 'profile_photo',
                                    'file_name' => $fileName,
                                    'file_path' => $filePath,
                                    'mime_type' => $mimeType,
                                    'file_size' => $fileSize,
                                    'disk' => 'public',
                                ]);
                            }

                            // Update member fields
                            $updateFamily->update([
                                'membership_no' => $request->membership_no . '-' . $newMemberData['family_suffix'],
                                'full_name' => $newMemberData['full_name'],
                                'barcode_no' => $newMemberData['barcode_no'] ?? null,
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

                    if ($family && $family->parent_id == $member->id) {
                        // Optionally also delete related User
                        if ($family->user) {
                            $family->user->delete();
                        }

                        $family->delete();
                    }
                }
            }

            // Check if status changed and create status history record
            if ($originalStatus !== $request->status) {
                // Close any existing open status history records
                $member->statusHistories()->whereNull('end_date')->update(['end_date' => now()]);

                // Create new status history record
                MemberStatusHistory::create([
                    'member_id' => $member->id,
                    'status' => $request->status,
                    'reason' => 'Status updated during member profile update',
                    'start_date' => now(),
                    'end_date' => null, // Open-ended until next status change
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

    // Show Public Profile
    public function viewProfile($id)
    {
        $user = Member::with(['memberType'])->findOrFail($id);

        return Inertia::render('App/Membership/Show', ['user' => $user]);
    }

    // Show Admin Member Profile with Family Members
    public function showMemberProfile($id)
    {
        $member = Member::with([
            'memberType:id,name',
            'profilePhoto:id,mediable_id,mediable_type,file_path',
            'memberCategory:id,name,description,subscription_fee',
            'kinshipMember:id,full_name,membership_no'
        ])->findOrFail($id);

        return Inertia::render('App/Admin/Membership/ViewProfile', [
            'member' => $member
        ]);
    }

    // Get Member Family Members with Pagination
    public function getMemberFamilyMembers(Request $request, $id)
    {
        $perPage = $request->get('per_page', 10);

        $familyMembers = Member::where('parent_id', $id)->with(['profilePhoto:id,mediable_id,mediable_type,file_path'])->paginate($perPage);

        return response()->json($familyMembers);
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

            $member->statusHistories()->whereNull('end_date')->update(['end_date' => now()]);

            MemberStatusHistory::create([
                'member_id' => $member->id,
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

    private function getInvoiceNo()
    {
        $invoiceNo = FinancialInvoice::max('invoice_no');
        $invoiceNo = $invoiceNo + 1;
        return $invoiceNo;
    }
}
