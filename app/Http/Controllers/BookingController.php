<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use App\Models\Booking;
use App\Models\Room;
use App\Models\BookingEvents;
use App\Models\FinancialInvoice;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    public function index()
    {
        $bookings = Booking::latest()->get();
        $totalBookings = Booking::count();
        $totalRoomBookings = Booking::where('booking_type', 'room')->count();
        $totalEventBookings = Booking::where('booking_type', 'event')->count();

        $rooms = Room::latest()->get();
        $events = BookingEvents::latest()->get();

        $totalRooms = $rooms->count();
        $totalEvents = $events->count();

        // Determine unavailable rooms today
        $conflictedRooms = Booking::query()
            ->where('booking_Type', 'room')
            ->whereIn('status', ['confirmed', 'pending'])
            ->where('checkin', '<', now()->addDay()) // today and future
            ->where('checkout', '>', now()) // overlapping today
            ->pluck('type_id')->unique();

        $availableRoomsToday = Room::query()
            ->whereNotIn('id', $conflictedRooms)
            ->count();

        // Determine unavailable events today
        $conflictedEvents = Booking::query()
            ->where('booking_Type', 'event')
            ->whereIn('status', ['confirmed', 'pending'])
            ->where('checkin', '<', now()->addDay()) // today and future
            ->where('checkout', '>', now()) // overlapping today
            ->pluck('type_id')->unique();

        $availableEventsToday = BookingEvents::query()
            ->whereNotIn('id', $conflictedEvents)
            ->count();

        $data = [
            'bookingsData' => $bookings,
            'rooms' => $rooms,
            'events' => $events,
            'totalRooms' => $totalRooms,
            'totalEvents' => $totalEvents,
            'availableRoomsToday' => $availableRoomsToday,
            'availableEventsToday' => $availableEventsToday,
            'totalBookings' => $totalBookings,
            'totalRoomBookings' => $totalRoomBookings,
            'totalEventBookings' => $totalEventBookings,
        ];

        return Inertia::render('App/Admin/Booking/Dashboard', [
            'data' => $data,
        ]);
    }


    public function search(Request $request)
    {
        $type = $request->query('bookingType'); // 'room' or 'event'
        $checkin = $request->query('checkin'); // Y-m-d
        $checkout = $request->query('checkout'); // Y-m-d
        $persons = $request->query('persons'); // int

        $conflicted = Booking::query()
            ->where('booking_Type', $type)
            ->whereIn('status', ['confirmed', 'pending'])
            ->where(function ($query) use ($checkin, $checkout) {
                $query->where('checkin', '<', $checkout)
                    ->where('checkout', '>', $checkin);
            })
            ->pluck('type_id');

        if ($type == 'room') {
            $available = Room::query()
                ->whereNotIn('id', $conflicted)
                ->where('max_capacity', '>', $persons)
                ->get();
        } else { // event
            $available = BookingEvents::query()
                ->whereNotIn('id', $conflicted)
                ->where('max_capacity', '>', $persons)
                ->get();
        }

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
        $bookingType = $request->query('type');
        $TypeId = $request->query('type_id');
        $invoice_no = $request->query('invoice_no');

        $booking = null;
        $invoice = null;
        if ($bookingType == 'room') {
            $booking = Room::find($TypeId);
        } else if ($bookingType == 'event') {
            $booking = BookingEvents::find($TypeId);
        }
        if ($invoice_no) {
            $invoice = FinancialInvoice::where('invoice_no', $invoice_no)->with('customer:id,first_name,last_name,email', 'customer.member.memberType')->first();
        }
        $next_booking_id = $this->getBookingId();

        return Inertia::render('App/Admin/Booking/RoomBooking', compact('booking', 'invoice', 'next_booking_id'));
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
            'data' => $booking
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

        $subscription = Booking::find($invoice->data['id']);
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
        $booking_id =  (int) Booking::max('booking_id');
        return $booking_id + 1;
    }

    private function getInvoiceNo()
    {
        $invoiceNo = (int)FinancialInvoice::max('invoice_no');
        $invoiceNo = $invoiceNo + 1;
        return $invoiceNo;
    }
}
