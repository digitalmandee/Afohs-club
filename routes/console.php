<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule the family member expiry command to run daily at 2:00 AM
Schedule::command('members:expire-by-age')
    ->dailyAt('02:00')
    ->withoutOverlapping()
    ->runInBackground()
    ->appendOutputTo(storage_path('logs/family-member-expiry.log'));
