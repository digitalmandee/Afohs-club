<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\AddressType;
use App\Models\MemberType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AddressTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        $addressTypes = AddressType::all();

        return Inertia::render('App/Member/Dashboard', compact('addressTypes'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $request->validate([
            'name' => 'required',
        ]);

        AddressType::create([
            'name' => $request->name,
        ]);

        return redirect()->back()->with('success', 'Address Type created.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'name' => 'required',
        ]);

        AddressType::find($id)->update([
            'name' => $request->name,
        ]);

        return redirect()->back()->with('success', 'Address Type updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $addressType = AddressType::find($id);

        $addressType->delete();

        return redirect()->back()->with('success', 'Address Type deleted.');
    }
}
