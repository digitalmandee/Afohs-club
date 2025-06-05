<?php

namespace App\Providers;

use App\Http\Middleware\AuthenticateTenant;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Stancl\Tenancy\Events\TenancyInitialized;
use Stancl\Tenancy\Tenancy;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Schema::defaultStringLength(191);
        Route::aliasMiddleware('auth.tenant.custom', AuthenticateTenant::class);
        Event::listen(TenancyInitialized::class, function (TenancyInitialized $event) {
            URL::defaults(['tenant' => tenant('id')]);
        });
    }
}