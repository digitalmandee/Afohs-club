<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateTenant
{
    public function handle(Request $request, Closure $next, string $guard = 'tenant'): Response
    {
        if (!Auth::guard($guard)->check()) {
            if (!$request->expectsJson()) {
                // Try to resolve tenant ID via the tenancy package
                $tenantId = tenant('id') ?? $this->resolveFromPath($request);

                if ($tenantId) {
                    return redirect()->route('tenant.login', ['tenant' => $tenantId]);
                }

                return redirect()->route('login', ['tenant' => $tenantId]);
            }
        }

        return $next($request);
    }

    protected function resolveFromPath(Request $request)
    {
        return $request->route('tenant');
    }
}
