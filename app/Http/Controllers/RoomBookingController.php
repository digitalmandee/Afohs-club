<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use App\Models\FinancialInvoice;
use App\Models\Room;
use App\Models\RoomBooking;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class RoomBookingController extends Controller
{
    public function store(Request $req)
    {
        $req->validate([
            'bookingNo' => 'required|string|unique:room_bookings,booking_no',
            'bookingDate' => 'nullable|date',
            'checkInDate' => 'nullable|date',
            'checkOutDate' => 'nullable|date',
            'arrivalDetails' => 'nullable|string',
            'departureDetails' => 'nullable|string',
            'bookingType' => 'nullable|string',
            'guest' => 'required|array',
            'guest.id' => 'required|integer',
            'perDayCharge' => 'nullable|numeric',
            'nights' => 'nullable|integer',
            'roomCharge' => 'nullable|numeric',
            'securityDeposit' => 'nullable|numeric',
            'bookedBy' => 'nullable|string',
            'guestFirstName' => 'nullable|string',
            'guestLastName' => 'nullable|string',
            'company' => 'nullable|string',
            'address' => 'nullable|string',
            'country' => 'nullable|string',
            'city' => 'nullable|string',
            'mobile' => 'nullable|string',
            'email' => 'nullable|string',
            'cnic' => 'nullable|string',
            'accompaniedGuest' => 'nullable|string',
            'discountType' => 'nullable|string',
            'discount' => 'nullable|numeric',
            'notes' => 'nullable|string',
            'documents' => 'nullable|array',
            'documents.*' => 'file|mimes:jpg,jpeg,png,pdf,docx',
            'mini_bar_items' => 'nullable|array',
            'other_charges' => 'nullable|array',
        ]);

        $data = $req->all();

        DB::beginTransaction();

        try {
            $documentPaths = [];
            if ($req->hasFile('documents')) {
                foreach ($req->file('documents') as $file) {
                    $documentPaths[] = FileHelper::saveImage($file, 'booking_documents');
                }
            }

            $booking = RoomBooking::create([
                'booking_no' => $this->getBookingId(),
                'customer_id' => (int)$data['guest']['id'],
                'booking_date' => $data['bookingDate'] ?? null,
                'check_in_date' => $data['checkInDate'] ?? null,
                'check_out_date' => $data['checkOutDate'] ?? null,
                'arrival_details' => $data['arrivalDetails'] ?? null,
                'departure_details' => $data['departureDetails'] ?? null,
                'booking_type' => $data['bookingType'] ?? null,
                'guest_first_name' => $data['guestFirstName'] ?? null,
                'guest_last_name' => $data['guestLastName'] ?? null,
                'guest_company' => $data['company'] ?? null,
                'guest_address' => $data['address'] ?? null,
                'guest_country' => $data['country'] ?? null,
                'guest_city' => $data['city'] ?? null,
                'guest_mob' => $data['mobile'] ?? null,
                'guest_email' => $data['email'] ?? null,
                'guest_cnic' => $data['cnic'] ?? null,
                'accompanied_guest' => $data['accompaniedGuest'] ?? null,
                'acc_relationship' => $data['guestRelation'] ?? null,
                'booked_by' => $data['bookedBy'] ?? null,
                'room_id' => $data['room']['id'] ?? null,
                'persons' => $data['persons'] ?? null,
                'category' => $data['bookingCategory'] ?? null,
                'nights' => $data['nights'] ?? null,
                'per_day_charge' => $data['perDayCharge'] ?? null,
                'room_charge' => $data['roomCharge'] ?? null,
                'total_other_charges' => $data['totalOtherCharges'] ?? null,
                'total_mini_bar' => $data['totalMiniBar'] ?? null,
                'security_deposit' => $data['securityDeposit'] ?? null,
                'discount_type' => $data['discountType'] ?? null,
                'discount_value' => $data['discount'] ?? 0,
                'grand_total' => ($data['grandTotal']),
                'additional_notes' => $data['notes'] ?? null,
                'booking_docs' => json_encode($documentPaths),
                'status' => 'confirmed',
            ]);

            foreach ($data['mini_bar_items'] ?? [] as $item) {
                if (!empty($item['item'])) {
                    $booking->miniBarItems()->create($item);
                }
            }

            foreach ($data['other_charges'] ?? [] as $charge) {
                if (!empty($charge['type'])) {
                    $booking->otherCharges()->create($charge);
                }
            }

            Log::info('Room booking created', ['booking_id' => $data['guest']['id']]);

            $invoice = FinancialInvoice::create([
                'invoice_no' => $this->getInvoiceNo(),
                'customer_id' => (int)$data['guest']['id'],
                'member_id' => Auth::user()->id,
                'invoice_type' => 'room_booking',
                'discount_type' => $data['discountType'] ?? null,
                'discount_value' => $data['discount'] ?? 0,
                'amount' => $booking->grand_total,
                'total_price' => $booking->grand_total,
                'paid_amount' => 0,
                'status' => 'unpaid',
                'data' => [
                    [
                        'booking_id' => $booking->id,
                        'booking_no' => $booking->booking_no,
                        'amount' => $booking->grand_total
                    ]
                ],
            ]);

            DB::commit();

            return response()->json(['invoice_id' => $invoice->id], 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Calendar

    public function calendar()
    {
        return Inertia::render('App/Admin/Booking/Room/Calendar');
    }

    public function getCalendar(Request $req)
    {
        $bookings = RoomBooking::whereMonth('check_in_date', $req->month)
            ->whereYear('check_in_date', $req->year)
            ->with('room', 'customer')
            ->get()
            ->map(fn($b) => [
                'id' => $b->id,
                'booking_no' => $b->booking_no,
                'guest_name' => $b->customer->first_name . ' ' . $b->customer->last_name,
                'room_number' => $b->room->name,
                'check_in_date' => $b->check_in_date,
                'check_out_date' => $b->check_out_date,
                'status' => $b->status,
            ]);

        $rooms = Room::select('id', 'name')->get()->map(fn($r) => ['id' => $r->id, 'room_number' => $r->name]);

        return response()->json(['rooms' => $rooms, 'bookings' => $bookings]);
    }

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