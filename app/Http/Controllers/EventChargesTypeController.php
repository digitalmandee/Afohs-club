<?php

namespace App\Http\Controllers;

use App\Models\EventChargeType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventChargesTypeController extends Controller
{
    // List all Event charges types
    public function index()
    {
        $eventChargesData = EventChargeType::orderBy('created_at', 'desc')->get();

        return Inertia::render('App/Admin/Events/ChargesType/Index', compact('eventChargesData'));
    }

    // Store a new Event charges type
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:event_charge_types,name',
            'amount' => 'required|numeric|min:0',
            'status' => 'required|in:active,inactive', // ✅ validate status
        ]);

        $eventChargesType = EventChargeType::create([
            'name' => $request->name,
            'amount' => $request->amount,
            'status' => $request->status, // ✅ store status
        ]);

        return response()->json([
            'message' => 'Event Charges Type created successfully.',
            'data' => $eventChargesType,
        ], 201);
    }

    // Update an existing Event charges type
    public function update(Request $request, $id)
    {
        $eventChargesType = EventChargeType::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255|unique:event_charge_types,name,' . $eventChargesType->id,
            'amount' => 'required|numeric|min:0',
            'status' => 'required|in:active,inactive', // ✅ validate status
        ]);

        $eventChargesType->update([
            'name' => $request->name,
            'amount' => $request->amount,
            'status' => $request->status, // ✅ update status
        ]);

        return response()->json([
            'message' => 'Event Charges Type updated successfully.',
            'data' => $eventChargesType,
        ], 200);
    }

    // Delete a Event charges type
    public function destroy($id)
    {
        $eventChargesType = EventChargeType::findOrFail($id);
        $eventChargesType->delete();

        return response()->json(['message' => 'Event Charges Type deleted successfully.']);
    }
}
