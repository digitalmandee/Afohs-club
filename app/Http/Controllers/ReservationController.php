<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Table;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ReservationController extends Controller
{
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
            $start->addMinutes(60);
        }

        // If table is selected → check only this table
        if ($tableId) {
            $reservations = Order::where('table_id', $tableId)
                ->whereDate('start_date', $date)
                ->select('start_time', 'end_time')
                ->get();
        } else {
            // No table selected → get reservations for all tables in floor or restaurant
            $query = Order::whereDate('start_date', $date);

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

        return response()->json(array_values($availableSlots));
    }
}
