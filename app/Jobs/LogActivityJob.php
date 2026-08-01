<?php

namespace App\Jobs;

use App\Models\ActivityLog;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

/**
 * Writes a single activity log record. The payload is fully serializable
 * (scalars + arrays) so it can be safely dispatched through any queue driver.
 */
class LogActivityJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly array $payload,
    ) {}

    public function handle(): void
    {
        ActivityLog::query()->create($this->payload);
    }
}
