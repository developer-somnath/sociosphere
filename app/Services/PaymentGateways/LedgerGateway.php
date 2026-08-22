<?php

namespace App\Services\PaymentGateways;

use App\Contracts\PaymentGateway;
use Illuminate\Http\Request;

/**
 * The default "gateway" — manual ledger entry by society staff.
 *
 * No webhooks: payments are recorded directly by authorised users via the
 * collection form. This keeps the abstraction uniform so the UI and the
 * PaymentService can treat every payment as gateway-originated.
 */
class LedgerGateway implements PaymentGateway
{
    public function name(): string
    {
        return 'ledger';
    }

    public function label(): string
    {
        return 'Manual Ledger';
    }

    public function supportedMethods(): array
    {
        return ['Cash', 'Cheque', 'UPI', 'NetBanking', 'Credit Card'];
    }

    public function supportsWebhooks(): bool
    {
        return false;
    }

    public function verifyWebhook(Request $request): bool
    {
        return false;
    }

    public function parseWebhook(Request $request): array
    {
        return [];
    }
}
