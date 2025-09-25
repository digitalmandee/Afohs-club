<?php

namespace App\Http\Controllers\App\Auth;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function checkUserId(Request $request)
    {
        $request->validate([
            'employee_id' => 'required',
        ]);

        // Step 1: Find employee by employee_id
        $employee = Employee::where('employee_id', $request->employee_id)->first();

        if (!$employee) {
            return back()->withErrors(['employee_id' => 'Employee ID not found.'])->withInput();
        }

        // Step 2: Ensure employee has linked user
        $user = User::find($employee->user_id);

        if (!$user) {
            return back()->withErrors(['employee_id' => 'This employee has no login access.'])->withInput();
        }

        // Step 3: Ensure cashier role
        if (!$user->roles()->where('name', 'cashier')->exists()) {
            return back()->withErrors(['employee_id' => 'This employee is not a cashier.'])->withInput();
        }

        // ✅ Passed all checks
        return redirect()->route('tenant.login');
    }
}
