<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Member;
use App\Models\Order;
use App\Models\Reservation;
use App\Models\Table;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        $query = Reservation::with(['member:id,full_name,membership_no,mobile_number_a', 'customer:id,name,customer_no,contact', 'table']);

        // ✅ Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('member', function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%");
            })->orWhereHas('customer', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $reservations = $query->orderBy('date', 'desc')->paginate(10)->withQueryString();

        return inertia('App/Order/Reservations', [
            'reservations' => $reservations,
            'filters' => $request->only('status', 'start_date', 'end_date', 'search'),
        ]);
    }

    public function orderReservation(Request $request)
    {
        $validated = $request->validate([
            // 'member.id' => 'required|exists:members,user_id',
            'person_count' => 'required|integer|min:1',
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'down_payment' => 'required|numeric|min:1',
            'nature_of_function' => 'nullable|string|max:255',
            'theme_of_function' => 'nullable|string|max:255',
            'special_request' => 'nullable|string|max:1000',
            'table' => 'required|exists:tables,id',
        ], [
            'member.id.required' => 'Please select a member.',
            'member.id.exists' => 'The selected member does not exist.',
            'person_count.required' => 'Number of persons is required.',
            'person_count.min' => 'Number of persons must be at least 1.',
            'date.after_or_equal' => 'Reservation date must be today or later.',
            'end_time.after' => 'End time must be after start time.',
        ]);

        $date = Carbon::parse($validated['date'])->setTimezone('Asia/Karachi')->toDateString();

        $reservationData = [
            'person_count' => $validated['person_count'],
            'date' => $date,
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'down_payment' => $validated['down_payment'] ?? 0,
            'nature_of_function' => $validated['nature_of_function'] ?? null,
            'theme_of_function' => $validated['theme_of_function'] ?? null,
            'special_request' => $validated['special_request'] ?? null,
            'table_id' => $validated['table'] ?? null,
            'status' => 'pending',
        ];

        if ($request->member['booking_type'] == 'member') {
            $reservationData['member_id'] = $request->member['id'];
        } else {
            $reservationData['customer_id'] = $request->member['id'];
        }

        $reservation = Reservation::create($reservationData);

        // Create advance payment transaction
        $payerType = $request->member['booking_type'] == 'member' ? Member::class : Customer::class;
        $payerId = $request->member['id'];
        $payerName = $request->member['full_name'] ?? $request->member['name'] ?? 'Customer';

        Transaction::create([
            'type' => 'credit',
            'amount' => $validated['down_payment'],
            'date' => now(),
            'description' => 'Reservation #' . $reservation->id . ' - Advance Payment from ' . $payerName,
            'payable_type' => $payerType,
            'payable_id' => $payerId,
            'reference_type' => Reservation::class,
            'reference_id' => $reservation->id,
            'created_by' => Auth::id(),
        ]);

        return response()->json([
            'message' => 'Reservation created successfully with advance payment.',
            'order' => $reservation
        ], 200);
    }

    public function availableTimes(Request $request, $tableId = null)
    {
        $date = $request->query('date');
        $floorId = $request->query('floor');  // optional if provided

        if (!$date) {
            return response()->json(['error' => 'Date is required'], 400);
        }

        // Define all possible slots (10:00 - 23:00 every 30 mins)
        $start = Carbon::createFromTime(10, 0);
        $end = Carbon::createFromTime(23, 0);
        $allSlots = [];
        while ($start < $end) {
            $slotStart = $start->copy();
            $slotEnd = $start->copy()->addMinutes(30);
            $allSlots[] = ['start' => $slotStart->format('H:i'), 'end' => $slotEnd->format('H:i')];
            $start->addMinutes(30);
        }

        Log::info('Available times request:', ['tableId' => $tableId, 'date' => $date, 'totalSlots' => count($allSlots)]);

        // If table is selected → check only this table
        if ($tableId) {
            $reservations = Reservation::where('table_id', $tableId)
                ->whereIn('status', ['pending', 'confirmed'])
                ->whereDate('date', $date)
                ->select('start_time', 'end_time')
                ->get();

            Log::info('Found reservations for table:', ['count' => $reservations->count()]);
        } else {
            // No table selected → get reservations for all tables in floor or restaurant
            $query = Reservation::whereDate('date', $date);

            if ($floorId) {
                $query->whereHas('table', function ($q) use ($floorId) {
                    $q->where('floor_id', $floorId);
                });
            }

            $reservations = $query->select('start_time', 'end_time', 'table_id')->get();
        }

        // Filter slots
        $availableSlots = array_filter($allSlots, function ($slot) use ($reservations, $tableId) {
            // If tableId is null → allow if at least one table is free for this slot
            if (!$tableId) {
                // Count how many reservations overlap
                $conflicts = $reservations->filter(function ($res) use ($slot) {
                    return ($slot['start'] < $res->end_time) && ($slot['end'] > $res->start_time);
                });

                // If all tables are taken at this slot, exclude it
                // Suppose 10 tables total (hardcoded or fetched dynamically)
                $totalTables = Table::count();
                return $conflicts->count() < $totalTables;
            }

            // If table selected → standard conflict check
            foreach ($reservations as $res) {
                if (($slot['start'] < $res->end_time) && ($slot['end'] > $res->start_time)) {
                    return false;
                }
            }
            return true;
        });

        Log::info('Available slots after filtering:', ['count' => count($availableSlots)]);

        return response()->json(array_values($availableSlots));
    }

    public function cancel(Reservation $reservation)
    {
        if ($reservation->status === 'cancelled') {
            return back()->with('error', 'Reservation already cancelled.');
        }

        $reservation->update(['status' => 'cancelled']);

        $reservation->order()->update(['status' => 'cancelled']);

        return back()->with('success', 'Reservation cancelled successfully.');
    }
}
