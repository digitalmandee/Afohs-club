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
            'member:id,user_id,membership_no,full_name'
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
                    });
            });
        }

        // ✅ Paginate results and keep query string
        $bookings = $query->paginate(10)->withQueryString();

        // ✅ Get booking IDs for current page
        $bookingIds = $bookings->pluck('id');

        // ✅ Fetch invoices linked to these bookings
        $invoiceData = FinancialInvoice::where('invoice_type', 'room_booking')
            ->where(function ($q) use ($bookingIds) {
                $q->whereJsonContains('data->*.booking_id', $bookingIds);
            })
            ->select('id', 'status', 'data')
            ->get();

        // ✅ Map invoices by booking_id
        $invoiceMap = [];
        foreach ($invoiceData as $invoice) {
            foreach ($invoice->data as $entry) {
                if (!empty($entry['booking_id'])) {
                    $invoiceMap[$entry['booking_id']] = [
                        'id' => $invoice->id,
                        'status' => $invoice->status,
                    ];
                }
            }
        }

        // ✅ Attach invoices to bookings
        $bookings->getCollection()->transform(function ($booking) use ($invoiceMap) {
            $booking->invoice = $invoiceMap[$booking->id] ?? null;
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
            'member'
        ])->findOrFail($id);

        // ✅ Find invoice linked to this booking
        $invoice = FinancialInvoice::where('invoice_type', 'room_booking')
            ->whereJsonContains('data->*.booking_id', $id)
            ->select('id', 'status', 'data')
            ->first();

        $booking->invoice = $invoice ? [
            'id' => $invoice->id,
            'status' => $invoice->status,
        ] : null;

        return response()->json(['success' => true, 'booking' => $booking]);
    }

    public function dashboard()
    {
        // Step 1: Get the latest bookings
        $bookings = RoomBooking::with('room:id,name,room_type_id',
                'customer:id,customer_no,email,name',
                'member:id,user_id,membership_no,full_name')
            ->latest()
            ->take(6)
            ->get();

        // Extract booking IDs
        $bookingIds = $bookings->pluck('id')->toArray();

        // Step 2: Fetch only invoices linked to these bookings
        $invoices = FinancialInvoice::where('invoice_type', 'room_booking')
            ->where(function ($q) use ($bookingIds) {
                foreach ($bookingIds as $id) {
                    // Check if JSON column contains booking_id
                    $q->orWhereJsonContains('data->*.booking_id', $id);
                }
            })
            ->get();

        // Step 3: Build bookingId => invoice mapping
        $bookingInvoiceMap = [];

        foreach ($invoices as $invoice) {
            foreach ($invoice->data as $entry) {
                if (!empty($entry['booking_id']) && in_array($entry['booking_id'], $bookingIds)) {
                    $bookingInvoiceMap[$entry['booking_id']] = [
                        'id' => $invoice->id,
                        'status' => $invoice->status,
                    ];
                }
            }
        }

        // Step 4: Attach invoice data to bookings
        $bookings->transform(function ($booking) use ($bookingInvoiceMap) {
            $booking->invoice = $bookingInvoiceMap[$booking->id] ?? null;
            return $booking;
        });

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
            'bookingsData' => $bookings,
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
    public function checkInIndex()
    {
        $query = RoomBooking::with([
            'room:id,name,room_type_id',
            'customer:id,customer_no,email,name',
            'member:id,user_id,membership_no,full_name'
        ])
            ->where('status', 'confirmed')
            ->orderBy('booking_date', 'desc')
            ->latest();
        $bookings = $query->paginate(10)->withQueryString();

        return Inertia::render('App/Admin/Booking/Room/CheckIn', [
            'bookings' => $bookings,
        ]);
    }

    // CheckOut Rooms
    public function checkOutIndex()
    {
        $query = RoomBooking::with([
            'room:id,name,room_type_id',
            'customer:id,customer_no,email,name',
            'member:id,user_id,membership_no,full_name'
        ])
            ->where('status', 'checked_in')
            ->orderBy('booking_date', 'desc')
            ->latest();

        $bookings = $query->paginate(10)->withQueryString();

        return Inertia::render('App/Admin/Booking/Room/CheckOut', [
            'bookings' => $bookings,
        ]);
    }
}
