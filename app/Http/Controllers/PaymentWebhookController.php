<?php

namespace App\Http\Controllers;

use App\Services\PaymentGatewayManager;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Inbound gateway webhooks (S4-2 / Phase 18).
 *
 * Each gateway is mounted at /api/payments/webhook/{gateway}. The gateway
 * verifies the signature, parses the payload into a canonical result, and the
 * PaymentService records the payment against the referenced invoice.
 */
class PaymentWebhookController extends Controller
{
    public function __construct(
        protected PaymentGatewayManager $gateways,
        protected PaymentService $payments,
    ) {}

    public function handle(Request $request, string $gateway): JsonResponse
    {
        $gatewayInstance = $this->gateways->forWebhook($gateway);

        if (!$gatewayInstance || !$gatewayInstance->supportsWebhooks()) {
            return response()->json(['error' => 'Unsupported gateway'], 404);
        }

        if (!$gatewayInstance->verifyWebhook($request)) {
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        $result = $gatewayInstance->parseWebhook($request);

        // Only act on completed payments that reference a known invoice.
        $invoiceId = $request->input('payload.payment.entity.notes.invoice_id')
            ?? $request->input('payload.payment.entity.notes.invoiceId')
            ?? null;

        if ($result['status'] === 'Completed' && $invoiceId) {
            $this->payments->record([
                'invoice_id' => $invoiceId,
                'amount' => $result['amount'],
                'payment_method' => $this->mapMethod($result['meta']['method'] ?? null),
                'transaction_reference' => $result['transaction_reference'],
                'gateway_reference' => $result['gateway_reference'],
                'paid_at' => $result['paid_at'],
                'status' => 'Completed',
                'remarks' => 'Gateway webhook: ' . $gatewayInstance->label(),
                'gateway' => $gatewayInstance->name(),
            ]);
        }

        return response()->json(['ok' => true]);
    }

    private function mapMethod(?string $method): string
    {
        return match (strtolower((string) $method)) {
            'card', 'credit_card' => 'Credit Card',
            'netbanking', 'net_banking' => 'NetBanking',
            'upi' => 'UPI',
            'wallet' => 'UPI',
            default => 'UPI',
        };
    }
}
