<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use App\Models\Booking;
use App\Models\BookingEvents;
use App\Models\EventBooking;
use App\Models\EventBookingMenu;
use App\Models\EventBookingMenuAddOn;
use App\Models\EventBookingOtherCharges;
use App\Models\EventChargeType;
use App\Models\EventMenu;
use App\Models\EventMenuAddOn;
use App\Models\EventMenuCategory;
use App\Models\EventVenue;
use App\Models\FinancialInvoice;
use App\Models\Member;
use App\Models\Room;
use App\Models\RoomBooking;
use App\Models\RoomCategory;
use App\Models\RoomChargesType;
use App\Models\RoomMiniBar;
use App\Models\RoomType;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class EventBookingController extends Controller
{
    public function index()
    {
        $bookings = RoomBooking::with('room', 'customer', 'customer.member')->latest()->get();
        $totalBookings = RoomBooking::count();
        $totalRoomBookings = RoomBooking::count();

        $rooms = Room::latest()->get();

        $totalRooms = $rooms->count();

        // Determine unavailable rooms today
        $conflictedRooms = RoomBooking::query()
            ->whereIn('status', ['confirmed', 'pending'])
            ->where('check_in_date', '<', now()->addDay())  // today and future
            ->where('check_out_date', '>', now())  // overlapping today
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

        return Inertia::render('App/Admin/Events/Dashboard', [
            'data' => $data,
            'roomTypes' => $roomTypes
        ]);
    }

    // Create Events
    public function create()
    {
        $bookingNo = $this->getBookingId();
        $eventVenues = EventVenue::select('id', 'name')->get();
        $chargesTypeItems = EventChargeType::where('status', 'active')->select('id', 'name', 'amount')->get();
        
        // Get event menus with their items
        $eventMenus = EventMenu::where('status', 'active')
            ->with('items:id,event_menu_id,menu_category_id,name,status')
            ->select('id', 'name', 'amount', 'status')
            ->get();
            
        // Get menu category items for selection
        $menuCategoryItems = EventMenuCategory::where('status', 'active')
            ->select('id', 'name')
            ->get();
            
        // Get menu add-ons (similar to charges)
        $menuAddOnItems = EventMenuAddOn::where('status', 'active')
            ->select('id', 'name', 'amount')
            ->get();

        return Inertia::render('App/Admin/Events/CreateBooking', compact('bookingNo', 'eventVenues', 'chargesTypeItems', 'eventMenus', 'menuCategoryItems', 'menuAddOnItems'));
    }

    public function search(Request $request)
    {
        $checkin = $request->query('checkin');  // Y-m-d
        $checkout = $request->query('checkout');  // Y-m-d
        $persons = $request->query('persons');  // int

        $conflicted = RoomBooking::query()
            ->whereIn('status', ['confirmed', 'pending'])
            ->where(function ($query) use ($checkin, $checkout) {
                $query
                    ->where('check_in_date', '<', $checkout)
                    ->where('check_out_date', '>', $checkin);
            })
            ->pluck('room_id');

        $available = Room::query()
            ->whereNotIn('id', $conflicted)
            ->where('max_capacity', '>', $persons)
            ->with('roomType', 'categoryCharges', 'categoryCharges.Category')
            ->get();

        return response()->json($available);
    }

    //     public function roomsAndEvents()
    // {
    //     $rooms = Room::latest()->get()->toArray();
    //     $events = BookingEvents::latest()->get()->toArray();

    //     $roomsEvents = [
    //         'rooms' => $rooms,
    //         'events' => $events,
    //     ];

    //     return Inertia::render('App/Admin/Booking/Dashboard', [
    //         'roomsEvent' => $roomsEvents,
    //     ]);
    // }

    public function booking(Request $request)
    {
        $roomId = $request->query('room_id');

        $room = Room::with('roomType', 'categoryCharges')->find($roomId);
        $bookingNo = $this->getBookingId();

        $roomCategories = RoomCategory::where('status', 'active')->select('id', 'name')->get();
        $chargesTypeItems = RoomChargesType::where('status', 'active')->select('id', 'name', 'amount')->get();
        $miniBarItems = RoomMiniBar::where('status', 'active')->select('id', 'name', 'amount')->get();

        return Inertia::render('App/Admin/Booking/RoomBooking', compact('room', 'bookingNo', 'roomCategories', 'chargesTypeItems', 'miniBarItems'));
    }

    // Search family Members

    public function familyMembers($id)
    {
        $members = User::role('user', 'web')
            ->select(
                'users.id',
                'users.first_name',
                'users.last_name',
                'users.email',
                'users.phone_number',
                'members.family_suffix',
                'user_details.cnic_no',
                'user_details.current_address',
            )
            ->leftJoin('user_details', 'users.id', '=', 'user_details.user_id')
            ->leftJoin('members', 'users.id', '=', 'members.user_id')
            ->where('users.parent_user_id', $id)
            ->limit(10)
            ->get();

        // Format for frontend
        $results = $members->map(function ($user) use ($id) {
            $fullName = trim("{$user->first_name} {$user->last_name}");
            $parentUser = Member::where('user_id', $id)->first();
            return [
                'id' => $user->id,
                'label' => "{$fullName} ({$parentUser->membership_no}-{$user->family_suffix}) ({$user->email})",
                'membership_no' => "{$parentUser->membership_no}-{$user->family_suffix}",
                'email' => $user->email,
                'cnic' => $user->cnic_no,
                'phone' => $user->phone_number,
                'address' => $user->current_address,
            ];
        });

        return response()->json(['success' => true, 'results' => $results], 200);
    }

    // Search users
    public function searchUsers(Request $request)
    {
        $query = $request->input('query');

        $members = User::role('user', 'web')
            ->select(
                'users.id',
                'users.first_name',
                'users.last_name',
                'users.email',
                'users.phone_number',
                'members.membership_no',
                'user_details.cnic_no',
                'user_details.current_address',
            )
            ->leftJoin('members', 'users.id', '=', 'members.user_id')
            ->leftJoin('user_details', 'users.id', '=', 'user_details.user_id')
            ->whereNull('users.parent_user_id')
            ->where(function ($q) use ($query) {
                $q
                    ->where('users.first_name', 'like', "%{$query}%")
                    ->orWhere('users.last_name', 'like', "%{$query}%")
                    ->orWhereRaw("CONCAT(users.first_name, ' ', users.last_name) LIKE ?", ["%{$query}%"])
                    ->orWhere('members.membership_no', 'like', "%{$query}%")
                    ->orWhere('users.email', 'like', "%{$query}%");
            })
            ->limit(10)
            ->get();

        // Format for frontend
        $results = $members->map(function ($user) {
            $fullName = trim("{$user->first_name} {$user->last_name}");
            return [
                'id' => $user->id,
                'label' => "{$fullName} ({$user->membership_no}) ({$user->email})",
                'membership_no' => $user->membership_no,
                'email' => $user->email,
                'cnic' => $user->cnic_no,
                'phone' => $user->phone_number,
                'address' => $user->current_address,
            ];
        });

        return response()->json(['success' => true, 'results' => $results], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'guest' => 'required',
            'bookedBy' => 'required|string',
            'guestFirstName' => 'required|string', // nature_of_event
            'guestLastName' => 'required|date', // event_date
            'company' => 'required|date_format:H:i', // event_time_from
            'address' => 'required|date_format:H:i', // event_time_to
            'venue' => 'required|exists:event_venues,id',
            'selectedMenu' => 'nullable|exists:event_menus,id',
            'numberOfGuests' => 'required|integer|min:1',
            'menu_addons' => 'nullable|array',
            'other_charges' => 'nullable|array',
            'discountType' => 'required|in:fixed,percentage',
            'discount' => 'nullable|numeric|min:0',
            'grandTotal' => 'required|numeric|min:0',
        ]);

        $member_id = Auth::user()->id;
        $bookingNo = $this->getBookingId();

        DB::beginTransaction();

        try {
            // Prepare booking data
            $bookingData = [
                'booking_no' => $bookingNo,
                'event_venue_id' => $request->venue,
                'family_id' => $request->familyMember['id'] ?? null,
                'booking_date' => now()->toDateString(),
                'booking_type' => 'event',
                'booked_by' => $request->bookedBy,
                'nature_of_event' => $request->guestFirstName,
                'event_date' => $request->guestLastName,
                'event_time_from' => $request->company,
                'event_time_to' => $request->address,
                'menu_charges' => $request->menuAmount ?? 0,
                'addons_charges' => $this->calculateMenuAddOnsTotal($request->menu_addons ?? []),
                'total_per_person_charges' => ($request->menuAmount ?? 0) + $this->calculateMenuAddOnsTotal($request->menu_addons ?? []),
                'no_of_guests' => $request->numberOfGuests,
                'guest_charges' => (($request->menuAmount ?? 0) + $this->calculateMenuAddOnsTotal($request->menu_addons ?? [])) * $request->numberOfGuests,
                'total_food_charges' => (($request->menuAmount ?? 0) + $this->calculateMenuAddOnsTotal($request->menu_addons ?? [])) * $request->numberOfGuests,
                'total_other_charges' => $this->calculateOtherChargesTotal($request->other_charges ?? []),
                'total_charges' => $request->grandTotal,
                'reduction_type' => $request->discountType,
                'reduction_amount' => $request->discount ?? 0,
                'total_price' => $request->grandTotal,
                'additional_notes' => $request->notes ?? '',
                'status' => 'confirmed',
                'created_by' => $member_id,
            ];

            // ✅ Assign IDs based on booking_type (same as RoomBookingController)
            if (!empty($request->guest['booking_type']) && $request->guest['booking_type'] === 'member') {
                $bookingData['member_id'] = (int) $request->guest['id'];
            } else {
                $bookingData['customer_id'] = (int) $request->guest['id'];
            }

            // Create main event booking
            $eventBooking = EventBooking::create($bookingData);

            // Store selected menu
            if ($request->selectedMenu) {
                $selectedMenu = EventMenu::find($request->selectedMenu);
                EventBookingMenu::create([
                    'event_booking_id' => $eventBooking->id,
                    'event_menu_id' => $request->selectedMenu,
                    'name' => $selectedMenu->name,
                    'amount' => $selectedMenu->amount,
                    'items' => $request->menuItems ?? [],
                ]);
            }

            // Store menu add-ons
            if ($request->menu_addons) {
                foreach ($request->menu_addons as $addon) {
                    if (!empty($addon['type'])) {
                        EventBookingMenuAddOn::create([
                            'event_booking_id' => $eventBooking->id,
                            'type' => $addon['type'],
                            'details' => $addon['details'] ?? '',
                            'amount' => $addon['amount'] ?? 0,
                            'is_complementary' => $addon['is_complementary'] ?? false,
                        ]);
                    }
                }
            }

            // Store other charges
            if ($request->other_charges) {
                foreach ($request->other_charges as $charge) {
                    if (!empty($charge['type'])) {
                        EventBookingOtherCharges::create([
                            'event_booking_id' => $eventBooking->id,
                            'type' => $charge['type'],
                            'details' => $charge['details'] ?? '',
                            'amount' => $charge['amount'] ?? 0,
                            'is_complementary' => $charge['is_complementary'] ?? false,
                        ]);
                    }
                }
            }

            // Create financial invoice
            $invoice_no = $this->getInvoiceNo();
            $invoiceData = [
                'invoice_no' => $invoice_no,
                'invoice_type' => 'event_booking',
                'discount_type' => $request->discountType ?? null,
                'discount_value' => $request->discount ?? 0,
                'amount' => $request->grandTotal,
                'total_price' => $request->grandTotal,
                'issue_date' => now(),
                'status' => 'unpaid',
                'data' => [$eventBooking->toArray()]
            ];

            // ✅ Assign IDs based on guest type (same as RoomBookingController)
            if (!empty($request->guest['booking_type']) && $request->guest['booking_type'] === 'member') {
                $invoiceData['member_id'] = (int) $request->guest['id'];
            } else {
                $invoiceData['customer_id'] = (int) $request->guest['id'];
            }

            $invoice = FinancialInvoice::create($invoiceData);

            DB::commit();

            return response()->json([
                'message' => 'Event booking created successfully',
                'booking_no' => $bookingNo,
                'invoice_no' => $invoice->id,
                'booking_id' => $eventBooking->id
            ], 200);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Event booking creation failed: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to create event booking',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function paymentStore(Request $request)
    {
        $request->validate([
            'invoice_no' => 'required|exists:financial_invoices,invoice_no',
            'amount' => 'required|numeric',
        ]);

        DB::beginTransaction();

        $recieptPath = null;
        if ($request->payment_method == 'credit_card' && $request->has('reciept')) {
            $recieptPath = FileHelper::saveImage($request->file('reciept'), 'reciepts');
        }

        $invoice = FinancialInvoice::where('invoice_no', $request->invoice_no)->first();
        $invoice->payment_date = now();
        $invoice->paid_amount = $request->total_amount;
        $invoice->customer_charges = $request->customer_charges;
        $invoice->payment_method = $request->payment_method;
        $invoice->reciept = $recieptPath;
        $invoice->status = 'paid';
        $invoice->save();

        $subscription = Booking::find($invoice->data[0]['id']);
        $subscription->status = 'confirmed';
        $subscription->save();

        DB::commit();

        return response()->json(['success' => true, 'message' => 'Payment successful']);
    }

    // ✅ Get next booking ID
    // public function nextBookingId()
    // {
    //     return response()->json(['booking_id' => $this->getBookingId()]);
    // }

    private function getBookingId()
    {
        $booking_id = (int) EventBooking::max('booking_no');
        return $booking_id + 1;
    }

    private function getInvoiceNo()
    {
        $invoiceNo = FinancialInvoice::max('invoice_no');
        $invoiceNo = $invoiceNo + 1;
        return $invoiceNo;
    }

    /**
     * Calculate total amount for menu add-ons (excluding complementary)
     */
    private function calculateMenuAddOnsTotal($menuAddOns)
    {
        $total = 0;
        foreach ($menuAddOns as $addon) {
            if (!($addon['is_complementary'] ?? false)) {
                $total += floatval($addon['amount'] ?? 0);
            }
        }
        return $total;
    }

    /**
     * Calculate total amount for other charges (excluding complementary)
     */
    private function calculateOtherChargesTotal($otherCharges)
    {
        $total = 0;
        foreach ($otherCharges as $charge) {
            if (!($charge['is_complementary'] ?? false)) {
                $total += floatval($charge['amount'] ?? 0);
            }
        }
        return $total;
    }
}