<?php

namespace App\Http\Controllers;

use App\Models\PosShift;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PosShiftController extends Controller
{
    /**
     * Get shift history for the current user.
     */
    public function history()
    {
        $user = Auth::user();
        // $tenantId = tenant('id'); // Scoped by User, not Tenant

        $shifts = PosShift::where('user_id', $user->id)
            // ->where('tenant_id', $tenantId)
            ->latest()
            ->limit(50)
            ->get();

        return response()->json($shifts);
    }

    /**
     * Check if the current user has an active shift for today.
     */
    public function status()
    {
        $user = Auth::user();
        // $tenantId = tenant('id');
        $today = Carbon::today()->toDateString();

        // Check for an active shift for today (User Global)
        $activeShift = PosShift::where('user_id', $user->id)
            // ->where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->whereDate('start_date', $today)
            ->latest()
            ->first();

        return response()->json([
            'has_active_shift' => (bool) $activeShift,
            'shift' => $activeShift
        ]);
    }

    /**
     * Start a new shift.
     */
    public function start(Request $request)
    {
        // No input validation needed as we auto-set date/time

        $user = Auth::user();
        $tenantId = tenant('id');

        // Prevent double shift (User Global)
        $existingShift = PosShift::where('user_id', $user->id)
            // ->where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->first();

        if ($existingShift) {
            return response()->json([
                'success' => false,
                'message' => 'You already have an active shift.',
                'shift' => $existingShift
            ], 400);
        }

        $shift = PosShift::create([
            'user_id' => $user->id,
            'tenant_id' => $tenantId,
            'start_date' => Carbon::today(),  // Auto-set to today
            'start_time' => Carbon::now(),
            'status' => 'active',
            'created_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Shift started successfully.',
            'shift' => $shift
        ]);
    }

    /**
     * End the current shift.
     */
    public function end()
    {
        $user = Auth::user();
        // $tenantId = tenant('id');

        $activeShift = PosShift::where('user_id', $user->id)
            // ->where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->latest()
            ->first();

        // Check for incomplete orders created by this user
        // An order is incomplete if:
        // 1. Status is NOT 'completed' AND NOT 'cancelled'
        // 2. OR Payment Status is NOT 'paid' OR 'awaiting' (unless cancelled)
        $incompleteOrders = \App\Models\Order::where('created_by', $user->id)
            ->where(function ($query) {
                $query
                    ->whereNotIn('status', ['completed', 'cancelled'])
                    ->orWhere(function ($q) {
                        $q
                            ->whereNotIn('payment_status', ['paid', 'awaiting'])
                            ->where('status', '!=', 'cancelled');
                    });
            })
            ->exists();

        if ($incompleteOrders) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot end shift. You have incomplete or unpaid orders.',
            ], 400);
        }

        if ($activeShift) {
            $activeShift->update([
                'end_time' => Carbon::now(),
                'status' => 'closed',
                'updated_by' => $user->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Shift closed successfully.',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'No active shift found.',
        ], 404);
    }
}
