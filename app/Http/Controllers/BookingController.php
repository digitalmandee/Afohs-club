<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use App\Models\Booking;
use App\Models\BookingEvents;
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

class BookingController extends Controller
{
    public function index()
    {
        // Step 1: Build bookingId => invoice mapping
        $invoices = FinancialInvoice::where('invoice_type', 'room_booking')->get();

        $bookingInvoiceMap = [];

        foreach ($invoices as $invoice) {
            foreach ($invoice->data as $entry) {
                if (!empty($entry['booking_id'])) {
                    $bookingInvoiceMap[$entry['booking_id']] = [
                        'id' => $invoice->id,
                        'status' => $invoice->status,
                    ];
                }
            }
        }

        // Step 2: Get all RoomBookings
        $bookings = RoomBooking::with('room', 'customer', 'customer.member')->latest()->get();

        // Step 3: Attach invoice data to each booking
        $bookings->transform(function ($booking) use ($bookingInvoiceMap) {
            $invoice = $bookingInvoiceMap[$booking->id] ?? null;
            $booking->invoice = $invoice;
            return $booking;
        });

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

        return Inertia::render('App/Admin/Booking/Dashboard', [
            'data' => $data,
            'roomTypes' => $roomTypes
        ]);
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
            ->where('max_capacity', '>=', $persons)
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

    public function editbooking(Request $request, $id)
    {
        $booking = RoomBooking::with(['customer', 'customer.member', 'room', 'room.roomType', 'room.categoryCharges', 'otherCharges', 'miniBarItems'])->findOrFail($id);
        Log::info($booking->room);
        $booking = [
            'id' => $booking->id,
            'bookingNo' => $booking->booking_no,
            'bookingDate' => $booking->booking_date,
            'checkInDate' => $booking->check_in_date,
            'checkInTime' => $booking->check_in_time,
            'checkOutDate' => $booking->check_out_date,
            'checkOutTime' => $booking->check_out_time ?? now()->format('H:i'),
            'arrivalDetails' => $booking->arrival_details,
            'departureDetails' => $booking->departure_details,
            'bookingType' => $booking->booking_type,
            'guest' => [
                'id' => $booking->customer_id,
                'name' => $booking->customer->first_name ?? null,
                'label' => $booking->customer->first_name ?? null,
                'email' => $booking->customer->email ?? null,
                'phone' => $booking->customer->phone_number ?? null,
                'membership_no' => $booking->customer->member->membership_no ?? null,
            ],
            'guestFirstName' => $booking->guest_first_name,
            'guestLastName' => $booking->guest_last_name,
            'company' => $booking->guest_company,
            'address' => $booking->guest_address,
            'country' => $booking->guest_country,
            'city' => $booking->guest_city,
            'mobile' => $booking->guest_mob,
            'email' => $booking->guest_email,
            'cnic' => $booking->guest_cnic,
            'accompaniedGuest' => $booking->accompanied_guest,
            'guestRelation' => $booking->acc_relationship,
            'bookedBy' => $booking->booked_by,
            'room' => $booking->room,
            'persons' => $booking->persons,
            'bookingCategory' => $booking->category,
            'nights' => $booking->nights,
            'perDayCharge' => $booking->per_day_charge,
            'roomCharge' => $booking->room_charge,
            'securityDeposit' => $booking->security_deposit,
            'discountType' => $booking->discount_type,
            'discount' => $booking->discount_value,
            'totalOtherCharges' => $booking->total_other_charges,
            'totalMiniBar' => $booking->total_mini_bar,
            'grandTotal' => $booking->grand_total,
            'notes' => $booking->additional_notes,
            'documents' => json_decode($booking->booking_docs, true),
            'mini_bar_items' => $booking->miniBarItems,
            'other_charges' => $booking->otherCharges,
        ];

        $roomCategories = RoomCategory::where('status', 'active')->select('id', 'name')->get();
        $chargesTypeItems = RoomChargesType::where('status', 'active')->select('id', 'name', 'amount')->get();
        $miniBarItems = RoomMiniBar::where('status', 'active')->select('id', 'name', 'amount')->get();

        return Inertia::render('App/Admin/Booking/EditRoomBooking', compact('booking', 'roomCategories', 'chargesTypeItems', 'miniBarItems'));
    }

    public function payNow(Request $request)
    {
        $invoice_no = $request->query('invoice_no');

        $invoice = FinancialInvoice::where('id', $invoice_no)->with('customer:id,first_name,last_name,email', 'customer.member.memberType')->first();

        if (!$invoice) {
            return response()->json(['message' => 'Invoice not found'], 404);
        }

        return Inertia::render('App/Admin/Booking/Payment', compact('invoice'));
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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer' => 'required',
            'bookingType' => 'required|in:room,event',
            // 'bookingFor' => 'required|in:main_guest,other',
            // 'personCount' => 'nullable|integer|min:0',
            // 'roomCount' => 'nullable|integer|min:0',
            // 'totalPayment' => 'required|numeric|min:0',
            // 'eventName' => 'nullable|string',
            // 'eventDate' => 'nullable|date',
            // 'eventTime' => 'nullable|date_format:H:i',
            // 'checkin' => 'required_if:bookingType,room|date|nullable',
            // 'checkout' => 'nullable|date|after:checkin',
        ]);

        $member_id = Auth::user()->id;

        $bookingId = $this->getBookingId();
        $bookingType = $request->bookingType;

        DB::beginTransaction();

        $booking = Booking::create([
            'booking_id' => $bookingId,
            'user_id' => $request->customer['id'],
            'booking_type' => $request->bookingType,
            'booking_For' => $request->bookingFor,
            'type_id' => $request->bookingTypeId,
            'persons' => $request->personCount,
            // 'total_rooms' => $validated['roomCount'],
            'checkin' => $bookingType === 'room' ? $request->checkin : ($bookingType === 'event' ? $request->eventDate : now()),
            'checkout' => $bookingType === 'room' ? $request->checkout : null,
            'event_name' => $bookingType === 'event' ? $request->eventName : null,
            'start_time' => $bookingType === 'event' ? $request->eventTime : null,
            'end_time' => null,
            'total_payment' => $request->totalPayment,
            'status' => 'pending',
        ]);

        $data = $booking->toArray();  // Convert Eloquent model to array
        $data['invoice_type'] = $bookingType === 'room' ? 'room_booking' : 'event_booking';
        $data['amount'] = $request->totalPayment;
        $invoice_no = $this->getInvoiceNo();
        $member_id = Auth::user()->id;

        FinancialInvoice::create([
            'invoice_no' => $invoice_no,
            'customer_id' => $request->customer['id'],
            'member_id' => $member_id,
            'invoice_type' => $bookingType === 'room' ? 'room_booking' : 'event_booking',
            'amount' => $request->totalPayment,
            'total_price' => $request->totalPayment,
            'issue_date' => now(),
            'status' => 'unpaid',
            'data' => [$data]
        ]);

        DB::commit();

        return response()->json(['message' => 'Booking saved successfully', 'invoice_no' => $invoice_no], 200);
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

        $booking = RoomBooking::find($invoice->data[0]['booking_id']);
        if ($request->booking_status) {
            $booking->status = $request->booking_status;
        }
        $booking->save();

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
        $booking_id = (int) RoomBooking::max('booking_no');
        return $booking_id + 1;
    }

    private function getInvoiceNo()
    {
        $invoiceNo = FinancialInvoice::max('invoice_no');
        $invoiceNo = $invoiceNo + 1;
        return $invoiceNo;
    }
}