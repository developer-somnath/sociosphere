<?php

namespace App\Services;

use App\Jobs\LogActivityJob;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Queue;

class ActivityLogger
{
    /**
     * Record an activity log entry.
     *
     * Request context (IP, user agent, method, URL) is captured eagerly into
     * scalar fields so the payload can be queued safely. When
     * config('activity-log.queue') is true the record is dispatched to the
     * queue; otherwise it is written synchronously.
     */
    public function log(
        string $action,
        string $module,
        ?string $entityType = null,
        ?string $entityId = null,
        ?array $properties = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?string $remarks = null,
        ?Request $request = null,
        ?int $causerId = null,
        ?int $societyId = null,
    ): ?ActivityLog {
        if (! Config::get('activity-log.enabled', true)) {
            return null;
        }

        $request = $request ?? request();

        $payload = [
            'causer_id' => $causerId ?? Auth::id(),
            'society_id' => $societyId ?? Auth::user()?->society_id,
            'module' => $module,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'properties' => $properties,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'remarks' => $remarks,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
            'method' => $request?->method(),
            'request_url' => $request?->getRequestUri(),
            'created_at' => now(),
        ];

        if (Config::get('activity-log.queue', false)) {
            Queue::connection(Config::get('activity-log.queue_connection'))
                ->push(new LogActivityJob($payload));

            return null;
        }

        return ActivityLog::query()->create($payload);
    }
}
