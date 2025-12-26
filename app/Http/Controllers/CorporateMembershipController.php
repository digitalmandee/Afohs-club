<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use App\Models\CorporateMember;
use App\Models\FinancialInvoice;
use App\Models\MemberCategory;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class CorporateMembershipController extends Controller
{
    /**
     * Display dashboard - redirects to main membership dashboard which has tabs.
     */
    public function index()
    {
        return redirect()->route('membership.dashboard');
    }

    /**
     * Show create form with categories filtered for corporate.
     */
    public function create()
    {
        $membershipNo = CorporateMember::generateNextMembershipNumber();

        // Filter categories that have 'corporate' in their category_types JSON array
        $membercategories = MemberCategory::select('id', 'name', 'description', 'fee', 'subscription_fee')
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereJsonContains('category_types', 'corporate');
            })
            ->get();

        return Inertia::render('App/Admin/CorporateMembership/CorporateMemberForm', compact('membershipNo', 'membercategories'));
    }

    /**
     * Store new corporate member.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'membership_no' => 'nullable|string|unique:corporate_members,membership_no',
                'personal_email' => 'nullable|email|unique:corporate_members,personal_email',
                'barcode_no' => 'nullable|string|unique:corporate_members,barcode_no',
                'cnic_no' => 'required|string|regex:/^\d{5}-\d{7}-\d{1}$/|unique:corporate_members,cnic_no',
            ], [
                'membership_no.unique' => 'Membership number already exists.⚠️',
                'cnic_no.unique' => 'Corporate Member CNIC already exists.⚠️',
                'barcode_no.unique' => 'Barcode number already exists.⚠️',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            DB::beginTransaction();

            $fullName = trim(preg_replace('/\s+/', ' ', $request->title . ' ' . $request->first_name . ' ' . $request->middle_name . ' ' . $request->last_name));
            $membershipNo = CorporateMember::generateNextMembershipNumber();

            $mainMember = CorporateMember::create([
                'first_name' => $request->first_name,
                'barcode_no' => $request->barcode_no ?? null,
                'middle_name' => $request->middle_name,
                'last_name' => $request->last_name,
                'full_name' => $fullName,
                'martial_status' => $request->martial_status,
                'membership_no' => $request->membership_no ?? $membershipNo,
                'member_category_id' => $request->membership_category,
                'membership_date' => $this->formatDateForDatabase($request->membership_date),
                'card_status' => $request->card_status,
                'status' => $request->status,
                'card_issue_date' => $this->formatDateForDatabase($request->card_issue_date),
                'card_expiry_date' => $this->formatDateForDatabase($request->card_expiry_date),
                'is_document_missing' => filter_var($request->is_document_missing ?? false, FILTER_VALIDATE_BOOLEAN),
                'missing_documents' => $request->missing_documents ?? null,
                'title' => $request->title,
                'guardian_name' => $request->guardian_name,
                'guardian_membership' => $request->guardian_membership,
                'nationality' => $request->nationality,
                'cnic_no' => $request->cnic_no,
                'passport_no' => $request->passport_no,
                'gender' => $request->gender,
                'ntn' => $request->ntn,
                'date_of_birth' => $this->formatDateForDatabase($request->date_of_birth),
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
                'business_developer_id' => $request->business_developer_id,
                'membership_fee' => $request->membership_fee,
                'additional_membership_charges' => $request->additional_membership_charges,
                'membership_fee_additional_remarks' => $request->membership_fee_additional_remarks,
                'membership_fee_discount' => $request->membership_fee_discount,
                'membership_fee_discount_remarks' => $request->membership_fee_discount_remarks,
                'total_membership_fee' => $request->total_membership_fee,
                'maintenance_fee' => $request->maintenance_fee,
                'additional_maintenance_charges' => $request->additional_maintenance_charges,
                'maintenance_fee_additional_remarks' => $request->maintenance_fee_additional_remarks,
                'maintenance_fee_discount' => $request->maintenance_fee_discount,
                'maintenance_fee_discount_remarks' => $request->maintenance_fee_discount_remarks,
                'total_maintenance_fee' => $request->total_maintenance_fee,
                'per_day_maintenance_fee' => $request->per_day_maintenance_fee,
                'comment_box' => $request->comment_box,
            ]);

            // Handle profile photo
            if ($request->hasFile('profile_photo')) {
                $file = $request->file('profile_photo');
                $fileName = $file->getClientOriginalName();
                $mimeType = $file->getMimeType();
                $fileSize = $file->getSize();
                $filePath = FileHelper::saveImage($file, 'corporate_membership');

                $mainMember->media()->create([
                    'type' => 'profile_photo',
                    'file_name' => $fileName,
                    'file_path' => $filePath,
                    'mime_type' => $mimeType,
                    'file_size' => $fileSize,
                    'disk' => 'public',
                ]);
            }

            // Handle documents
            if ($request->hasFile('documents')) {
                foreach ($request->file('documents') as $file) {
                    $fileName = $file->getClientOriginalName();
                    $mimeType = $file->getMimeType();
                    $fileSize = $file->getSize();
                    $filePath = FileHelper::saveImage($file, 'corporate_member_documents');

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

            // Create QR code
            $qrCodeData = route('corporate-member.profile', ['id' => $mainMember->id]);
            $qrBinary = QrCode::format('png')->size(300)->generate($qrCodeData);
            $qrImagePath = FileHelper::saveBinaryImage($qrBinary, 'qr_codes');
            $mainMember->qr_code = $qrImagePath;
            $mainMember->save();

            // Create unpaid membership fee invoice
            FinancialInvoice::create([
                'invoice_no' => $this->generateInvoiceNumber(),
                'member_id' => $mainMember->id,
                'fee_type' => 'membership_fee',
                'invoice_type' => 'corporate_membership',
                'amount' => $request->membership_fee ?? 0,
                'additional_charges' => $request->additional_membership_charges ?? 0,
                'discount_type' => 'fixed',
                'discount_value' => $request->membership_fee_discount ?? 0,
                'discount_details' => $request->membership_fee_discount_remarks,
                'total_price' => $request->total_membership_fee,
                'payment_method' => null,
                'valid_from' => $this->formatDateForDatabase($request->membership_date),
                'valid_to' => null,
                'status' => 'unpaid',
                'remarks' => $request->membership_fee_additional_remarks,
                'invoiceable_id' => $mainMember->id,
                'invoiceable_type' => CorporateMember::class,
            ]);

            DB::commit();

            return response()->json(['message' => 'Corporate Membership created successfully.', 'member' => $mainMember], 200);
        } catch (\Throwable $th) {
            DB::rollBack();
            Log::error('Error creating corporate member: ' . $th->getMessage());
            return response()->json(['error' => 'Failed to create corporate member: ' . $th->getMessage()], 500);
        }
    }

    /**
     * Show all corporate members list.
     */
    public function allMembers(Request $request)
    {
        $query = CorporateMember::whereNull('parent_id')
            ->with([
                'profilePhoto:id,mediable_id,mediable_type,file_path',
                'documents:id,mediable_id,mediable_type,file_path',
                'memberCategory:id,name,description',
                'membershipInvoice:id,member_id,invoice_no,status,total_price'
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

        // Filter: Card Status
        if ($request->filled('card_status') && $request->card_status !== 'all') {
            $query->where('card_status', $request->card_status);
        }

        // Filter: Member Category
        if ($request->filled('member_category') && $request->member_category !== 'all') {
            $query->where('member_category_id', $request->member_category);
        }

        // Sorting
        $sortBy = $request->input('sortBy', 'id');
        $sortDirection = $request->input('sort', 'desc');

        if ($sortBy === 'name') {
            $query->orderBy('full_name', $sortDirection);
        } elseif ($sortBy === 'membership_no') {
            $query->orderBy('membership_no', $sortDirection);
        } else {
            $query->orderBy('id', $sortDirection);
        }

        $members = $query->paginate(10)->withQueryString();

        // Get Member Categories for filter
        $memberCategories = \App\Models\MemberCategory::select('id', 'name')->get();

        return Inertia::render('App/Admin/CorporateMembership/CorporateMembers', [
            'members' => $members,
            'memberCategories' => $memberCategories,
            'filters' => $request->all(),
        ]);
    }

    /**
     * Show edit form.
     */
    public function edit(Request $request)
    {
        $user = CorporateMember::where('id', $request->id)
            ->with(['documents', 'profilePhoto', 'memberCategory'])
            ->first();

        if (!$user) {
            return redirect()->route('corporate-membership.dashboard')->with('error', 'Corporate member not found.');
        }

        $user->profile_photo = $user->profilePhoto
            ? ['id' => $user->profilePhoto->id, 'file_path' => $user->profilePhoto->file_path]
            : null;

        $userData = $user->toArray();

        $membercategories = MemberCategory::select('id', 'name', 'description', 'fee', 'subscription_fee')
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereJsonContains('category_types', 'corporate');
            })
            ->get();

        return Inertia::render('App/Admin/CorporateMembership/CorporateMemberForm', compact('membercategories'))
            ->with(['user' => $userData]);
    }

    /**
     * Show member profile.
     */
    public function showMemberProfile($id)
    {
        $member = CorporateMember::with([
            'memberCategory',
            'profilePhoto',
            'documents',
            'familyMembers.profilePhoto',
            'professionInfo',
            'businessDeveloper',
        ])->findOrFail($id);

        return Inertia::render('App/Admin/CorporateMembership/ViewProfile', [
            'member' => $member,
        ]);
    }

    /**
     * Get family members for profile.
     */
    public function getFamilyMembers(Request $request, $id)
    {
        $perPage = $request->input('per_page', 10);

        $familyMembers = CorporateMember::where('parent_id', $id)
            ->with(['profilePhoto'])
            ->paginate($perPage);

        return response()->json($familyMembers);
    }

    /**
     * Update corporate member.
     */
    public function update(Request $request, $id)
    {
        try {
            $member = CorporateMember::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'membership_no' => 'nullable|string|unique:corporate_members,membership_no,' . $id,
                'personal_email' => 'nullable|email|unique:corporate_members,personal_email,' . $id,
                'barcode_no' => 'nullable|string|unique:corporate_members,barcode_no,' . $id,
                'cnic_no' => 'required|string|regex:/^\d{5}-\d{7}-\d{1}$/|unique:corporate_members,cnic_no,' . $id,
            ], [
                'membership_no.unique' => 'Membership number already exists.⚠️',
                'cnic_no.unique' => 'Corporate Member CNIC already exists.⚠️',
                'barcode_no.unique' => 'Barcode number already exists.⚠️',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            DB::beginTransaction();

            $fullName = trim(preg_replace('/\s+/', ' ', $request->title . ' ' . $request->first_name . ' ' . $request->middle_name . ' ' . $request->last_name));

            $member->update([
                'first_name' => $request->first_name,
                'barcode_no' => $request->barcode_no ?? null,
                'middle_name' => $request->middle_name,
                'last_name' => $request->last_name,
                'full_name' => $fullName,
                'martial_status' => $request->martial_status,
                'member_category_id' => $request->membership_category,
                'membership_date' => $this->formatDateForDatabase($request->membership_date),
                'card_status' => $request->card_status,
                'status' => $request->status,
                'card_issue_date' => $this->formatDateForDatabase($request->card_issue_date),
                'card_expiry_date' => $this->formatDateForDatabase($request->card_expiry_date),
                'is_document_missing' => filter_var($request->is_document_missing ?? false, FILTER_VALIDATE_BOOLEAN),
                'missing_documents' => $request->missing_documents ?? null,
                'title' => $request->title,
                'guardian_name' => $request->guardian_name,
                'guardian_membership' => $request->guardian_membership,
                'nationality' => $request->nationality,
                'cnic_no' => $request->cnic_no,
                'passport_no' => $request->passport_no,
                'gender' => $request->gender,
                'ntn' => $request->ntn,
                'date_of_birth' => $this->formatDateForDatabase($request->date_of_birth),
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
                'business_developer_id' => $request->business_developer_id,
                'membership_fee' => $request->membership_fee,
                'additional_membership_charges' => $request->additional_membership_charges,
                'membership_fee_additional_remarks' => $request->membership_fee_additional_remarks,
                'membership_fee_discount' => $request->membership_fee_discount,
                'membership_fee_discount_remarks' => $request->membership_fee_discount_remarks,
                'total_membership_fee' => $request->total_membership_fee,
                'maintenance_fee' => $request->maintenance_fee,
                'additional_maintenance_charges' => $request->additional_maintenance_charges,
                'maintenance_fee_additional_remarks' => $request->maintenance_fee_additional_remarks,
                'maintenance_fee_discount' => $request->maintenance_fee_discount,
                'maintenance_fee_discount_remarks' => $request->maintenance_fee_discount_remarks,
                'total_maintenance_fee' => $request->total_maintenance_fee,
                'per_day_maintenance_fee' => $request->per_day_maintenance_fee,
                'comment_box' => $request->comment_box,
            ]);

            // Handle profile photo update
            if ($request->hasFile('profile_photo')) {
                // Delete old photo
                $member->media()->where('type', 'profile_photo')->delete();

                $file = $request->file('profile_photo');
                $fileName = $file->getClientOriginalName();
                $mimeType = $file->getMimeType();
                $fileSize = $file->getSize();
                $filePath = FileHelper::saveImage($file, 'corporate_membership');

                $member->media()->create([
                    'type' => 'profile_photo',
                    'file_name' => $fileName,
                    'file_path' => $filePath,
                    'mime_type' => $mimeType,
                    'file_size' => $fileSize,
                    'disk' => 'public',
                ]);
            }

            // Handle new documents
            if ($request->hasFile('documents')) {
                foreach ($request->file('documents') as $file) {
                    $fileName = $file->getClientOriginalName();
                    $mimeType = $file->getMimeType();
                    $fileSize = $file->getSize();
                    $filePath = FileHelper::saveImage($file, 'corporate_member_documents');

                    $member->media()->create([
                        'type' => 'member_docs',
                        'file_name' => $fileName,
                        'file_path' => $filePath,
                        'mime_type' => $mimeType,
                        'file_size' => $fileSize,
                        'disk' => 'public',
                    ]);
                }
            }

            DB::commit();

            return response()->json(['message' => 'Corporate Membership updated successfully.', 'member' => $member], 200);
        } catch (\Throwable $th) {
            DB::rollBack();
            Log::error('Error updating corporate member: ' . $th->getMessage());
            return response()->json(['error' => 'Failed to update corporate member: ' . $th->getMessage()], 500);
        }
    }

    /**
     * Delete corporate member.
     */
    public function destroy($id)
    {
        $member = CorporateMember::findOrFail($id);
        $member->delete();

        return response()->json(['message' => 'Corporate member deleted successfully.']);
    }

    /**
     * Show trashed members.
     */
    public function trashed(Request $request)
    {
        $query = CorporateMember::onlyTrashed()->whereNull('parent_id');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q
                    ->where('full_name', 'like', "%{$search}%")
                    ->orWhere('membership_no', 'like', "%{$search}%");
            });
        }

        $members = $query->orderBy('deleted_at', 'desc')->paginate(10);

        return Inertia::render('App/Admin/CorporateMembership/TrashedCorporateMembers', [
            'members' => $members,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Restore trashed member.
     */
    public function restore($id)
    {
        $member = CorporateMember::withTrashed()->findOrFail($id);
        $member->restore();

        return redirect()->back()->with('success', 'Corporate member restored successfully.');
    }

    private function formatDateForDatabase($date)
    {
        if (!$date)
            return null;
        try {
            return Carbon::createFromFormat('d-m-Y', $date)->format('Y-m-d');
        } catch (\Exception $e) {
            return $date;
        }
    }

    private function generateInvoiceNumber()
    {
        $lastInvoice = FinancialInvoice::withTrashed()
            ->orderBy('invoice_no', 'desc')
            ->whereNotNull('invoice_no')
            ->first();

        $nextNumber = 1;
        if ($lastInvoice && $lastInvoice->invoice_no) {
            $nextNumber = $lastInvoice->invoice_no + 1;
        }

        while (FinancialInvoice::withTrashed()->where('invoice_no', $nextNumber)->exists()) {
            $nextNumber++;
        }

        return $nextNumber;
    }

    /**
     * Display a listing of corporate family members (archive).
     */
    public function familyMembersIndex(Request $request)
    {
        // Query Corporate Members where parent_id is not null
        $query = CorporateMember::whereNotNull('parent_id')->with(['parent:id,membership_no,first_name,last_name', 'profilePhoto']);

        // Membership No
        if ($request->filled('membership_no')) {
            $query->where('membership_no', 'like', '%' . $request->membership_no . '%');
        }

        // Name (own name)
        if ($request->filled('name')) {
            $name = $request->name;
            $query->where(function ($q) use ($name) {
                $q
                    ->where('first_name', 'like', '%' . $name . '%')
                    ->orWhere('last_name', 'like', '%' . $name . '%')
                    ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ['%' . $name . '%']);
            });
        }

        // CNIC
        if ($request->filled('cnic')) {
            $cnic = str_replace('-', '', $request->cnic);
            $query->whereRaw("REPLACE(cnic_no, '-', '') LIKE ?", ["%{$cnic}%"]);
        }

        // Contact
        if ($request->filled('contact')) {
            $query->where('mobile_number_a', 'like', '%' . $request->contact . '%');
        }

        // Parent Name (Member Name)
        if ($request->filled('parent_name')) {
            $query->whereHas('parent', function ($q) use ($request) {
                $parentName = $request->parent_name;
                $q->where(function ($subQ) use ($parentName) {
                    $subQ
                        ->where('first_name', 'like', '%' . $parentName . '%')
                        ->orWhere('last_name', 'like', '%' . $parentName . '%')
                        ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ['%' . $parentName . '%']);
                });
            });
        }

        // Relation
        if ($request->filled('relation') && $request->relation !== 'all') {
            $query->where('relation', $request->relation);
        }

        // Card Status
        if ($request->filled('card_status') && $request->card_status !== 'all') {
            $query->where('card_status', $request->card_status);
        }

        // Status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Member Category
        if ($request->filled('member_category') && $request->member_category !== 'all') {
            $query->where('member_category_id', $request->member_category);
        }

        // Over 25 Age Checkbox
        if ($request->boolean('age_over_25')) {
            $query->whereDate('date_of_birth', '<=', Carbon::now()->subYears(25)->toDateString());
        }

        $familyGroups = $query->latest()->paginate(10)->withQueryString();

        // Add calculated age
        $familyGroups->getCollection()->transform(function ($member) {
            $member->calculated_age = $member->age ?? \Carbon\Carbon::parse($member->date_of_birth)->age;
            return $member;
        });

        // Get statistics
        $stats = [
            'total_family_members' => CorporateMember::whereNotNull('parent_id')->count(),
            'total_over_25' => CorporateMember::whereNotNull('parent_id')
                ->whereRaw('TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) >= 25')
                ->count(),
        ];

        // Use MemberCategory for filter options
        $memberCategories = \App\Models\MemberCategory::select('id', 'name')->get();

        return Inertia::render('App/Admin/CorporateMembership/FamilyMembersArchive', [
            'familyGroups' => $familyGroups,
            'memberCategories' => $memberCategories,
            'filters' => $request->all(),
            'stats' => $stats,
        ]);
    }

    /**
     * Search corporate members for autocomplete.
     */
    public function search(Request $request)
    {
        $query = $request->input('query');

        if (!$query) {
            return response()->json(['members' => []]);
        }

        $members = CorporateMember::whereNull('parent_id')
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
