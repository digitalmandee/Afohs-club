<?php

namespace App\Http\Controllers;

use App\Models\TransactionType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $types = TransactionType::orderBy('id', 'desc')->paginate(10);
        return Inertia::render('App/Admin/Membership/TransactionTypes/Index', [
            'types' => $types
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('App/Admin/Membership/TransactionTypes/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'default_amount' => 'nullable|numeric|min:0',
            'is_fixed' => 'boolean',
            'status' => 'required|in:active,inactive',
        ]);

        TransactionType::create($validated);

        return redirect()->route('finance.charge-types.index')->with('success', 'Charge Type created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $transactionType = TransactionType::findOrFail($id);
        return Inertia::render('App/Admin/Membership/TransactionTypes/Create', [
            'item' => $transactionType
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $transactionType = TransactionType::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'default_amount' => 'nullable|numeric|min:0',
            'is_fixed' => 'boolean',
            'status' => 'required|in:active,inactive',
        ]);

        $transactionType->update($validated);

        return redirect()->route('finance.charge-types.index')->with('success', 'Charge Type updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $transactionType = TransactionType::findOrFail($id);
        if ($transactionType->is_system) {
            return back()->with('error', 'System types cannot be deleted.');
        }

        $transactionType->delete();

        return back()->with('success', 'Charge Type deleted successfully.');
    }
}
