<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\InvoiceTaxBreakdown;
use App\Models\Society;
use App\Models\TaxProfile;
use App\Models\TaxRate;

class TaxEngineService
{
    /**
     * Calculate tax breakdown for a given subtotal and society context.
     *
     * @return array{
     *     subtotal: float,
     *     tax_total: float,
     *     grand_total: float,
     *     tax_profile: TaxProfile|null,
     *     items: array<int, array{
     *         name: string,
     *         code: string,
     *         rate: float,
     *         taxable_amount: float,
     *         tax_amount: float,
     *         is_inclusive: bool,
     *         is_compound: bool
     *     }>
     * }
     */
    public function calculateTax(Society $society, float $subtotal): array
    {
        $profile = TaxProfile::query()
            ->where('society_id', $society->id)
            ->where('is_active', true)
            ->with(['activeRates'])
            ->first();

        if (! $profile || $profile->tax_scheme === 'None' || $subtotal <= 0) {
            return [
                'subtotal' => $subtotal,
                'tax_total' => 0.0,
                'grand_total' => $subtotal,
                'tax_profile' => $profile,
                'items' => [],
            ];
        }

        $rates = $profile->activeRates;
        if ($rates->isEmpty()) {
            return [
                'subtotal' => $subtotal,
                'tax_total' => 0.0,
                'grand_total' => $subtotal,
                'tax_profile' => $profile,
                'items' => [],
            ];
        }

        $taxItems = [];
        $runningTaxable = $subtotal;
        $totalTax = 0.0;

        foreach ($rates as $rate) {
            $baseAmount = $rate->is_compound ? ($subtotal + $totalTax) : $subtotal;
            $ratePercent = (float) $rate->rate_percentage;

            if ($rate->is_inclusive) {
                // Inclusive: Subtotal already contains tax -> Tax = Base * Rate / (100 + Rate)
                $rawTax = ($baseAmount * $ratePercent) / (100 + $ratePercent);
            } else {
                // Exclusive: Tax = Base * Rate / 100
                $rawTax = ($baseAmount * $ratePercent) / 100;
            }

            $roundedTax = $this->applyRounding($rawTax, $profile->rounding_mode, $profile->rounding_precision);

            if ($profile->tax_scheme === 'GST' && strtolower($rate->code) === 'gst') {
                // GST Split: CGST (50%) + SGST (50%)
                $halfRate = $ratePercent / 2;
                $halfTax = $this->applyRounding($roundedTax / 2, $profile->rounding_mode, $profile->rounding_precision);

                $taxItems[] = [
                    'name' => 'Central GST (CGST)',
                    'code' => 'CGST',
                    'rate' => $halfRate,
                    'taxable_amount' => $baseAmount,
                    'tax_amount' => $halfTax,
                    'is_inclusive' => $rate->is_inclusive,
                    'is_compound' => $rate->is_compound,
                ];

                $taxItems[] = [
                    'name' => 'State GST (SGST)',
                    'code' => 'SGST',
                    'rate' => $halfRate,
                    'taxable_amount' => $baseAmount,
                    'tax_amount' => $halfTax,
                    'is_inclusive' => $rate->is_inclusive,
                    'is_compound' => $rate->is_compound,
                ];

                $totalTax += ($halfTax * 2);
            } else {
                $taxItems[] = [
                    'name' => $rate->name,
                    'code' => $rate->code,
                    'rate' => $ratePercent,
                    'taxable_amount' => $baseAmount,
                    'tax_amount' => $roundedTax,
                    'is_inclusive' => $rate->is_inclusive,
                    'is_compound' => $rate->is_compound,
                ];

                $totalTax += $roundedTax;
            }
        }

        $grandTotal = $this->applyRounding($subtotal + $totalTax, $profile->rounding_mode, $profile->rounding_precision);

        return [
            'subtotal' => $subtotal,
            'tax_total' => $totalTax,
            'grand_total' => $grandTotal,
            'tax_profile' => $profile,
            'items' => $taxItems,
        ];
    }

    /**
     * Save tax breakdown line-items for an invoice.
     */
    public function saveInvoiceTaxBreakdown(Invoice $invoice, array $taxResult): void
    {
        // Remove old tax breakdowns if re-calculating
        InvoiceTaxBreakdown::query()->where('invoice_id', $invoice->id)->delete();

        foreach ($taxResult['items'] as $item) {
            InvoiceTaxBreakdown::create([
                'invoice_id' => $invoice->id,
                'tax_name' => $item['name'],
                'tax_code' => $item['code'],
                'rate' => $item['rate'],
                'taxable_amount' => $item['taxable_amount'],
                'tax_amount' => $item['tax_amount'],
            ]);
        }
    }

    /**
     * Apply rounding mode & precision.
     */
    protected function applyRounding(float $value, string $mode, int $precision = 2): float
    {
        $factor = pow(10, $precision);

        switch (strtolower($mode)) {
            case 'ceil':
                return ceil($value * $factor) / $factor;
            case 'floor':
                return floor($value * $factor) / $factor;
            case 'round':
            default:
                return round($value, $precision);
        }
    }
}
