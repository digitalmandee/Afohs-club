<?php

namespace App\Http\Controllers\App\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\TenantLoginRequest;
use App\Models\EmployeeLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('App/Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(TenantLoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = Auth::guard('tenant')->user();

        // ✅ Only cashier can proceed
        if ($user->hasRole('cashier')) {
            // 🔹 Save login log
            EmployeeLog::create([
                'employee_id' => $user->employee->id,
                'type' => 'login',  // or 'shift_start' if you want shift naming
                'logged_at' => now(),
            ]);

            return redirect()->intended(route('tenant.dashboard', absolute: false));
        }

        // ❌ Not cashier → logout & send back error
        Auth::guard('tenant')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return back()->withErrors([
            'employee_id' => 'Access denied. Only cashier can log in.',
        ]);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = Auth::guard('tenant')->user();

        if ($user) {
            // 🔹 Save employee log
            EmployeeLog::create([
                'employee_id' => $user->employee->id,  // assuming user has employee_id relation/column
                'type' => 'logout',  // or 'shift_end' if you want strict shift naming
                'logged_at' => now(),
            ]);
        }

        // 🔹 Proceed with logout
        Auth::guard('tenant')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect(route('tenant.login'));
    }
}
