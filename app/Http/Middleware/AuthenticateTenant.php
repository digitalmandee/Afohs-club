<?php

namespace App\Http\Middleware;

use App\Helpers\TenantLogout;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use Closure;

class AuthenticateTenant
{
    public function handle(Request $request, Closure $next, string $guard = 'tenant'): Response
    {
        $currentTenant = tenant('id');  // Always available after InitializeTenancyByPath

        if (Auth::guard($guard)->check()) {
            // Compare logged-in tenant vs current tenant
            $loggedInTenant = session('tenant_id');

            if ($loggedInTenant && $loggedInTenant !== $currentTenant) {
                TenantLogout::logout($request);

                return redirect()->route('tenant.login', ['tenant' => $currentTenant]);
            }
        }

        if (!Auth::guard($guard)->check()) {
            return redirect()->route('tenant.login', ['tenant' => $currentTenant]);
        }

        // Always store tenant in session
        session(['tenant_id' => $currentTenant]);

        return $next($request);
    }
}