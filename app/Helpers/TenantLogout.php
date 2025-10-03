<?php

namespace App\Helpers;

use App\Models\EmployeeLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TenantLogout
{
    public static function logout(Request $request, $guard = 'tenant')
    {
        $user = Auth::guard($guard)->user();

        if ($user) {
            $now = Carbon::now();

            // If between midnight and 4 AM → treat date as previous day
            if ($now->hour < 4) {
                $loggedAt = $now->copy()->subDay()->setDate(
                    $now->copy()->subDay()->year,
                    $now->copy()->subDay()->month,
                    $now->copy()->subDay()->day
                );
                $loggedAt->setTime($now->hour, $now->minute, $now->second);
            } else {
                $loggedAt = $now;
            }

            EmployeeLog::create([
                'employee_id' => $user->employee->id,
                'type' => 'logout',
                'logged_at' => $loggedAt,
                'tenant_id' => session('tenant_id'),
            ]);
        }

        Auth::guard($guard)->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        session()->forget('tenant_id');
    }
}
