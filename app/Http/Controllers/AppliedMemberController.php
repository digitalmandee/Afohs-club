<?php

namespace App\Http\Controllers;

use App\Models\AppliedMember;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\QueryException;

class AppliedMemberController extends Controller
{
    public function index(Request $request)
    {
        $members = AppliedMember::all()->map(function ($member) {
            return [
                'id' => $member->id,
                'member_id' => $member->member_id,
                'name' => $member->name,
                'email' => $member->email,
                'phone_number' => $member->phone_number,
                'address' => $member->address,
                'cnic' => $member->cnic ?? 'N/A',
                'amount_paid' => $member->amount_paid,
                'start_date' => $member->start_date,
                'end_date' => $member->end_date,
            ];
        });

        $memberData = null;
        if ($request->query('mode') === 'edit' && $request->query('id')) {
            $member = AppliedMember::findOrFail($request->query('id'));
            $memberData = [
                'id' => $member->id,
                'member_id' => $member->member_id,
                'name' => $member->name,
                'email' => $member->email,
                'phone_number' => $member->phone_number,
                'address' => $member->address,
                'cnic' => $member->cnic,
                'amount_paid' => $member->amount_paid,
                'start_date' => $member->start_date,
                'end_date' => $member->end_date,
            ];
        }

        return Inertia::render('App/Admin/Membership/AppliedMember', [
            'familyGroups' => $members,
            'memberData' => $memberData,
            'mode' => $request->query('mode', 'list'),
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'member_id' => 'nullable|integer|exists:users,id|unique:applied_member,member_id',
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:applied_member,email|max:255',
                'phone_number' => 'required|string|regex:/^[0-9]{11}$/',
                'address' => 'nullable|string|max:500',
                'cnic' => 'required|string|regex:/^[0-9]{13}$/|unique:applied_member,cnic',
                'amount_paid' => 'required|numeric|min:0',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
            ], [
                'member_id.unique' => 'The member ID is already in use.',
                'email.unique' => 'The email address is already in use.',
                'phone_number.regex' => 'The phone number must be exactly 11 digits.',
                'cnic.required' => 'The CNIC is required.',
                'cnic.regex' => 'The CNIC must be exactly 13 digits.',
                'cnic.unique' => 'The CNIC is already in use.',
                'end_date.after_or_equal' => 'The end date must be on or after the start date.',
            ]);

            if ($validator->fails()) {
                Log::warning('Validation failed for applied member creation', ['errors' => $validator->errors(), 'request' => $request->all()]);
                return response()->json(['errors' => $validator->errors()], 422);
            }

            AppliedMember::create([
                'member_id' => $request->member_id ?: null,
                'name' => $request->name,
                'email' => $request->email,
                'phone_number' => $request->phone_number,
                'address' => $request->address ?: null,
                'cnic' => $request->cnic,
                'amount_paid' => (float) $request->amount_paid,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
            ]);

            return response()->json(['message' => 'Applied member created successfully.'], 200);
        } catch (QueryException $e) {
            Log::error('Database error creating applied member: ' . $e->getMessage(), ['request' => $request->all()]);
            return response()->json(['error' => 'Database error: ' . $e->getMessage()], 500);
        } catch (\Throwable $th) {
            Log::error('Unexpected error creating applied member: ' . $th->getMessage(), ['request' => $request->all()]);
            return response()->json(['error' => 'Failed to create applied member: ' . $th->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'member_id' => 'nullable|integer|exists:users,id|unique:applied_member,member_id,' . $id, 
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:applied_member,email,' . $id . '|max:255',
                'phone_number' => 'required|string|regex:/^[0-9]{11}$/',
                'address' => 'nullable|string|max:500',
                'cnic' => 'required|string|regex:/^[0-9]{13}$/|unique:applied_member,cnic,' . $id,
                'amount_paid' => 'required|numeric|min:0',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
            ], [
                'member_id.unique' => 'The member ID is already in use.',
                'email.unique' => 'The email address is already in use.',
                'phone_number.regex' => 'The phone number must be exactly 11 digits.',
                'cnic.required' => 'The CNIC is required.',
                'cnic.regex' => 'The CNIC must be exactly 13 digits.',
                'cnic.unique' => 'The CNIC is already in use.',
                'end_date.after_or_equal' => 'The end date must be on or after the start date.',
            ]);

            if ($validator->fails()) {
                Log::warning('Validation failed for applied member update', ['errors' => $validator->errors(), 'id' => $id, 'request' => $request->all()]);
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $member = AppliedMember::findOrFail($id);
            $member->update([
                'member_id' => $request->member_id ?: null,
                'name' => $request->name,
                'email' => $request->email,
                'phone_number' => $request->phone_number,
                'address' => $request->address ?: null,
                'cnic' => $request->cnic,
                'amount_paid' => (float) $request->amount_paid,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
            ]);

            return response()->json(['message' => 'Applied member updated successfully.'], 200);
        } catch (QueryException $e) {
            Log::error('Database error updating applied member: ' . $e->getMessage(), ['id' => $id, 'request' => $request->all()]);
            return response()->json(['error' => 'Database error: ' . $e->getMessage()], 500);
        } catch (\Throwable $th) {
            Log::error('Unexpected error updating applied member: ' . $th->getMessage(), ['id' => $id, 'request' => $request->all()]);
            return response()->json(['error' => 'Failed to update applied member: ' . $th->getMessage()], 500);
        }
    }
}
