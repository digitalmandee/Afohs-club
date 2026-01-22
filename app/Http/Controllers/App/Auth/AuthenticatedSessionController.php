<?php

namespace App\Http\Controllers\App\Auth;

use App\Helpers\TenantLogout;
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

        // 🔹 Super Admin Bypass
        if ($user->hasRole('super-admin')) {
            return redirect()->intended(route('tenant.dashboard', absolute: false));
        }

        // ✅ Only cashier/employee can proceed if not super admin
        if ($user->hasRole('cashier') || $user->employee) {
            // 🔹 1. Check Employee Status
            if ($user->employee && $user->employee->status !== 'active') {
                Auth::guard('tenant')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect()->route('tenant.login', ['tenant' => tenant('id')])->withErrors([
                    'employee_id' => 'Access denied. Your account is not active.',
                ]);
            }

            // 🔹 2. Check Tenant Access
            $currentTenant = tenant('id');
            $allowedTenants = $user->getAllowedTenantIds();

            // If no tenants assigned OR current tenant not in allowed list
            if (empty($allowedTenants) || !in_array($currentTenant, $allowedTenants)) {
                Auth::guard('tenant')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect()->route('tenant.login', ['tenant' => tenant('id')])->withErrors([
                    'employee_id' => 'Access denied. You do not have access to this restaurant.',
                ]);
            }

            // 🔹 Save login log
            if ($user->employee) {
                EmployeeLog::create([
                    'employee_id' => $user->employee->id,
                    'type' => 'login',
                    'logged_at' => now(),
                ]);
            }

            return redirect()->intended(route('tenant.dashboard', absolute: false));
        }

        // ❌ Not authorized
        Auth::guard('tenant')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('tenant.login', ['tenant' => tenant('id')])->withErrors([
            'employee_id' => 'Access denied. Only authorized employees can log in.',
        ]);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        TenantLogout::logout($request);

        return redirect(route('tenant.login'));
    }
}
