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
        $requests = RoomBookingRequest::with(['room', 'member', 'customer'])->latest()->get();

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

        // Prevent duplicate booking request for overlapping dates and same room
        $exists = RoomBookingRequest::where('room_id', $validated['room_id'])
            ->where(function($query) use ($validated) {
                $query->whereBetween('check_in_date', [$validated['check_in_date'], $validated['check_out_date']])
                      ->orWhereBetween('check_out_date', [$validated['check_in_date'], $validated['check_out_date']])
                      ->orWhere(function($q) use ($validated) {
                          $q->where('check_in_date', '<=', $validated['check_in_date'])
                            ->where('check_out_date', '>=', $validated['check_out_date']);
                      });
            })
            ->whereIn('status', ['pending', 'approved'])
            ->exists();

        if ($exists) {
            return back()->withErrors(['check_in_date' => 'A booking request for these dates and room already exists or overlaps with existing booking.'])->withInput();
        }

        // Add logic for member or customer
        if (str_starts_with($validated['booking_type'], 'guest-')) {
            $request->validate(['customer_id' => 'required|exists:customers,id']);
        } else {
            $request->validate(['member_id' => 'required|exists:members,id']);
        }

        $validated['member_id'] = $request->member_id ?? null;
        $validated['customer_id'] = $request->customer_id ?? null;
        $validated['status'] = 'pending';

        RoomBookingRequest::create($validated);

        return redirect()->back()->with('success', 'Booking Request created successfully!');
    }

    public function show($id)
    {
        $request = RoomBookingRequest::with(['room', 'member', 'customer'])->findOrFail($id);
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

        $request = RoomBookingRequest::with(['member', 'customer'])->findOrFail($id);

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
