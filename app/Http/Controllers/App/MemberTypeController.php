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
        return Inertia::render('App/Member/MemberTypes', compact('memberTypesList'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:member_types,name',
        ]);

        MemberType::create([
            'name' => $request->name,
        ]);

        return redirect()->back()->with('success', 'Member Type created.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:member_types,name,' . $id,
        ]);

        $memberType = MemberType::findOrFail($id);
        $memberType->update([
            'name' => $request->name,
        ]);

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
