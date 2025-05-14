<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfTenantAuthenticated
{
    public function handle(Request $request, Closure $next, string $guard = 'tenant'): Response
    {
        if (Auth::guard($guard)->check()) {
            $tenantId = $request->route('tenant');
            return redirect()->route('tenant.dashboard', ['tenant' => $tenantId]);
        }

        return $next($request);
    }
}