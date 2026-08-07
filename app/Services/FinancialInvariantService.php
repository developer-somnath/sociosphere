<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Payment;

/**
 * Validates the financial ledger invariants of a society.
 *
 * The engine guarantees that:
 *  1. Invoice paid_amount is exactly the sum of its recorded payments.
 *  2. paid_amount never exceeds total_amount (no over-collection).
 *  3. Invoice status is consistent with the amounts (Paid ⇒ paid in full,
 *     Unpaid ⇒ zero collected, Partially Paid ⇒ 0 < paid < total).
 */
class FinancialInvariantService
{
    /**
     * Run all ledger integrity checks for a society.
     *
     * @return array<int, string> Human-readable violations (empty when healthy).
     */
    public function checkInvoicesMatchPayments(int $societyId): array
    {
        $violations = [];

        $invoices = Invoice::query()
            ->where('society_id', $societyId)
            ->with('payments')
            ->get();

        foreach ($invoices as $invoice) {
            $paid = round((float) $invoice->paid_amount, 2);
            $total = round((float) $invoice->total_amount, 2);
            $paymentSum = round($invoice->payments->sum('amount'), 2);

            if (abs($paid - $paymentSum) > 0.009) {
                $violations[] = sprintf(
                    'Invoice %s: paid_amount (%s) does not match sum of payments (%s).',
                    $invoice->invoice_number ?: $invoice->id,
                    number_format($paid, 2),
                    number_format($paymentSum, 2)
                );
            }

            if ($paid > $total + 0.009) {
                $violations[] = sprintf(
                    'Invoice %s: collected (%s) exceeds invoice total (%s).',
                    $invoice->invoice_number ?: $invoice->id,
                    number_format($paid, 2),
                    number_format($total, 2)
                );
            }

            if ($invoice->status === 'Paid' && $paid < $total - 0.009) {
                $violations[] = sprintf(
                    'Invoice %s: marked Paid but only %s of %s collected.',
                    $invoice->invoice_number ?: $invoice->id,
                    number_format($paid, 2),
                    number_format($total, 2)
                );
            }

            if ($invoice->status === 'Unpaid' && $paid > 0.009) {
                $violations[] = sprintf(
                    'Invoice %s: marked Unpaid but %s already collected.',
                    $invoice->invoice_number ?: $invoice->id,
                    number_format($paid, 2)
                );
            }

            if ($invoice->status === 'Partially Paid' && ($paid <= 0.009 || $paid >= $total - 0.009)) {
                $violations[] = sprintf(
                    'Invoice %s: status Partially Paid inconsistent with collected amount %s of %s.',
                    $invoice->invoice_number ?: $invoice->id,
                    number_format($paid, 2),
                    number_format($total, 2)
                );
            }
        }

        // Cross-check orphan payments (no invoice) and payments whose invoice
        // record disagrees with the payment's own flat linkage.
        $payments = Payment::query()
            ->where('society_id', $societyId)
            ->whereNull('invoice_id')
            ->get();

        foreach ($payments as $payment) {
            $violations[] = sprintf(
                'Payment %s (%s) is not linked to any invoice.',
                $payment->payment_number ?: $payment->id,
                number_format((float) $payment->amount, 2)
            );
        }

        return $violations;
    }

    /**
     * Convenience boolean wrapper around checkInvoicesMatchPayments().
     */
    public function assertInvoicesMatchPayments(int $societyId): bool
    {
        return count($this->checkInvoicesMatchPayments($societyId)) === 0;
    }
}
