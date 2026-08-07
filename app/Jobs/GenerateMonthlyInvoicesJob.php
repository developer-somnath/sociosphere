<?php

namespace App\Jobs;

use App\Models\BillingRunHistory;
use App\Models\Society;
use App\Services\ActivityLogger;
use App\Services\BillingService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * Generates monthly maintenance invoices for every eligible flat in a society.
 *
 * Billing mode (from SocietyBillingConfig):
 *  - per_sqft: base_rate × flat.area_sqft
 *  - fixed:    base_rate per flat
 *
 * Tax is applied as a percentage on the subtotal. The job is idempotent:
 * flats that already carry an invoice for the target billing period are skipped.
 */
class GenerateMonthlyInvoicesJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly int $societyId,
        public readonly ?string $billingPeriod = null,
        public readonly array $excludedFlatIds = [],
        public readonly ?int $runByUserId = null,
    ) {}

    /**
     * Execute the job. Returns a run summary array for direct callers.
     *
     * @return array<string, mixed>
     */
    public function handle(): array
    {
        $society = Society::query()->find($this->societyId);

        if (! $society) {
            return ['status' => 'Failed', 'notes' => 'Society not found.', 'invoices_generated' => 0];
        }

        $period = $this->billingPeriod ?: now()->format('Y-m');

        try {
            $run = DB::transaction(fn () => app(BillingService::class)->executeRun(
                societyId: $this->societyId,
                billingPeriod: $this->billingPeriod,
                excludedFlatIds: $this->excludedFlatIds,
                runByUserId: $this->runByUserId,
            ));
        } catch (Throwable $e) {
            $run = [
                'status' => 'Failed',
                'notes' => 'Billing run failed: ' . $e->getMessage(),
                'invoices_generated' => 0,
            ];
        }

        BillingRunHistory::create([
            'society_id' => $society->id,
            'billing_period' => $period,
            'total_flats' => $run['total_flats'] ?? 0,
            'billed_flats' => $run['billed_flats'] ?? 0,
            'excluded_flats' => $run['excluded_flats'] ?? 0,
            'skipped_flats' => $run['skipped_flats'] ?? 0,
            'subtotal' => $run['subtotal'] ?? 0,
            'tax_amount' => $run['tax_amount'] ?? 0,
            'total_amount' => $run['total_amount'] ?? 0,
            'invoices_generated' => $run['invoices_generated'] ?? 0,
            'status' => $run['status'] ?? 'Failed',
            'run_by' => $this->runByUserId,
            'notes' => $run['notes'] ?? null,
        ]);

        app(ActivityLogger::class)->log(
            action: 'create',
            module: 'Billing',
            entityType: BillingRunHistory::class,
            entityId: (string) BillingRunHistory::query()->where('society_id', $society->id)->latest('id')->value('id'),
            remarks: "Auto-billing run for {$period}: {$run['invoices_generated']} invoice(s) generated, total " . ($run['total_amount'] ?? 0)
        );

        return $run;
    }
}
