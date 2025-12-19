<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use App\Models\FinancialInvoice;
use App\Models\Room;
use App\Models\RoomBooking;
use App\Models\RoomCategory;
use App\Models\RoomChargesType;
use App\Models\RoomMiniBar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class RoomBookingController extends Controller
{
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
        $booking = RoomBooking::with(['customer', 'member', 'room', 'room.roomType', 'room.categoryCharges', 'otherCharges', 'miniBarItems'])->findOrFail($id);
        $fullName = ($booking->customer ? $booking->customer->name : ($booking->member ? $booking->member->full_name : null));
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
                'id' => $booking->customer ? $booking->customer->id : ($booking->member ? $booking->member->id : null),
                'booking_type' => $booking->customer ? 'customer' : ($booking->member ? 'member' : null),
                'name' => $fullName,
                'label' => $fullName,
                'email' => $booking->customer ? $booking->customer->email : ($booking->member ? $booking->member->personal_email : null),
                'phone' => $booking->customer ? $booking->customer->contact : ($booking->member ? $booking->member->mobile_number_a : null),
                'membership_no' => $booking->customer ? $booking->customer->customer_no : ($booking->member ? $booking->member->membership_no : null),
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

    public function store(Request $req)
    {
        $req->validate([
            // 'bookingNo' => 'required|string|unique:room_bookings,booking_no',
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

            $bookingData = [
                'booking_no' => $this->getBookingId(),
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
                'persons' => $data['persons'] ?? 0,
                'category' => $data['bookingCategory'] ?? null,
                'nights' => $data['nights'] ?? null,
                'per_day_charge' => $data['perDayCharge'] ?? null,
                'room_charge' => $data['roomCharge'] ?? null,
                'total_other_charges' => $data['totalOtherCharges'] ?? null,
                'total_mini_bar' => $data['totalMiniBar'] ?? null,
                'security_deposit' => $data['securityDeposit'] ?? null,
                'discount_type' => $data['discountType'] ?? null,
                'discount_value' => $data['discount'] ?? 0,
                'grand_total' => $data['grandTotal'],
                'additional_notes' => $data['notes'] ?? null,
                'booking_docs' => json_encode($documentPaths),
                'status' => 'confirmed',
            ];

            // ✅ Assign IDs based on booking_type
            if (!empty($data['guest']['booking_type']) && $data['guest']['booking_type'] === 'member') {
                $bookingData['member_id'] = (int) $data['guest']['id'];
            } else {
                $bookingData['customer_id'] = (int) $data['guest']['id'];
            }

            $booking = RoomBooking::create($bookingData);

            foreach ($data['mini_bar_items'] ?? [] as $item) {
                if (!empty($item['item'])) {
                    $booking->miniBarItems()->create($item);
                }
            }

            foreach ($data['other_charges'] ?? [] as $charge) {
                if (!empty($charge['type'])) {
                    $charge['is_complementary'] = $charge['is_complementary'] ? 1 : 0;
                    $booking->otherCharges()->create($charge);
                }
            }

            // ✅ Create invoice using polymorphic relationship (cleaner approach)
            $invoiceData = [
                'invoice_no' => $this->getInvoiceNo(),
                'invoice_type' => 'room_booking',
                'discount_type' => $data['discountType'] ?? null,
                'discount_value' => $data['discount'] ?? 0,
                'amount' => $booking->grand_total,
                'total_price' => $booking->grand_total,
                'advance_payment' => $data['securityDeposit'] ?? 0,
                'paid_amount' => 0,
                'status' => 'unpaid',
                // Keep data for backward compatibility
                'data' => [
                    'booking_no' => $booking->booking_no,
                    'amount' => $booking->grand_total
                ],
            ];

            // ✅ Assign member/customer ID based on guest type
            if (!empty($data['guest']['booking_type']) && $data['guest']['booking_type'] === 'member') {
                $invoiceData['member_id'] = (int) $data['guest']['id'];
            } else {
                $invoiceData['customer_id'] = (int) $data['guest']['id'];
            }

            // ✅ Use relationship to create invoice (automatically sets invoiceable_id and invoiceable_type)
            $invoice = $booking->invoice()->create($invoiceData);

            DB::commit();

            return response()->json(['invoice_id' => $invoice->id], 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $req, $id)
    {
        $req->validate([
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
            'mini_bar_items' => 'nullable|array',
            'other_charges' => 'nullable|array',
            'statusType' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            $booking = RoomBooking::findOrFail($id);
            $data = $req->all();

            // Handle documents
            $documentPaths = $booking->booking_docs ? json_decode($booking->booking_docs, true) : [];

            if ($req->hasFile('documents')) {
                foreach ($req->file('documents') as $file) {
                    $documentPaths[] = FileHelper::saveImage($file, 'booking_documents');
                }
            }

            $booking->update([
                // 'booking_date' => $data['bookingDate'] ?? null,
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
                'persons' => $data['persons'] ?? 0,
                'category' => $data['bookingCategory'] ?? null,
                'nights' => $data['nights'] ?? null,
                'per_day_charge' => $data['perDayCharge'] ?? null,
                'room_charge' => $data['roomCharge'] ?? null,
                'total_other_charges' => $data['totalOtherCharges'] ?? null,
                'total_mini_bar' => $data['totalMiniBar'] ?? null,
                'security_deposit' => $data['securityDeposit'] ?? null,
                'discount_type' => $data['discountType'] ?? null,
                'discount_value' => $data['discount'] ?? 0,
                'grand_total' => $data['grandTotal'],
                'additional_notes' => $data['notes'] ?? null,
                'booking_docs' => json_encode($documentPaths),
                'status' => $data['statusType'] ?? $booking->status,
            ]);

            // 🔁 Clear and recreate mini bar + other charges
            $booking->miniBarItems()->delete();
            foreach ($data['mini_bar_items'] ?? [] as $item) {
                if (!empty($item['item'])) {
                    $booking->miniBarItems()->create($item);
                }
            }

            $booking->otherCharges()->delete();
            foreach ($data['other_charges'] ?? [] as $charge) {
                if (!empty($charge['type'])) {
                    $charge['is_complementary'] = $charge['is_complementary'] ? 1 : 0;
                    $booking->otherCharges()->create($charge);
                }
            }

            // 🔄 Update Invoice using polymorphic relationship
            $invoice = $booking->invoice;

            if ($invoice && $invoice->status === 'unpaid') {
                $updateData = [
                    'discount_type' => $data['discountType'] ?? null,
                    'discount_value' => $data['discount'] ?? 0,
                    'amount' => $booking->grand_total,
                    'total_price' => $booking->grand_total,
                ];

                // Update member/customer ID if guest changed
                if (!empty($data['guest']['booking_type']) && $data['guest']['booking_type'] === 'member') {
                    $updateData['member_id'] = (int) $data['guest']['id'];
                    $updateData['customer_id'] = null;
                } else {
                    $updateData['customer_id'] = (int) $data['guest']['id'];
                    $updateData['member_id'] = null;
                }

                $invoice->update($updateData);
            }

            DB::commit();

            return response()->json(['message' => 'Booking updated successfully.', 'invoice' => ['id' => $invoice->id, 'status' => $invoice->status]], 200);
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
        $monthStart = Carbon::createFromDate($req->year, $req->month, 1)->startOfMonth();
        $monthEnd = (clone $monthStart)->endOfMonth();

        $bookings = RoomBooking::where(function ($query) use ($monthStart, $monthEnd) {
            $query
                ->whereBetween('check_in_date', [$monthStart, $monthEnd])
                ->orWhereBetween('check_out_date', [$monthStart, $monthEnd])
                ->orWhere(function ($q) use ($monthStart, $monthEnd) {
                    // Booking starts before month and ends after month
                    $q
                        ->where('check_in_date', '<', $monthStart)
                        ->where('check_out_date', '>', $monthEnd);
                });
        })
            ->with('room', 'customer', 'member:id,membership_no,full_name,personal_email')
            ->get()
            ->map(fn($b) => [
                'id' => $b->id,
                'booking_no' => $b->booking_no,
                'guest_name' => $b->customer ? $b->customer->name : ($b->member ? $b->member->full_name : ''),
                'room_number' => $b->room->name,
                'check_in_date' => $b->check_in_date,
                'check_out_date' => $b->check_out_date,
                'status' => $b->status,
            ]);

        $rooms = Room::select('id', 'name')->get()->map(fn($r) => ['id' => $r->id, 'room_number' => $r->name]);

        return response()->json(['rooms' => $rooms, 'bookings' => $bookings]);
    }

    // Show Room Booking
    public function showRoomBooking($id)
    {
        $booking = RoomBooking::with('room', 'customer', 'member:id,membership_no,full_name,personal_email', 'room', 'room.roomType')->findOrFail($id);
        $invoice = FinancialInvoice::where('invoice_type', 'room_booking')
            ->select('id', 'customer_id', 'data', 'status')
            ->where('customer_id', $booking->customer_id)
            ->whereJsonContains('data', [['booking_id' => $booking->id]])
            ->first();
        $booking->invoice = $invoice;

        return response()->json(['success' => true, 'booking' => $booking]);
    }

    public function checkIn(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|exists:room_bookings,id',
            'check_in_date' => 'required|date',
            'check_in_time' => 'required|date_format:H:i',
        ]);

        $booking = RoomBooking::findOrFail($request->booking_id);

        // Validate: Check-in date must not be after check-out date
        if (!empty($booking->check_out_date) && $request->check_in_date > $booking->check_out_date) {
            return response()->json(['message' => 'Check-in date cannot be after check-out date.'], 422);
        }

        // Save check-in info
        $booking->check_in_date = $request->check_in_date;
        $booking->check_in_time = $request->check_in_time;
        $booking->status = 'checked_in';

        $booking->save();

        return response()->json([
            'message' => 'Check-in time recorded successfully.',
            'check_in_at' => $booking->check_in_date . ' ' . $booking->check_in_time,
        ]);
    }

    private function getBookingId()
    {
        $booking_id = RoomBooking::max('booking_no');
        return $booking_id + 1;
    }

    private function getInvoiceNo()
    {
        $invoiceNo = FinancialInvoice::withTrashed()->max('invoice_no');
        $invoiceNo = $invoiceNo + 1;
        return $invoiceNo;
    }

    public function getOrders($id)
    {
        $booking = RoomBooking::findOrFail($id);
        $orders = $booking->orders()->with('orderItems')->latest()->get();

        return response()->json([
            'success' => true,
            'orders' => $orders
        ]);
    }
}
