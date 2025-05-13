<?php

namespace App\Http\Controllers;

use App\Models\UserDetail;
use Illuminate\Http\Request;

class MembershipController extends Controller
{
    // Show form to create user detail
    public function create()
    {
        return view('membership.create');
    }

    // Store submitted form data
    public function store(Request $request)
    {
        $validated = $request->validate([
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
        ]);

        // Store the data
        UserDetail::create([
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
        ]);

        return redirect()->back()->with('success', 'Membership details submitted successfully.');
    }
}
