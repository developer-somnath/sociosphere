<?php

namespace App\Models\Traits;

use App\Services\ActivityLogger;
use Illuminate\Database\Eloquent\Model;

/**
 * Automatically record model CRUD events (create, update, delete, restore)
 * through the central ActivityLogger service.
 *
 * Add to any model: use LogsActivity;
 */
trait LogsActivity
{
    /**
     * Attributes that must never be stored in the audit trail
     * (e.g. password hashes, tokens). Models can override by declaring
     * a public static $activityLogExclude property.
     *
     * @var array<int, string>
     */
    protected static array $activityLogExclude = ['password', 'remember_token'];

    protected static function bootLogsActivity(): void
    {
        static::created(function (Model $model) {
            static::logModelActivity($model, 'created');
        });

        static::updated(function (Model $model) {
            if (empty($model->getChanges())) {
                return;
            }

            static::logModelActivity($model, 'updated');
        });

        static::deleted(function (Model $model) {
            static::logModelActivity($model, 'deleted');
        });

        // Registered via the low-level API because the convenience
        // static::restored() helper only exists on SoftDeletes models.
        // The event never fires for models without SoftDeletes, so this
        // registration is harmless there.
        static::registerModelEvent('restored', function (Model $model) {
            static::logModelActivity($model, 'restored');
        });
    }

    protected static function logModelActivity(Model $model, string $action): void
    {
        $exclude = array_flip(static::$activityLogExclude);

        app(ActivityLogger::class)->log(
            action: $action,
            module: class_basename($model),
            entityType: get_class($model),
            entityId: (string) $model->getKey(),
            oldValues: $action === 'updated' || $action === 'restored'
                ? array_diff_key($model->getOriginal(), $exclude)
                : null,
            newValues: array_diff_key($model->getAttributes(), $exclude),
            remarks: ucfirst($action) . ' ' . class_basename($model),
        );
    }
}
