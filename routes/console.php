<?php

use App\Jobs\CalculateOverduePenaltiesJob;
use App\Console\Commands\DeliverReportCommand;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Phase 13: Daily overdue penalty engine (grace period expiration & late fees).
Schedule::job(new CalculateOverduePenaltiesJob)->dailyAt('02:00');

// Phase 14: Daily subscription lifecycle sync (trials expire, terms end).
Schedule::command('subscriptions:sync')->dailyAt('03:00');

// S4-3: Scheduled report delivery — email the monthly invoices report to each
// society's administrators at the start of every month.
Schedule::command(DeliverReportCommand::class, ['invoices', '--format=pdf'])
    ->monthlyOn(1, '06:00')
    ->name('report:deliver:invoices')
    ->withoutOverlapping();
