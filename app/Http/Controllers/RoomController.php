<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use App\Models\Booking;
use App\Models\BookingEvents;
use App\Models\EventLocation;
use App\Models\FinancialInvoice;
use App\Models\Room;
use App\Models\RoomBooking;
use App\Models\RoomBookingRequest;
use App\Models\RoomCategory;
use App\Models\RoomCategoryCharge;
use App\Models\RoomType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoomController extends Controller
{
    public function index(Request $request)
    {
        // ✅ Collect filters
        $filters = $request->only(['room_type', 'booking_status', 'start_date', 'end_date', 'search']);

        // ✅ Base query with relations
        $query = RoomBooking::with([
            'room:id,name,room_type_id',
            'customer:id,customer_no,email,name',
            'member:id,membership_no,full_name',
            'corporateMember:id,membership_no,full_name'
        ])->latest();

        // ✅ Apply Room Type filter
        if (!empty($filters['room_type'])) {
            $query->whereHas('room', function ($q) use ($filters) {
                $q->where('room_type_id', $filters['room_type']);
            });
        }

        // ✅ Apply Booking Status filter
        if (!empty($filters['booking_status'])) {
            $query->where('status', $filters['booking_status']);
        }

        // ✅ Apply Date Range filter
        if (!empty($filters['start_date']) && !empty($filters['end_date'])) {
            $query->whereBetween('booking_date', [$filters['start_date'], $filters['end_date']]);
            // Replace `booking_date` with actual column name if different
        }

        // ✅ Apply search filter
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q
                    ->whereHas('room', function ($sub) use ($search) {
                        $sub->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('customer', function ($sub) use ($search) {
                        $sub
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('customer_no', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('member', function ($sub) use ($search) {
                        $sub
                            ->where('full_name', 'like', "%{$search}%")
                            ->orWhere('membership_no', 'like', "%{$search}%");
                    })
                    ->orWhereHas('corporateMember', function ($sub) use ($search) {
                        $sub
                            ->where('full_name', 'like', "%{$search}%")
                            ->orWhere('membership_no', 'like', "%{$search}%");
                    });
            });
        }

        // ✅ Eager load invoice with polymorphic relationship
        $query->with('invoice:id,invoiceable_id,invoiceable_type,status');

        // ✅ Paginate results and keep query string
        $bookings = $query->paginate(10)->withQueryString();

        // ✅ Transform invoice data for frontend
        $bookings->getCollection()->transform(function ($booking) {
            $booking->invoice = $booking->invoice ? [
                'id' => $booking->invoice->id,
                'status' => $booking->invoice->status,
            ] : null;
            return $booking;
        });

        // ✅ Return Inertia page with data
        return Inertia::render('App/Admin/Booking/RoomManage', [
            'bookings' => $bookings,
            'filters' => $filters,  // ✅ Pass filters to front-end
            'roomTypes' => RoomType::select('id', 'name')->get(),  // ✅ Pass room types dynamically
        ]);
    }

    public function bookingInvoice($id)
    {
        // ✅ Fetch the booking with relations
        $booking = RoomBooking::with([
            'room',
            'customer',
            'member',
            'corporateMember',
            'invoice:id,invoiceable_id,invoiceable_type,status'
        ])->findOrFail($id);

        // ✅ Get invoice using polymorphic relationship
        $invoice = $booking->invoice;

        $booking->invoice = $invoice ? [
            'id' => $invoice->id,
            'status' => $invoice->status,
        ] : null;

        return response()->json(['success' => true, 'booking' => $booking]);
    }

    public function dashboard()
    {
        // Other stats
        $totalBookings = RoomBooking::count();
        $totalRoomBookings = RoomBooking::count();

        $rooms = Room::latest()->get();
        $totalRooms = $rooms->count();

        $conflictedRooms = RoomBooking::query()
            ->whereIn('status', ['confirmed', 'pending'])
            ->where('check_in_date', '<', now()->addDay())
            ->where('check_out_date', '>', now())
            ->pluck('room_id')
            ->unique();

        $availableRoomsToday = Room::query()
            ->whereNotIn('id', $conflictedRooms)
            ->count();

        $data = [
            'rooms' => $rooms,
            'totalRooms' => $totalRooms,
            'availableRoomsToday' => $availableRoomsToday,
            'totalBookings' => $totalBookings,
            'totalRoomBookings' => $totalRoomBookings,
        ];

        $roomTypes = RoomType::where('status', 'active')->select('id', 'name')->get();

        return Inertia::render('App/Admin/Booking/Dashboard', [
            'data' => $data,
            'roomTypes' => $roomTypes
        ]);
    }

    public function allRooms()
    {
        $rooms = Room::latest()->get();

        return Inertia::render('App/Admin/Booking/AllRooms', [
            'rooms' => $rooms,
        ]);
    }

    // Show form + existing room data
    public function create()
    {
        $roomTypes = RoomType::where('status', 'active')->select('id', 'name')->get();
        $categories = RoomCategory::where('status', 'active')->select('id', 'name')->get();
        $locations = EventLocation::all();

        return Inertia::render('App/Admin/Booking/AddRoom', [
            'roomTypes' => $roomTypes,
            'locations' => $locations,
            'categories' => $categories
        ]);
    }

    // Store new room
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'number_of_beds' => 'required|integer',
            'max_capacity' => 'required|integer',
            'room_type_id' => 'required|exists:room_types,id',
            'number_of_bathrooms' => 'required|integer',
            'photo' => 'nullable|image|max:4096',
            'category_charges' => 'nullable|array',
            'category_charges.*.id' => 'required|exists:room_categories,id',
            'category_charges.*.amount' => 'nullable|numeric|min:0',
        ]);

        $request->validate([]);

        $path = null;
        if ($request->hasFile('photo')) {
            $path = FileHelper::saveImage($request->file('photo'), 'booking_rooms');
        }

        $room = Room::create([
            'name' => $request->name,
            'room_type_id' => $request->room_type_id,
            'number_of_beds' => $request->number_of_beds,
            'max_capacity' => $request->max_capacity,
            'number_of_bathrooms' => $request->number_of_bathrooms,
            'photo_path' => $path,
        ]);

        // Save category charges
        foreach ($request->category_charges as $charge) {
            if (!empty($charge['amount'])) {
                RoomCategoryCharge::updateOrCreate(
                    [
                        'room_id' => $room->id,
                        'room_category_id' => $charge['id']
                    ],
                    [
                        'amount' => $charge['amount']
                    ]
                );
            }
        }

        return redirect()->route('rooms.add')->with('success', 'Room added successfully.');
    }

    // Show edit form for a room
    public function edit($id)
    {
        $room = Room::with('categoryCharges')->findOrFail($id);
        $roomTypes = RoomType::where('status', 'active')->select('id', 'name')->get();
        $categories = RoomCategory::where('status', 'active')->select('id', 'name')->get();
        $locations = EventLocation::all();

        return Inertia::render('App/Admin/Booking/AddRoom', [
            'roomTypes' => $roomTypes,
            'locations' => $locations,
            'categories' => $categories,
            'room' => $room,
        ]);
    }

    // Update a room
    public function update(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'number_of_beds' => 'required|integer',
            'max_capacity' => 'required|integer',
            'room_type_id' => 'required|exists:room_types,id',
            'number_of_bathrooms' => 'required|integer',
            'photo' => 'nullable|image|max:4096',
            'category_charges' => 'nullable|array',
            'category_charges.*.id' => 'required|exists:room_categories,id',
            'category_charges.*.amount' => 'nullable|numeric|min:0',
        ]);

        $room = Room::findOrFail($request->id);

        $path = $room->photo_path;
        if ($request->hasFile('photo')) {
            $path = FileHelper::saveImage($request->file('photo'), 'booking_rooms');
        }

        $room->update([
            'name' => $request->name,
            'room_type_id' => $request->room_type_id,
            'number_of_beds' => $request->number_of_beds,
            'max_capacity' => $request->max_capacity,
            'number_of_bathrooms' => $request->number_of_bathrooms,
            'photo_path' => $path,
        ]);

        // Save category charges
        foreach ($request->category_charges as $charge) {
            if (!empty($charge['amount'])) {
                RoomCategoryCharge::updateOrCreate(
                    [
                        'room_id' => $room->id,
                        'room_category_id' => $charge['id']
                    ],
                    [
                        'amount' => $charge['amount']
                    ]
                );
            }
        }

        return redirect()->route('rooms.all')->with('success', 'Room updated successfully.');
    }

    // Delete a room
    public function destroy($id)
    {
        $room = Room::findOrFail($id);

        // Delete the photo if it exists
        // if ($room->photo_path) {
        //     FileHelper::deleteImage($room->photo_path);
        // }

        $room->delete();

        return redirect()->route('rooms.all')->with('success', 'Room deleted successfully.');
    }

    // CheckIn Rooms
    public function checkInIndex(Request $request)
    {
        $search = $request->input('search', '');
        $startDate = $request->input('start_date', '');
        $endDate = $request->input('end_date', '');

        $query = RoomBooking::with([
            'room:id,name',
            'customer:id,customer_no,email,name',
            'member:id,membership_no,full_name',
            'corporateMember:id,membership_no,full_name'
        ])
            ->where('status', 'checked_in');

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q
                    ->where('id', 'like', "%{$search}%")
                    ->orWhereHas('member', function ($q) use ($search) {
                        $q
                            ->where('full_name', 'like', "%{$search}%")
                            ->orWhere('membership_no', 'like', "%{$search}%");
                    })
                    ->orWhereHas('corporateMember', function ($q) use ($search) {
                        $q
                            ->where('full_name', 'like', "%{$search}%")
                            ->orWhere('membership_no', 'like', "%{$search}%");
                    })
                    ->orWhereHas('customer', function ($q) use ($search) {
                        $q
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('customer_no', 'like', "%{$search}%");
                    })
                    ->orWhereHas('room', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Apply date range filter (check_in_date and check_out_date)
        if ($startDate && $endDate) {
            $query->where(function ($q) use ($startDate, $endDate) {
                $q
                    ->whereBetween('check_in_date', [$startDate, $endDate])
                    ->orWhereBetween('check_out_date', [$startDate, $endDate])
                    ->orWhere(function ($q) use ($startDate, $endDate) {
                        // Bookings that span the date range
                        $q
                            ->where('check_in_date', '<=', $startDate)
                            ->where('check_out_date', '>=', $endDate);
                    });
            });
        } elseif ($startDate) {
            $query->where('check_out_date', '>=', $startDate);
        } elseif ($endDate) {
            $query->where('check_in_date', '<=', $endDate);
        }

        $bookings = $query
            ->orderBy('check_in_date', 'desc')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('App/Admin/Booking/Room/CheckIn', [
            'bookings' => $bookings,
            'filters' => [
                'search' => $search,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    // CheckOut Rooms
    public function checkOutIndex(Request $request)
    {
        $search = $request->input('search', '');
        $startDate = $request->input('start_date', '');
        $endDate = $request->input('end_date', '');

        $query = RoomBooking::with([
            'room:id,name,room_type_id',
            'customer:id,customer_no,email,name',
            'member:id,membership_no,full_name',
            'corporateMember:id,membership_no,full_name'
        ])
            ->where('status', 'checked_out');

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q
                    ->where('id', 'like', "%{$search}%")
                    ->orWhereHas('member', function ($q) use ($search) {
                        $q
                            ->where('full_name', 'like', "%{$search}%")
                            ->orWhere('membership_no', 'like', "%{$search}%");
                    })
                    ->orWhereHas('corporateMember', function ($q) use ($search) {
                        $q
                            ->where('full_name', 'like', "%{$search}%")
                            ->orWhere('membership_no', 'like', "%{$search}%");
                    })
                    ->orWhereHas('customer', function ($q) use ($search) {
                        $q
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('customer_no', 'like', "%{$search}%");
                    })
                    ->orWhereHas('room', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Apply date range filter (check_in_date and check_out_date)
        if ($startDate && $endDate) {
            $query->where(function ($q) use ($startDate, $endDate) {
                $q
                    ->whereBetween('check_in_date', [$startDate, $endDate])
                    ->orWhereBetween('check_out_date', [$startDate, $endDate])
                    ->orWhere(function ($q) use ($startDate, $endDate) {
                        // Bookings that span the date range
                        $q
                            ->where('check_in_date', '<=', $startDate)
                            ->where('check_out_date', '>=', $endDate);
                    });
            });
        } elseif ($startDate) {
            $query->where('check_out_date', '>=', $startDate);
        } elseif ($endDate) {
            $query->where('check_in_date', '<=', $endDate);
        }

        $bookings = $query
            ->orderBy('check_out_date', 'desc')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('App/Admin/Booking/Room/CheckOut', [
            'bookings' => $bookings,
            'filters' => [
                'search' => $search,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    /**
     * Update room booking status
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string',
            'cancellation_reason' => 'nullable|string',
        ]);

        $booking = RoomBooking::findOrFail($id);

        $booking->status = $request->status;

        if ($request->has('cancellation_reason')) {
            $booking->cancellation_reason = $request->cancellation_reason;
        }

        $booking->save();

        return response()->json([
            'message' => 'Booking status updated successfully',
            'booking' => $booking
        ]);
    }
}
