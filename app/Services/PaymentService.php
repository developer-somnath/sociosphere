<?php

namespace App\Services;

use App\Contracts\PaymentGateway;
use App\Models\Invoice;
use App\Models\Payment;
use App\Services\PaymentGateways\LedgerGateway;
use Illuminate\Support\Facades\Config;

/**
 * Records payments through the gateway abstraction and produces digital
 * receipts. Keeps the ledger, invoice reconciliation, and activity logging
 * in one place so both manual entries and webhook-driven payments share the
 * same code path (S4-2 / Phase 18).
 */
class PaymentService
{
    public function __construct(
        protected PaymentGatewayManager $gateways,
    ) {}

    /**
     * Record a payment originating from a gateway (manual ledger or webhook).
     *
     * @param array $data Keys: invoice_id, amount, payment_method, transaction_reference, gateway_reference, paid_at, status, remarks, gateway
     */
    public function record(array $data): Payment
    {
        $gatewayName = $data['gateway'] ?? 'ledger';
        $gateway = $this->gateways->get($gatewayName) ?? new LedgerGateway();

        $invoice = Invoice::findOrFail($data['invoice_id']);
        $amount = (float) $data['amount'];

        $societyId = $invoice->society_id;
        $nextNum = Payment::where('society_id', $societyId)->count() + 1;
        $paymentNumber = 'PAY-' . date('Ym') . '-' . str_pad((string) $nextNum, 4, '0', STR_PAD_LEFT);

        $payment = Payment::create([
            'society_id' => $societyId,
            'invoice_id' => $invoice->id,
            'flat_id' => $invoice->flat_id,
            'payment_number' => $paymentNumber,
            'amount' => $amount,
            'payment_method' => $data['payment_method'],
            'transaction_reference' => $data['transaction_reference'] ?? null,
            'gateway_reference' => $data['gateway_reference'] ?? null,
            'paid_at' => $data['paid_at'] ?? now(),
            'status' => $data['status'] ?? 'Completed',
            'remarks' => $data['remarks'] ?? null,
        ]);

        $this->reconcileInvoice($invoice, $amount);

        app(ActivityLogger::class)->log(
            action: 'create',
            module: 'Payment',
            entityType: Payment::class,
            entityId: (string) $payment->id,
            remarks: "Recorded {$gateway->label()} payment {$payment->payment_number} of {$amount} for Invoice {$invoice->invoice_number}"
        );

        return $payment;
    }

    /**
     * Build a canonical receipt payload for a payment (used by the receipt
     * view and any future PDF/email export).
     *
     * @return array<string, mixed>
     */
    public function receiptData(Payment $payment): array
    {
        $payment->load(['invoice', 'invoice.flat', 'invoice.flat.tower', 'society']);

        $gateway = $this->gateways->get($payment->gateway_reference ? 'razorpay' : 'ledger')
            ?? new LedgerGateway();

        return [
            'receipt_no' => $payment->payment_number,
            'invoice_no' => $payment->invoice?->invoice_number,
            'society_name' => $payment->society?->name,
            'flat_no' => $payment->invoice?->flat?->flat_no,
            'tower' => $payment->invoice?->flat?->tower?->name,
            'amount' => (float) $payment->amount,
            'method' => $payment->payment_method,
            'gateway' => $gateway->label(),
            'transaction_reference' => $payment->transaction_reference,
            'paid_at' => $payment->paid_at?->format('Y-m-d H:i:s'),
            'status' => $payment->status,
            'remarks' => $payment->remarks,
        ];
    }

    protected function reconcileInvoice(Invoice $invoice, float $amount): void
    {
        $newPaid = $invoice->paid_amount + $amount;
        $status = $newPaid >= $invoice->total_amount ? 'Paid' : 'Partially Paid';
        $invoice->update([
            'paid_amount' => $newPaid,
            'status' => $status,
        ]);
    }
}
