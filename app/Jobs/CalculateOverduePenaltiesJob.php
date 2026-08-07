<?php

namespace App\Jobs;

use App\Models\Invoice;
use App\Models\InvoicePenalty;
use App\Models\SocietyBillingConfig;
use App\Services\ActivityLogger;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * Applies overdue late-fee penalties to invoices whose due date (plus the
 * configured grace period) has passed. Idempotent: an invoice is penalized
 * at most once per billing period (enforced by a DB unique constraint and a
 * pre-check against the invoice_penalties table).
 */
class CalculateOverduePenaltiesJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly ?int $societyId = null,
    ) {}

    /**
     * Execute the job. Returns a summary array for direct callers.
     *
     * @return array<string, mixed>
     */
    public function handle(): array
    {
        $summary = [
            'scanned_invoices' => 0,
            'penalties_applied' => 0,
            'penalty_total' => 0.0,
        ];

        $configs = SocietyBillingConfig::query()
            ->when($this->societyId !== null, fn ($q) => $q->where('society_id', $this->societyId))
            ->where('is_active', true)
            ->get();

        foreach ($configs as $config) {
            $graceCutoff = now()->subDays(max((int) $config->grace_days, 0))->startOfDay();
            $penaltyRate = (float) $config->penalty_rate;
            $penaltyCap = $config->penalty_cap !== null ? (float) $config->penalty_cap : null;

            $invoices = Invoice::query()
                ->where('society_id', $config->society_id)
                ->whereIn('status', ['Unpaid', 'Partially Paid'])
                ->whereNotNull('due_date')
                ->where('due_date', '<', $graceCutoff->toDateString())
                ->get();

            try {
                DB::transaction(function () use ($invoices, $config, $penaltyRate, $penaltyCap, &$summary) {
                    foreach ($invoices as $invoice) {
                        $summary['scanned_invoices']++;

                        $alreadyPenalized = InvoicePenalty::query()
                            ->where('invoice_id', $invoice->id)
                            ->where('billing_period', $invoice->billing_period ?: now()->format('Y-m'))
                            ->exists();

                        if ($alreadyPenalized) {
                            continue;
                        }

                        $base = (float) $invoice->total_amount - (float) $invoice->penalty;
                        $rawPenalty = round($base * ($penaltyRate / 100), 2);
                        $penaltyAmount = $penaltyCap !== null ? min($rawPenalty, $penaltyCap) : $rawPenalty;

                        if ($penaltyAmount <= 0) {
                            continue;
                        }

                        $period = $invoice->billing_period ?: now()->format('Y-m');

                        InvoicePenalty::create([
                            'society_id' => $config->society_id,
                            'invoice_id' => $invoice->id,
                            'penalty_amount' => $penaltyAmount,
                            'applied_on' => now()->toDateString(),
                            'billing_period' => $period,
                            'reason' => 'Late payment penalty after grace period',
                        ]);

                        $invoice->update([
                            'penalty' => round((float) $invoice->penalty + $penaltyAmount, 2),
                            'total_amount' => round((float) $invoice->total_amount + $penaltyAmount, 2),
                            'status' => 'Overdue',
                        ]);

                        $summary['penalties_applied']++;
                        $summary['penalty_total'] += $penaltyAmount;
                    }
                });
            } catch (Throwable $e) {
                // Log and continue with next society config.
                logger()->error('Overdue penalty run failed for society ' . $config->society_id, ['error' => $e->getMessage()]);
            }
        }

        $summary['penalty_total'] = round($summary['penalty_total'], 2);

        app(ActivityLogger::class)->log(
            action: 'create',
            module: 'Billing',
            entityType: InvoicePenalty::class,
            entityId: '0',
            remarks: "Overdue penalty run: {$summary['penalties_applied']} penalty(ies) applied totalling {$summary['penalty_total']}"
        );

        return $summary;
    }
}
