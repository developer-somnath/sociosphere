<?php

use App\Jobs\CalculateOverduePenaltiesJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Phase 13: Daily overdue penalty engine (grace period expiration & late fees).
Schedule::job(new CalculateOverduePenaltiesJob)->dailyAt('02:00');
