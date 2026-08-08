<?php

namespace App\Console\Commands;

use App\Services\SubscriptionService;
use Illuminate\Console\Command;

class SyncSubscriptionStatuses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscriptions:sync';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Synchronise subscription lifecycle statuses (trialing → active → expired)';

    /**
     * Execute the console command.
     */
    public function handle(SubscriptionService $subscriptions): int
    {
        $result = $subscriptions->syncStatuses();

        $this->info("Checked {$result['checked']} subscription(s), updated {$result['updated']}.");

        return self::SUCCESS;
    }
}
