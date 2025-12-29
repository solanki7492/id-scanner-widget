<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule document purging (daily at 2 AM)
Schedule::command('documents:purge-expired')->dailyAt('02:00');

// Schedule webhook retry (every 5 minutes)
Schedule::job(new \App\Jobs\RetryFailedWebhooks)->everyFiveMinutes();
