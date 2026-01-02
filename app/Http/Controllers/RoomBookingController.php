<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use App\Models\FinancialInvoice;
use App\Models\Room;
use App\Models\RoomBooking;
use App\Models\RoomCategory;
use App\Models\RoomChargesType;
use App\Models\RoomMiniBar;
use App\Models\RoomType;
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
            if ($data['bookingType'] == '2') {
                $invoiceData['corporate_member_id'] = (int) $data['guest']['id'];
            } elseif (!empty($data['guest']['booking_type']) && $data['guest']['booking_type'] === 'member') {
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
            ->where('status', '!=', 'cancelled')
            ->where('status', '!=', 'cancelled')
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
            $isOccupied = RoomBooking::where('room_id', $booking->room_id)
                ->where('status', 'checked_in')
                ->where('id', '!=', $booking->id)
                ->exists();

            if ($isOccupied) {
                return response()->json(['message' => 'This room is currently occupied by another guest (Status: Checked In). Cannot check in new guest until the room is vacated.'], 422);
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
            'invoice:id,invoiceable_id,invoiceable_type,status,paid_amount,total_price,advance_payment'
        ])->whereIn('status', ['cancelled', 'refunded']);

        // Apply shared filters
        $this->applyFilters($query, $filters);

        $bookings = $query->orderBy('updated_at', 'desc')->paginate(20)->withQueryString();

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
                // Optionally update status if balance becomes due? But for cancellation, usually irrelevant.

                // However, logic says if cancelled, maybe we shouldn't care about balance?
                // But we want to reflect "money returned".

                $invoice->save();

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
                ->limit(10)
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
                ->limit(10)
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
                ->limit(10)
                ->get()
                ->map(function ($c) {
                    return [
                        'label' => "{$c->name} (Guest - {$c->customer_no})",
                        'value' => $c->name,
                        'type' => 'Guest',
                        'name' => $c->name,
                        'customer_no' => $c->customer_no,
                        'status' => null,  // Guests don't have a status column
                    ];
                });
            $results = $results->merge($guests);
        }

        return response()->json($results);
    }
}
