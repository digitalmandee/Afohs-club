<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\MemberType;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\Customer;
use Illuminate\Support\Facades\Storage;

class MembersController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $limit = $request->query('limit') ?? 10;

        $users = User::with(['memberType', 'userDetail'])->latest()->paginate($limit);

        return Inertia::render('App/Member/Dashboard', compact('users'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $limit = $request->query('limit') ?? 10;

        $users = User::with(['memberType', 'userDetail'])->latest()->paginate($limit);

        $memberTypes = MemberType::all(); // get all member types

        return Inertia::render('App/Member/AddCustomer', [
            'users' => $users,
            'memberTypes' => $memberTypes,
        ]);
    }



    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:customers,email',
            'phone' => 'required|string|max:20',
            'type' => 'required|string|in:Regular,Premium,VIP',
            'address' => 'nullable|string|max:255',
            'customer_type' => 'required|string',
            'profile_pic' => 'nullable|image|max:4096', // 4MB max
            'addresses' => 'nullable|json',
        ]);

        $customer = new User();
        $customer->name = $validated['name'];
        $customer->email = $validated['email'];
        $customer->phone = $validated['phone'];
        $customer->type = $validated['type'];
        $customer->address = $validated['address'];
        $customer->customer_type = $validated['customer_type'];
        $customer->addresses = $validated['addresses'] ? json_decode($validated['addresses'], true) : [];

        if ($request->hasFile('profile_pic')) {
            $path = $request->file('profile_pic')->store('profiles', 'public');
            $customer->profile_pic = Storage::url($path);
        }

        $customer->save();

        return redirect()->back()->with('success', 'Customer added successfully!');
    }

    public function update(Request $request, $id)
    {
        $customer = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:customers,email,' . $customer->id,
            'phone' => 'required|string|max:20',
            'type' => 'required|string|in:Regular,Premium,VIP',
            'address' => 'nullable|string|max:255',
            'customer_type' => 'required|string',
            'profile_pic' => 'nullable|image|max:4096',
            'addresses' => 'nullable|json',
        ]);

        $customer->name = $validated['name'];
        $customer->email = $validated['email'];
        $customer->phone = $validated['phone'];
        $customer->type = $validated['type'];
        $customer->address = $validated['address'];
        $customer->customer_type = $validated['customer_type'];
        $customer->addresses = $validated['addresses'] ? json_decode($validated['addresses'], true) : [];

        if ($request->hasFile('profile_pic')) {
            // Delete old image if exists
            if ($customer->profile_pic) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $customer->profile_pic));
            }
            $path = $request->file('profile_pic')->store('profiles', 'public');
            $customer->profile_pic = Storage::url($path);
        }

        $customer->save();

        return redirect()->back()->with('success', 'Customer updated successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
