<?php

namespace App\Console\Commands;

use App\Models\ActivityLog;
use Illuminate\Console\Command;

class PruneActivityLogsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'activity-logs:prune {--days=90 : Retain logs created within the last N days}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Prune activity log entries older than specified days';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $days = (int) $this->option('days');

        if ($days <= 0) {
            $this->error('The --days option must be a positive integer.');
            return self::FAILURE;
        }

        $cutoff = now()->subDays($days);
        $deleted = ActivityLog::query()->where('created_at', '<', $cutoff)->delete();

        $this->info("Pruned {$deleted} activity log records created before {$cutoff->toDateTimeString()}.");

        return self::SUCCESS;
    }
}
