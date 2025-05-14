<?php

namespace App\Http\Controllers;

use App\Models\UserDetail;
use App\Models\FamilyMember; // Assuming a FamilyMember model exists
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class MembershipController extends Controller
{
    public function index()
    {
        return Inertia::render('App/Admin/Membership/Dashboard');
    }

    public function create()
    {
        return Inertia::render('App/Admin/Membership/Dashboard');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'coa_account' => 'nullable|string|max:255',
            'title' => 'nullable|string|in:Mr,Mrs,Ms,dr,Female,Other',
            'first_name' => 'nullable|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'application_number' => 'nullable|string|max:255',
            'name_comments' => 'nullable|string',
            'guardian_name' => 'nullable|string|max:255',
            'guardian_membership' => 'nullable|string|max:255',
            'nationality' => 'nullable|string|max:255',
            'cnic_no' => 'required|string|size:13',
            'passport_no' => 'required|string|max:255',
            'gender' => 'required|string|in:Male,Female,Other',
            'ntn' => 'nullable|string|max:255',
            'date_of_birth' => 'required|date',
            'education' => 'nullable|array',
            'membership_reason' => 'nullable|string',
            'mobile_number_a' => 'required|string|max:255',
            'mobile_number_b' => 'nullable|string|max:255',
            'mobile_number_c' => 'nullable|string|max:255',
            'telephone_number' => 'nullable|string|max:255',
            'personal_email' => 'required|email|max:255',
            'critical_email' => 'nullable|email|max:255',
            'emergency_name' => 'nullable|string|max:255',
            'emergency_relation' => 'nullable|string|max:255',
            'emergency_contact' => 'nullable|string|max:255',
            'current_address' => 'required|string',
            'current_city' => 'nullable|string|max:255',
            'current_country' => 'nullable|string|max:255',
            'permanent_address' => 'nullable|string',
            'permanent_city' => 'nullable|string|max:255',
            'permanent_country' => 'nullable|string|max:255',
            'member_type' => 'string|max:255',
            'membership_category' => 'nullable|string|max:255',
            'membership_number' => 'string|max:255',
            'membership_date' => 'date',
            'card_status' => 'nullable|string|in:Active,Inactive',
            'card_issue_date' => 'nullable|date',
            'card_expiry_date' => 'nullable|date',
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date',
            'family_members' => 'nullable|array',
            'family_members.*.full_name' => 'required|string|max:255',
            'family_members.*.relation' => 'required|string|max:255',
            'family_members.*.cnic' => 'nullable|string|max:255',
            'family_members.*.phone_number' => 'nullable|string|max:255',
            'family_members.*.membership_type' => 'nullable|string|max:255',
            'family_members.*.membership_category' => 'nullable|string|max:255',
            'family_members.*.start_date' => 'nullable|date',
            'family_members.*.end_date' => 'nullable|date',
            'family_members.*.picture' => 'nullable|string', // Base64 image
            'member_image' => 'nullable|string', // Base64 image
        ]);

        // Handle member_image (base64 to file storage)
        $memberImagePath = null;
        if ($request->filled('member_image')) {
            $base64Image = $request->input('member_image');
            // Remove data URI prefix (e.g., "data:image/jpeg;base64,")
            $base64Image = preg_replace('/^data:image\/(png|jpg|jpeg);base64,/', '', $base64Image);
            $imageData = base64_decode($base64Image);
            $filename = 'member_images/' . Str::uuid() . '.jpg';
            Storage::disk('public')->put($filename, $imageData);
            $memberImagePath = $filename;
        }

        // Create UserDetail record
        $userDetail = UserDetail::create([
            'user_id' => Auth::id(),
            // 'user_id' => 8,
            'state' => 'Punjab', // <-- Add this!
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
            'country' => $validated['current_country'], // Added to map current_country to country
            'member_type' => $validated['member_type'],
            'membership_category' => $validated['membership_category'],
            'membership_number' => $validated['membership_number'],
            'membership_date' => $validated['membership_date'],
            'card_status' => $validated['card_status'],
            'card_issue_date' => $validated['card_issue_date'],
            'card_expiry_date' => $validated['card_expiry_date'],
            'from_date' => $validated['from_date'],
            'to_date' => $validated['to_date'],
            'member_image' => $memberImagePath,
        ]);

        // // Handle family members
        // if (!empty($validated['family_members'])) {
        //     foreach ($validated['family_members'] as $familyMemberData) {
        //         $familyMemberImagePath = null;
        //         if (!empty($familyMemberData['picture'])) {
        //             $base64Image = preg_replace('/^data:image\/(png|jpg|jpeg);base64,/', '', $familyMemberData['picture']);
        //             $imageData = base64_decode($base64Image);
        //             $filename = 'family_member_images/' . Str::uuid() . '.jpg';
        //             Storage::disk('public')->put($filename, $imageData);
        //             $familyMemberImagePath = $filename;
        //         }

        //         FamilyMember::create([
        //             'user_detail_id' => $userDetail->id,
        //             'full_name' => $familyMemberData['full_name'],
        //             'relation' => $familyMemberData['relation'],
        //             'cnic' => $familyMemberData['cnic'],
        //             'phone_number' => $familyMemberData['phone_number'],
        //             'membership_type' => $familyMemberData['membership_type'],
        //             'membership_category' => $familyMemberData['membership_category'],
        //             'start_date' => $familyMemberData['start_date'],
        //             'end_date' => $familyMemberData['end_date'],
        //             'picture' => $familyMemberImagePath,
        //         ]);
        //     }
        // }

        return redirect()->back()->with('success', 'Membership details submitted successfully.');
    }
}
