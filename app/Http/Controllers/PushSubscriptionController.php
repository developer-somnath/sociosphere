<?php

namespace App\Http\Controllers;

use App\Models\PushSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PushSubscriptionController extends Controller
{
    /**
     * Persist a WebPush subscription for the authenticated user.
     */
    public function subscribe(Request $request): JsonResponse
    {
        $data = $request->validate([
            'subscription.endpoint' => ['required', 'string', 'max:1000'],
            'subscription.keys.p256dh' => ['nullable', 'string', 'max:512'],
            'subscription.keys.auth' => ['nullable', 'string', 'max:512'],
        ]);

        $sub = $data['subscription'];
        $keys = $sub['keys'] ?? [];

        $request->user()
            ->pushSubscriptions()
            ->updateOrCreate(
                ['endpoint' => $sub['endpoint']],
                [
                    'society_id' => society_id(),
                    'p256dh' => $keys['p256dh'] ?? null,
                    'auth' => $keys['auth'] ?? null,
                    'payload' => $sub,
                ]
            );

        return response()->json(['ok' => true]);
    }

    /**
     * Remove a WebPush subscription for the authenticated user.
     */
    public function unsubscribe(Request $request): JsonResponse
    {
        $data = $request->validate([
            'subscription.endpoint' => ['required', 'string', 'max:1000'],
        ]);

        $request->user()
            ->pushSubscriptions()
            ->where('endpoint', $data['subscription']['endpoint'])
            ->delete();

        return response()->json(['ok' => true]);
    }
}
