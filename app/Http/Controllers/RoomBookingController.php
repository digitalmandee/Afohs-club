<?php

namespace App\Http\Controllers;

use App\Constants\AppConstants;
use App\Helpers\FileHelper;
use App\Models\FinancialInvoice;
use App\Models\FinancialInvoiceItem;
use App\Models\FinancialReceipt;
use App\Models\Room;
use App\Models\RoomBooking;
use App\Models\RoomCategory;
use App\Models\RoomChargesType;
use App\Models\RoomMiniBar;
use App\Models\RoomType;
use App\Models\Transaction;
use App\Models\TransactionRelation;
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
        $booking = RoomBooking::with(['customer', 'member', 'corporateMember', 'room', 'room.roomType', 'room.categoryCharges', 'otherCharges', 'miniBarItems'])->findOrFail($id);
        $fullName = ($booking->customer ? $booking->customer->name : ($booking->member ? $booking->member->full_name : ($booking->corporateMember ? $booking->corporateMember->full_name : null)));
        $bookingData = [
            'id' => $booking->id,
            'status' => $booking->status,
            'bookingNo' => $booking->booking_no,
            'bookingDate' => $booking->booking_date,
            'checkInDate' => $booking->check_in_date,
            'checkInTime' => $booking->check_in_time,
            'checkOutDate' => $booking->check_out_date,
            'checkOutTime' => $booking->check_out_time ?? now()->format('H:i'),
            'arrivalDetails' => $booking->arrival_details,
            'departureDetails' => $booking->departure_details,
            'bookingType' => (string) $booking->booking_type,
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
            'advanceAmount' => $booking->advance_amount,
            'discountType' => $booking->discount_type,
            'discount' => $booking->discount_value,
            'totalOtherCharges' => $booking->total_other_charges,
            'totalMiniBar' => $booking->total_mini_bar,
            'grandTotal' => $booking->grand_total,
            'notes' => $booking->additional_notes,
            'documents' => json_decode($booking->booking_docs, true),
            'mini_bar_items' => $booking->miniBarItems,
            'other_charges' => $booking->otherCharges,
            'other_charges' => $booking->otherCharges,
            'guest' => null,
            'invoice' => $booking->invoice ? [
                'id' => $booking->invoice->id,
                'status' => $booking->invoice->status,
                'paid_amount' => $booking->invoice->paid_amount,
                'total_price' => $booking->invoice->total_price,
            ] : null,
        ];

        if ($booking->customer) {
            $bookingData['guest'] = [
                'id' => $booking->customer->id,
                'booking_type' => 'customer',
                'name' => $fullName,
                'label' => $fullName,
                'email' => $booking->customer->email,
                'phone' => $booking->customer->contact,
                'membership_no' => $booking->customer->customer_no,
            ];
        } elseif ($booking->member) {
            $bookingData['guest'] = [
                'id' => $booking->member->id,
                'booking_type' => 'member',
                'name' => $fullName,
                'label' => $fullName,
                'email' => $booking->member->personal_email,
                'phone' => $booking->member->mobile_number_a,
                'membership_no' => $booking->member->membership_no,
            ];
        } elseif ($booking->corporateMember) {
            $bookingData['guest'] = [
                'id' => $booking->corporateMember->id,
                'booking_type' => '2',
                'name' => $fullName,
                'label' => $fullName,
                'email' => $booking->corporateMember->personal_email,
                'phone' => $booking->corporateMember->mobile_number_a,
                'membership_no' => $booking->corporateMember->membership_no,
            ];
        }

        // Reassign back to $booking variable to match view expectations or use $bookingData directly
        $booking = $bookingData;

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
            'advanceAmount' => 'nullable|numeric',
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

            // check duplicate booking
            if (!empty($data['checkInDate']) && !empty($data['checkOutDate']) && !empty($data['room']['id'])) {
                $checkIn = $data['checkInDate'];
                $checkOut = $data['checkOutDate'];
                $roomId = $data['room']['id'];

                $conflictingBooking = RoomBooking::where('room_id', $roomId)
                    ->whereNotIn('status', ['cancelled', 'refunded', 'checked_out', 'Cancelled', 'Refunded'])
                    ->where(function ($query) use ($checkIn, $checkOut) {
                        $query
                            ->where('check_in_date', '<', $checkOut)
                            ->where('check_out_date', '>', $checkIn);
                    })
                    ->first();

                if ($conflictingBooking) {
                    DB::rollBack();
                    return response()->json([
                        'error' => "Room is already booked. Conflict with Booking #{$conflictingBooking->booking_no} ({$conflictingBooking->check_in_date} to {$conflictingBooking->check_out_date})"
                    ], 422);
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
                'nights' => (isset($data['checkInDate']) && isset($data['checkOutDate'])) ? max(1, \Carbon\Carbon::parse($data['checkOutDate'])->diffInDays(\Carbon\Carbon::parse($data['checkInDate']))) : ($data['nights'] ?? null),
                'per_day_charge' => $data['perDayCharge'] ?? null,
                'room_charge' => $data['roomCharge'] ?? null,
                'total_other_charges' => $data['totalOtherCharges'] ?? null,
                'total_mini_bar' => $data['totalMiniBar'] ?? null,
                'security_deposit' => $data['securityDeposit'] ?? null,
                'advance_amount' => $data['advanceAmount'] ?? null,
                'discount_type' => $data['discountType'] ?? null,
                'discount_value' => $data['discount'] ?? 0,
                'grand_total' => $data['grandTotal'],
                'additional_notes' => $data['notes'] ?? null,
                'booking_docs' => json_encode($documentPaths),
                'status' => 'confirmed',
            ];

            // ✅ Assign IDs based on booking_type
            if ($data['bookingType'] == '2') {
                $bookingData['corporate_member_id'] = (int) $data['guest']['id'];
            } elseif (!empty($data['guest']['booking_type']) && $data['guest']['booking_type'] === 'member') {
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

            // ✅ Determine Payer Details for Ledger & Invoice Data
            $payerId = null;
            $payerType = null;
            $memberName = 'Guest';
            $corporateId = null;
            $memberId = null;
            $customerId = null;

            if ($data['bookingType'] == '2') {
                $payerId = (int) $data['guest']['id'];
                $payerType = \App\Models\CorporateMember::class;
                $memberName = $data['guest']['name'] ?? 'Corporate Member';
                $corporateId = $payerId;
            } elseif (!empty($data['guest']['booking_type']) && $data['guest']['booking_type'] === 'member') {
                $payerId = (int) $data['guest']['id'];
                $payerType = \App\Models\Member::class;
                $memberName = $data['guest']['name'] ?? 'Member';
                $memberId = $payerId;
            } else {
                $payerId = (int) $data['guest']['id'];
                $payerType = \App\Models\Customer::class;
                $memberName = $data['guest']['name'] ?? 'Guest';
                $customerId = $payerId;
            }

            // ✅ Create invoice using polymorphic relationship (cleaner approach)
            $invoiceData = [
                'invoice_no' => $this->getInvoiceNo(),
                'invoice_type' => 'room_booking',
                // Discount moved to item level
                'amount' => $booking->grand_total,
                'total_price' => $booking->grand_total,
                'advance_payment' => 0,
                'paid_amount' => 0,
                'status' => 'unpaid',
                'payment_method' => match ($data['paymentMode'] ?? 'Cash') {
                    'Bank Transfer' => 'bank',
                    'Credit Card' => 'credit_card',
                    'Online' => 'bank',
                    default => 'cash',
                },
                'data' => [
                    'member_name' => $memberName,
                    'booking_no' => $booking->booking_no,
                    'action' => 'save'
                ],
                'member_id' => $memberId,
                'corporate_member_id' => $corporateId,
                'customer_id' => $customerId,
                'issue_date' => now(),
                'due_date' => now()->addDays(1),
                'created_by' => Auth::id(),
            ];

            // ✅ Add member_name to invoice data
            $invoiceData['data']['member_name'] = $memberName;

            // ✅ Use relationship to create invoice (automatically sets invoiceable_id and invoiceable_type)
            $invoice = $booking->invoice()->create($invoiceData);

            // ✅ Create SINGLE Invoice Item with Discount Logic
            $grossAmount = (float) $booking->room_charge + (float) $booking->total_other_charges + (float) $booking->total_mini_bar;
            $discountType = $data['discountType'] ?? null;
            $discountValue = $data['discount'] ?? 0;
            $discountAmount = 0;

            if ($discountType === 'percentage') {
                $discountAmount = ($grossAmount * $discountValue) / 100;
            } elseif ($discountType === 'fixed') {
                $discountAmount = $discountValue;
            }

            // Ensure we match grand_total (handle logic mismatches safely)
            // If calculated Net != grand_total, prefer grand_total and adjust?
            // For now, allow slight component re-calculation for the Item fields.

            $invoiceItem = FinancialInvoiceItem::create([
                'invoice_id' => $invoice->id,
                'fee_type' => AppConstants::TRANSACTION_TYPE_ID_ROOM_BOOKING,
                'description' => 'Room Booking Charges #' . $booking->booking_no,
                'qty' => 1,
                'amount' => $grossAmount,  // Store Gross Amount here
                'discount_type' => $discountType,
                'discount_value' => $discountValue,
                'discount_amount' => $discountAmount,
                'tax_percentage' => 0,
                'tax_amount' => 0,
                'sub_total' => $grossAmount,
                'total' => $booking->grand_total,  // Net Amount (Gross - Discount + Tax)
            ]);

            // ✅ 1. Create Ledger Entry (Debit) - Invoice Created
            // We create ONE debit transaction for the Invoice Total (Net).
            Transaction::create([
                'type' => 'debit',
                'amount' => $booking->grand_total,
                'date' => now(),
                'description' => 'Invoice #' . $invoice->invoice_no . ' (Room Booking)',
                'payable_type' => $payerType,
                'payable_id' => $payerId,
                'reference_type' => FinancialInvoiceItem::class,
                'reference_id' => $invoiceItem->id,
                'invoice_id' => $invoice->id,
                'created_by' => Auth::id(),
            ]);

            // ✅ 2. Handle Advance Payment (Receipt + Credit Transaction)
            if (($data['securityDeposit'] ?? 0) > 0 || ($data['advanceAmount'] ?? 0) > 0) {
                $securityDeposit = $data['securityDeposit'] ?? 0;
                $advanceAmount = $data['advanceAmount'] ?? 0;
                $totalPaid = $securityDeposit + $advanceAmount;

                // Create Receipt
                $receipt = FinancialReceipt::create([
                    'receipt_no' => time(),
                    'payer_type' => $payerType,
                    'payer_id' => $payerId,
                    'amount' => $totalPaid,
                    'payment_method' => match ($data['paymentMode'] ?? 'Cash') {
                        'Bank Transfer' => 'bank',
                        'Credit Card' => 'credit_card',
                        'Online' => 'bank',
                        default => 'cash',
                    },
                    'payment_details' => $data['paymentAccount'] ?? null,
                    'receipt_date' => now(),
                    'status' => 'active',
                    'remarks' => 'Advance/Security for Booking #' . $booking->booking_no,
                    'created_by' => Auth::id(),
                ]);

                // Create Ledger Entry (Credit)
                Transaction::create([
                    'type' => 'credit',
                    'amount' => $totalPaid,
                    'date' => now(),
                    'description' => 'Payment Received (Rec #' . $receipt->receipt_no . ')',
                    'payable_type' => $payerType,
                    'payable_id' => $payerId,
                    'reference_type' => FinancialReceipt::class,
                    'reference_id' => $receipt->id,
                    'created_by' => Auth::id(),
                ]);

                // Link Receipt to Invoice (Only Advance counts towards invoice)
                if ($advanceAmount > 0) {
                    TransactionRelation::create([
                        'invoice_id' => $invoice->id,
                        'receipt_id' => $receipt->id,
                        'amount' => $advanceAmount,
                    ]);
                }

                // Update Invoice Paid Amount
                $invoice->update([
                    'paid_amount' => $advanceAmount,
                    'advance_payment' => 0,
                    'status' => ($advanceAmount >= $booking->grand_total) ? 'paid' : 'unpaid'
                ]);
            }

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
            'advanceAmount' => 'nullable|numeric',
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

            // check duplicate booking
            if (!empty($data['checkInDate']) && !empty($data['checkOutDate']) && !empty($data['room']['id'])) {
                $checkIn = $data['checkInDate'];
                $checkOut = $data['checkOutDate'];
                $roomId = $data['room']['id'];

                \Illuminate\Support\Facades\Log::info("Checking conflict for Booking ID: $id, Room: $roomId, In: $checkIn, Out: $checkOut");

                $conflicts = RoomBooking::where('room_id', $roomId)
                    ->where('id', '!=', $id)  // Exclude current booking
                    ->whereNotIn('status', ['cancelled', 'refunded', 'checked_out', 'Cancelled', 'Refunded'])
                    ->where(function ($query) use ($checkIn, $checkOut) {
                        $query
                            ->where('check_in_date', '<', $checkOut)
                            ->where('check_out_date', '>', $checkIn);
                    })
                    ->get();

                if ($conflicts->count() > 0) {
                    $conflictIds = $conflicts->pluck('id')->implode(', ');
                    \Illuminate\Support\Facades\Log::info('Conflict found with: ' . $conflictIds);
                    DB::rollBack();
                    return response()->json(['error' => "Room is already booked. Checking ID: $id (Room $roomId) vs Found Conflict IDs: $conflictIds"], 422);
                }
            }

            // Handle documents
            $documentPaths = $booking->booking_docs ? json_decode($booking->booking_docs, true) : [];

            if ($req->hasFile('documents')) {
                foreach ($req->file('documents') as $file) {
                    $documentPaths[] = FileHelper::saveImage($file, 'booking_documents');
                }
            }

            // Capture old values for payment difference calculation
            $oldSecurity = $booking->security_deposit ?? 0;
            $oldAdvance = $booking->advance_amount ?? 0;

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
                'nights' => (isset($data['checkInDate']) && isset($data['checkOutDate'])) ? max(1, \Carbon\Carbon::parse($data['checkOutDate'])->diffInDays(\Carbon\Carbon::parse($data['checkInDate']))) : ($data['nights'] ?? null),
                'per_day_charge' => $data['perDayCharge'] ?? null,
                'room_charge' => $data['roomCharge'] ?? null,
                'total_other_charges' => $data['totalOtherCharges'] ?? null,
                'total_mini_bar' => $data['totalMiniBar'] ?? null,
                'security_deposit' => $data['securityDeposit'] ?? null,
                'advance_amount' => $data['advanceAmount'] ?? null,
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
                if ($data['bookingType'] == '2') {
                    $updateData['corporate_member_id'] = (int) $data['guest']['id'];
                    $updateData['member_id'] = null;
                    $updateData['customer_id'] = null;
                } elseif (!empty($data['guest']['booking_type']) && $data['guest']['booking_type'] === 'member') {
                    $updateData['member_id'] = (int) $data['guest']['id'];
                    $updateData['customer_id'] = null;
                    $updateData['corporate_member_id'] = null;
                } else {
                    $updateData['customer_id'] = (int) $data['guest']['id'];
                    $updateData['member_id'] = null;
                    $updateData['corporate_member_id'] = null;
                }

                $invoice->update($updateData);
            }

            // Calculate Payment Difference and Create Receipt if needed
            $newSecurity = $data['securityDeposit'] ?? 0;
            $newAdvance = $data['advanceAmount'] ?? 0;
            $diffSecurity = max(0, $newSecurity - $oldSecurity);
            $diffAdvance = max(0, $newAdvance - $oldAdvance);
            $toBePaid = $diffSecurity + $diffAdvance;

            if ($toBePaid > 0) {
                // Determine Payer
                $payerType = null;
                $payerId = null;
                if ($booking->member_id) {
                    $payerType = \App\Models\Member::class;
                    $payerId = $booking->member_id;
                } elseif ($booking->corporate_member_id) {
                    $payerType = \App\Models\CorporateMember::class;
                    $payerId = $booking->corporate_member_id;
                } elseif ($booking->customer_id) {
                    $payerType = \App\Models\Customer::class;
                    $payerId = $booking->customer_id;
                }

                // Create Receipt
                $receipt = FinancialReceipt::create([
                    'receipt_no' => time(),
                    'payer_type' => $payerType,
                    'payer_id' => $payerId,
                    'amount' => $toBePaid,
                    'payment_method' => match ($data['paymentMode'] ?? 'Cash') {
                        'Bank Transfer' => 'bank',
                        'Credit Card' => 'credit_card',
                        'Online' => 'bank',
                        default => 'cash',
                    },
                    'payment_details' => $data['paymentAccount'] ?? null,
                    'receipt_date' => now(),
                    'status' => 'active',
                    'remarks' => 'Additional Payment (Security: ' . $diffSecurity . ', Advance: ' . $diffAdvance . ') for Room Booking #' . $booking->booking_no,
                    'created_by' => Auth::id(),
                ]);

                // Create Ledger Entry (Credit)
                Transaction::create([
                    'type' => 'credit',
                    'amount' => $toBePaid,
                    'date' => now(),
                    'description' => 'Payment Received (Rec #' . $receipt->receipt_no . ')',
                    'payable_type' => $payerType,
                    'payable_id' => $payerId,
                    'reference_type' => FinancialReceipt::class,
                    'reference_id' => $receipt->id,
                    'created_by' => Auth::id(),
                ]);

                // Link Receipt to Invoice (ONLY Advance Amount Difference)
                if ($diffAdvance > 0 && $invoice) {
                    TransactionRelation::create([
                        'invoice_id' => $invoice->id,
                        'receipt_id' => $receipt->id,
                        'amount' => $diffAdvance,
                    ]);
                }

                // Update Invoice Paid Amount
                if ($invoice) {
                    $invoice->paid_amount += $diffAdvance;
                    $invoice->status = ($invoice->paid_amount >= $booking->grand_total) ? 'paid' : 'unpaid';
                    $invoice->save();
                }
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
        if ($req->has('from') && $req->has('to')) {
            $startDate = Carbon::parse($req->from)->startOfDay();
            $endDate = Carbon::parse($req->to)->endOfDay();
        } else {
            $startDate = Carbon::createFromDate($req->year, $req->month, 1)->startOfMonth();
            $endDate = (clone $startDate)->endOfMonth();
        }

        $bookings = RoomBooking::where(function ($query) use ($startDate, $endDate) {
            $query
                ->whereBetween('check_in_date', [$startDate, $endDate])
                ->orWhereBetween('check_out_date', [$startDate, $endDate])
                ->orWhere(function ($q) use ($startDate, $endDate) {
                    // Booking starts before range and ends after range
                    $q
                        ->where('check_in_date', '<', $startDate)
                        ->where('check_out_date', '>', $endDate);
                });
        })
            ->whereNotIn('status', ['cancelled', 'refunded'])
            ->with(['room', 'customer', 'member:id,membership_no,full_name,personal_email', 'corporateMember:id,membership_no,full_name,personal_email', 'invoice'])
            ->get()
            ->map(fn($b) => [
                'id' => $b->id,
                'booking_no' => $b->booking_no,
                'guest_name' => $b->customer ? $b->customer->name : ($b->member ? $b->member->full_name : ($b->corporateMember ? $b->corporateMember->full_name : '')),
                'room_number' => $b->room->name,
                'check_in_date' => $b->check_in_date,
                'check_out_date' => $b->check_out_date,
                'status' => $b->status,
                'invoice' => $b->invoice ? [
                    'paid_amount' => $b->invoice->paid_amount,
                ] : null,
            ]);

        $rooms = Room::select('id', 'name')->get()->map(fn($r) => ['id' => $r->id, 'room_number' => $r->name]);

        return response()->json(['rooms' => $rooms, 'bookings' => $bookings]);
    }

    // Show Room Booking
    public function showRoomBooking($id)
    {
        $booking = RoomBooking::with('room', 'customer', 'member:id,membership_no,full_name,personal_email', 'corporateMember:id,membership_no,full_name,personal_email', 'room', 'room.roomType')->findOrFail($id);
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

        // 1. Status Validation
        if ($booking->status === 'checked_in') {
            return response()->json(['message' => 'This booking is already checked in.'], 422);
        }
        if ($booking->status === 'checked_out') {
            return response()->json(['message' => 'This booking is already checked out.'], 422);
        }
        if ($booking->status === 'cancelled') {
            return response()->json(['message' => 'This booking is cancelled.'], 422);
        }

        // 2. Date Validation (Cannot check in for future)
        $checkInDate = Carbon::parse($request->check_in_date)->startOfDay();
        $today = Carbon::today();

        if ($checkInDate->gt($today)) {
            return response()->json(['message' => 'Cannot check in. The booking date is in the future.'], 422);
        }

        // Validate: Check-in date must not be after check-out date
        if (!empty($booking->check_out_date) && $request->check_in_date > $booking->check_out_date) {
            return response()->json(['message' => 'Check-in date cannot be after check-out date.'], 422);
        }

        // 3. Room Occupancy Validation
        if ($booking->room_id) {
            $occupant = RoomBooking::where('room_id', $booking->room_id)
                ->where('status', 'checked_in')
                ->where('id', '!=', $booking->id)
                ->with(['customer', 'member', 'corporateMember'])
                ->first();

            if ($occupant) {
                $guestName = ($occupant->customer ? $occupant->customer->name : ($occupant->member ? $occupant->member->full_name : ($occupant->corporateMember ? $occupant->corporateMember->full_name : 'Unknown')));
                return response()->json(['message' => "This room is currently occupied by another guest (Booking #{$occupant->booking_no}, Guest: $guestName). Cannot check in new guest until the room is vacated."], 422);
            }
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

    public function cancelled(Request $request)
    {
        $filters = $request->only(['search', 'room_type', 'booking_date_from', 'booking_date_to', 'check_in_from', 'check_in_to', 'check_out_from', 'check_out_to', 'customer_type', 'room_ids']);

        $query = RoomBooking::with([
            'customer:id,name,email,contact',
            'member:id,membership_no,full_name,personal_email',
            'corporateMember:id,membership_no,full_name,personal_email',
            'room:id,name,room_type_id',
            'invoice:id,invoiceable_id,invoiceable_type,status,paid_amount,total_price,advance_payment,payment_method,data'
        ])->whereIn('status', ['cancelled', 'refunded']);

        // Apply shared filters
        $this->applyFilters($query, $filters);

        $bookings = $query->orderBy('updated_at', 'desc')->paginate(20)->withQueryString();

        // Transform collection to include full invoice details
        $bookings->getCollection()->transform(function ($booking) {
            $booking->invoice = $booking->invoice ? [
                'id' => $booking->invoice->id,
                'status' => $booking->invoice->status,
                'paid_amount' => $booking->invoice->paid_amount,
                'total_price' => $booking->invoice->total_price,
                'advance_payment' => $booking->invoice->advance_payment,
                'payment_method' => $booking->invoice->payment_method,
                'data' => $booking->invoice->data,
            ] : null;
            return $booking;
        });

        return Inertia::render('App/Admin/Booking/Room/Cancelled', [
            'bookings' => $bookings,
            'filters' => $filters,
            'roomTypes' => RoomType::select('id', 'name')->get(),
            'rooms' => Room::select('id', 'name')->get(),
        ]);
    }

    private function applyFilters($query, $filters)
    {
        // Search
        // Customer Type & Search Logic
        $customerType = $filters['customer_type'] ?? 'all';
        $search = $filters['search'] ?? null;

        if ($customerType === 'member') {
            $query->whereHas('member');
            if ($search) {
                $query->whereHas('member', function ($q) use ($search) {
                    $q
                        ->where('full_name', 'like', "%{$search}%")
                        ->orWhere('membership_no', 'like', "%{$search}%");
                });
            }
        } elseif ($customerType === 'corporate') {
            $query->whereHas('corporateMember');
            if ($search) {
                $query->whereHas('corporateMember', function ($q) use ($search) {
                    $q
                        ->where('full_name', 'like', "%{$search}%")
                        ->orWhere('membership_no', 'like', "%{$search}%");
                });
            }
        } elseif ($customerType === 'guest') {
            $query->whereHas('customer');
            if ($search) {
                $query->whereHas('customer', function ($q) use ($search) {
                    $q
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('customer_no', 'like', "%{$search}%");
                });
            }
        } else {
            // ALL types
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q
                        ->where('id', 'like', "%{$search}%")
                        ->orWhere('booking_no', 'like', "%{$search}%")
                        ->orWhereHas('member', function ($sub) use ($search) {
                            $sub
                                ->where('full_name', 'like', "%{$search}%")
                                ->orWhere('membership_no', 'like', "%{$search}%");
                        })
                        ->orWhereHas('corporateMember', function ($sub) use ($search) {
                            $sub
                                ->where('full_name', 'like', "%{$search}%")
                                ->orWhere('membership_no', 'like', "%{$search}%");
                        })
                        ->orWhereHas('customer', function ($sub) use ($search) {
                            $sub
                                ->where('name', 'like', "%{$search}%")
                                ->orWhere('customer_no', 'like', "%{$search}%");
                        })
                        ->orWhereHas('room', function ($sub) use ($search) {
                            $sub->where('name', 'like', "%{$search}%");
                        });
                });
            }
        }

        // Room Type
        if (!empty($filters['room_type'])) {
            $roomTypes = explode(',', $filters['room_type']);
            $query->whereHas('room', function ($q) use ($roomTypes) {
                $q->whereIn('room_type_id', $roomTypes);
            });
        }

        // Room IDs
        if (!empty($filters['room_ids'])) {
            $roomIds = explode(',', $filters['room_ids']);
            $query->whereIn('room_id', $roomIds);
        }

        // Booking Date
        if (!empty($filters['booking_date_from'])) {
            $query->whereDate('booking_date', '>=', $filters['booking_date_from']);
        }
        if (!empty($filters['booking_date_to'])) {
            $query->whereDate('booking_date', '<=', $filters['booking_date_to']);
        }

        // Check In Date
        if (!empty($filters['check_in_from'])) {
            $query->whereDate('check_in_date', '>=', $filters['check_in_from']);
        }
        if (!empty($filters['check_in_to'])) {
            $query->whereDate('check_in_date', '<=', $filters['check_in_to']);
        }

        // Check Out Date
        if (!empty($filters['check_out_from'])) {
            $query->whereDate('check_out_date', '>=', $filters['check_out_from']);
        }
        if (!empty($filters['check_out_to'])) {
            $query->whereDate('check_out_date', '<=', $filters['check_out_to']);
        }

        // Booking Status
        if (!empty($filters['booking_status'])) {
            $query->where('status', $filters['booking_status']);
        }
    }

    public function cancelBooking(Request $request, $id)
    {
        $request->validate([
            'cancellation_reason' => 'nullable|string|max:500',
            'refund_amount' => 'nullable|numeric|min:0',
            'refund_mode' => 'nullable|string|required_with:refund_amount',
            'refund_account' => 'nullable|string',
        ]);

        $booking = RoomBooking::with('invoice')->findOrFail($id);
        $booking->status = 'cancelled';

        $notes = "\n[Cancelled: " . now()->toDateTimeString() . ']';
        if ($request->filled('cancellation_reason')) {
            $notes .= ' Reason: ' . $request->cancellation_reason;
        }

        // Handle Refund
        if ($request->filled('refund_amount') && $request->refund_amount > 0) {
            $invoice = $booking->invoice;
            if ($invoice) {
                $maxRefundable = max($invoice->paid_amount, $invoice->advance_payment);

                if ($request->refund_amount > $maxRefundable) {
                    return redirect()->back()->withErrors(['refund_amount' => 'Refund amount cannot be greater than refundable amount (' . $maxRefundable . ').']);
                }

                // Update Invoice Paid Amount
                if ($invoice->paid_amount > 0) {
                    $invoice->paid_amount = max(0, $invoice->paid_amount - $request->refund_amount);
                }
                // Also deduct from advance_payment if available
                if ($invoice->advance_payment > 0) {
                    $invoice->advance_payment = max(0, $invoice->advance_payment - $request->refund_amount);
                }

                $invoice->save();

                // ✅ Determine Payer Details for Ledger
                $payerDetails = $this->getPayerDetails($invoice);

                // Find main invoice item to attach refund to
                $invoiceItem = $invoice->items()->where('fee_type', '1')->first() ?? $invoice->items()->first();

                // ✅ Create Refund Ledger Entry (Debit)
                Transaction::create([
                    'type' => 'debit',
                    'amount' => $request->refund_amount,
                    'date' => now(),
                    'description' => 'Refund processed for Booking Cancellation #' . $booking->booking_no,
                    'payable_type' => $payerDetails['type'],
                    'payable_id' => $payerDetails['id'],
                    'reference_type' => $invoiceItem ? FinancialInvoiceItem::class : FinancialInvoice::class,
                    'reference_id' => $invoiceItem ? $invoiceItem->id : $invoice->id,
                    'invoice_id' => $invoice->id,
                    'created_by' => Auth::id(),
                ]);

                $notes .= "\n[Refund Processed: " . $request->refund_amount . ' via ' . $request->refund_mode . ']';
                if ($request->filled('refund_account')) {
                    $notes .= ' Account: ' . $request->refund_account;
                }
            }
        }

        $booking->additional_notes .= $notes;
        $booking->save();

        if ($booking->invoice) {
            $invoice = $booking->invoice->refresh();  // Refresh to get updated amounts
            if ($invoice->paid_amount == 0 && $invoice->advance_payment == 0) {
                // If balance is clear, status should be 'refunded' (if we refunded) or 'cancelled' (if it was unpaid)
                // Since we are checking post-logic, if we processed a refund, it might be 'refunded'.
                // Let's use 'refunded' if it was previously paid check, or 'cancelled' broadly.
                // Actually, if we just cancelled and it had 0 paid, it is 'cancelled'.
                // If we had paid > 0 and refunded it to 0, it is 'refunded'.
                // Simple logic: If balance is 0, match booking status (cancelled) or better 'refunded' if there was a transaction?
                // Let's check if we did a refund.
                if ($request->filled('refund_amount') && $request->refund_amount > 0) {
                    $invoice->update(['status' => 'refunded']);
                    $booking->status = 'refunded';  // Also update booking to refunded for consistency? Or keep cancelled? User wants 'refunded' if money returned.
                    $booking->save();
                } else {
                    // Just cancelled without refund (presumably unpaid or holding money).
                    // User requested NOT to change invoice status to 'cancelled'.
                    // So we keep it as 'paid' or 'unpaid'.
                }
            }
        }

        return redirect()->back()->with('success', 'Booking cancelled successfully');
    }

    public function processRefund(Request $request, $id)
    {
        $request->validate([
            'refund_amount' => 'required|numeric|min:1',
            'refund_mode' => 'required|string',
            'refund_account' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $booking = RoomBooking::with('invoice')->findOrFail($id);
        $invoice = $booking->invoice;

        $maxRefundable = max($invoice->paid_amount, $invoice->advance_payment);

        if (!$invoice || $request->refund_amount > $maxRefundable) {
            return redirect()->back()->withErrors(['refund_amount' => 'Refund amount cannot be greater than remaining refundable amount (' . $maxRefundable . ').']);
        }

        // Deduct logic: Prefer deducting from paid_amount first (if > 0), else from advance
        if ($invoice->paid_amount > 0) {
            $invoice->paid_amount = max(0, $invoice->paid_amount - $request->refund_amount);
        }
        // Also deduct from advance_payment if available, to reflect the 'advance returned' request
        if ($invoice->advance_payment > 0) {
            $invoice->advance_payment = max(0, $invoice->advance_payment - $request->refund_amount);
        }
        $invoice->save();

        // ✅ Determine Payer Details for Ledger
        $payerDetails = $this->getPayerDetails($invoice);

        // Find main invoice item to attach refund to
        $invoiceItem = $invoice->items()->where('fee_type', '1')->first() ?? $invoice->items()->first();

        // ✅ Create Refund Ledger Entry (Debit)
        Transaction::create([
            'type' => 'debit',
            'amount' => $request->refund_amount,
            'date' => now(),
            'description' => 'Refund processed (Post-Cancel) for Booking #' . $booking->booking_no,
            'payable_type' => $payerDetails['type'],
            'payable_id' => $payerDetails['id'],
            'reference_type' => $invoiceItem ? FinancialInvoiceItem::class : FinancialInvoice::class,
            'reference_id' => $invoiceItem ? $invoiceItem->id : $invoice->id,
            'invoice_id' => $invoice->id,
            'created_by' => Auth::id(),
        ]);

        // FINAL SETTLEMENT LOGIC:
        // We do NOT zero out the balance, so we keep record of what was retained (e.g. 100 tax).
        // But we mark status as 'refunded' so the UI hides the refund button (no more refunds allowed).

        $invoice->status = 'refunded';  // Mark as fully refunded/settled
        $invoice->save();

        // Update Booking Status
        $booking->status = 'refunded';

        $notes = "\n[Refund Processed (Post-Cancel): " . now()->toDateTimeString() . ']';
        $notes .= ' Amount: ' . $request->refund_amount . ' via ' . $request->refund_mode;
        if ($request->filled('refund_account')) {
            $notes .= ' Account: ' . $request->refund_account;
        }
        if ($request->filled('notes')) {
            $notes .= ' Note: ' . $request->notes;
        }

        $booking->additional_notes .= $notes;
        $booking->save();

        return redirect()->back()->with('success', 'Refund processed successfully');
    }

    private function getPayerDetails($invoice)
    {
        if ($invoice->member_id) {
            return ['type' => \App\Models\Member::class, 'id' => $invoice->member_id];
        } elseif ($invoice->corporate_member_id) {
            return ['type' => \App\Models\CorporateMember::class, 'id' => $invoice->corporate_member_id];
        } elseif ($invoice->customer_id) {
            return ['type' => \App\Models\Customer::class, 'id' => $invoice->customer_id];
        }
        return ['type' => null, 'id' => null];
    }

    public function undoBooking($id)
    {
        $booking = RoomBooking::findOrFail($id);

        // Logic to restrict undo time if needed (e.g. check updated_at)
        // For now, allow undo.
        // Revert to 'booked' or 'confirmed'? Usually 'booked' is the initial confirmed state in this system.
        $previousStatus = $booking->status;

        // Revert to 'confirmed'
        $booking->status = 'confirmed';

        // If it was refunded (money gone), we must reset financial records to reflect 'unpaid' state
        if ($previousStatus === 'refunded' || ($booking->invoice && $booking->invoice->status === 'refunded')) {
            if ($booking->invoice) {
                $booking->invoice->status = 'unpaid';
                $booking->invoice->advance_payment = 0;  // Clear advance since it was returned
                $booking->invoice->save();
            }
            $booking->security_deposit = 0;  // Clear security deposit since it was returned
        } elseif ($booking->invoice && $booking->invoice->status === 'cancelled') {
            // If just cancelled (money held), revert invoice to paid/unpaid based on balance
            $total = $booking->invoice->total_price;
            $paid = $booking->invoice->paid_amount + $booking->invoice->advance_payment;
            $booking->invoice->status = ($paid >= $total && $total > 0) ? 'paid' : 'unpaid';
            $booking->invoice->save();
        }

        // Optionally note the undo
        $booking->additional_notes .= "\n[Undo Cancel: " . now()->toDateTimeString() . ']';

        $booking->save();

        return redirect()->back()->with('success', 'Booking cancellation undone successfully');
    }

    public function searchCustomers(Request $request)
    {
        $query = $request->input('query');
        $type = $request->input('type', 'all');  // all, member, corporate, guest

        if (empty($query)) {
            return response()->json([]);
        }

        $results = collect();

        // 1. Members
        if ($type === 'all' || $type === 'member') {
            $members = \App\Models\Member::where('status', 'active')
                ->where(function ($q) use ($query) {
                    $q
                        ->where('full_name', 'like', "%{$query}%")
                        ->orWhere('membership_no', 'like', "%{$query}%");
                })
                ->limit(30)
                ->get()
                ->map(function ($m) {
                    return [
                        'label' => "{$m->full_name} (Member - {$m->membership_no})",
                        'value' => $m->full_name,
                        'type' => 'Member',
                        'name' => $m->full_name,
                        'membership_no' => $m->membership_no,
                        'status' => $m->status,
                    ];
                });
            $results = $results->merge($members);
        }

        // 2. Corporate Members
        if ($type === 'all' || $type === 'corporate') {
            $corporate = \App\Models\CorporateMember::where('status', 'active')
                ->where(function ($q) use ($query) {
                    $q
                        ->where('full_name', 'like', "%{$query}%")
                        ->orWhere('membership_no', 'like', "%{$query}%");
                })
                ->limit(30)
                ->get()
                ->map(function ($m) {
                    return [
                        'label' => "{$m->full_name} (Corporate - {$m->membership_no})",
                        'value' => $m->full_name,
                        'type' => 'Corporate',
                        'name' => $m->full_name,
                        'membership_no' => $m->membership_no,
                        'status' => $m->status,
                    ];
                });
            $results = $results->merge($corporate);
        }

        // 3. Guests (Customers)
        if ($type === 'all' || $type === 'guest') {
            $guests = \App\Models\Customer::query()
                ->where(function ($q) use ($query) {
                    $q
                        ->where('name', 'like', "%{$query}%")
                        ->orWhere('customer_no', 'like', "%{$query}%");
                })
                ->limit(30)
                ->get()
                ->map(function ($c) {
                    return [
                        'label' => "{$c->name} (Guest - {$c->customer_no})",
                        'value' => $c->name,
                        'type' => 'Guest',
                        'name' => $c->name,
                        'customer_no' => $c->customer_no,
                        'id' => $c->id,
                        'status' => null,  // Guests don't have a status column
                        'guest_type_id' => $c->guest_type_id,
                    ];
                });
            $results = $results->merge($guests);

            // 4. Past Event Guests (Names in EventBooking)
            // Search for guests who might not be in Customer table but booked an event
            $eventGuests = \App\Models\EventBooking::where('name', 'like', "%{$query}%")
                ->select('name')
                ->distinct()
                ->limit(5)
                ->get()
                ->map(function ($eb) {
                    return [
                        'label' => "{$eb->name} (Event Guest)",
                        'value' => $eb->name,
                        'type' => 'Guest',
                        'name' => $eb->name,
                        'membership_no' => 'N/A',
                        'status' => 'active',
                    ];
                });

            // Merge unique names
            $results = $results->merge($eventGuests);
        }

        // 4. Dynamic Guest Types
        if (str_starts_with($type, 'guest-')) {
            $guestTypeId = str_replace('guest-', '', $type);
            $guests = \App\Models\Customer::query()
                ->where('guest_type_id', $guestTypeId)
                ->where(function ($q) use ($query) {
                    $q
                        ->where('name', 'like', "%{$query}%")
                        ->orWhere('customer_no', 'like', "%{$query}%");
                })
                ->limit(30)
                ->get()
                ->map(function ($c) {
                    return [
                        'label' => "{$c->name} (Guest - {$c->customer_no})",
                        'value' => $c->name,
                        'type' => 'Guest',
                        'name' => $c->name,
                        'customer_no' => $c->customer_no,
                        'id' => $c->id,
                        'status' => null,
                        'booking_type' => 'guest',  // Important for store method logic
                    ];
                });
            $results = $results->merge($guests);
        }

        return response()->json($results);
    }
}
