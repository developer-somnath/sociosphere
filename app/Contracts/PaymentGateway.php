<?php

namespace App\Contracts;

use Illuminate\Http\Request;

/**
 * Contract for a payment gateway integration.
 *
 * Each gateway knows how to:
 *  - expose its supported methods (for the collection UI),
 *  - build a redirect/payload for initiating a charge (optional),
 *  - verify and normalise an inbound webhook into a canonical result.
 */
interface PaymentGateway
{
    /**
     * Machine name used in config and stored on payments (e.g. "razorpay").
     */
    public function name(): string;

    /**
     * Human-readable label for the UI.
     */
    public function label(): string;

    /**
     * Payment methods this gateway can accept.
     *
     * @return array<int, string>
     */
    public function supportedMethods(): array;

    /**
     * Whether this gateway delivers asynchronous confirmations via webhook.
     */
    public function supportsWebhooks(): bool;

    /**
     * Verify the authenticity of an inbound webhook request.
     */
    public function verifyWebhook(Request $request): bool;

    /**
     * Normalise a verified webhook into a canonical payment result.
     *
     * @return array{status: string, amount: float, transaction_reference: ?string, gateway_reference: ?string, paid_at: ?string, meta: array}
     */
    public function parseWebhook(Request $request): array;
}
