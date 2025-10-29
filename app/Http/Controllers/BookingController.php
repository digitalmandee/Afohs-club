<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use App\Models\Booking;
use App\Models\BookingEvents;
use App\Models\EventBooking;
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
        $bookings = RoomBooking::with('room', 'customer', 'member')->latest()->take(10)->get();

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
        $persons = (int) $request->query('persons');  // int

        $maxCapacityLimit = $persons + 2;

        // Find conflicted rooms (already booked)
        $conflicted = RoomBooking::query()
            ->whereIn('status', ['confirmed', 'pending'])
            ->where(function ($query) use ($checkin, $checkout) {
                $query
                    ->where('check_in_date', '<', $checkout)
                    ->where('check_out_date', '>', $checkin);
            })
            ->pluck('room_id');

        // Get available rooms with capacity rule
        $available = Room::query()
            ->whereNotIn('id', $conflicted)
            ->whereBetween('max_capacity', [$persons, $maxCapacityLimit])
            ->with(['roomType', 'categoryCharges', 'categoryCharges.Category'])
            ->get();

        return response()->json($available);
    }

    public function payNow(Request $request)
    {
        $invoice_no = $request->query('invoice_no');

        $invoice = FinancialInvoice::where('id', $invoice_no)->with('customer', 'member:id,membership_no,full_name,personal_email', 'member.memberType')->first();

        if (!$invoice) {
            return response()->json(['message' => 'Invoice not found'], 404);
        }

        return Inertia::render('App/Admin/Booking/Payment', compact('invoice'));
    }

    // Search family Members

    public function familyMembers($id)
    {
        // Get family members (members with parent_id = main member id)
        $familyMembers = Member::select(
                'id',
                'full_name',
                'membership_no',
                'personal_email',
                'mobile_number_a',
                'family_suffix',
                'cnic_no',
                'current_address'
            )
            ->where('parent_id', $id)
            ->limit(10)
            ->get();

        // Format for frontend
        $results = $familyMembers->map(function ($member){
            return [
                'id' => $member->id,
                'label' => "{$member->full_name} ({$member->membership_no})",
                'membership_no' => $member->membership_no,
                'email' => $member->personal_email,
                'cnic' => $member->cnic_no,
                'phone' => $member->mobile_number_a,
                'address' => $member->current_address,
                'family_suffix' => $member->family_suffix,
            ];
        });

        return response()->json(['success' => true, 'results' => $results], 200);
    }

    public function paymentStore(Request $request)
    {
        $request->validate([
            'invoice_no' => 'required|exists:financial_invoices,invoice_no',
            'amount' => 'required|numeric|min:0',
        ]);

        $invoice = FinancialInvoice::where('invoice_no', $request->invoice_no)->first();

        // Calculate remaining balance
        $remaining = $invoice->total_price - $invoice->paid_amount;

        if ($request->amount < $remaining) {
            return response()->json([
                'success' => false,
                'message' => 'Amount must be at least Rs ' . number_format($remaining, 2)
            ], 422);
        }

        DB::beginTransaction();

        $recieptPath = null;
        if ($request->payment_method == 'credit_card' && $request->has('reciept')) {
            $recieptPath = FileHelper::saveImage($request->file('reciept'), 'reciepts');
        }

        $invoice->payment_date = now();
        $invoice->paid_amount = $invoice->paid_amount + $request->amount;  // ✅ accumulate payments
        $invoice->customer_charges = $request->customer_charges ?? $invoice->customer_charges;
        $invoice->payment_method = $request->payment_method;
        $invoice->receipt = $recieptPath;
        $invoice->status = $invoice->paid_amount >= $invoice->total_price ? 'paid' : 'partial';
        $invoice->save();

        if ($invoice->invoice_type == 'room_booking') {
            $booking = RoomBooking::find($invoice->data[0]['booking_id']);
            if ($request->booking_status) {
                $booking->status = $request->booking_status;
            }
            $booking->save();
        }else if ($invoice->invoice_type == 'event_booking') {
            $booking = EventBooking::find($invoice->data['booking_id']);
            if ($request->booking_status) {
                $booking->status = $request->booking_status;
            }
            $booking->save();
        }

        DB::commit();

        return response()->json(['success' => true, 'message' => 'Payment successful']);
    }
}