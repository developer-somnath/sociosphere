<?php

namespace App\Services;

use App\Jobs\LogActivityJob;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Queue;

use Illuminate\Support\Facades\DB;

class ActivityLogger
{
    /**
     * Sensitive attribute names to redact across all log payloads.
     *
     * @var array<int, string>
     */
    protected static array $sensitiveKeys = [
        'password',
        'password_confirmation',
        'remember_token',
        'token',
        'secret',
        'api_token',
        'access_token',
        'credit_card',
        'card_number',
        'cvv',
        'pin',
        'ssn',
    ];

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
            'properties' => static::redact($properties),
            'old_values' => static::redact($oldValues),
            'new_values' => static::redact($newValues),
            'remarks' => $remarks,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
            'method' => $request?->method(),
            'request_url' => $request?->getRequestUri(),
            'created_at' => now(),
        ];

        $persist = function () use ($payload) {
            if (Config::get('activity-log.queue', false)) {
                Queue::connection(Config::get('activity-log.queue_connection'))
                    ->push(new LogActivityJob($payload));

                return null;
            }

            return ActivityLog::query()->create($payload);
        };

        if (DB::transactionLevel() > 0) {
            DB::afterCommit($persist);

            return null;
        }

        return $persist();
    }

    /**
     * Recursively redact sensitive values in array payloads.
     */
    public static function redact(?array $data): ?array
    {
        if ($data === null) {
            return null;
        }

        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $data[$key] = static::redact($value);
            } elseif (in_array(strtolower((string) $key), static::$sensitiveKeys, true)) {
                $data[$key] = '[REDACTED]';
            }
        }

        return $data;
    }
}
