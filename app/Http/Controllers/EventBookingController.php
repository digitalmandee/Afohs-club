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
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class EventBookingController extends Controller
{
    public function index()
    {
        $bookings = EventBooking::with([
            'customer',
            'member:id,membership_no,full_name,personal_email',
            'eventVenue:id,name'
        ])
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

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
            'eventVenues' => $eventVenues
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

    public function store(Request $request)
    {
        $validated = $request->validate([
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
                'total_charges' => $request->grandTotal,
                'reduction_type' => $request->discountType,
                'reduction_amount' => $request->discount ?? 0,
                'total_price' => $request->grandTotal,
                'booking_docs' => json_encode($documentPaths),
                'additional_notes' => $request->notes ?? '',
                'status' => 'confirmed',
                'created_by' => $member_id,
            ];

            // ✅ Assign IDs based on booking_type (same as RoomBookingController)
            if (!empty($request->guest['booking_type']) && $request->guest['booking_type'] === 'member') {
                $bookingData['member_id'] = (int) $request->guest['id'];
                $bookingData['booking_type'] = '0'; // Member
            } else {
                $bookingData['customer_id'] = (int) $request->guest['id'];
                $bookingData['booking_type'] = '1'; // Guest
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
                'data' => [
                    'booking_id' => $eventBooking->id,
                    'booking_no' => $eventBooking->booking_no,
                    'booking_type' => 'event_booking',
                    'booking_data' => $eventBooking->toArray()
                ]
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

    /**
     * Show edit form for event booking
     */
    public function edit($id)
    {
        $booking = EventBooking::with([
            'customer',
            'member',
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
                'family_id' => $request->familyMember ?? null,
                'booked_by' => $request->bookedBy,
                'nature_of_event' => $request->natureOfEvent,
                'event_date' => $request->eventDate,
                'event_time_from' => $request->eventTimeFrom,
                'event_time_to' => $request->eventTimeTo,
                'event_venue_id' => $request->venue,
                'no_of_guests' => $request->numberOfGuests,
                'reduction_type' => $request->discountType,
                'reduction_amount' => $request->discount ?? 0,
                'total_price' => $request->grandTotal,
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

            // Update associated invoice
            $invoice = FinancialInvoice::where('invoice_type', 'event_booking')
                ->where(function ($query) use ($booking) {
                    if ($booking->customer_id) {
                        $query->where('customer_id', $booking->customer_id);
                    } else {
                        $query->where('member_id', $booking->member_id);
                    }
                })
                ->whereJsonContains('data->booking_id', $booking->id)
                ->first();

            if ($invoice) {
                $invoice->update([
                    'discount_type' => $request->discountType ?? null,
                    'discount_value' => $request->discount ?? 0,
                    'amount' => $request->grandTotal,
                    'total_price' => $request->grandTotal,
                    'data' => [
                        'booking_id' => $booking->id,
                        'booking_no' => $booking->booking_no,
                        'booking_type' => 'event_booking',
                        'booking_data' => $booking->fresh()->toArray()
                    ]
                ]);
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
            'familyMember:id,membership_no,full_name,personal_email',
            'eventVenue:id,name',
            'menu',
            'menuAddOns',
            'otherCharges'
        ])->findOrFail($id);

        // Get associated invoice
        $invoice = FinancialInvoice::where('invoice_type', 'event_booking')
            ->where(function ($query) use ($booking) {
                if ($booking->customer_id) {
                    $query->where('customer_id', $booking->customer_id);
                } else {
                    $query->where('member_id', $booking->member_id);
                }
            })
            ->whereJsonContains('data->booking_id', $booking->id)
            ->first();

        $booking->invoice = $invoice;
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
                'membership_no' => $booking->member->membership_no,
                'no_of_guests' => $booking->no_of_guests,
                'status' => $booking->status,
                'total_price' => $booking->total_price,
                'additional_notes' => $booking->additional_notes,
                'event_venue' => $booking->eventVenue,
                'customer' => $booking->customer,
                'member' => $booking->member,
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
    public function manage(Request $request)
    {
        $query = EventBooking::with([
            'customer:id,name,email,phone_number',
            'member:id,membership_no,full_name,personal_email',
            'eventVenue:id,name'
        ]);

        // Search by name
        if ($request->filled('search_name')) {
            $searchName = $request->search_name;
            $query->where(function ($q) use ($searchName) {
                $q->where('name', 'like', "%{$searchName}%")
                  ->orWhereHas('customer', function ($subQ) use ($searchName) {
                      $subQ->where('name', 'like', "%{$searchName}%");
                  })
                  ->orWhereHas('member', function ($subQ) use ($searchName) {
                      $subQ->where('full_name', 'like', "%{$searchName}%");
                  });
            });
        }

        // Search by booking ID
        if ($request->filled('search_id')) {
            $query->where('booking_no', 'like', "%{$request->search_id}%");
        }

        // Filter by booking date range
        if ($request->filled('booking_date_from')) {
            $query->whereDate('created_at', '>=', $request->booking_date_from);
        }
        if ($request->filled('booking_date_to')) {
            $query->whereDate('created_at', '<=', $request->booking_date_to);
        }

        // Filter by event date range
        if ($request->filled('event_date_from')) {
            $query->whereDate('event_date', '>=', $request->event_date_from);
        }
        if ($request->filled('event_date_to')) {
            $query->whereDate('event_date', '<=', $request->event_date_to);
        }

        // Filter by venues
        if ($request->filled('venues') && is_array($request->venues)) {
            $query->whereHas('eventVenue', function ($q) use ($request) {
                $q->whereIn('name', $request->venues);
            });
        }

        // Filter by status
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
                
                // Add booking status conditions
                if (!empty($bookingStatuses)) {
                    $q->orWhereIn('status', $bookingStatuses);
                }
                
                // Add invoice status conditions using exists queries
                if ($includesPaid) {
                    $q->orWhereExists(function ($subQ) {
                        $subQ->select(DB::raw(1))
                            ->from('financial_invoices')
                            ->where('invoice_type', 'event_booking')
                            ->whereRaw('JSON_CONTAINS(data, JSON_OBJECT("booking_id", event_bookings.id))')
                            ->where('status', 'paid');
                    });
                }
                
                if ($includesUnpaid) {
                    $q->orWhereExists(function ($subQ) {
                        $subQ->select(DB::raw(1))
                            ->from('financial_invoices')
                            ->where('invoice_type', 'event_booking')
                            ->whereRaw('JSON_CONTAINS(data, JSON_OBJECT("booking_id", event_bookings.id))')
                            ->where('status', 'unpaid');
                    });
                }
            });
        }

        $bookings = $query->orderBy('created_at', 'desc')->paginate(20);

        return inertia('App/Admin/Events/Manage', [
            'bookings' => $bookings,
            'filters' => $request->only(['search_name', 'search_id', 'booking_date_from', 'booking_date_to', 'event_date_from', 'event_date_to', 'venues', 'status'])
        ]);
    }

    /**
     * Show completed event bookings page
     */
    public function completed(Request $request)
    {
        $query = EventBooking::with([
            'customer:id,name,email,phone_number',
            'member:id,membership_no,full_name,personal_email',
            'eventVenue:id,name'
        ])->where('status', 'completed');

        // Apply same filters as manage method
        if ($request->filled('search_name')) {
            $searchName = $request->search_name;
            $query->where(function ($q) use ($searchName) {
                $q->where('name', 'like', "%{$searchName}%")
                  ->orWhereHas('customer', function ($subQ) use ($searchName) {
                      $subQ->where('name', 'like', "%{$searchName}%");
                  })
                  ->orWhereHas('member', function ($subQ) use ($searchName) {
                      $subQ->where('full_name', 'like', "%{$searchName}%");
                  });
            });
        }

        if ($request->filled('search_id')) {
            $query->where('booking_no', 'like', "%{$request->search_id}%");
        }

        if ($request->filled('booking_date_from')) {
            $query->whereDate('created_at', '>=', $request->booking_date_from);
        }
        if ($request->filled('booking_date_to')) {
            $query->whereDate('created_at', '<=', $request->booking_date_to);
        }

        if ($request->filled('event_date_from')) {
            $query->whereDate('event_date', '>=', $request->event_date_from);
        }
        if ($request->filled('event_date_to')) {
            $query->whereDate('event_date', '<=', $request->event_date_to);
        }

        if ($request->filled('venues') && is_array($request->venues)) {
            $query->whereHas('eventVenue', function ($q) use ($request) {
                $q->whereIn('name', $request->venues);
            });
        }

        $bookings = $query->orderBy('created_at', 'desc')->paginate(20);

        return inertia('App/Admin/Events/Completed', [
            'bookings' => $bookings,
            'filters' => $request->only(['search_name', 'search_id', 'booking_date_from', 'booking_date_to', 'event_date_from', 'event_date_to', 'venues'])
        ]);
    }

    /**
     * Show cancelled event bookings page
     */
    public function cancelled(Request $request)
    {
        $query = EventBooking::with([
            'customer:id,name,email,phone_number',
            'member:id,membership_no,full_name,personal_email',
            'eventVenue:id,name'
        ])->where('status', 'cancelled');

        // Apply same filters as manage method
        if ($request->filled('search_name')) {
            $searchName = $request->search_name;
            $query->where(function ($q) use ($searchName) {
                $q->where('name', 'like', "%{$searchName}%")
                  ->orWhereHas('customer', function ($subQ) use ($searchName) {
                      $subQ->where('name', 'like', "%{$searchName}%");
                  })
                  ->orWhereHas('member', function ($subQ) use ($searchName) {
                      $subQ->where('full_name', 'like', "%{$searchName}%");
                  });
            });
        }

        if ($request->filled('search_id')) {
            $query->where('booking_no', 'like', "%{$request->search_id}%");
        }

        if ($request->filled('booking_date_from')) {
            $query->whereDate('created_at', '>=', $request->booking_date_from);
        }
        if ($request->filled('booking_date_to')) {
            $query->whereDate('created_at', '<=', $request->booking_date_to);
        }

        if ($request->filled('event_date_from')) {
            $query->whereDate('event_date', '>=', $request->event_date_from);
        }
        if ($request->filled('event_date_to')) {
            $query->whereDate('event_date', '<=', $request->event_date_to);
        }

        if ($request->filled('venues') && is_array($request->venues)) {
            $query->whereHas('eventVenue', function ($q) use ($request) {
                $q->whereIn('name', $request->venues);
            });
        }

        $bookings = $query->orderBy('created_at', 'desc')->paginate(20);

        return inertia('App/Admin/Events/Cancelled', [
            'bookings' => $bookings,
            'filters' => $request->only(['search_name', 'search_id', 'booking_date_from', 'booking_date_to', 'event_date_from', 'event_date_to', 'venues'])
        ]);
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
}
