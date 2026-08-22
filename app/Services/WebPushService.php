<?php

namespace App\Services;

use App\Models\PushSubscription;
use App\Models\User;
use Illuminate\Support\Facades\Config;
use Minishlink\WebPush\Subscription as WebPushSubscription;
use Minishlink\WebPush\WebPush;

/**
 * WebPush sender backed by minishlink/web-push.
 *
 * Sends a push message to every stored subscription for a user using the
 * WebPush protocol with VAPID authentication. Dead subscriptions (404/410)
 * are pruned automatically.
 */
class WebPushService
{
    public function sendToUser(User $user, array $payload): int
    {
        $auth = [
            'VAPID' => [
                'subject' => Config::get('services.webpush.subject', 'mailto:admin@sociosphere.app'),
                'publicKey' => Config::get('services.webpush.vapid_public_key'),
                'privateKey' => Config::get('services.webpush.vapid_private_key'),
            ],
        ];

        if (empty($auth['VAPID']['publicKey']) || empty($auth['VAPID']['privateKey'])) {
            return 0;
        }

        $webPush = new WebPush($auth);
        $webPush->setReuseVAPIDHeaders(true);

        $payloadJson = json_encode($payload);

        foreach ($user->pushSubscriptions as $subscription) {
            $webPush->queueNotification($this->toWebPushSubscription($subscription), $payloadJson);
        }

        return $this->flush($webPush);
    }

    /**
     * Send a single notification to every subscription in the collection
     * (used for society-wide broadcasts).
     */
    public function broadcast(iterable $subscriptions, array $payload): int
    {
        $auth = [
            'VAPID' => [
                'subject' => Config::get('services.webpush.subject', 'mailto:admin@sociosphere.app'),
                'publicKey' => Config::get('services.webpush.vapid_public_key'),
                'privateKey' => Config::get('services.webpush.vapid_private_key'),
            ],
        ];

        if (empty($auth['VAPID']['publicKey']) || empty($auth['VAPID']['privateKey'])) {
            return 0;
        }

        $webPush = new WebPush($auth);
        $webPush->setReuseVAPIDHeaders(true);
        $payloadJson = json_encode($payload);

        foreach ($subscriptions as $subscription) {
            $webPush->queueNotification($this->toWebPushSubscription($subscription), $payloadJson);
        }

        return $this->flush($webPush);
    }

    private function flush(WebPush $webPush): int
    {
        $sent = 0;
        foreach ($webPush->flush() as $report) {
            if ($report->isSuccess()) {
                $sent++;
                continue;
            }

            $status = $report->getResponse()?->getStatusCode();
            if (in_array($status, [404, 410], true)) {
                // Subscription is dead — remove it.
                $endpoint = (string) $report->getRequest()->getUri();
                PushSubscription::query()->where('endpoint', $endpoint)->delete();
            }
        }

        return $sent;
    }

    private function toWebPushSubscription(PushSubscription $subscription): WebPushSubscription
    {
        return new WebPushSubscription(
            $subscription->endpoint,
            $subscription->p256dh,
            $subscription->auth
        );
    }
}
