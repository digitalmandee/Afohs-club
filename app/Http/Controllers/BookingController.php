<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use App\Models\Booking;
use App\Models\Room;
use App\Models\BookingEvents;
use App\Models\FinancialInvoice;
use App\Models\Member;
use App\Models\RoomBooking;
use App\Models\RoomCategory;
use App\Models\RoomChargesType;
use App\Models\RoomMiniBar;
use App\Models\RoomType;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BookingController extends Controller
{
    public function index()
    {
        $bookings = RoomBooking::with('room', 'customer')->latest()->get();
        $totalBookings = RoomBooking::count();
        $totalRoomBookings = RoomBooking::count();


        $rooms = Room::latest()->get();

        $totalRooms = $rooms->count();

        // Determine unavailable rooms today
        $conflictedRooms = RoomBooking::query()
            ->whereIn('status', ['confirmed', 'pending'])
            ->where('check_in_date', '<', now()->addDay()) // today and future
            ->where('check_out_date', '>', now()) // overlapping today
            ->pluck('room_id')->unique();

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
        $checkin = $request->query('checkin'); // Y-m-d
        $checkout = $request->query('checkout'); // Y-m-d
        $persons = $request->query('persons'); // int

        $conflicted = RoomBooking::query()
            ->whereIn('status', ['confirmed', 'pending'])
            ->where(function ($query) use ($checkin, $checkout) {
                $query->where('check_in_date', '<', $checkout)
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
        $members = User::role('user', 'web')->select(
            'users.id',
            'users.first_name',
            'users.last_name',
            'users.email',
            'users.phone_number',
            'members.family_suffix',
            'user_details.cnic_no',
            'user_details.current_address',
        )->leftJoin('user_details', 'users.id', '=', 'user_details.user_id')
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
                $q->where('users.first_name', 'like', "%{$query}%")
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

        $data = $booking->toArray(); // Convert Eloquent model to array
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
        $booking_id =  (int) RoomBooking::max('booking_no');
        return $booking_id + 1;
    }

    private function getInvoiceNo()
    {
        $invoiceNo = FinancialInvoice::max('invoice_no');
        $invoiceNo = $invoiceNo + 1;
        return $invoiceNo;
    }
}