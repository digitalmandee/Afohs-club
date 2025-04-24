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
        //
        $memberTypes = MemberType::all();

        return Inertia::render('App/Member/Dashboard', compact('memberTypes'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $request->validate([
            'name' => 'required',
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
            'name' => 'required',
        ]);

        MemberType::find($id)->update([
            'name' => $request->name,
        ]);

        return redirect()->back()->with('success', 'Member Type updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $memberType = MemberType::find($id);

        $memberType->delete();

        return redirect()->back()->with('success', 'Member Type deleted.');
    }
}
