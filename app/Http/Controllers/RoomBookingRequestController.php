<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\RoomBookingRequest;
use App\Models\RoomCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoomBookingRequestController extends Controller
{
    public function index()
    {
        $requests = RoomBookingRequest::with(['room', 'member', 'customer', 'corporateMember'])->latest()->get();

        return Inertia::render('App/Admin/Booking/Room/Requests', [
            'requests' => $requests
        ]);
    }

    public function create()
    {
        $roomCategories = RoomCategory::where('status', 'active')
            ->select('id', 'name')
            ->get();

        $rooms = Room::with('categoryCharges')
            ->select('id', 'name', 'max_capacity')
            ->get();

        return Inertia::render('App/Admin/Booking/Request', [
            'rooms' => $rooms,
            'roomCategories' => $roomCategories,
            'request' => null,
            'mode' => 'create'
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'booking_date' => 'required|date',
            'check_in_date' => 'required|date|after_or_equal:today',
            'check_out_date' => 'required|date|after:check_in_date',
            'booking_type' => 'required|string',
            'room_id' => 'required|exists:rooms,id',
            'booking_category' => 'required|exists:room_categories,id',
            'persons' => 'required|integer|min:1',
            'security_deposit' => 'nullable|numeric',
            'per_day_charge' => 'required|numeric|min:0',
        ]);

        // Add logic for member or customer
        if (str_starts_with($validated['booking_type'], 'guest-')) {
            $request->validate(['customer_id' => 'required|exists:customers,id']);
        } elseif ($validated['booking_type'] == '2') {
            $request->validate(['corporate_member_id' => 'required|exists:corporate_members,id']);
        } else {
            $request->validate(['member_id' => 'required|exists:members,id']);
        }

        $validated['member_id'] = $request->member_id ?? null;
        $validated['customer_id'] = $request->customer_id ?? null;
        $validated['corporate_member_id'] = $request->corporate_member_id ?? null;
        $validated['status'] = 'pending';

        RoomBookingRequest::create($validated);

        return redirect()->back()->with('success', 'Booking Request created successfully!');
    }

    public function show($id)
    {
        $request = RoomBookingRequest::with(['room', 'member', 'customer', 'corporateMember'])->findOrFail($id);
        return Inertia::render('Admin/Rooms/ViewBookingRequest', [
            'request' => $request
        ]);
    }

    public function edit($id)
    {
        $roomCategories = RoomCategory::where('status', 'active')
            ->select('id', 'name')
            ->get();

        $rooms = Room::with('categoryCharges')
            ->select('id', 'name', 'max_capacity')
            ->get();

        $request = RoomBookingRequest::with(['member', 'customer', 'corporateMember'])->findOrFail($id);

        return Inertia::render('App/Admin/Booking/Request', [
            'rooms' => $rooms,
            'roomCategories' => $roomCategories,
            'request' => $request,
            'mode' => 'edit'
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'booking_date' => 'required|date',
            'check_in_date' => 'required|date',
            'check_out_date' => 'required|date|after:check_in_date',
            'persons' => 'required|integer|min:1',
            'security_deposit' => 'nullable|numeric',
            'per_day_charge' => 'required|numeric|min:0',
        ]);

        $roomRequest = RoomBookingRequest::findOrFail($id);
        // Handle guest change logic here if needed, or assume guest cannot be changed in simple update
        if (isset($validated['booking_type'])) {
            // If booking type logic needs to be updated, it should mirror store()
            // For now, assuming only details are updated, not the guest itself unless explicitly handled
        }

        $roomRequest->update($validated);

        return redirect()->route('rooms.request')->with('success', 'Booking Request updated successfully.');
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected'
        ]);

        $roomRequest = RoomBookingRequest::findOrFail($id);
        $roomRequest->status = $validated['status'];
        $roomRequest->save();

        return back()->with('success', 'Status updated successfully.');
    }
}
