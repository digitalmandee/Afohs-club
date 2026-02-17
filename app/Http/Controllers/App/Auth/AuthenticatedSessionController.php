<?php

namespace App\Http\Controllers\App\Auth;

use App\Helpers\TenantLogout;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\TenantLoginRequest;
use App\Models\UserLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\Rule;
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
            'routes' => [
                'checkUserId' => 'tenant.check-user-id',
                'login' => 'tenant.login',
            ],
        ]);
    }

    public function createPos(Request $request)
    {
        if (Auth::guard('tenant')->check()) {
            if ($request->session()->has('active_restaurant_id')) {
                return redirect()->route('pos.dashboard');
            }

            return redirect()->route('pos.select-restaurant');
        }

        $webUser = Auth::guard('web')->user();
        if ($webUser && ($webUser->hasRole('admin') || $webUser->hasRole('super-admin'))) {
            Auth::guard('tenant')->login($webUser);
            $request->session()->regenerate();

            if ($request->session()->has('active_restaurant_id')) {
                return redirect()->route('pos.dashboard');
            }

            return redirect()->route('pos.select-restaurant');
        }

        return Inertia::render('App/Auth/Login', [
            'canResetPassword' => false,
            'status' => $request->session()->get('status'),
            'routes' => [
                'checkUserId' => 'pos.check-user-id',
                'login' => 'pos.login',
            ],
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
        $restaurantId = tenant('id');

        // 🔹 Super Admin Bypass
        if ($user->hasRole('super-admin')) {
            UserLog::create([
                'user_id' => $user->id,
                'type' => 'login',
                'logged_at' => now(),
                'restaurant_id' => $restaurantId,
            ]);

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

            UserLog::create([
                'user_id' => $user->id,
                'type' => 'login',
                'logged_at' => now(),
                'restaurant_id' => $restaurantId,
            ]);

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

    public function storePos(TenantLoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = Auth::guard('tenant')->user();

        if ($user->employee && $user->employee->status !== 'active') {
            Auth::guard('tenant')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('pos.login')->withErrors([
                'employee_id' => 'Access denied. Your account is not active.',
            ]);
        }

        $restaurants = $user->getAccessibleTenants();

        if ($restaurants->count() === 1) {
            $restaurant = $restaurants->first();

            session([
                'active_company_id' => $user->employee?->branch_id ?? $restaurant->branch_id,
                'active_restaurant_id' => $restaurant->id,
            ]);

            UserLog::create([
                'user_id' => $user->id,
                'type' => 'login',
                'logged_at' => now(),
                'restaurant_id' => $restaurant->id,
            ]);

            return redirect()->route('pos.dashboard');
        }

        UserLog::create([
            'user_id' => $user->id,
            'type' => 'login',
            'logged_at' => now(),
            'restaurant_id' => null,
        ]);

        return redirect()->route('pos.select-restaurant');
    }

    public function selectRestaurant(Request $request): Response|RedirectResponse
    {
        $user = Auth::guard('tenant')->user();
        $restaurants = $user->getAccessibleTenants();

        if ($restaurants->count() === 1) {
            $restaurant = $restaurants->first();

            session([
                'active_company_id' => $user->employee?->branch_id ?? $restaurant->branch_id,
                'active_restaurant_id' => $restaurant->id,
            ]);

            return redirect()->route('pos.dashboard');
        }

        return Inertia::render('App/Auth/SelectRestaurant', [
            'restaurants' => $restaurants->map(fn($t) => ['id' => $t->id, 'name' => $t->name])->values(),
        ]);
    }

    public function setRestaurant(Request $request): RedirectResponse
    {
        $user = Auth::guard('tenant')->user();
        $restaurants = $user->getAccessibleTenants();

        $request->validate([
            'restaurant_id' => ['required', Rule::in($restaurants->pluck('id')->all())],
        ]);

        $restaurant = $restaurants->firstWhere('id', $request->restaurant_id);

        session([
            'active_company_id' => $user->employee?->branch_id ?? $restaurant->branch_id,
            'active_restaurant_id' => $restaurant->id,
        ]);

        return redirect()->route('pos.dashboard');
    }

    public function destroyPos(Request $request): RedirectResponse
    {
        TenantLogout::logout($request, 'tenant');

        return redirect()->route('login');
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
