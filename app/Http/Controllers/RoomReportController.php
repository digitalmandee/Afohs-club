<?php

namespace App\Http\Controllers;

use App\Models\FinancialReceipt;
use App\Models\Room;
use App\Models\RoomBooking;
use App\Models\RoomBookingMiniBarItem;
use App\Models\RoomBookingOtherCharge;
use App\Models\RoomType;
use App\Models\TransactionRelation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class RoomReportController extends Controller
{
    /**
     * Reports Dashboard - Index page with all report links
     */
    public function index()
    {
        $reports = [
            [
                'id' => 1,
                'title' => 'Day-wise Report',
                'description' => 'Daily occupancy and revenue summary',
                'icon' => 'Today',
                'color' => '#063455',
                'route' => 'rooms.reports.day-wise',
                'stats' => 'Daily Stats'
            ],
            [
                'id' => 2,
                'title' => 'Room-wise Payment History',
                'description' => 'Payment history and outstanding balances per room/booking',
                'icon' => 'History',
                'color' => '#063455',
                'route' => 'rooms.reports.payment-history',
                'stats' => 'Payments'
            ],
            [
                'id' => 4,
                'title' => 'Cancelled Bookings Report',
                'description' => 'List of cancelled and refunded bookings',
                'icon' => 'Cancel',
                'color' => '#d32f2f',
                'route' => 'rooms.reports.cancelled',
                'stats' => 'Cancellations'
            ],
            [
                'id' => 5,
                'title' => 'Check-in Report',
                'description' => 'Guest arrival logs and details',
                'icon' => 'Login',
                'color' => '#063455',
                'route' => 'rooms.reports.check-in',
                'stats' => 'Arrivals'
            ],
            [
                'id' => 6,
                'title' => 'Check-out Report',
                'description' => 'Guest departure logs and billing details',
                'icon' => 'Logout',
                'color' => '#063455',
                'route' => 'rooms.reports.check-out',
                'stats' => 'Departures'
            ],
            [
                'id' => 7,
                'title' => 'Member-wise Report',
                'description' => 'Booking history aggregated by member',
                'icon' => 'Person',
                'color' => '#063455',
                'route' => 'rooms.reports.member-wise',
                'stats' => 'Member History'
            ],
            [
                'id' => 8,
                'title' => 'Mini-bar Report',
                'description' => 'Usage and revenue from mini-bar items',
                'icon' => 'Kitchen',
                'color' => '#063455',
                'route' => 'rooms.reports.mini-bar',
                'stats' => 'Mini-bar'
            ],
            [
                'id' => 9,
                'title' => 'Complementary Items Report',
                'description' => 'Log of complementary items provided',
                'icon' => 'CardGiftcard',
                'color' => '#063455',
                'route' => 'rooms.reports.complementary',
                'stats' => 'Free Items'
            ],
            [
                'id' => 10,
                'title' => 'Receivables Report',
                'description' => 'Receipts received against room booking invoices',
                'icon' => 'History',
                'color' => '#063455',
                'route' => 'rooms.reports.receivables',
                'stats' => 'Receipts'
            ],
        ];

        return Inertia::render('App/Admin/Rooms/Reports/Index', [
            'reports' => $reports
        ]);
    }

    // --- Report Methods ---

    /**
     * Day-wise Report
     */
    public function dayWise(Request $request)
    {
        $filters = $request->all();

        if (
            empty($filters['booking_date_from']) &&
            empty($filters['booking_date_to']) &&
            empty($filters['check_in_from']) &&
            empty($filters['check_in_to']) &&
            empty($filters['check_out_from']) &&
            empty($filters['check_out_to'])
        ) {
            $filters['booking_date_from'] = Carbon::now()->startOfMonth()->format('Y-m-d');
            $filters['booking_date_to'] = Carbon::now()->format('Y-m-d');
        }

        $query = RoomBooking::with(['room.roomType', 'customer', 'member', 'corporateMember', 'invoice', 'orders'])
            ->orderBy('check_in_date', 'desc');

        $query = $this->applyFilters($query, $filters);

        $bookings = $query->paginate(30)->appends($request->query());

        $bookings->getCollection()->transform(function ($booking) {
            $roomTotal = (float) ($booking->grand_total ?? 0);
            $invoiceTotal = (float) ($booking->invoice?->total_price ?? 0);

            $ordersTotal = collect($booking->orders ?? [])->sum(function ($o) {
                return (float) ($o->total_price ?? $o->total ?? $o->grand_total ?? 0);
            });
            $paidOrders = collect($booking->orders ?? [])->filter(function ($o) {
                return strtolower((string) ($o->payment_status ?? '')) === 'paid';
            })->sum(function ($o) {
                return (float) ($o->total_price ?? $o->total ?? $o->grand_total ?? 0);
            });

            $invoiceCoversOrders = $invoiceTotal > $roomTotal + 0.01;
            $totalPayable = $invoiceCoversOrders ? $invoiceTotal : ($roomTotal + $ordersTotal);

            $advanceSecurity = (float) ($booking->advance_amount ?? 0) + (float) ($booking->security_deposit ?? 0);
            $invoicePaidTotal = (float) ($booking->invoice?->paid_amount ?? 0) + (float) ($booking->invoice?->advance_payment ?? 0);
            $paidAfterAdvance = max(0, $invoicePaidTotal - (float) ($booking->advance_amount ?? 0));
            $paidTotal = $paidAfterAdvance + ($invoiceCoversOrders ? 0 : $paidOrders);

            $booking->computed_total = round($totalPayable);
            $booking->computed_advance_security = round($advanceSecurity);
            $booking->computed_paid_total = round($paidTotal);
            $booking->computed_balance = round(max(0, $totalPayable - $advanceSecurity - $paidTotal));

            return $booking;
        });

        return Inertia::render('App/Admin/Rooms/Reports/DayWise', [
            'bookings' => $bookings,
            'filters' => $filters,
            'roomTypes' => RoomType::select('id', 'name')->get(),
            'rooms' => Room::select('id', 'name')->get(),
        ]);
    }

    public function dayWiseExport(Request $request)
    {
        $filters = $request->all();
        $query = RoomBooking::with(['room.roomType', 'customer', 'member', 'corporateMember', 'invoice', 'orders'])->orderBy('check_in_date', 'desc');
        $query = $this->applyFilters($query, $filters);

        return $this->streamCsv($query, function ($row) {
            $roomTotal = (float) ($row->grand_total ?? 0);
            $invoiceTotal = (float) ($row->invoice?->total_price ?? 0);
            $ordersTotal = collect($row->orders ?? [])->sum(fn($o) => (float) ($o->total_price ?? $o->total ?? $o->grand_total ?? 0));
            $paidOrders = collect($row->orders ?? [])->filter(fn($o) => strtolower((string) ($o->payment_status ?? '')) === 'paid')->sum(fn($o) => (float) ($o->total_price ?? $o->total ?? $o->grand_total ?? 0));

            $invoiceCoversOrders = $invoiceTotal > $roomTotal + 0.01;
            $totalPayable = $invoiceCoversOrders ? $invoiceTotal : ($roomTotal + $ordersTotal);

            $advanceSecurity = (float) ($row->advance_amount ?? 0) + (float) ($row->security_deposit ?? 0);
            $invoicePaidTotal = (float) ($row->invoice?->paid_amount ?? 0) + (float) ($row->invoice?->advance_payment ?? 0);
            $paidAfterAdvance = max(0, $invoicePaidTotal - (float) ($row->advance_amount ?? 0));
            $paidTotal = $paidAfterAdvance + ($invoiceCoversOrders ? 0 : $paidOrders);
            $balance = max(0, $totalPayable - $advanceSecurity - $paidTotal);

            return [
                $row->booking_no,
                $this->getGuestName($row),
                $row->room->name ?? 'N/A',
                $row->room->roomType->name ?? 'N/A',
                $row->booking_date,
                $row->check_in_date,
                $row->check_out_date,
                $row->status,
                round($totalPayable),
                round($advanceSecurity),
                round($paidTotal),
                round($balance),
            ];
        }, ['Booking No', 'Guest', 'Room', 'Room Type', 'Booking Date', 'Check In', 'Check Out', 'Status', 'Total', 'Advance/Security', 'Paid Total', 'Balance'], 'day-wise-report.csv');
    }

    public function dayWisePrint(Request $request)
    {
        $filters = $request->all();
        $query = RoomBooking::with(['room.roomType', 'customer', 'member', 'corporateMember', 'invoice', 'orders'])->orderBy('check_in_date', 'desc');
        $query = $this->applyFilters($query, $filters);
        $bookings = $query->get();

        $bookings->transform(function ($booking) {
            $roomTotal = (float) ($booking->grand_total ?? 0);
            $invoiceTotal = (float) ($booking->invoice?->total_price ?? 0);

            $ordersTotal = collect($booking->orders ?? [])->sum(fn($o) => (float) ($o->total_price ?? $o->total ?? $o->grand_total ?? 0));
            $paidOrders = collect($booking->orders ?? [])->filter(fn($o) => strtolower((string) ($o->payment_status ?? '')) === 'paid')->sum(fn($o) => (float) ($o->total_price ?? $o->total ?? $o->grand_total ?? 0));

            $invoiceCoversOrders = $invoiceTotal > $roomTotal + 0.01;
            $totalPayable = $invoiceCoversOrders ? $invoiceTotal : ($roomTotal + $ordersTotal);

            $advanceSecurity = (float) ($booking->advance_amount ?? 0) + (float) ($booking->security_deposit ?? 0);
            $invoicePaidTotal = (float) ($booking->invoice?->paid_amount ?? 0) + (float) ($booking->invoice?->advance_payment ?? 0);
            $paidAfterAdvance = max(0, $invoicePaidTotal - (float) ($booking->advance_amount ?? 0));
            $paidTotal = $paidAfterAdvance + ($invoiceCoversOrders ? 0 : $paidOrders);

            $booking->computed_total = round($totalPayable);
            $booking->computed_advance_security = round($advanceSecurity);
            $booking->computed_paid_total = round($paidTotal);
            $booking->computed_balance = round(max(0, $totalPayable - $advanceSecurity - $paidTotal));

            return $booking;
        });

        return Inertia::render('App/Admin/Rooms/Reports/DayWisePrint', [
            'bookings' => $bookings,
            'filters' => $filters,
            'generatedAt' => now()->format('d M Y, h:i A')
        ]);
    }

    /**
     * Cancelled Report
     */
    public function cancelled(Request $request)
    {
        $filters = $request->all();

        if (empty($filters['booking_date_from']) && empty($filters['booking_date_to']) && empty($filters['check_in_from']) && empty($filters['check_in_to']) && empty($filters['check_out_from']) && empty($filters['check_out_to'])) {
            $filters['booking_date_from'] = Carbon::now()->startOfMonth()->format('Y-m-d');
            $filters['booking_date_to'] = Carbon::now()->format('Y-m-d');
        }

        $query = RoomBooking::with(['room.roomType', 'customer', 'member', 'corporateMember', 'invoice'])
            ->whereIn('status', ['cancelled', 'refunded'])
            ->orderByDesc('booking_date')
            ->orderByDesc('id');

        $query = $this->applyFilters($query, $filters);

        $bookings = $query->paginate(30)->appends($request->query());

        return Inertia::render('App/Admin/Rooms/Reports/Cancelled', [
            'bookings' => $bookings,
            'filters' => $filters,
            'roomTypes' => RoomType::select('id', 'name')->get(),
            'rooms' => Room::select('id', 'name')->get(),
        ]);
    }

    public function cancelledExport(Request $request)
    {
        $filters = $request->all();
        $query = RoomBooking::with(['room.roomType', 'customer', 'member', 'corporateMember', 'invoice'])
            ->whereIn('status', ['cancelled', 'refunded'])
            ->orderByDesc('booking_date')
            ->orderByDesc('id');

        $query = $this->applyFilters($query, $filters);

        return $this->streamCsv($query, function ($row) {
            return [
                $row->booking_no,
                $this->getGuestName($row),
                $row->room->name ?? 'N/A',
                $row->room->roomType->name ?? 'N/A',
                $row->booking_date,
                $row->check_in_date,
                $row->check_out_date,
                $row->cancellation_reason ?? '',
                $row->grand_total,
                $row->security_deposit ?? 0,
                $row->advance_amount ?? 0
            ];
        }, ['Booking No', 'Guest', 'Room', 'Room Type', 'Booking Date', 'Check In', 'Check Out', 'Cancellation Reason', 'Total', 'Security', 'Advance'], 'cancelled-report.csv');
    }

    public function cancelledPrint(Request $request)
    {
        $filters = $request->all();
        $query = RoomBooking::with(['room.roomType', 'customer', 'member', 'corporateMember', 'invoice'])
            ->whereIn('status', ['cancelled', 'refunded'])
            ->orderByDesc('booking_date')
            ->orderByDesc('id');

        $query = $this->applyFilters($query, $filters);

        $bookings = $query->get();

        return Inertia::render('App/Admin/Rooms/Reports/CancelledPrint', [
            'bookings' => $bookings,
            'filters' => $filters,
            'generatedAt' => now()->format('d M Y, h:i A')
        ]);
    }

    /**
     * Check-in/Check-out Reports
     */
    public function checkIn(Request $request)
    {
        $filters = $request->all();
        if (empty($filters['check_in_from']) && empty($filters['check_in_to'])) {
            $filters['check_in_from'] = Carbon::now()->startOfMonth()->format('Y-m-d');
            $filters['check_in_to'] = Carbon::now()->format('Y-m-d');
        }

        $query = RoomBooking::with(['room.roomType', 'customer', 'customer.guestType', 'member', 'corporateMember'])
            ->whereIn('status', ['checked_in', 'completed'])
            ->orderBy('check_in_date', 'desc');

        $query = $this->applyFilters($query, $filters);
        $bookings = $query->paginate(30)->appends($request->query());

        return Inertia::render('App/Admin/Rooms/Reports/CheckIn', [
            'bookings' => $bookings,
            'filters' => $filters,
            'roomTypes' => RoomType::select('id', 'name')->get(),
            'rooms' => Room::select('id', 'name')->get(),
        ]);
    }

    public function checkInExport(Request $request)
    {
        $filters = $request->all();
        $query = RoomBooking::with(['room.roomType', 'customer', 'member', 'corporateMember'])
            ->whereIn('status', ['checked_in', 'completed'])
            ->orderBy('check_in_date', 'desc');
        $query = $this->applyFilters($query, $filters);

        return $this->streamCsv($query, function ($row) {
            return [
                $row->booking_no,
                $this->getGuestName($row),
                $row->room->name ?? 'N/A',
                $row->check_in_date,
                $row->check_in_time,
                $row->status,
            ];
        }, ['Booking No', 'Guest', 'Room', 'Check In Date', 'Check In Time', 'Status'], 'check-in-report.csv');
    }

    public function checkInPrint(Request $request)
    {
        $filters = $request->all();
        $query = RoomBooking::with(['room.roomType', 'customer', 'member', 'corporateMember'])
            ->whereIn('status', ['checked_in', 'completed'])
            ->orderBy('check_in_date', 'desc');
        $query = $this->applyFilters($query, $filters);
        $bookings = $query->get();

        return Inertia::render('App/Admin/Rooms/Reports/CheckInPrint', [
            'bookings' => $bookings,
            'filters' => $filters,
            'generatedAt' => now()->format('d M Y, h:i A')
        ]);
    }

    public function checkOut(Request $request)
    {
        $filters = $request->all();
        $hasNonDateFilters =
            !empty($filters['search']) ||
            !empty($filters['search_id']) ||
            !empty($filters['membership_no']) ||
            (!empty($filters['customer_type']) && $filters['customer_type'] !== 'all') ||
            !empty($filters['room_type']) ||
            !empty($filters['room_ids']) ||
            !empty($filters['booking_status']) ||
            !empty($filters['status']);

        if (!$hasNonDateFilters && empty($filters['booking_date_from']) && empty($filters['booking_date_to'])) {
            $filters['booking_date_from'] = Carbon::now()->format('Y-m-d');
            $filters['booking_date_to'] = Carbon::now()->format('Y-m-d');
        }

        $query = RoomBooking::with([
            'room:id,name,room_type_id',
            'room.roomType:id,name',
            'customer:id,customer_no,email,name',
            'customer.guestType:id,name',
            'member:id,membership_no,full_name',
            'corporateMember:id,membership_no,full_name',
            'invoice:id,invoiceable_id,invoiceable_type,status,paid_amount,total_price,advance_payment',
        ])
            ->withSum('miniBarItems', 'amount')
            ->withSum('otherCharges', 'amount')
            ->with('orders')
            ->whereIn('status', ['checked_out', 'completed'])
            ->orderBy('check_out_date', 'desc');

        $query = $this->applyFilters($query, $filters);
        $bookings = $query->paginate(30)->appends($request->query());

        return Inertia::render('App/Admin/Rooms/Reports/CheckOut', [
            'bookings' => $bookings,
            'filters' => $filters,
            'roomTypes' => RoomType::select('id', 'name')->get(),
            'rooms' => Room::select('id', 'name')->get(),
        ]);
    }

    public function checkOutExport(Request $request)
    {
        $filters = $request->all();
        $hasNonDateFilters =
            !empty($filters['search']) ||
            !empty($filters['search_id']) ||
            !empty($filters['membership_no']) ||
            (!empty($filters['customer_type']) && $filters['customer_type'] !== 'all') ||
            !empty($filters['room_type']) ||
            !empty($filters['room_ids']) ||
            !empty($filters['booking_status']) ||
            !empty($filters['status']);

        if (!$hasNonDateFilters && empty($filters['booking_date_from']) && empty($filters['booking_date_to'])) {
            $filters['booking_date_from'] = Carbon::now()->format('Y-m-d');
            $filters['booking_date_to'] = Carbon::now()->format('Y-m-d');
        }

        $query = RoomBooking::with([
            'room:id,name,room_type_id',
            'room.roomType:id,name',
            'customer:id,customer_no,email,name',
            'member:id,membership_no,full_name',
            'corporateMember:id,membership_no,full_name',
        ])
            ->whereIn('status', ['checked_out', 'completed'])
            ->orderBy('check_out_date', 'desc');
        $query = $this->applyFilters($query, $filters);

        return $this->streamCsv($query, function ($row) {
            return [
                $row->booking_no,
                $row->booking_date,
                $this->getGuestName($row),
                $row->booked_by,
                $row->room->name ?? 'N/A',
                $row->check_in_date,
                $row->check_out_date,
                $row->status,
                $row->grand_total
            ];
        }, ['Booking No', 'Booking Date', 'Guest', 'Booked By', 'Room', 'Check In', 'Check Out', 'Status', 'Total Bill'], 'check-out-report.csv');
    }

    public function checkOutPrint(Request $request)
    {
        $filters = $request->all();
        $hasNonDateFilters =
            !empty($filters['search']) ||
            !empty($filters['search_id']) ||
            !empty($filters['membership_no']) ||
            (!empty($filters['customer_type']) && $filters['customer_type'] !== 'all') ||
            !empty($filters['room_type']) ||
            !empty($filters['room_ids']) ||
            !empty($filters['booking_status']) ||
            !empty($filters['status']);

        if (!$hasNonDateFilters && empty($filters['booking_date_from']) && empty($filters['booking_date_to'])) {
            $filters['booking_date_from'] = Carbon::now()->format('Y-m-d');
            $filters['booking_date_to'] = Carbon::now()->format('Y-m-d');
        }

        $query = RoomBooking::with([
            'room:id,name,room_type_id',
            'room.roomType:id,name',
            'customer:id,customer_no,email,name',
            'customer.guestType:id,name',
            'member:id,membership_no,full_name',
            'corporateMember:id,membership_no,full_name',
            'invoice:id,invoiceable_id,invoiceable_type,status,paid_amount,total_price,advance_payment',
        ])
            ->withSum('miniBarItems', 'amount')
            ->withSum('otherCharges', 'amount')
            ->with('orders')
            ->whereIn('status', ['checked_out', 'completed'])
            ->orderBy('check_out_date', 'desc');
        $query = $this->applyFilters($query, $filters);
        $bookings = $query->get();

        return Inertia::render('App/Admin/Rooms/Reports/CheckOutPrint', [
            'bookings' => $bookings,
            'filters' => $filters,
            'generatedAt' => now()->format('d M Y, h:i A')
        ]);
    }

    /**
     * Room Payment History
     */
    public function paymentHistory(Request $request)
    {
        $filters = $request->all();

        $hasNonDateFilters =
            !empty($filters['search']) ||
            !empty($filters['search_id']) ||
            !empty($filters['membership_no']) ||
            (!empty($filters['customer_type']) && $filters['customer_type'] !== 'all') ||
            !empty($filters['room_type']) ||
            !empty($filters['room_ids']) ||
            !empty($filters['booking_status']) ||
            !empty($filters['status']);

        if (!$hasNonDateFilters && empty($filters['booking_date_from']) && empty($filters['booking_date_to'])) {
            $filters['booking_date_from'] = Carbon::now()->format('Y-m-d');
            $filters['booking_date_to'] = Carbon::now()->format('Y-m-d');
        }

        $query = RoomBooking::query()
            ->with([
                'room:id,name,room_type_id',
                'room.roomType:id,name',
                'customer:id,customer_no,email,name',
                'member:id,membership_no,full_name',
                'corporateMember:id,membership_no,full_name',
                'invoice:id,invoiceable_id,invoiceable_type,invoice_no,status,paid_amount,total_price,advance_payment',
            ])
            ->with('orders')
            ->whereIn('status', ['checked_out'])
            ->has('invoice')
            ->where(function ($q) {
                $q
                    ->where('advance_amount', '>', 0)
                    ->orWhere('security_deposit', '>', 0)
                    ->orWhereHas('invoice', function ($invoiceQ) {
                        $invoiceQ->where('paid_amount', '>', 0);
                    });
            })
            ->orderBy('room_id')
            ->orderBy('check_out_date', 'desc')
            ->orderBy('check_out_time', 'desc');

        $query = $this->applyFilters($query, $filters);

        $bookings = $query->get();

        $rows = $bookings
            ->groupBy(function ($b) {
                return $b->room?->name ?? 'N/A';
            })
            ->map(function ($group, $roomName) {
                $roomType = $group->first()?->room?->roomType?->name ?? '-';

                $items = $group
                    ->map(function ($booking) {
                        $foodBill = collect($booking->orders ?? [])->sum(function ($o) {
                            return (float) ($o->total_price ?? 0);
                        });
                        $invoiceTotal = (float) ($booking->grand_total ?? 0) + $foodBill;

                        $paidOrdersSum = collect($booking->orders ?? [])->filter(function ($o) {
                            return strtolower((string) ($o->payment_status ?? '')) === 'paid';
                        })->sum(function ($o) {
                            return (float) ($o->total_price ?? 0);
                        });

                        $paid = (float) ($booking->invoice?->paid_amount ?? 0) + $paidOrdersSum;

                        $advanceSecurity = (float) ($booking->advance_amount ?? 0) + (float) ($booking->security_deposit ?? 0);
                        $balance = max(0, $invoiceTotal - $paid);

                        return [
                            'booking_id' => $booking->id,
                            'booking_no' => $booking->booking_no,
                            'check_in_date' => $booking->check_in_date,
                            'check_out_date' => $booking->check_out_date,
                            'advance_security' => round($advanceSecurity),
                            'total' => round($invoiceTotal),
                            'paid' => round($paid),
                            'balance' => round($balance),
                        ];
                    })
                    ->values();

                $totals = [
                    'advance_security' => (int) $items->sum('advance_security'),
                    'total' => (int) $items->sum('total'),
                    'paid' => (int) $items->sum('paid'),
                    'balance' => (int) $items->sum('balance'),
                ];

                return [
                    'room_name' => $roomName,
                    'room_type' => $roomType,
                    'items' => $items,
                    'totals' => $totals,
                ];
            })
            ->values();

        return Inertia::render('App/Admin/Rooms/Reports/PaymentHistory', [
            'rows' => $rows,
            'filters' => $filters,
            'cutoff' => Carbon::now()->format('Y-m-d'),
            'roomTypes' => RoomType::select('id', 'name')->get(),
            'rooms' => Room::select('id', 'name')->get(),
        ]);
    }

    public function paymentHistoryExport(Request $request)
    {
        $filters = $request->all();

        $hasNonDateFilters =
            !empty($filters['search']) ||
            !empty($filters['search_id']) ||
            !empty($filters['membership_no']) ||
            (!empty($filters['customer_type']) && $filters['customer_type'] !== 'all') ||
            !empty($filters['room_type']) ||
            !empty($filters['room_ids']) ||
            !empty($filters['booking_status']) ||
            !empty($filters['status']);

        if (!$hasNonDateFilters && empty($filters['booking_date_from']) && empty($filters['booking_date_to'])) {
            $filters['booking_date_from'] = Carbon::now()->format('Y-m-d');
            $filters['booking_date_to'] = Carbon::now()->format('Y-m-d');
        }

        $query = RoomBooking::query()
            ->with([
                'room:id,name,room_type_id',
                'room.roomType:id,name',
                'customer:id,customer_no,email,name',
                'member:id,membership_no,full_name',
                'corporateMember:id,membership_no,full_name',
                'invoice:id,invoiceable_id,invoiceable_type,invoice_no,status,paid_amount,total_price,advance_payment',
            ])
            ->with('orders')
            ->whereIn('status', ['checked_out'])
            ->has('invoice')
            ->where(function ($q) {
                $q
                    ->where('advance_amount', '>', 0)
                    ->orWhere('security_deposit', '>', 0)
                    ->orWhereHas('invoice', function ($invoiceQ) {
                        $invoiceQ->where('paid_amount', '>', 0);
                    });
            })
            ->orderBy('room_id')
            ->orderBy('check_out_date', 'desc');

        $query = $this->applyFilters($query, $filters);

        return $this->streamCsv($query, function ($row) {
            $foodBill = collect($row->orders ?? [])->sum(fn($o) => (float) ($o->total_price ?? 0));
            $invoiceTotal = (float) ($row->grand_total ?? 0) + $foodBill;

            $paidOrdersSum = collect($row->orders ?? [])->filter(fn($o) => strtolower((string) ($o->payment_status ?? '')) === 'paid')->sum(fn($o) => (float) ($o->total_price ?? 0));
            $paid = (float) ($row->invoice?->paid_amount ?? 0) + $paidOrdersSum;

            $advanceSecurity = (float) ($row->advance_amount ?? 0) + (float) ($row->security_deposit ?? 0);
            $balance = max(0, $invoiceTotal - $paid);

            return [
                $row->room->name ?? 'N/A',
                $row->room->roomType->name ?? 'N/A',
                $row->booking_no,
                $row->check_in_date,
                $row->check_out_date,
                round($invoiceTotal),
                round($advanceSecurity),
                round($paid),
                round($balance),
            ];
        }, ['Room', 'Room Type', 'Booking No', 'Check In', 'Check Out', 'Total', 'Advance/Security', 'Paid', 'Balance'], 'payment-history-report.csv');
    }

    public function paymentHistoryPrint(Request $request)
    {
        $filters = $request->all();

        $hasNonDateFilters =
            !empty($filters['search']) ||
            !empty($filters['search_id']) ||
            !empty($filters['membership_no']) ||
            (!empty($filters['customer_type']) && $filters['customer_type'] !== 'all') ||
            !empty($filters['room_type']) ||
            !empty($filters['room_ids']) ||
            !empty($filters['booking_status']) ||
            !empty($filters['status']);

        if (!$hasNonDateFilters && empty($filters['booking_date_from']) && empty($filters['booking_date_to'])) {
            $filters['booking_date_from'] = Carbon::now()->format('Y-m-d');
            $filters['booking_date_to'] = Carbon::now()->format('Y-m-d');
        }

        $query = RoomBooking::query()
            ->with([
                'room:id,name,room_type_id',
                'room.roomType:id,name',
                'customer:id,customer_no,email,name',
                'member:id,membership_no,full_name',
                'corporateMember:id,membership_no,full_name',
                'invoice:id,invoiceable_id,invoiceable_type,invoice_no,status,paid_amount,total_price,advance_payment',
            ])
            ->with('orders')
            ->whereIn('status', ['checked_out'])
            ->has('invoice')
            ->where(function ($q) {
                $q
                    ->where('advance_amount', '>', 0)
                    ->orWhere('security_deposit', '>', 0)
                    ->orWhereHas('invoice', function ($invoiceQ) {
                        $invoiceQ->where('paid_amount', '>', 0);
                    });
            })
            ->orderBy('room_id')
            ->orderBy('check_out_date', 'desc');

        $query = $this->applyFilters($query, $filters);

        $bookings = $query->get();

        $rows = $bookings
            ->groupBy(function ($b) {
                return $b->room?->name ?? 'N/A';
            })
            ->map(function ($group, $roomName) {
                $roomType = $group->first()?->room?->roomType?->name ?? '-';

                $items = $group
                    ->map(function ($booking) {
                        $foodBill = collect($booking->orders ?? [])->sum(function ($o) {
                            return (float) ($o->total_price ?? 0);
                        });
                        $invoiceTotal = (float) ($booking->grand_total ?? 0) + $foodBill;

                        $paidOrdersSum = collect($booking->orders ?? [])->filter(function ($o) {
                            return strtolower((string) ($o->payment_status ?? '')) === 'paid';
                        })->sum(function ($o) {
                            return (float) ($o->total_price ?? 0);
                        });

                        $paid = (float) ($booking->invoice?->paid_amount ?? 0) + $paidOrdersSum;

                        $advanceSecurity = (float) ($booking->advance_amount ?? 0) + (float) ($booking->security_deposit ?? 0);
                        $balance = max(0, $invoiceTotal - $paid);

                        return [
                            'booking_id' => $booking->id,
                            'booking_no' => $booking->booking_no,
                            'check_in_date' => $booking->check_in_date,
                            'check_out_date' => $booking->check_out_date,
                            'advance_security' => round($advanceSecurity),
                            'total' => round($invoiceTotal),
                            'paid' => round($paid),
                            'balance' => round($balance),
                        ];
                    })
                    ->values();

                $totals = [
                    'advance_security' => (int) $items->sum('advance_security'),
                    'total' => (int) $items->sum('total'),
                    'paid' => (int) $items->sum('paid'),
                    'balance' => (int) $items->sum('balance'),
                ];

                return [
                    'room_name' => $roomName,
                    'room_type' => $roomType,
                    'items' => $items,
                    'totals' => $totals,
                ];
            })
            ->values();

        return Inertia::render('App/Admin/Rooms/Reports/PaymentHistoryPrint', [
            'rows' => $rows,
            'filters' => $filters,
            'cutoff' => Carbon::now()->format('Y-m-d'),
            'generatedAt' => now()->format('d M Y, h:i A')
        ]);
    }

    /**
     * Room Receivables Report (Receipts linked to room booking invoices)
     */
    public function receivables(Request $request)
    {
        $filters = $request->all();
        if (empty($filters['receipt_date_from']) && empty($filters['receipt_date_to'])) {
            $filters['receipt_date_from'] = Carbon::now()->startOfMonth()->format('Y-m-d');
            $filters['receipt_date_to'] = Carbon::now()->format('Y-m-d');
        }

        $query = FinancialReceipt::query()
            ->with(['paymentAccount', 'payer', 'links.invoice.invoiceable.room'])
            ->whereHas('links.invoice', function ($q) {
                $q->where('invoice_type', 'room_booking');
            })
            ->when(!empty($filters['receipt_date_from']), function ($q) use ($filters) {
                $q->whereDate('receipt_date', '>=', $filters['receipt_date_from']);
            })
            ->when(!empty($filters['receipt_date_to']), function ($q) use ($filters) {
                $q->whereDate('receipt_date', '<=', $filters['receipt_date_to']);
            })
            ->when(!empty($filters['search']), function ($q) use ($filters) {
                $search = $filters['search'];
                $q->where(function ($inner) use ($search) {
                    $inner
                        ->where('receipt_no', 'like', "%{$search}%")
                        ->orWhere('remarks', 'like', "%{$search}%")
                        ->orWhereHas('links.invoice.invoiceable', function ($invoiceableQ) use ($search) {
                            $invoiceableQ
                                ->where('booking_no', 'like', "%{$search}%")
                                ->orWhere('guest_first_name', 'like', "%{$search}%")
                                ->orWhere('guest_last_name', 'like', "%{$search}%");
                        });
                });
            })
            ->orderByDesc('receipt_date')
            ->orderByDesc('id');

        $receipts = $query->paginate(30)->appends($request->query());

        return Inertia::render('App/Admin/Rooms/Reports/Receivables', [
            'receipts' => $receipts,
            'filters' => $filters,
        ]);
    }

    /**
     * Member-wise Report
     */
    public function memberWise(Request $request)
    {
        $filters = $request->all();

        $query = RoomBooking::with(['room.roomType', 'member', 'customer', 'corporateMember', 'invoice'])
            ->orderBy('check_in_date', 'desc');

        $query = $this->applyFilters($query, $filters);
        $bookings = $query->paginate(30)->appends($request->query());

        return Inertia::render('App/Admin/Rooms/Reports/MemberWise', [
            'bookings' => $bookings,
            'filters' => $filters,
            'roomTypes' => RoomType::select('id', 'name')->get(),
            'rooms' => Room::select('id', 'name')->get(),
        ]);
    }

    public function memberWiseExport(Request $request)
    {
        $filters = $request->all();
        $query = RoomBooking::with(['room.roomType', 'member', 'customer', 'corporateMember', 'invoice'])
            ->orderBy('check_in_date', 'desc');
        $query = $this->applyFilters($query, $filters);

        return $this->streamCsv($query, function ($row) {
            $total = (float)($row->grand_total ?? 0);
            $paid = (float)($row->invoice->paid_amount ?? 0);
            $due = $total - $paid;
            $advanceSecurity = (float)($row->security_deposit ?? 0) + (float)($row->advance_amount ?? 0);

            return [
                $row->booking_no,
                $row->booking_date ?? '-',
                $this->getGuestName($row),
                $row->room->name ?? 'N/A',
                $row->check_in_date,
                $row->check_out_date,
                $row->status,
                $advanceSecurity,
                $total,
                $paid,
                $due
            ];
        }, ['Booking No', 'Booking Date', 'Member/Guest', 'Room', 'Check In', 'Check Out', 'Status', 'Advance/Security', 'Total', 'Paid', 'Due'], 'member-wise-report.csv');
    }

    public function memberWisePrint(Request $request)
    {
        $filters = $request->all();
        $query = RoomBooking::with(['room.roomType', 'member', 'customer', 'corporateMember', 'invoice'])
            ->orderBy('check_in_date', 'desc');
        $query = $this->applyFilters($query, $filters);
        $bookings = $query->get();

        return Inertia::render('App/Admin/Rooms/Reports/MemberWisePrint', [
            'bookings' => $bookings,
            'member' => null,
            'filters' => $filters,
            'generatedAt' => now()->format('d M Y, h:i A')
        ]);
    }

    /**
     * Mini Bar Report
     */
    public function miniBar(Request $request)
    {
        $filters = $request->all();
        if (empty($filters['booking_date_from']) && empty($filters['booking_date_to']) && empty($filters['check_in_from']) && empty($filters['check_in_to']) && empty($filters['check_out_from']) && empty($filters['check_out_to'])) {
            $filters['booking_date_from'] = Carbon::now()->startOfMonth()->format('Y-m-d');
            $filters['booking_date_to'] = Carbon::now()->format('Y-m-d');
        }

        $query = RoomBookingMiniBarItem::with(['roomBooking.room.roomType', 'roomBooking.member', 'roomBooking.customer', 'roomBooking.corporateMember'])
            ->orderBy('created_at', 'desc');

        $query->whereHas('roomBooking', function ($q) use ($filters) {
            $this->applyFilters($q, $filters);
        });

        $items = $query->paginate(30)->appends($request->query());

        return Inertia::render('App/Admin/Rooms/Reports/MiniBar', [
            'items' => $items,
            'filters' => $filters
        ]);
    }

    public function miniBarExport(Request $request)
    {
        $filters = $request->all();
        $query = RoomBookingMiniBarItem::with(['roomBooking.room.roomType', 'roomBooking.member', 'roomBooking.customer', 'roomBooking.corporateMember'])
            ->orderBy('created_at', 'desc');

        $query->whereHas('roomBooking', function ($q) use ($filters) {
            $this->applyFilters($q, $filters);
        });

        return $this->streamCsv($query, function ($row) {
            return [
                $row->roomBooking->booking_no ?? 'N/A',
                $this->getGuestName($row->roomBooking),
                $row->roomBooking->room->name ?? 'N/A',
                $row->roomBooking->room->roomType->name ?? 'N/A',
                $row->roomBooking->booking_date ?? null,
                $row->roomBooking->check_in_date ?? null,
                $row->roomBooking->check_out_date ?? null,
                $row->item,
                $row->qty,
                $row->amount,
                $row->total,
                $row->created_at->format('Y-m-d')
            ];
        }, ['Booking No', 'Guest', 'Room', 'Room Type', 'Booking Date', 'Check In', 'Check Out', 'Item', 'Qty', 'Price', 'Total', 'Item Date'], 'mini-bar-report.csv');
    }

    public function miniBarPrint(Request $request)
    {
        $filters = $request->all();
        $query = RoomBookingMiniBarItem::with(['roomBooking.room.roomType', 'roomBooking.member', 'roomBooking.customer', 'roomBooking.corporateMember'])
            ->orderBy('created_at', 'desc');

        $query->whereHas('roomBooking', function ($q) use ($filters) {
            $this->applyFilters($q, $filters);
        });

        $items = $query->get();

        return Inertia::render('App/Admin/Rooms/Reports/MiniBarPrint', [
            'items' => $items,
            'filters' => $filters,
            'generatedAt' => now()->format('d M Y, h:i A')
        ]);
    }

    /**
     * Complementary Report
     */
    public function complementary(Request $request)
    {
        $filters = $request->all();
        if (empty($filters['booking_date_from']) && empty($filters['booking_date_to']) && empty($filters['check_in_from']) && empty($filters['check_in_to']) && empty($filters['check_out_from']) && empty($filters['check_out_to'])) {
            $filters['booking_date_from'] = Carbon::now()->startOfMonth()->format('Y-m-d');
            $filters['booking_date_to'] = Carbon::now()->format('Y-m-d');
        }

        $query = RoomBookingOtherCharge::with(['roomBooking.room.roomType', 'roomBooking.member', 'roomBooking.customer', 'roomBooking.corporateMember'])
            ->where('is_complementary', true)
            ->orderBy('created_at', 'desc');

        $query->whereHas('roomBooking', function ($q) use ($filters) {
            $this->applyFilters($q, $filters);
        });

        $items = $query->paginate(30)->appends($request->query());

        return Inertia::render('App/Admin/Rooms/Reports/Complementary', [
            'items' => $items,
            'filters' => $filters
        ]);
    }

    public function complementaryExport(Request $request)
    {
        $filters = $request->all();
        $query = RoomBookingOtherCharge::with(['roomBooking.room.roomType', 'roomBooking.member', 'roomBooking.customer', 'roomBooking.corporateMember'])
            ->where('is_complementary', true)
            ->orderBy('created_at', 'desc');

        $query->whereHas('roomBooking', function ($q) use ($filters) {
            $this->applyFilters($q, $filters);
        });

        return $this->streamCsv($query, function ($row) {
            $booking = $row->roomBooking;
            return [
                $booking?->booking_date,
                $booking?->room?->roomType?->name ?? 'N/A',
                $booking?->room?->name ?? 'N/A',
                $this->getGuestName($booking),
                $row->type,
                $row->details,
                $row->amount,
                $booking?->booked_by ?? '',
                $booking?->status ?? '',
            ];
        }, ['Booking Date', 'Room Type', 'Room', 'Guest', 'Charges Type', 'Description', 'Amount', 'Booked By', 'Status'], 'complementary-report.csv');
    }

    public function complementaryPrint(Request $request)
    {
        $filters = $request->all();
        $query = RoomBookingOtherCharge::with(['roomBooking.room.roomType', 'roomBooking.member', 'roomBooking.customer', 'roomBooking.corporateMember'])
            ->where('is_complementary', true)
            ->orderBy('created_at', 'desc');

        $query->whereHas('roomBooking', function ($q) use ($filters) {
            $this->applyFilters($q, $filters);
        });

        $items = $query->get();

        return Inertia::render('App/Admin/Rooms/Reports/ComplementaryPrint', [
            'items' => $items,
            'filters' => $filters,
            'generatedAt' => now()->format('d M Y, h:i A')
        ]);
    }

    /**
     * Helper: Apply common filters to query builder
     */
    private function applyFilters($query, $filters)
    {
        // Customer Type & Search Logic
        $customerType = $filters['customer_type'] ?? 'all';
        $search = $filters['search'] ?? null;
        $searchId = $filters['search_id'] ?? null;
        $membershipNo = $filters['membership_no'] ?? null;

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
                        ->orWhere('booking_no', 'like', "%{$search}%")  // Fixed 'booking_number' to 'booking_no' based on DB
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

        if (!empty($searchId)) {
            $query->where(function ($q) use ($searchId) {
                $q
                    ->where('id', $searchId)
                    ->orWhere('booking_no', 'like', "%{$searchId}%");
            });
        }

        if (!empty($membershipNo)) {
            if ($customerType === 'member') {
                $query->whereHas('member', function ($q) use ($membershipNo) {
                    $q->where('membership_no', 'like', "%{$membershipNo}%");
                });
            } elseif ($customerType === 'corporate') {
                $query->whereHas('corporateMember', function ($q) use ($membershipNo) {
                    $q->where('membership_no', 'like', "%{$membershipNo}%");
                });
            } elseif ($customerType === 'guest') {
                $query->whereHas('customer', function ($q) use ($membershipNo) {
                    $q->where('customer_no', 'like', "%{$membershipNo}%");
                });
            } else {
                $query->where(function ($q) use ($membershipNo) {
                    $q
                        ->whereHas('member', function ($sub) use ($membershipNo) {
                            $sub->where('membership_no', 'like', "%{$membershipNo}%");
                        })
                        ->orWhereHas('corporateMember', function ($sub) use ($membershipNo) {
                            $sub->where('membership_no', 'like', "%{$membershipNo}%");
                        })
                        ->orWhereHas('customer', function ($sub) use ($membershipNo) {
                            $sub->where('customer_no', 'like', "%{$membershipNo}%");
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

        // Status Filter
        $rawStatuses = null;
        if (!empty($filters['booking_status'])) {
            $rawStatuses = $filters['booking_status'];
        } elseif (!empty($filters['status'])) {
            $rawStatuses = $filters['status'];
        }

        if (!empty($rawStatuses)) {
            $statuses = collect(explode(',', (string) $rawStatuses))
                ->map(fn($s) => strtolower(trim($s)))
                ->filter()
                ->values();

            $bookingStatuses = $statuses->filter(function ($s) {
                return in_array($s, ['pending', 'confirmed', 'checked_in', 'checked_out', 'completed', 'cancelled', 'refunded', 'no_show'], true);
            })->values();

            $paymentStatuses = $statuses->filter(function ($s) {
                return in_array($s, ['paid', 'unpaid', 'advance_paid'], true);
            })->values();

            if ($bookingStatuses->isNotEmpty()) {
                $query->whereIn('status', $bookingStatuses->all());
            }

            if ($paymentStatuses->isNotEmpty()) {
                $query->where(function ($q) use ($paymentStatuses) {
                    if ($paymentStatuses->contains('paid') || $paymentStatuses->contains('unpaid')) {
                        $q->orWhereHas('invoice', function ($invoiceQuery) use ($paymentStatuses) {
                            $invoiceQuery->where(function ($statusQuery) use ($paymentStatuses) {
                                if ($paymentStatuses->contains('paid')) {
                                    $statusQuery->orWhere('status', 'paid');
                                }
                                if ($paymentStatuses->contains('unpaid')) {
                                    $statusQuery->orWhere('status', 'unpaid');
                                }
                            });
                        });
                    }
                    if ($paymentStatuses->contains('advance_paid')) {
                        $q->orWhere('advance_amount', '>', 0);
                    }
                });
            }
        }

        return $query;
    }

    /**
     * CSV Stream Helper
     */
    private function streamCsv($query, callable $rowFormatter, array $columns, string $filename)
    {
        return response()->streamDownload(function () use ($query, $rowFormatter, $columns) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, $columns);

            $query->chunk(100, function ($results) use ($handle, $rowFormatter) {
                foreach ($results as $row) {
                    $formatted = $rowFormatter($row);
                    if ($formatted === null) {
                        continue;
                    }
                    fputcsv($handle, $formatted);
                }
            });

            fclose($handle);
        }, $filename);
    }

    private function getGuestName($booking)
    {
        if (!$booking)
            return 'Unknown';
        return $booking->customer
            ? $booking->customer->name
            : ($booking->member
                ? $booking->member->full_name
                : ($booking->corporateMember ? $booking->corporateMember->full_name : 'Unknown'));
    }
}
