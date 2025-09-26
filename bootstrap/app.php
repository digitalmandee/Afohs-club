<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Foundation\Application;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Inertia\Inertia;
use Stancl\Tenancy\Exceptions\TenantCouldNotBeIdentifiedByPathException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (TenantCouldNotBeIdentifiedByPathException $e, $request) {
            return Inertia::render('Errors/TenantNotFound', [
                'message' => 'The tenant you are looking for does not exist.'
            ])->toResponse($request)->setStatusCode(404);
        });
    })
    ->create();