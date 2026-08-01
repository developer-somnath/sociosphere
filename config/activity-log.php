<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Activity Logging
    |--------------------------------------------------------------------------
    |
    | Centralized audit trail configuration. When disabled, no activity is
    | recorded (useful for seeding or maintenance windows).
    |
    */

    'enabled' => env('ACTIVITY_LOG_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Queue
    |--------------------------------------------------------------------------
    |
    | When true, activity log records are dispatched to the queue instead of
    | being written synchronously, keeping the request lifecycle fast.
    |
    */

    'queue' => env('ACTIVITY_LOG_QUEUE', false),

    'queue_connection' => env('ACTIVITY_LOG_QUEUE_CONNECTION', 'database'),
];
