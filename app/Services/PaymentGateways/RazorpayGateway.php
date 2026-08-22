<?php

namespace App\Services\PaymentGateways;

use App\Contracts\PaymentGateway;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;

/**
 * Razorpay gateway integration (webhook-driven).
 *
 * Online collections are confirmed asynchronously via Razorpay's
 * `payment.captured` webhook. The shared secret is read from
 * `services.razorpay.webhook_secret` and verified using the standard
 * X-Razorpay-Signature HMAC-SHA256 scheme.
 */
class RazorpayGateway implements PaymentGateway
{
    public function name(): string
    {
        return 'razorpay';
    }

    public function label(): string
    {
        return 'Razorpay';
    }

    public function supportedMethods(): array
    {
        return ['UPI', 'NetBanking', 'Credit Card'];
    }

    public function supportsWebhooks(): bool
    {
        return true;
    }

    public function verifyWebhook(Request $request): bool
    {
        $secret = Config::get('services.razorpay.webhook_secret');
        if (empty($secret)) {
            return false;
        }

        $signature = $request->header('X-Razorpay-Signature');
        if (empty($signature)) {
            return false;
        }

        $payload = $request->getContent();
        $expected = hash_hmac('sha256', $payload, $secret);

        return hash_equals($expected, (string) $signature);
    }

    public function parseWebhook(Request $request): array
    {
        $event = $request->input('event');
        $payment = $request->input('payload.payment.entity', []);

        $status = match ($event) {
            'payment.captured' => 'Completed',
            'payment.failed' => 'Failed',
            default => 'Pending',
        };

        return [
            'status' => $status,
            'amount' => isset($payment['amount']) ? ((float) $payment['amount']) / 100 : 0.0,
            'transaction_reference' => $payment['id'] ?? null,
            'gateway_reference' => $payment['order_id'] ?? null,
            'paid_at' => isset($payment['captured_at'])
                ? date('Y-m-d H:i:s', (int) ($payment['captured_at']))
                : null,
            'meta' => [
                'method' => $payment['method'] ?? null,
                'email' => $payment['email'] ?? null,
                'contact' => $payment['contact'] ?? null,
            ],
        ];
    }
}
