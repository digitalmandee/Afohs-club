<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\MemberType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MemberTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $memberTypesData = MemberType::all();

        return Inertia::render('App/Admin/Membership/MemberType', compact('memberTypesData'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:member_types,name',
            'duration' => 'required|integer', // In months
            'fee' => 'required|numeric',
            'maintenance_fee' => 'required|numeric',
            'discount' => 'nullable|numeric',
            'discount_authorized' => 'required|string|max:255',
            'benefit' => 'required|array', // Validate as array
        ]);

        $data = $request->only([
            'name',
            'duration',
            'fee',
            'maintenance_fee',
            'discount',
            'discount_authorized',
            'benefit',
        ]);

        MemberType::create($data);

        return redirect()->back()->with('success', 'Member Type created.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:member_types,name,' . $id,
            'duration' => 'nullable|integer|max:255',
            'fee' => 'nullable|numeric',
            'maintenance_fee' => 'nullable|numeric',
            'discount' => 'nullable|numeric',
            'discount_authorized' => 'nullable|string|max:255',
            'benefit' => 'nullable|array',
        ]);

        $memberType = MemberType::findOrFail($id);
        $memberType->update($request->only([
            'name',
            'duration',
            'fee',
            'maintenance_fee',
            'discount',
            'discount_authorized',
            'benefit',
        ]));

        return redirect()->back()->with('success', 'Member Type updated.');
    }

    public function edit(string $member_type)
    {
        $memberType = MemberType::findOrFail($member_type);
        return Inertia::render('App/Admin/Membership/EditMember', [
            'memberType' => [
                'id' => $memberType->id,
                'name' => $memberType->name,
                'duration' => $memberType->duration ? (int)$memberType->duration : '',
                'fee' => $memberType->fee ? (string)$memberType->fee : '',
                'maintenance_fee' => $memberType->maintenance_fee ? (string)$memberType->maintenance_fee : '',
                'discount' => $memberType->discount ? (string)$memberType->discount : '',
                'discount_authorized' => $memberType->discount_authorized ?? '',
                'benefit' => $memberType->benefit ? implode(', ', $memberType->benefit) : '',
            ],
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $memberType = MemberType::findOrFail($id);
        $memberType->delete();

        return redirect()->back()->with('success', 'Member Type deleted.');
    }
}