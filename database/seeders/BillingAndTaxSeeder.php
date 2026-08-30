<?php

namespace Database\Seeders;

use App\Models\Flat;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\InvoiceTaxBreakdown;
use App\Models\Payment;
use App\Models\Society;
use App\Models\SocietyBillingConfig;
use App\Models\TaxProfile;
use App\Models\TaxRate;
use App\Models\User;
use Illuminate\Database\Seeder;

class BillingAndTaxSeeder extends Seeder
{
    public function run(): void
    {
        $society = Society::first();
        if (! $society) {
            return;
        }

        $treasurer = User::where('email', 'treasurer@gvr.com')->first() ?? User::where('society_id', $society->id)->first();
        $flats = Flat::where('society_id', $society->id)
            ->whereIn('occupancy_status', ['Occupied', 'Self-Occupied'])
            ->get();

        // 1. Tax Profile (India GST Regime)
        $taxProfile = TaxProfile::firstOrCreate(
            [
                'society_id' => $society->id,
            ],
            [
                'country' => 'India',
                'region' => 'Maharashtra',
                'tax_scheme' => 'GST',
                'currency_code' => 'INR',
                'currency_symbol' => '₹',
                'locale' => 'en_IN',
                'rounding_mode' => 'round',
                'rounding_precision' => 2,
                'tax_registration_no' => '27AABCS1234F1Z5',
                'is_active' => true,
            ]
        );

        // Tax Rates: CGST (9%) + SGST (9%)
        $cgst = TaxRate::firstOrCreate(
            [
                'tax_profile_id' => $taxProfile->id,
                'code' => 'CGST-9',
            ],
            [
                'name' => 'Central GST (CGST 9%)',
                'rate' => 9.00,
                'type' => 'percentage',
                'is_compound' => false,
                'is_active' => true,
                'sort_order' => 1,
            ]
        );

        $sgst = TaxRate::firstOrCreate(
            [
                'tax_profile_id' => $taxProfile->id,
                'code' => 'SGST-9',
            ],
            [
                'name' => 'State GST (SGST 9%)',
                'rate' => 9.00,
                'type' => 'percentage',
                'is_compound' => false,
                'is_active' => true,
                'sort_order' => 2,
            ]
        );

        // 2. Society Billing Settings
        SocietyBillingConfig::firstOrCreate(
            [
                'society_id' => $society->id,
            ],
            [
                'billing_mode' => 'per_sqft',
                'base_rate' => 3.50,
                'tax_rate' => 18.00,
                'due_day' => 10,
                'grace_days' => 5,
                'penalty_rate' => 2.00,
                'penalty_cap' => 500.00,
                'is_active' => true,
            ]
        );

        // 3. Generate Invoices for Flats for current & previous month
        $months = [
            ['month' => (int) now()->format('m'), 'year' => (int) now()->format('Y'), 'period' => now()->format('F Y'), 'is_current' => true],
            ['month' => (int) now()->subMonth()->format('m'), 'year' => (int) now()->subMonth()->format('Y'), 'period' => now()->subMonth()->format('F Y'), 'is_current' => false],
        ];

        foreach ($months as $mIdx => $m) {
            foreach ($flats->take(16) as $fIdx => $flat) {
                $invoiceNo = sprintf('INV-%04d%02d-%03d', $m['year'], $m['month'], $fIdx + 1);

                $area = (float) ($flat->area_sqft ?: 1200);
                $maintenanceAmt = round($area * 3.50, 2);
                $sinkingFund = 500.00;
                $waterCharge = 350.00;
                $parkingFee = ($fIdx % 2 === 0) ? 450.00 : 0.00;

                $subtotal = $maintenanceAmt + $sinkingFund + $waterCharge + $parkingFee;
                $cgstAmt = round($subtotal * 0.09, 2);
                $sgstAmt = round($subtotal * 0.09, 2);
                $taxAmount = $cgstAmt + $sgstAmt;
                $totalAmount = $subtotal + $taxAmount;

                // Status distribution
                if (! $m['is_current']) {
                    $status = 'Paid';
                    $paidAmount = $totalAmount;
                } else {
                    $status = match ($fIdx % 4) {
                        0, 1 => 'Paid',
                        2 => 'Partially Paid',
                        3 => 'Unpaid',
                    };
                    $paidAmount = match ($status) {
                        'Paid' => $totalAmount,
                        'Partially Paid' => round($totalAmount / 2, 2),
                        'Unpaid' => 0.00,
                    };
                }

                $issueDate = now()->setDate($m['year'], $m['month'], 1)->format('Y-m-d');
                $dueDate = now()->setDate($m['year'], $m['month'], 10)->format('Y-m-d');

                $invoice = Invoice::firstOrCreate(
                    [
                        'society_id' => $society->id,
                        'invoice_number' => $invoiceNo,
                    ],
                    [
                        'flat_id' => $flat->id,
                        'invoice_no' => $invoiceNo,
                        'billing_period' => $m['period'],
                        'billing_month' => $m['month'],
                        'billing_year' => $m['year'],
                        'issue_date' => $issueDate,
                        'due_date' => $dueDate,
                        'subtotal' => $subtotal,
                        'tax_amount' => $taxAmount,
                        'discount_amount' => 0.00,
                        'penalty' => 0.00,
                        'total_amount' => $totalAmount,
                        'paid_amount' => $paidAmount,
                        'status' => $status,
                        'notes' => 'Regular monthly society maintenance bill.',
                        'generated_by' => $treasurer?->id,
                    ]
                );

                // Invoice Items
                InvoiceItem::firstOrCreate(
                    [
                        'society_id' => $society->id,
                        'invoice_id' => $invoice->id,
                        'title' => 'Base Maintenance Charges (' . $area . ' sq.ft @ ₹3.50/sq.ft)',
                    ],
                    [
                        'calculation_type' => 'per_sqft',
                        'unit_price' => 3.50,
                        'quantity' => $area,
                        'amount' => $maintenanceAmt,
                    ]
                );

                InvoiceItem::firstOrCreate(
                    [
                        'society_id' => $society->id,
                        'invoice_id' => $invoice->id,
                        'title' => 'Sinking & Major Repair Reserve Fund',
                    ],
                    [
                        'calculation_type' => 'fixed',
                        'unit_price' => 500.00,
                        'quantity' => 1,
                        'amount' => $sinkingFund,
                    ]
                );

                InvoiceItem::firstOrCreate(
                    [
                        'society_id' => $society->id,
                        'invoice_id' => $invoice->id,
                        'title' => 'Municipal Water Supply & Sewerage',
                    ],
                    [
                        'calculation_type' => 'fixed',
                        'unit_price' => 350.00,
                        'quantity' => 1,
                        'amount' => $waterCharge,
                    ]
                );

                // Tax Breakdowns
                InvoiceTaxBreakdown::firstOrCreate(
                    [
                        'invoice_id' => $invoice->id,
                        'tax_code' => 'CGST-9',
                    ],
                    [
                        'tax_name' => 'Central GST (CGST 9%)',
                        'rate' => 9.00,
                        'taxable_amount' => $subtotal,
                        'tax_amount' => $cgstAmt,
                        'sort_order' => 1,
                    ]
                );

                InvoiceTaxBreakdown::firstOrCreate(
                    [
                        'invoice_id' => $invoice->id,
                        'tax_code' => 'SGST-9',
                    ],
                    [
                        'tax_name' => 'State GST (SGST 9%)',
                        'rate' => 9.00,
                        'taxable_amount' => $subtotal,
                        'tax_amount' => $sgstAmt,
                        'sort_order' => 2,
                    ]
                );

                // 4. Payments
                if ($paidAmount > 0) {
                    $payMethod = match ($fIdx % 4) {
                        0 => 'UPI',
                        1 => 'NetBanking',
                        2 => 'Card',
                        3 => 'Cheque',
                    };

                    $txnRef = match ($payMethod) {
                        'UPI' => 'UPI/' . rand(100000000000, 999999999999) . '@okaxis',
                        'NetBanking' => 'HDFC' . rand(10000000, 99999999),
                        'Card' => 'RZP_TXN_' . rand(100000, 999999),
                        'Cheque' => 'CHQ#' . rand(100000, 999999) . ' SBI Vashi Branch',
                    };

                    Payment::firstOrCreate(
                        [
                            'society_id' => $society->id,
                            'invoice_id' => $invoice->id,
                            'transaction_reference' => $txnRef,
                        ],
                        [
                            'flat_id' => $flat->id,
                            'payment_number' => sprintf('PAY-%04d%02d-%03d', $m['year'], $m['month'], $fIdx + 1),
                            'amount' => $paidAmount,
                            'payment_method' => $payMethod,
                            'gateway_reference' => 'GATEWAY-REF-' . rand(10000, 99999),
                            'paid_at' => now()->subDays(rand(1, 15)),
                            'status' => 'Success',
                            'remarks' => "Maintenance payment for {$m['period']}",
                        ]
                    );
                }
            }
        }
    }
}
