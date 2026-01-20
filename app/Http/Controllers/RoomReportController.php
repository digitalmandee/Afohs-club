<?php

namespace App\Http\Controllers;

use App\Models\CorporateMember;
use App\Models\Customer;
use App\Models\Member;
use App\Models\Room;
use App\Models\RoomBooking;
use App\Models\RoomBookingMiniBarItem;
use App\Models\RoomBookingOrder;
use App\Models\RoomBookingOrderItem;
use App\Models\RoomBookingOtherCharge;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
                'id' => 3,
                'title' => 'Booking Report',
                'description' => 'Comprehensive list of all room bookings',
                'icon' => 'BookOnline',
                'color' => '#063455',
                'route' => 'rooms.reports.booking',
                'stats' => 'All Bookings'
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
        $dateFrom = $request->date_from ?? Carbon::now()->startOfMonth()->format('Y-m-d');
        $dateTo = $request->date_to ?? Carbon::now()->format('Y-m-d');

        // Logic: Group bookings by date (check-in date? or stay dates?). Usually Check-in or creation date.
        // Or "Occupancy" which implies how many rooms occupied on that day.
        // Let's assume daily check-in + totals for now, or revenue per day.
        // Simple approach: Bookings created/checked-in within range.

        $bookings = RoomBooking::with(['room.roomType', 'customer', 'member', 'corporateMember'])
            ->whereBetween('check_in_date', [$dateFrom, $dateTo])
            ->orderBy('check_in_date', 'desc')
            ->get();

        return Inertia::render('App/Admin/Rooms/Reports/DayWise', [
            'bookings' => $bookings,
            'filters' => compact('dateFrom', 'dateTo')
        ]);
    }

    public function dayWisePrint(Request $request)
    {
        $dateFrom = $request->date_from ?? Carbon::now()->startOfMonth()->format('Y-m-d');
        $dateTo = $request->date_to ?? Carbon::now()->format('Y-m-d');
        $bookings = RoomBooking::with(['room.roomType', 'customer', 'member', 'corporateMember'])
            ->whereBetween('check_in_date', [$dateFrom, $dateTo])
            ->orderBy('check_in_date', 'desc')
            ->get();

        return Inertia::render('App/Admin/Rooms/Reports/DayWisePrint', [
            'bookings' => $bookings,
            'filters' => compact('dateFrom', 'dateTo'),
            'generatedAt' => now()->format('d M Y, h:i A')
        ]);
    }

    /**
     * Booking Report
     */
    public function booking(Request $request)
    {
        $status = $request->status;
        $dateFrom = $request->date_from ?? Carbon::now()->startOfMonth()->format('Y-m-d');
        $dateTo = $request->date_to ?? Carbon::now()->format('Y-m-d');

        $query = RoomBooking::with(['room', 'customer', 'member', 'corporateMember', 'invoice'])
            ->whereBetween('check_in_date', [$dateFrom, $dateTo]);

        if ($status) {
            $query->where('status', $status);
        }

        $bookings = $query->orderBy('check_in_date', 'desc')->get();

        return Inertia::render('App/Admin/Rooms/Reports/Booking', [
            'bookings' => $bookings,
            'filters' => compact('status', 'dateFrom', 'dateTo')
        ]);
    }

    public function bookingPrint(Request $request)
    {
        $status = $request->status;
        $dateFrom = $request->date_from ?? Carbon::now()->startOfMonth()->format('Y-m-d');
        $dateTo = $request->date_to ?? Carbon::now()->format('Y-m-d');

        $query = RoomBooking::with(['room', 'customer', 'member', 'corporateMember', 'invoice'])
            ->whereBetween('check_in_date', [$dateFrom, $dateTo]);

        if ($status) {
            $query->where('status', $status);
        }

        $bookings = $query->orderBy('check_in_date', 'desc')->get();

        return Inertia::render('App/Admin/Rooms/Reports/BookingPrint', [
            'bookings' => $bookings,
            'filters' => compact('status', 'dateFrom', 'dateTo'),
            'generatedAt' => now()->format('d M Y, h:i A')
        ]);
    }

    /**
     * Cancelled Report
     */
    public function cancelled(Request $request)
    {
        $dateFrom = $request->date_from ?? Carbon::now()->startOfMonth()->format('Y-m-d');
        $dateTo = $request->date_to ?? Carbon::now()->format('Y-m-d');

        $bookings = RoomBooking::with(['room', 'customer', 'member', 'corporateMember', 'invoice'])
            ->whereIn('status', ['cancelled', 'refunded'])
            ->whereBetween('updated_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->orderBy('updated_at', 'desc')
            ->get();

        return Inertia::render('App/Admin/Rooms/Reports/Cancelled', [
            'bookings' => $bookings,
            'filters' => compact('dateFrom', 'dateTo')
        ]);
    }

    public function cancelledPrint(Request $request)
    {
        $dateFrom = $request->date_from ?? Carbon::now()->startOfMonth()->format('Y-m-d');
        $dateTo = $request->date_to ?? Carbon::now()->format('Y-m-d');

        $bookings = RoomBooking::with(['room', 'customer', 'member', 'corporateMember', 'invoice'])
            ->whereIn('status', ['cancelled', 'refunded'])
            ->whereBetween('updated_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->orderBy('updated_at', 'desc')
            ->get();

        return Inertia::render('App/Admin/Rooms/Reports/CancelledPrint', [
            'bookings' => $bookings,
            'filters' => compact('dateFrom', 'dateTo'),
            'generatedAt' => now()->format('d M Y, h:i A')
        ]);
    }

    /**
     * Check-in/Check-out Reports
     */
    public function checkIn(Request $request)
    {
        $dateFrom = $request->date_from ?? Carbon::now()->format('Y-m-d');
        $dateTo = $request->date_to ?? Carbon::now()->format('Y-m-d');

        $bookings = RoomBooking::with(['room', 'customer', 'member'])
            ->whereBetween('check_in_date', [$dateFrom, $dateTo])
            ->whereIn('status', ['checked_in', 'completed'])
            ->orderBy('check_in_date', 'desc')
            ->get();

        return Inertia::render('App/Admin/Rooms/Reports/CheckIn', [
            'bookings' => $bookings,
            'filters' => compact('dateFrom', 'dateTo')
        ]);
    }

    public function checkInPrint(Request $request)
    {
        $dateFrom = $request->date_from ?? Carbon::now()->format('Y-m-d');
        $dateTo = $request->date_to ?? Carbon::now()->format('Y-m-d');

        $bookings = RoomBooking::with(['room', 'customer', 'member'])
            ->whereBetween('check_in_date', [$dateFrom, $dateTo])
            ->whereIn('status', ['checked_in', 'completed'])
            ->orderBy('check_in_date', 'desc')
            ->get();

        return Inertia::render('App/Admin/Rooms/Reports/CheckInPrint', [
            'bookings' => $bookings,
            'filters' => compact('dateFrom', 'dateTo'),
            'generatedAt' => now()->format('d M Y, h:i A')
        ]);
    }

    public function checkOut(Request $request)
    {
        $dateFrom = $request->date_from ?? Carbon::now()->format('Y-m-d');
        $dateTo = $request->date_to ?? Carbon::now()->format('Y-m-d');

        $bookings = RoomBooking::with(['room', 'customer', 'member'])
            ->whereBetween('check_out_date', [$dateFrom, $dateTo])
            ->where('status', 'completed')  // Assuming checked-out means completed
            ->orderBy('check_out_date', 'desc')
            ->get();

        return Inertia::render('App/Admin/Rooms/Reports/CheckOut', [
            'bookings' => $bookings,
            'filters' => compact('dateFrom', 'dateTo')
        ]);
    }

    public function checkOutPrint(Request $request)
    {
        $dateFrom = $request->date_from ?? Carbon::now()->format('Y-m-d');
        $dateTo = $request->date_to ?? Carbon::now()->format('Y-m-d');

        $bookings = RoomBooking::with(['room', 'customer', 'member'])
            ->whereBetween('check_out_date', [$dateFrom, $dateTo])
            ->where('status', 'completed')
            ->orderBy('check_out_date', 'desc')
            ->get();

        return Inertia::render('App/Admin/Rooms/Reports/CheckOutPrint', [
            'bookings' => $bookings,
            'filters' => compact('dateFrom', 'dateTo'),
            'generatedAt' => now()->format('d M Y, h:i A')
        ]);
    }

    /**
     * Room Payment History
     */
    public function paymentHistory(Request $request)
    {
        $dateFrom = $request->date_from ?? Carbon::now()->startOfMonth()->format('Y-m-d');
        $dateTo = $request->date_to ?? Carbon::now()->format('Y-m-d');

        // This should fetch invoices associated with room bookings
        // Assuming RoomBooking has 'invoice' relation
        $bookings = RoomBooking::has('invoice')
            ->with(['room', 'member', 'customer', 'invoice.transactions'])
            ->whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('App/Admin/Rooms/Reports/PaymentHistory', [
            'bookings' => $bookings,
            'filters' => compact('dateFrom', 'dateTo')
        ]);
    }

    public function paymentHistoryPrint(Request $request)
    {
        $dateFrom = $request->date_from ?? Carbon::now()->startOfMonth()->format('Y-m-d');
        $dateTo = $request->date_to ?? Carbon::now()->format('Y-m-d');

        $bookings = RoomBooking::has('invoice')
            ->with(['room', 'member', 'customer', 'invoice.transactions'])
            ->whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('App/Admin/Rooms/Reports/PaymentHistoryPrint', [
            'bookings' => $bookings,
            'filters' => compact('dateFrom', 'dateTo'),
            'generatedAt' => now()->format('d M Y, h:i A')
        ]);
    }

    /**
     * Member-wise Report
     */
    public function memberWise(Request $request)
    {
        $memberId = $request->member_id;

        $bookings = collect();

        if ($memberId) {
            $bookings = RoomBooking::with(['room', 'member', 'invoice'])
                ->where('member_id', $memberId)
                ->orderBy('check_in_date', 'desc')
                ->get();
        }

        $members = Member::select('id', 'full_name', 'membership_no')->get();

        return Inertia::render('App/Admin/Rooms/Reports/MemberWise', [
            'bookings' => $bookings,
            'members' => $members,
            'filters' => compact('memberId')
        ]);
    }

    public function memberWisePrint(Request $request)
    {
        $memberId = $request->member_id;
        $bookings = collect();
        $member = null;
        if ($memberId) {
            $bookings = RoomBooking::with(['room', 'member', 'invoice'])
                ->where('member_id', $memberId)
                ->orderBy('check_in_date', 'desc')
                ->get();
            $member = Member::find($memberId);
        }

        return Inertia::render('App/Admin/Rooms/Reports/MemberWisePrint', [
            'bookings' => $bookings,
            'member' => $member,
            'filters' => compact('memberId'),
            'generatedAt' => now()->format('d M Y, h:i A')
        ]);
    }

    // Mini-Bar Report and Complementary Report usually rely on RoomBookingOrder or similar items table
    // Assuming RoomBookingOrder has 'type' or items have 'is_complementary'

    public function miniBar(Request $request)
    {
        $dateFrom = $request->date_from ?? Carbon::now()->startOfMonth()->format('Y-m-d');
        $dateTo = $request->date_to ?? Carbon::now()->format('Y-m-d');

        $items = RoomBookingMiniBarItem::with(['roomBooking.room', 'roomBooking.member', 'roomBooking.customer', 'roomBooking.corporateMember'])
            ->whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('App/Admin/Rooms/Reports/MiniBar', [
            'items' => $items,
            'filters' => compact('dateFrom', 'dateTo')
        ]);
    }

    public function miniBarPrint(Request $request)
    {
        $dateFrom = $request->date_from ?? Carbon::now()->startOfMonth()->format('Y-m-d');
        $dateTo = $request->date_to ?? Carbon::now()->format('Y-m-d');

        $items = RoomBookingMiniBarItem::with(['roomBooking.room', 'roomBooking.member', 'roomBooking.customer', 'roomBooking.corporateMember'])
            ->whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('App/Admin/Rooms/Reports/MiniBarPrint', [
            'items' => $items,
            'filters' => compact('dateFrom', 'dateTo'),
            'generatedAt' => now()->format('d M Y, h:i A')
        ]);
    }

    public function complementary(Request $request)
    {
        $dateFrom = $request->date_from ?? Carbon::now()->startOfMonth()->format('Y-m-d');
        $dateTo = $request->date_to ?? Carbon::now()->format('Y-m-d');

        $items = RoomBookingOtherCharge::with(['roomBooking.room', 'roomBooking.member', 'roomBooking.customer', 'roomBooking.corporateMember'])
            ->where('is_complementary', true)
            ->whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('App/Admin/Rooms/Reports/Complementary', [
            'items' => $items,
            'filters' => compact('dateFrom', 'dateTo')
        ]);
    }

    public function complementaryPrint(Request $request)
    {
        $dateFrom = $request->date_from ?? Carbon::now()->startOfMonth()->format('Y-m-d');
        $dateTo = $request->date_to ?? Carbon::now()->format('Y-m-d');

        $items = RoomBookingOtherCharge::with(['roomBooking.room', 'roomBooking.member', 'roomBooking.customer', 'roomBooking.corporateMember'])
            ->where('is_complementary', true)
            ->whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('App/Admin/Rooms/Reports/ComplementaryPrint', [
            'items' => $items,
            'filters' => compact('dateFrom', 'dateTo'),
            'generatedAt' => now()->format('d M Y, h:i A')
        ]);
    }
}
