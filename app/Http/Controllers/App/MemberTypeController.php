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
        $memberTypesList = MemberType::all();
        return Inertia::render('App/Admin/Membership/MemberType', compact('memberTypesList'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:member_types,name',
            'duration' => 'nullable|string|max:255',
            'fee' => 'nullable|numeric',
            'maintenance_fee' => 'nullable|numeric',
            'discount' => 'nullable|numeric',
            'discount_authorized' => 'nullable|numeric',
            'benefit' => 'nullable|string|max:1000',
        ]);

        MemberType::create($request->only([
            'name',
            'duration',
            'fee',
            'maintenance_fee',
            'discount',
            'discount_authorized',
            'benefit',
        ]));

        return redirect()->back()->with('success', 'Member Type created.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:member_types,name,' . $id,
            'duration' => 'nullable|string|max:255',
            'fee' => 'nullable|numeric',
            'maintenance_fee' => 'nullable|numeric',
            'discount' => 'nullable|numeric',
            'discount_authorized' => 'nullable|boolean',
            'benefit' => 'nullable|string|max:1000',
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
