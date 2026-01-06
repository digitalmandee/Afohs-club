<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use App\Models\Booking;
use App\Models\BookingEvents;
use App\Models\Customer;
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

    public function store(Request $request)
    {
        $request->validate([
            'guest' => 'required',
            'bookedBy' => 'required|string',
            'natureOfEvent' => 'required|string',
            'eventDate' => 'required|date',
            'eventTimeFrom' => 'required|date_format:H:i',
            'eventTimeTo' => 'required|date_format:H:i',
            'venue' => 'required|exists:event_venues,id',
            'selectedMenu' => 'nullable|exists:event_menus,id',
            'numberOfGuests' => 'required|integer|min:1',
            'menu_addons' => 'nullable|array',
            'other_charges' => 'nullable|array',
            'discountType' => 'required|in:fixed,percentage',
            'discount' => 'nullable|numeric|min:0',
            'grandTotal' => 'required|numeric|min:0',
        ]);

        // Check for duplicate booking (overlapping time)
        $start = $request->eventTimeFrom;
        $end = $request->eventTimeTo;

        $existingBooking = EventBooking::where('event_venue_id', $request->venue)
            ->where('event_date', $request->eventDate)
            ->whereNotIn('status', ['cancelled', 'completed'])
            ->where(function ($query) use ($start, $end) {
                $query
                    ->where('event_time_from', '<', $end)
                    ->where('event_time_to', '>', $start);
            })
            ->exists();

        if ($existingBooking) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'venue' => ['This venue is already booked for the selected date and time slot.'],
            ]);
        }

        $member_id = Auth::user()->id;
        $bookingNo = $this->getBookingId();

        DB::beginTransaction();

        try {
            $documentPaths = [];
            if ($request->hasFile('documents')) {
                foreach ($request->file('documents') as $file) {
                    $documentPaths[] = FileHelper::saveImage($file, 'booking_documents');
                }
            }

            // Prepare booking data
            $bookingData = [
                'booking_no' => $bookingNo,
                'event_venue_id' => $request->venue,
                'family_id' => $request->familyMember ?? null,
                'name' => $request->guest['name'] ?? '',
                'address' => $request->guest['address'] ?? '',
                'cnic' => $request->guest['cnic'] ?? '',
                'mobile' => $request->guest['phone'] ?? '',
                'email' => $request->guest['email'] ?? '',
                'booking_date' => now()->toDateString(),
                'booked_by' => $request->bookedBy,
                'nature_of_event' => $request->natureOfEvent,
                'event_date' => $request->eventDate,
                'event_time_from' => $request->eventTimeFrom,
                'event_time_to' => $request->eventTimeTo,
                'menu_charges' => $request->menuAmount ?? 0,
                'addons_charges' => $this->calculateMenuAddOnsTotal($request->menu_addons ?? []),
                'total_per_person_charges' => ($request->menuAmount ?? 0) + $this->calculateMenuAddOnsTotal($request->menu_addons ?? []),
                'no_of_guests' => $request->numberOfGuests,
                'guest_charges' => (($request->menuAmount ?? 0) + $this->calculateMenuAddOnsTotal($request->menu_addons ?? [])) * $request->numberOfGuests,
                'total_food_charges' => (($request->menuAmount ?? 0) + $this->calculateMenuAddOnsTotal($request->menu_addons ?? [])) * $request->numberOfGuests,
                'total_other_charges' => $this->calculateOtherChargesTotal($request->other_charges ?? []),
                'total_charges' => round(floatval($request->grandTotal)),
                'reduction_type' => $request->discountType,
                'reduction_amount' => $request->discount ?? 0,
                'total_price' => round(floatval($request->grandTotal)),
                'booking_docs' => json_encode($documentPaths),
                'additional_notes' => $request->notes ?? '',
                'status' => 'confirmed',
                'created_by' => $member_id,
            ];

            // ✅ Assign IDs based on booking_type (same as RoomBookingController)
            if (!empty($request->guest['is_corporate']) || ($request->guest['booking_type'] ?? '') == '2') {
                $bookingData['corporate_member_id'] = (int) $request->guest['id'];
                $bookingData['booking_type'] = '2';  // Corporate Member
            } elseif (!empty($request->guest['booking_type']) && $request->guest['booking_type'] === 'member') {
                $bookingData['member_id'] = (int) $request->guest['id'];
                $bookingData['booking_type'] = '0';  // Member
            } else {
                $bookingData['customer_id'] = (int) $request->guest['id'];
                $bookingData['booking_type'] = '1';  // Guest
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
                            'is_complementary' => filter_var($addon['is_complementary'] ?? false, FILTER_VALIDATE_BOOLEAN),
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
                            'is_complementary' => filter_var($charge['is_complementary'] ?? false, FILTER_VALIDATE_BOOLEAN),
                        ]);
                    }
                }
            }

            // ✅ Create financial invoice using polymorphic relationship
            $invoice_no = $this->getInvoiceNo();

            // Calculate original amount (before discount) and final amount (after discount)
            $originalAmount = round($this->calculateOriginalAmount($request));
            $finalAmount = round(floatval($request->grandTotal));

            $invoiceData = [
                'invoice_no' => $invoice_no,
                'invoice_type' => 'event_booking',
                'discount_type' => $request->discountType ?? null,
                'discount_value' => $request->discount ?? 0,
                'amount' => $originalAmount,  // Original amount before discount
                'total_price' => $finalAmount,  // Final amount after discount
                'issue_date' => now(),
                'status' => 'unpaid',
                // Keep data for backward compatibility
                'data' => [
                    'booking_no' => $eventBooking->booking_no,
                    'booking_type' => 'event_booking'
                ]
            ];

            // ✅ Assign member/customer ID based on guest type
            if (!empty($request->guest['is_corporate']) || ($request->guest['booking_type'] ?? '') == '2') {
                $invoiceData['corporate_member_id'] = (int) $request->guest['id'];
            } elseif (!empty($request->guest['booking_type']) && $request->guest['booking_type'] === 'member') {
                $invoiceData['member_id'] = (int) $request->guest['id'];
            } else {
                $invoiceData['customer_id'] = (int) $request->guest['id'];
            }

            // ✅ Use relationship to create invoice (automatically sets invoiceable_id and invoiceable_type)
            $invoice = $eventBooking->invoice()->create($invoiceData);

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

    private function getBookingId()
    {
        $maxBookingNo = EventBooking::withTrashed()
            ->selectRaw('MAX(CAST(booking_no AS UNSIGNED)) as max_no')
            ->value('max_no');

        return ($maxBookingNo ? (int) $maxBookingNo : 0) + 1;
    }

    private function getInvoiceNo()
    {
        $invoiceNo = FinancialInvoice::withTrashed()->max('invoice_no');
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

    /**
     * Show edit form for event booking
     */
    public function edit($id)
    {
        $booking = EventBooking::with([
            'customer',
            'member',
            'corporateMember',
            'eventVenue',
            'menu',
            'menuAddOns',
            'otherCharges'
        ])->findOrFail($id);

        // Get the same data as create form
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

        return Inertia::render('App/Admin/Events/CreateBooking', [
            'bookingNo' => $booking->booking_no,
            'eventVenues' => $eventVenues,
            'chargesTypeItems' => $chargesTypeItems,
            'eventMenus' => $eventMenus,
            'menuCategoryItems' => $menuCategoryItems,
            'menuAddOnItems' => $menuAddOnItems,
            'editMode' => true,
            'bookingData' => [
                ...$booking->toArray(),
                'menuAddOns' => $booking->menuAddOns->toArray(),
                'otherCharges' => $booking->otherCharges->toArray(),
                'menu' => $booking->menu ? $booking->menu->toArray() : null,
                'member' => $booking->member ? $booking->member->toArray() : null,
                'corporateMember' => $booking->corporateMember ? $booking->corporateMember->toArray() : null,
                'customer' => $booking->customer ? $booking->customer->toArray() : null,
                'eventVenue' => $booking->eventVenue ? $booking->eventVenue->toArray() : null,
            ]
        ]);
    }

    /**
     * Update event booking
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'bookedBy' => 'required|string',
            'natureOfEvent' => 'required|string',
            'eventDate' => 'required|date',
            'eventTimeFrom' => 'required',
            'eventTimeTo' => 'required',
            'venue' => 'required|exists:event_venues,id',
            'numberOfGuests' => 'required|integer|min:1',
            'grandTotal' => 'required|numeric|min:0',
        ]);

        // Check for duplicate booking (overlapping time)
        $start = $request->eventTimeFrom;
        $end = $request->eventTimeTo;

        $existingBooking = EventBooking::where('event_venue_id', $request->venue)
            ->where('event_date', $request->eventDate)
            ->whereNotIn('status', ['cancelled', 'completed'])
            ->where('id', '!=', $id)
            ->where(function ($query) use ($start, $end) {
                $query
                    ->where('event_time_from', '<', $end)
                    ->where('event_time_to', '>', $start);
            })
            ->exists();

        if ($existingBooking) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'venue' => ['This venue is already booked for the selected date and time slot.'],
            ]);
        }

        DB::beginTransaction();

        try {
            $booking = EventBooking::findOrFail($id);

            // Handle document uploads if any
            $oldDocs = $booking->booking_docs ? json_decode($booking->booking_docs, true) : [];
            $documentPaths = [];

            // Handle file uploads (new files from drag & drop or file input)
            if ($request->hasFile('documents')) {
                foreach ($request->file('documents') as $file) {
                    $documentPaths[] = FileHelper::saveImage($file, 'booking_documents');
                }
            }

            // Handle existing documents (paths sent from frontend)
            if ($request->has('existingDocuments') && is_array($request->existingDocuments)) {
                foreach ($request->existingDocuments as $existingDoc) {
                    if (!empty($existingDoc)) {
                        $documentPaths[] = $existingDoc;
                    }
                }
            }

            // If no documents field but we have existing docs, keep them
            if (!$request->hasFile('documents') && !$request->has('existingDocuments') && !empty($oldDocs)) {
                $documentPaths = $oldDocs;
            }

            // Step 2: Find deleted docs (compare old docs with new document paths)
            $deleted = array_diff($oldDocs, $documentPaths);

            // Step 3: Delete them from filesystem
            foreach ($deleted as $docPath) {
                $absolutePath = public_path(ltrim($docPath, '/'));

                if (file_exists($absolutePath)) {
                    @unlink($absolutePath);
                }
            }

            // Update booking data (don't change member/customer info)
            $booking->update([
                'booked_by' => $request->bookedBy,
                'nature_of_event' => $request->natureOfEvent,
                'event_date' => $request->eventDate,
                'event_time_from' => $request->eventTimeFrom,
                'event_time_to' => $request->eventTimeTo,
                'event_venue_id' => $request->venue,
                'no_of_guests' => $request->numberOfGuests,
                'reduction_type' => $request->discountType,
                'reduction_amount' => $request->discount ?? 0,
                'total_price' => round(floatval($request->grandTotal)),
                'booking_docs' => json_encode($documentPaths),
                'additional_notes' => $request->notes ?? '',
            ]);

            // Update menu if changed
            if ($request->selectedMenu) {
                // Delete existing menu
                $booking->menu()->delete();

                // Create new menu
                $selectedMenu = EventMenu::find($request->selectedMenu);
                EventBookingMenu::create([
                    'event_booking_id' => $booking->id,
                    'event_menu_id' => $request->selectedMenu,
                    'name' => $selectedMenu->name,
                    'amount' => $selectedMenu->amount,
                    'items' => $request->menuItems ?? [],
                ]);
            }

            // Update menu add-ons
            $booking->menuAddOns()->delete();
            if ($request->menu_addons) {
                foreach ($request->menu_addons as $addon) {
                    if (!empty($addon['type'])) {
                        EventBookingMenuAddOn::create([
                            'event_booking_id' => $booking->id,
                            'type' => $addon['type'],
                            'details' => $addon['details'] ?? '',
                            'amount' => $addon['amount'] ?? 0,
                            'is_complementary' => filter_var($addon['is_complementary'] ?? false, FILTER_VALIDATE_BOOLEAN),
                        ]);
                    }
                }
            }

            // Update other charges
            $booking->otherCharges()->delete();
            if ($request->other_charges) {
                foreach ($request->other_charges as $charge) {
                    if (!empty($charge['type'])) {
                        EventBookingOtherCharges::create([
                            'event_booking_id' => $booking->id,
                            'type' => $charge['type'],
                            'details' => $charge['details'] ?? '',
                            'amount' => $charge['amount'] ?? 0,
                            'is_complementary' => filter_var($charge['is_complementary'] ?? false, FILTER_VALIDATE_BOOLEAN),
                        ]);
                    }
                }
            }

            // ✅ Update associated invoice using polymorphic relationship
            $invoice = $booking->invoice;

            if ($invoice) {
                // Calculate original amount (before discount) and final amount (after discount)
                $originalAmount = round($this->calculateOriginalAmount($request));
                $finalAmount = round(floatval($request->grandTotal));

                $invoiceData = [
                    'discount_type' => $request->discountType ?? null,
                    'discount_value' => $request->discount ?? 0,
                    'amount' => $originalAmount,  // Original amount before discount
                    'total_price' => $finalAmount,  // Final amount after discount
                ];

                // Update member/customer/corporate ID if guest type changes
                // Note: The frontend might not be sending the full guest object in 'update' if it wasn't changed.
                // However, based on the request logic, likely the whole form is submitted.
                // We should check if guest info is present in request.

                // Based on store logic:
                if (!empty($request->guest['is_corporate']) || ($request->guest['booking_type'] ?? '') == '2') {
                    $invoiceData['corporate_member_id'] = (int) $request->guest['id'];
                    $invoiceData['member_id'] = null;
                    $invoiceData['customer_id'] = null;
                } elseif (!empty($request->guest['booking_type']) && $request->guest['booking_type'] === 'member') {
                    $invoiceData['member_id'] = (int) $request->guest['id'];
                    $invoiceData['corporate_member_id'] = null;
                    $invoiceData['customer_id'] = null;
                } elseif (!empty($request->guest['id'])) {
                    $invoiceData['customer_id'] = (int) $request->guest['id'];
                    $invoiceData['member_id'] = null;
                    $invoiceData['corporate_member_id'] = null;
                }

                $invoice->update($invoiceData);
            }

            DB::commit();

            return response()->json([
                'message' => 'Event booking updated successfully',
                'booking_no' => $booking->booking_no,
                'invoice_no' => $invoice->invoice_no ?? null,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Event booking update failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update event booking'], 500);
        }
    }

    /**
     * Show event booking invoice
     */
    public function showInvoice($id)
    {
        $booking = EventBooking::with([
            'customer',
            'member:id,membership_no,full_name,personal_email',
            'corporateMember:id,membership_no,full_name,personal_email',
            'familyMember:id,membership_no,full_name,personal_email',
            'eventVenue:id,name',
            'menu',
            'menuAddOns',
            'otherCharges',
            'invoice'  // ✅ Eager load invoice using polymorphic relationship
        ])->findOrFail($id);

        return response()->json(['booking' => $booking]);
    }

    /**
     * Update event booking status
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,completed,cancelled',
            'completed_time' => 'nullable|date_format:H:i',
            'cancellation_reason' => 'nullable|string'
        ]);

        $booking = EventBooking::findOrFail($id);

        $booking->status = $request->status;

        if ($request->status === 'completed' && $request->completed_time) {
            $booking->additional_data = array_merge(
                $booking->additional_data ?? [],
                ['completed_time' => $request->completed_time]
            );
        }

        if ($request->status === 'cancelled' && $request->cancellation_reason) {
            $booking->additional_data = array_merge(
                $booking->additional_data ?? [],
                ['cancellation_reason' => $request->cancellation_reason]
            );
        }

        $booking->save();

        return response()->json(['success' => true, 'message' => 'Booking status updated successfully']);
    }

    /**
     * Get calendar data for event bookings
     */
    public function calendarData(Request $request)
    {
        $month = $request->get('month', date('m'));
        $year = $request->get('year', date('Y'));

        // Get start and end dates for the month
        $startDate = "{$year}-{$month}-01";
        $endDate = date('Y-m-t', strtotime($startDate));

        // Get all event venues
        $venues = EventVenue::select('id', 'name')
            ->orderBy('name')
            ->get();

        // Get bookings for the month
        $bookings = EventBooking::with([
            'customer:id,name,email',
            'member:id,membership_no,full_name,personal_email',
            'corporateMember:id,membership_no,full_name,personal_email',
            'eventVenue:id,name'
        ])
            ->whereBetween('event_date', [$startDate, $endDate])
            ->orderBy('event_date')
            ->orderBy('event_time_from')
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'booking_no' => $booking->booking_no,
                    'event_venue_id' => $booking->event_venue_id,
                    'event_date' => $booking->event_date,
                    'event_time_from' => $booking->event_time_from,
                    'event_time_to' => $booking->event_time_to,
                    'nature_of_event' => $booking->nature_of_event,
                    'booked_by' => $booking->booked_by,
                    'name' => $booking->name,
                    'mobile' => $booking->mobile,
                    'membership_no' => $booking->member ? $booking->member->membership_no : ($booking->corporateMember ? $booking->corporateMember->membership_no : ($booking->customer ? $booking->customer->customer_no : null)),
                    'no_of_guests' => $booking->no_of_guests,
                    'status' => $booking->status,
                    'total_price' => $booking->total_price,
                    'additional_notes' => $booking->additional_notes,
                    'event_venue' => $booking->eventVenue,
                    'customer' => $booking->customer,
                    'member' => $booking->member,
                    'corporateMember' => $booking->corporateMember,
                ];
            });

        return response()->json([
            'venues' => $venues,
            'bookings' => $bookings
        ]);
    }

    /**
     * Show all event bookings page
     */
    public function index(Request $request)
    {
        $query = EventBooking::with([
            'customer',
            'member:id,membership_no,full_name,personal_email',
            'corporateMember:id,membership_no,full_name,personal_email',
            'eventVenue:id,name'
        ]);

        // Apply centralized filters
        $filters = $request->only(['search', 'search_id', 'customer_type', 'booking_date_from', 'booking_date_to', 'event_date_from', 'event_date_to']);
        $this->applyFilters($query, $filters);

        $bookings = $query->orderBy('created_at', 'desc')->limit(20)->get();

        $data = [
            'bookingsData' => $bookings,
            'totalEventBookings' => EventBooking::count(),
            'availableVenuesToday' => EventVenue::where('status', 'active')->count(),
            'confirmedBookings' => EventBooking::where('status', 'confirmed')->count(),
            'completedBookings' => EventBooking::where('status', 'completed')->count(),
        ];

        $eventVenues = EventVenue::where('status', 'active')->get();

        return Inertia::render('App/Admin/Events/BookingDashboard', [
            'data' => $data,
            'filters' => $filters,
            'eventVenues' => $eventVenues
        ]);
    }

    // ... (create, store, edit, update, showInvoice, updateStatus, calendarData methods remain unchanged) ...

    public function manage(Request $request)
    {
        $query = EventBooking::with([
            'customer:id,name,email,contact',
            'member:id,membership_no,full_name,personal_email',
            'corporateMember:id,membership_no,full_name,personal_email',
            'eventVenue:id,name'
        ]);

        $filters = $request->only(['search', 'search_id', 'customer_type', 'booking_date_from', 'booking_date_to', 'event_date_from', 'event_date_to', 'venues', 'status']);
        $this->applyFilters($query, $filters);

        // Filter by venues (specific to manage/completed/cancelled pages which have extra venue filter)
        if ($request->filled('venues') && is_array($request->venues)) {
            $query->whereHas('eventVenue', function ($q) use ($request) {
                $q->whereIn('name', $request->venues);
            });
        }

        // Filter by status (specific extra logic for manage page)
        if ($request->filled('status') && is_array($request->status)) {
            $query->where(function ($q) use ($request) {
                $bookingStatuses = [];
                $includesPaid = false;
                $includesUnpaid = false;

                foreach ($request->status as $status) {
                    if (in_array($status, ['confirmed', 'completed', 'cancelled'])) {
                        $bookingStatuses[] = $status;
                    } elseif ($status === 'paid') {
                        $includesPaid = true;
                    } elseif ($status === 'unpaid') {
                        $includesUnpaid = true;
                    }
                }

                if (!empty($bookingStatuses)) {
                    $q->orWhereIn('status', $bookingStatuses);
                }

                if ($includesPaid) {
                    $q->orWhereExists(function ($subQ) {
                        $subQ
                            ->select(DB::raw(1))
                            ->from('financial_invoices')
                            ->where('invoice_type', 'event_booking')
                            ->whereRaw('JSON_CONTAINS(data, JSON_OBJECT("booking_id", event_bookings.id))')
                            ->where('status', 'paid');
                    });
                }
                if ($includesUnpaid) {
                    $q->orWhereExists(function ($subQ) {
                        $subQ
                            ->select(DB::raw(1))
                            ->from('financial_invoices')
                            ->where('invoice_type', 'event_booking')
                            ->whereRaw('JSON_CONTAINS(data, JSON_OBJECT("booking_id", event_bookings.id))')
                            ->where('status', 'unpaid');
                    });
                }
            });
        }

        $bookings = $query->orderBy('created_at', 'desc')->paginate(20)->withQueryString();

        return inertia('App/Admin/Events/Manage', [
            'bookings' => $bookings,
            'filters' => $filters
        ]);
    }

    public function completed(Request $request)
    {
        $query = EventBooking::with([
            'customer:id,name,email,contact',
            'member:id,membership_no,full_name,personal_email',
            'corporateMember:id,membership_no,full_name,personal_email',
            'eventVenue:id,name'
        ])->where('status', 'completed');

        $filters = $request->only(['search', 'search_id', 'customer_type', 'booking_date_from', 'booking_date_to', 'event_date_from', 'event_date_to', 'venues']);
        $this->applyFilters($query, $filters);

        if ($request->filled('venues') && is_array($request->venues)) {
            $query->whereHas('eventVenue', function ($q) use ($request) {
                $q->whereIn('name', $request->venues);
            });
        }

        $bookings = $query->orderBy('created_at', 'desc')->paginate(20)->withQueryString();

        return inertia('App/Admin/Events/Completed', [
            'bookings' => $bookings,
            'filters' => $filters
        ]);
    }

    public function cancelled(Request $request)
    {
        $query = EventBooking::with([
            'customer:id,name,email,contact',
            'member:id,membership_no,full_name,personal_email',
            'corporateMember:id,membership_no,full_name,personal_email',
            'eventVenue:id,name'
        ])->where('status', 'cancelled');

        $filters = $request->only(['search', 'search_id', 'customer_type', 'booking_date_from', 'booking_date_to', 'event_date_from', 'event_date_to', 'venues']);
        $this->applyFilters($query, $filters);

        if ($request->filled('venues') && is_array($request->venues)) {
            $query->whereHas('eventVenue', function ($q) use ($request) {
                $q->whereIn('name', $request->venues);
            });
        }

        $bookings = $query->orderBy('created_at', 'desc')->paginate(20)->withQueryString();

        return inertia('App/Admin/Events/Cancelled', [
            'bookings' => $bookings,
            'filters' => $filters
        ]);
    }

    /**
     * Apply common filters to the query
     */
    private function applyFilters($query, $filters)
    {
        // 1. Customer Type Filter
        $customerType = $filters['customer_type'] ?? 'all';
        // Note: The original 'manage' search logic conflated search term with type check somewhat.
        // Here we explictly filter by type if selected.
        if ($customerType === 'member') {
            $query->whereNotNull('member_id');
        } elseif ($customerType === 'corporate') {
            $query->whereNotNull('corporate_member_id');
        } elseif ($customerType === 'guest') {
            $query
                ->whereNotNull('customer_id')
                ->whereNull('member_id')
                ->whereNull('corporate_member_id');
        }

        // 2. Search Filter (Name, ID, etc.)
        // This 'search' comes from the unified search box in BookingFilter
        // It replaces 'search_name' from the old logic, but we should support both or map them.
        // We will prioritize 'search' but fallback to 'search_name' if passed (legacy support or if frontend uses it).
        $search = $filters['search'] ?? ($filters['search_name'] ?? null);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q
                    ->where('name', 'like', "%{$search}%")  // Guest Name stored directly on booking sometimes? Or is it 'name' column?
                    ->orWhere('booking_no', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($sub) use ($search) {
                        $sub
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('customer_no', 'like', "%{$search}%");
                    })
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
                    ->orWhereHas('eventVenue', function ($sub) use ($search) {
                        $sub->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // 3. Search by ID (Specific field)
        if (!empty($filters['search_id'])) {
            $query->where('booking_no', 'like', "%{$filters['search_id']}%");
        }

        // 4. Booking Date Range
        if (!empty($filters['booking_date_from'])) {
            $query->whereDate('created_at', '>=', $filters['booking_date_from']);
        }
        if (!empty($filters['booking_date_to'])) {
            $query->whereDate('created_at', '<=', $filters['booking_date_to']);
        }

        // 5. Event Date Range
        if (!empty($filters['event_date_from'])) {
            $query->whereDate('event_date', '>=', $filters['event_date_from']);
        }
        if (!empty($filters['event_date_to'])) {
            $query->whereDate('event_date', '<=', $filters['event_date_to']);
        }
    }

    /**
     * Get available venues for filter dropdown
     */
    public function getVenues()
    {
        $venues = EventVenue::select('id', 'name')
            ->orderBy('name')
            ->get()
            ->map(function ($venue) {
                return [
                    'value' => $venue->name,
                    'label' => $venue->name
                ];
            });

        return response()->json($venues);
    }

    /**
     * Calculate original amount before discount
     */
    private function calculateOriginalAmount($request)
    {
        // Calculate total other charges (excluding complementary items)
        $totalOtherCharges = 0;
        if (!empty($request->other_charges)) {
            foreach ($request->other_charges as $charge) {
                if (!filter_var($charge['is_complementary'] ?? false, FILTER_VALIDATE_BOOLEAN)) {
                    $totalOtherCharges += floatval($charge['amount'] ?? 0);
                }
            }
        }

        // Calculate total menu add-ons (excluding complementary items)
        $totalMenuAddOns = 0;
        if (!empty($request->menu_addons)) {
            foreach ($request->menu_addons as $addon) {
                if (!filter_var($addon['is_complementary'] ?? false, FILTER_VALIDATE_BOOLEAN)) {
                    $totalMenuAddOns += floatval($addon['amount'] ?? 0);
                }
            }
        }

        // Calculate menu charges
        $menuAmount = floatval($request->menuAmount ?? 0);
        $numberOfGuests = intval($request->numberOfGuests ?? 1);
        $perPersonMenuCharges = $menuAmount + $totalMenuAddOns;
        $totalMenuCharges = $perPersonMenuCharges * $numberOfGuests;

        // Base total (before discount)
        $baseTotal = $totalOtherCharges + $totalMenuCharges;

        return $baseTotal;
    }
}
