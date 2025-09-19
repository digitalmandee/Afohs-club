<?php

namespace App\Helpers;

use App\Models\EmployeeLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TenantLogout
{
    public static function logout(Request $request, $guard = 'tenant')
    {
        $user = Auth::guard($guard)->user();

        if ($user) {
            EmployeeLog::create([
                'employee_id' => $user->employee->id,
                'type' => 'logout',
                'logged_at' => now(),
                'tenant_id' => session('tenant_id'),
            ]);
        }

        Auth::guard($guard)->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        session()->forget('tenant_id');
    }
}