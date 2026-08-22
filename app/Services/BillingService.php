<?php

namespace App\Services;

use App\Models\Flat;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\SocietyBillingConfig;
use Carbon\Carbon;

/**
 * Shared billing calculation engine used by both the async job and the
 * interactive preview/run controllers so the math stays in one place.
 */
class BillingService
{
    /**
     * Build a billing run plan (no persistence).
     *
     * @param array<int> $excludedFlatIds
     * @return array<string, mixed>
     */
    public function buildRunPlan(
        int $societyId,
        ?string $billingPeriod = null,
        array $excludedFlatIds = [],
    ): array {
        $config = SocietyBillingConfig::query()
            ->where('society_id', $societyId)
            ->first();

        $period = $billingPeriod ?: now()->format('Y-m');
        $startOfPeriod = Carbon::createFromFormat('Y-m', $period)->startOfMonth();
        $dueDay = min(max((int) ($config?->due_day ?? 10), 1), 28);

        $plan = [
            'society_id' => $societyId,
            'billing_period' => $period,
            'issue_date' => $startOfPeriod->toDateString(),
            'due_date' => $startOfPeriod->copy()->day($dueDay)->toDateString(),
            'config' => $config ? [
                'billing_mode' => $config->billing_mode,
                'base_rate' => (float) $config->base_rate,
                'tax_rate' => (float) $config->tax_rate,
                'due_day' => $config->due_day,
                'grace_days' => $config->grace_days,
                'penalty_rate' => (float) $config->penalty_rate,
                'penalty_cap' => $config->penalty_cap !== null ? (float) $config->penalty_cap : null,
                'is_active' => $config->is_active,
            ] : null,
            'is_configured' => $config !== null && $config->is_active,
            'flats' => [],
            'totals' => [
                'total_flats' => 0,
                'excluded_flats' => 0,
                'skipped_flats' => 0,
                'billed_flats' => 0,
                'subtotal' => 0.0,
                'tax_amount' => 0.0,
                'total_amount' => 0.0,
            ],
        ];

        if (! $config || ! $config->is_active) {
            return $plan;
        }

        $flats = Flat::query()
            ->with('tower')
            ->where('society_id', $societyId)
            ->whereNull('deleted_at')
            ->orderBy('flat_no')
            ->get();

        $existing = Invoice::query()
            ->where('society_id', $societyId)
            ->where('billing_period', $period)
            ->pluck('flat_id')
            ->all();

        $excluded = array_map('intval', $excludedFlatIds);
        $isPerSqft = $config->billing_mode === 'per_sqft';

        foreach ($flats as $flat) {
            if (in_array((int) $flat->id, $excluded, true)) {
                $plan['totals']['excluded_flats']++;
                continue;
            }

            $alreadyBilled = in_array((int) $flat->id, $existing, true);
            $area = max((float) $flat->area_sqft, 1);
            $quantity = $isPerSqft ? $area : 1.0;
            $unitPrice = (float) $config->base_rate;
            $subtotal = round($unitPrice * $quantity, 2);
            $taxAmount = round($subtotal * ((float) $config->tax_rate / 100), 2);
            $totalAmount = round($subtotal + $taxAmount, 2);

            if (! $alreadyBilled) {
                $plan['totals']['billed_flats']++;
                $plan['totals']['subtotal'] += $subtotal;
                $plan['totals']['tax_amount'] += $taxAmount;
                $plan['totals']['total_amount'] += $totalAmount;
            } else {
                $plan['totals']['skipped_flats']++;
            }

            $plan['flats'][] = [
                'id' => $flat->id,
                'uuid' => $flat->uuid,
                'flat_no' => $flat->flat_no,
                'tower' => $flat->tower?->name,
                'area_sqft' => $flat->area_sqft,
                'quantity' => round($quantity, 2),
                'unit_price' => round($unitPrice, 2),
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'total_amount' => $totalAmount,
                'already_billed' => $alreadyBilled,
                'excluded' => in_array((int) $flat->id, $excluded, true),
            ];
        }

        $plan['totals']['total_flats'] = $flats->count();
        $plan['totals']['subtotal'] = round($plan['totals']['subtotal'], 2);
        $plan['totals']['tax_amount'] = round($plan['totals']['tax_amount'], 2);
        $plan['totals']['total_amount'] = round($plan['totals']['total_amount'], 2);

        return $plan;
    }

    /**
     * Persist a billing run using the same math as buildRunPlan().
     *
     * @param array<int> $excludedFlatIds
     * @return array<string, mixed>
     */
    public function executeRun(
        int $societyId,
        ?string $billingPeriod = null,
        array $excludedFlatIds = [],
        ?int $runByUserId = null,
    ): array {
        $plan = $this->buildRunPlan($societyId, $billingPeriod, $excludedFlatIds);

        if (! $plan['is_configured']) {
            return ['status' => 'Failed', 'notes' => 'No active billing configuration.', 'invoices_generated' => 0];
        }

        $config = SocietyBillingConfig::query()->where('society_id', $societyId)->first();
        $isPerSqft = $config->billing_mode === 'per_sqft';
        $created = 0;
        $invoiceBase = Invoice::query()
            ->where('society_id', $societyId)
            ->where('billing_period', $plan['billing_period'])
            ->count();

        foreach ($plan['flats'] as $flatData) {
            if ($flatData['already_billed'] || $flatData['excluded']) {
                continue;
            }

            $invoiceBase++;
            $invoiceNumber = 'INV-' . str_replace('-', '', $plan['billing_period']) . '-' . str_pad((string) $invoiceBase, 4, '0', STR_PAD_LEFT);

            $invoice = Invoice::create([
                'society_id' => $societyId,
                'flat_id' => $flatData['id'],
                'invoice_number' => $invoiceNumber,
                'invoice_no' => $invoiceNumber,
                'billing_period' => $plan['billing_period'],
                'billing_month' => (int) Carbon::parse($plan['issue_date'])->month,
                'billing_year' => (int) Carbon::parse($plan['issue_date'])->year,
                'issue_date' => $plan['issue_date'],
                'due_date' => $plan['due_date'],
                'subtotal' => $flatData['subtotal'],
                'tax_amount' => $flatData['tax_amount'],
                'discount_amount' => 0,
                'penalty' => 0,
                'total_amount' => $flatData['total_amount'],
                'paid_amount' => 0,
                'status' => 'Unpaid',
                'notes' => "Auto-generated maintenance invoice for {$plan['billing_period']}",
                'generated_by' => $runByUserId,
            ]);

            InvoiceItem::create([
                'society_id' => $societyId,
                'invoice_id' => $invoice->id,
                'title' => $isPerSqft ? 'Maintenance Charge (Per Sq Ft)' : 'Maintenance Charge (Fixed)',
                'description' => 'Monthly maintenance for ' . $flatData['flat_no']
                    . ($isPerSqft ? ' @ ' . $flatData['area_sqft'] . ' sq.ft.' : ''),
                'calculation_type' => $isPerSqft ? 'Per Sq Ft' : 'Fixed',
                'unit_price' => $flatData['unit_price'],
                'quantity' => $flatData['quantity'],
                'amount' => $flatData['subtotal'],
            ]);

            $society = \App\Models\Society::find($societyId);
            if ($society) {
                $taxEngine = app(\App\Services\TaxEngineService::class);
                $taxResult = $taxEngine->calculateTax($society, (float) $flatData['subtotal']);
                if ($taxResult['tax_profile']) {
                    $taxEngine->saveInvoiceTaxBreakdown($invoice, $taxResult);
                }
            }

            $created++;
        }

        return [
            'status' => 'Completed',
            'notes' => "Auto-billing run for {$plan['billing_period']}",
            'billing_period' => $plan['billing_period'],
            'invoices_generated' => $created,
            'total_flats' => $plan['totals']['total_flats'],
            'billed_flats' => $created,
            'excluded_flats' => $plan['totals']['excluded_flats'],
            'skipped_flats' => $plan['totals']['skipped_flats'],
            'subtotal' => $plan['totals']['subtotal'],
            'tax_amount' => $plan['totals']['tax_amount'],
            'total_amount' => $plan['totals']['total_amount'],
        ];
    }
}
