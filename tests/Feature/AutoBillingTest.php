<?php

namespace Tests\Feature;

use App\Jobs\CalculateOverduePenaltiesJob;
use App\Jobs\GenerateMonthlyInvoicesJob;
use App\Models\BillingRunHistory;
use App\Models\Flat;
use App\Models\Invoice;
use App\Models\InvoicePenalty;
use App\Models\Payment;
use App\Models\Society;
use App\Models\SocietyBillingConfig;
use App\Models\Tower;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AutoBillingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([
            RoleSeeder::class,
            PermissionSeeder::class,
            RolePermissionSeeder::class,
        ]);
    }

    private function societyWithFlats(int $flatCount = 3, ?SocietyBillingConfig $config = null): array
    {
        $society = Society::factory()->create();
        $tower = Tower::factory()->create(['society_id' => $society->id]);

        $flats = [];
        for ($i = 0; $i < $flatCount; $i++) {
            $flats[] = Flat::factory()->create([
                'society_id' => $society->id,
                'tower_id' => $tower->id,
                'area_sqft' => 1000 + ($i * 100),
            ]);
        }

        if ($config !== null) {
            $config->society_id = $society->id;
            $config->save();
        }

        return [$society, $flats];
    }

    /* ─── Preview & access ──────────────────────────────────────────────── */

    public function test_admin_can_view_billing_preview_page(): void
    {
        $society = Society::factory()->create();
        $admin = User::factory()->societyAdmin($society->id)->create();
        SocietyBillingConfig::factory()->create(['society_id' => $society->id]);

        $this->actingAs($admin)
            ->get(route('billing.preview'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/invoices/pages/batch-generate')
                ->has('plan')
                ->has('recent_runs')
                ->where('can.run', true)
                ->where('can.configure', true)
            );
    }

    public function test_resident_cannot_access_billing_preview(): void
    {
        $society = Society::factory()->create();
        $resident = User::factory()->resident($society->id)->create();

        $this->actingAs($resident)
            ->get(route('billing.preview'))
            ->assertForbidden();
    }

    /* ─── Job: per-sqft run math ────────────────────────────────────────── */

    public function test_generate_invoices_job_creates_per_sqft_invoices(): void
    {
        [$society, $flats] = $this->societyWithFlats(2, SocietyBillingConfig::factory()->make([
            'billing_mode' => 'per_sqft',
            'base_rate' => 2.50,
            'tax_rate' => 18.00,
            'due_day' => 10,
        ]));
        $admin = User::factory()->societyAdmin($society->id)->create();

        $result = (new GenerateMonthlyInvoicesJob(
            societyId: $society->id,
            billingPeriod: '2026-08',
            runByUserId: $admin->id,
        ))->handle();

        $this->assertSame('Completed', $result['status']);
        $this->assertSame(2, $result['invoices_generated']);

        $invoices = Invoice::query()->where('society_id', $society->id)->get();
        $this->assertCount(2, $invoices);

        // Flat 1: 1000 sqft × 2.50 = 2500; tax 18% = 450; total 2950
        $invoice1 = $invoices->firstWhere('flat_id', $flats[0]->id);
        $this->assertNotNull($invoice1);
        $this->assertSame(2500.00, (float) $invoice1->subtotal);
        $this->assertSame(450.00, (float) $invoice1->tax_amount);
        $this->assertSame(2950.00, (float) $invoice1->total_amount);
        $this->assertSame('Unpaid', $invoice1->status);
        $this->assertSame('2026-08-10', $invoice1->due_date->toDateString());
        $this->assertSame('2026-08-01', $invoice1->issue_date->toDateString());
        $this->assertStringContainsString('INV-202608-', $invoice1->invoice_number);
        $this->assertSame($admin->id, $invoice1->generated_by);

        $this->assertSame(1, $invoice1->items()->count());
        $item = $invoice1->items()->first();
        $this->assertSame('Maintenance Charge (Per Sq Ft)', $item->title);
        $this->assertSame('Per Sq Ft', $item->calculation_type);
        $this->assertSame(2.50, (float) $item->unit_price);
        $this->assertSame(1000.0, (float) $item->quantity);
        $this->assertSame(2500.00, (float) $item->amount);
    }

    public function test_generate_invoices_job_supports_fixed_mode(): void
    {
        [$society, $flats] = $this->societyWithFlats(2, SocietyBillingConfig::factory()->make([
            'billing_mode' => 'fixed',
            'base_rate' => 1500.00,
            'tax_rate' => 0,
        ]));

        $result = (new GenerateMonthlyInvoicesJob(
            societyId: $society->id,
            billingPeriod: '2026-08',
        ))->handle();

        $this->assertSame(2, $result['invoices_generated']);

        $invoice = Invoice::query()->where('society_id', $society->id)->first();
        $this->assertSame(1500.00, (float) $invoice->subtotal);
        $this->assertSame(1500.00, (float) $invoice->total_amount);
        $item = $invoice->items()->first();
        $this->assertSame('Fixed', $item->calculation_type);
        $this->assertSame(1.0, (float) $item->quantity);
    }

    public function test_run_is_idempotent_when_period_already_billed(): void
    {
        [$society, $flats] = $this->societyWithFlats(2, SocietyBillingConfig::factory()->make());

        (new GenerateMonthlyInvoicesJob($society->id, '2026-08'))->handle();
        $result = (new GenerateMonthlyInvoicesJob($society->id, '2026-08'))->handle();

        $this->assertSame(0, $result['invoices_generated']);
        $this->assertSame(2, $result['skipped_flats']);
        $this->assertSame(2, Invoice::query()->where('society_id', $society->id)->count());
    }

    public function test_run_skips_excluded_flats(): void
    {
        [$society, $flats] = $this->societyWithFlats(3, SocietyBillingConfig::factory()->make());

        $result = (new GenerateMonthlyInvoicesJob(
            societyId: $society->id,
            billingPeriod: '2026-08',
            excludedFlatIds: [$flats[0]->id],
        ))->handle();

        $this->assertSame(2, $result['invoices_generated']);
        $this->assertSame(1, $result['excluded_flats']);
        $this->assertSame(0, $result['skipped_flats']);

        $invoices = Invoice::query()->where('society_id', $society->id)->get();
        $this->assertCount(2, $invoices);
        $this->assertFalse($invoices->pluck('flat_id')->contains($flats[0]->id));
    }

    public function test_run_records_history_and_activity(): void
    {
        [$society, $flats] = $this->societyWithFlats(2, SocietyBillingConfig::factory()->make());
        $admin = User::factory()->societyAdmin($society->id)->create();

        (new GenerateMonthlyInvoicesJob(
            societyId: $society->id,
            billingPeriod: '2026-08',
            runByUserId: $admin->id,
        ))->handle();

        $history = BillingRunHistory::query()->where('society_id', $society->id)->first();
        $this->assertNotNull($history);
        $this->assertSame('2026-08', $history->billing_period);
        $this->assertSame(2, $history->billed_flats);
        $this->assertSame(2, $history->invoices_generated);
        $this->assertSame('Completed', $history->status);
        $this->assertSame($admin->id, $history->run_by);

        $this->assertDatabaseHas('activity_logs', [
            'module' => 'Billing',
            'entity_type' => BillingRunHistory::class,
        ]);
    }

    public function test_run_fails_gracefully_without_config(): void
    {
        [$society, $flats] = $this->societyWithFlats(2);

        $result = (new GenerateMonthlyInvoicesJob($society->id, '2026-08'))->handle();

        $this->assertSame('Failed', $result['status']);
        $this->assertSame(0, $result['invoices_generated']);
        $this->assertSame(0, Invoice::query()->where('society_id', $society->id)->count());

        $history = BillingRunHistory::query()->where('society_id', $society->id)->first();
        $this->assertNotNull($history);
        $this->assertSame('Failed', $history->status);
    }

    /* ─── Controller: run endpoint ──────────────────────────────────────── */

    public function test_admin_can_trigger_billing_run_via_controller(): void
    {
        [$society, $flats] = $this->societyWithFlats(2, SocietyBillingConfig::factory()->make());
        $admin = User::factory()->societyAdmin($society->id)->create();

        $this->actingAs($admin)
            ->post(route('billing.run'), ['billing_period' => '2026-08'])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertSame(2, Invoice::query()->where('society_id', $society->id)->count());
    }

    public function test_treasurer_can_run_billing(): void
    {
        [$society, $flats] = $this->societyWithFlats(2, SocietyBillingConfig::factory()->make());
        $treasurer = User::factory()->treasurer($society->id)->create();

        $this->actingAs($treasurer)
            ->post(route('billing.run'), ['billing_period' => '2026-08'])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertSame(2, Invoice::query()->where('society_id', $society->id)->count());
    }

    public function test_resident_cannot_run_billing(): void
    {
        [$society, $flats] = $this->societyWithFlats(2, SocietyBillingConfig::factory()->make());
        $resident = User::factory()->resident($society->id)->create();

        $this->actingAs($resident)
            ->post(route('billing.run'), ['billing_period' => '2026-08'])
            ->assertForbidden();
    }

    /* ─── Settings ──────────────────────────────────────────────────────── */

    public function test_admin_can_view_and_update_settings(): void
    {
        [$society, $flats] = $this->societyWithFlats(1, SocietyBillingConfig::factory()->make([
            'billing_mode' => 'per_sqft',
            'base_rate' => 2.50,
        ]));
        $admin = User::factory()->societyAdmin($society->id)->create();

        $this->actingAs($admin)
            ->get(route('billing.settings'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/invoices/pages/billing-settings')
                ->where('config.billing_mode', 'per_sqft')
            );

        $this->actingAs($admin)
            ->put(route('billing.settings.update'), [
                'billing_mode' => 'fixed',
                'base_rate' => 2200,
                'tax_rate' => 18,
                'due_day' => 5,
                'grace_days' => 10,
                'penalty_rate' => 2.5,
                'penalty_cap' => 1000,
                'is_active' => true,
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('society_billing_configs', [
            'society_id' => $society->id,
            'billing_mode' => 'fixed',
            'base_rate' => 2200,
            'due_day' => 5,
            'grace_days' => 10,
            'penalty_rate' => 2.5,
            'penalty_cap' => 1000,
        ]);
    }

    /* ─── Overdue penalties ─────────────────────────────────────────────── */

    public function test_overdue_penalty_applied_after_grace_period(): void
    {
        [$society, $flats] = $this->societyWithFlats(1, SocietyBillingConfig::factory()->make([
            'grace_days' => 7,
            'penalty_rate' => 2,
            'penalty_cap' => 500,
        ]));

        $invoice = Invoice::create([
            'society_id' => $society->id,
            'flat_id' => $flats[0]->id,
            'invoice_number' => 'INV-202607-0001',
            'invoice_no' => 'INV-202607-0001',
            'billing_period' => '2026-07',
            'issue_date' => '2026-07-01',
            'due_date' => now()->subDays(20)->toDateString(),
            'subtotal' => 3000,
            'tax_amount' => 0,
            'discount_amount' => 0,
            'total_amount' => 3000,
            'paid_amount' => 0,
            'status' => 'Unpaid',
        ]);

        $summary = (new CalculateOverduePenaltiesJob($society->id))->handle();

        $this->assertSame(1, $summary['scanned_invoices']);
        $this->assertSame(1, $summary['penalties_applied']);
        $this->assertSame(60.00, $summary['penalty_total']);

        $invoice->refresh();
        $this->assertSame(60.00, (float) $invoice->penalty);
        $this->assertSame(3060.00, (float) $invoice->total_amount);
        $this->assertSame('Overdue', $invoice->status);

        $this->assertDatabaseHas('invoice_penalties', [
            'invoice_id' => $invoice->id,
            'penalty_amount' => 60,
            'billing_period' => '2026-07',
            'reason' => 'Late payment penalty after grace period',
        ]);
    }

    public function test_penalty_respects_cap(): void
    {
        [$society, $flats] = $this->societyWithFlats(1, SocietyBillingConfig::factory()->make([
            'grace_days' => 0,
            'penalty_rate' => 10,
            'penalty_cap' => 100,
        ]));

        $invoice = Invoice::create([
            'society_id' => $society->id,
            'flat_id' => $flats[0]->id,
            'invoice_number' => 'INV-202607-0001',
            'invoice_no' => 'INV-202607-0001',
            'billing_period' => '2026-07',
            'issue_date' => '2026-07-01',
            'due_date' => now()->subDays(40)->toDateString(),
            'subtotal' => 5000,
            'tax_amount' => 0,
            'discount_amount' => 0,
            'total_amount' => 5000,
            'paid_amount' => 0,
            'status' => 'Unpaid',
        ]);

        $summary = (new CalculateOverduePenaltiesJob($society->id))->handle();

        $this->assertSame(100.00, $summary['penalty_total']);
        $invoice->refresh();
        $this->assertSame(100.00, (float) $invoice->penalty);
    }

    public function test_penalty_skips_invoice_within_grace_period(): void
    {
        [$society, $flats] = $this->societyWithFlats(1, SocietyBillingConfig::factory()->make([
            'grace_days' => 30,
        ]));

        Invoice::create([
            'society_id' => $society->id,
            'flat_id' => $flats[0]->id,
            'invoice_number' => 'INV-202607-0001',
            'invoice_no' => 'INV-202607-0001',
            'billing_period' => '2026-07',
            'issue_date' => '2026-07-01',
            'due_date' => now()->subDays(5)->toDateString(),
            'subtotal' => 3000,
            'tax_amount' => 0,
            'discount_amount' => 0,
            'total_amount' => 3000,
            'paid_amount' => 0,
            'status' => 'Unpaid',
        ]);

        $summary = (new CalculateOverduePenaltiesJob($society->id))->handle();

        $this->assertSame(0, $summary['scanned_invoices']);
        $this->assertSame(0, $summary['penalties_applied']);
    }

    public function test_penalty_is_idempotent_per_invoice_and_period(): void
    {
        [$society, $flats] = $this->societyWithFlats(1, SocietyBillingConfig::factory()->make([
            'grace_days' => 0,
            'penalty_rate' => 2,
        ]));

        $invoice = Invoice::create([
            'society_id' => $society->id,
            'flat_id' => $flats[0]->id,
            'invoice_number' => 'INV-202607-0001',
            'invoice_no' => 'INV-202607-0001',
            'billing_period' => '2026-07',
            'issue_date' => '2026-07-01',
            'due_date' => now()->subDays(40)->toDateString(),
            'subtotal' => 3000,
            'tax_amount' => 0,
            'discount_amount' => 0,
            'total_amount' => 3000,
            'paid_amount' => 0,
            'status' => 'Unpaid',
        ]);

        (new CalculateOverduePenaltiesJob($society->id))->handle();
        $second = (new CalculateOverduePenaltiesJob($society->id))->handle();

        $this->assertSame(0, $second['penalties_applied']);
        $invoice->refresh();
        $this->assertSame(60.00, (float) $invoice->penalty);
        $this->assertSame(3060.00, (float) $invoice->total_amount);
        $this->assertSame(1, InvoicePenalty::query()->where('invoice_id', $invoice->id)->count());
    }

    /* ─── Financial invariants ──────────────────────────────────────────── */

    public function test_invariant_check_is_healthy_when_consistent(): void
    {
        [$society, $flats] = $this->societyWithFlats(1);
        $admin = User::factory()->societyAdmin($society->id)->create();

        $invoice = Invoice::create([
            'society_id' => $society->id,
            'flat_id' => $flats[0]->id,
            'invoice_number' => 'INV-202607-0001',
            'invoice_no' => 'INV-202607-0001',
            'billing_period' => '2026-07',
            'issue_date' => '2026-07-01',
            'due_date' => '2026-07-15',
            'subtotal' => 3000,
            'tax_amount' => 0,
            'discount_amount' => 0,
            'total_amount' => 3000,
            'paid_amount' => 1200,
            'status' => 'Partially Paid',
        ]);

        Payment::create([
            'society_id' => $society->id,
            'invoice_id' => $invoice->id,
            'payment_number' => 'PAY-202607-0001',
            'amount' => 1200,
            'payment_method' => 'UPI',
            'paid_at' => now(),
            'status' => 'Completed',
        ]);

        $this->actingAs($admin)
            ->get(route('billing.verify'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/invoices/pages/invariant-check')
                ->where('healthy', true)
                ->where('violations', [])
            );
    }

    public function test_invariant_check_detects_payment_mismatch(): void
    {
        [$society, $flats] = $this->societyWithFlats(1);
        $admin = User::factory()->societyAdmin($society->id)->create();

        $invoice = Invoice::create([
            'society_id' => $society->id,
            'flat_id' => $flats[0]->id,
            'invoice_number' => 'INV-202607-0001',
            'invoice_no' => 'INV-202607-0001',
            'billing_period' => '2026-07',
            'issue_date' => '2026-07-01',
            'due_date' => '2026-07-15',
            'subtotal' => 3000,
            'tax_amount' => 0,
            'discount_amount' => 0,
            'total_amount' => 3000,
            'paid_amount' => 1000,
            'status' => 'Partially Paid',
        ]);

        Payment::create([
            'society_id' => $society->id,
            'invoice_id' => $invoice->id,
            'payment_number' => 'PAY-202607-0001',
            'amount' => 2000,
            'payment_method' => 'UPI',
            'paid_at' => now(),
            'status' => 'Completed',
        ]);

        $this->actingAs($admin)
            ->get(route('billing.verify'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/invoices/pages/invariant-check')
                ->where('healthy', false)
                ->has('violations', 1)
            );
    }

    /* ─── Ledger ────────────────────────────────────────────────────────── */

    public function test_resident_can_view_flat_ledger(): void
    {
        [$society, $flats] = $this->societyWithFlats(2);
        $resident = User::factory()->resident($society->id)->create();

        Invoice::create([
            'society_id' => $society->id,
            'flat_id' => $flats[0]->id,
            'invoice_number' => 'INV-202607-0001',
            'invoice_no' => 'INV-202607-0001',
            'billing_period' => '2026-07',
            'issue_date' => '2026-07-01',
            'due_date' => '2026-07-15',
            'subtotal' => 3000,
            'tax_amount' => 0,
            'discount_amount' => 0,
            'total_amount' => 3000,
            'paid_amount' => 3000,
            'status' => 'Paid',
        ]);

        $this->actingAs($resident)
            ->get(route('billing.ledger', ['flat_id' => $flats[0]->id]))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/invoices/pages/flat-ledger')
                ->has('flats', 2)
                ->where('selected_flat_id', $flats[0]->id)
                ->has('invoices', 1)
                ->where('balance', 0)
            );
    }

    public function test_admin_can_view_run_history(): void
    {
        [$society, $flats] = $this->societyWithFlats(2, SocietyBillingConfig::factory()->make());
        $admin = User::factory()->societyAdmin($society->id)->create();

        (new GenerateMonthlyInvoicesJob($society->id, '2026-08'))->handle();

        $this->actingAs($admin)
            ->get(route('billing.runs'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/invoices/pages/billing-runs')
                ->has('runs.data', 1)
                ->where('runs.data.0.billing_period', '2026-08')
            );
    }
}
