<?php

namespace Tests\Feature;

use App\Models\Flat;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Society;
use App\Models\Tower;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MaintenanceBillingTest extends TestCase
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

    public function test_society_admin_and_treasurer_can_view_invoices(): void
    {
        $society = Society::factory()->create();
        $treasurer = User::factory()->create(['society_id' => $society->id]);
        $treasurer->assignRole('Treasurer');

        $tower = Tower::factory()->create(['society_id' => $society->id]);
        $flat = Flat::factory()->create(['society_id' => $society->id, 'tower_id' => $tower->id]);

        Invoice::create([
            'society_id' => $society->id,
            'flat_id' => $flat->id,
            'invoice_number' => 'INV-202608-0001',
            'invoice_no' => 'INV-202608-0001',
            'billing_period' => '2026-08',
            'issue_date' => now(),
            'due_date' => now()->addDays(15),
            'subtotal' => 3000,
            'tax_amount' => 0,
            'discount_amount' => 0,
            'total_amount' => 3000,
            'paid_amount' => 0,
            'status' => 'Unpaid',
        ]);

        $this->actingAs($treasurer)
            ->get(route('invoices.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/invoices/pages/index')
                ->has('invoices.data', 1)
            );
    }

    public function test_society_admin_can_generate_maintenance_invoice_with_items(): void
    {
        $society = Society::factory()->create();
        $admin = User::factory()->societyAdmin($society->id)->create();
        $tower = Tower::factory()->create(['society_id' => $society->id]);
        $flat = Flat::factory()->create(['society_id' => $society->id, 'tower_id' => $tower->id]);

        $response = $this->actingAs($admin)
            ->post(route('invoices.store'), [
                'flat_id' => $flat->id,
                'billing_period' => '2026-08',
                'issue_date' => now()->toDateString(),
                'due_date' => now()->addDays(15)->toDateString(),
                'tax_amount' => 100,
                'discount_amount' => 50,
                'notes' => 'August Maintenance',
                'items' => [
                    [
                        'title' => 'Base Maintenance',
                        'calculation_type' => 'Fixed',
                        'unit_price' => 2500,
                        'quantity' => 1,
                    ],
                    [
                        'title' => 'Sinking Fund',
                        'calculation_type' => 'Fixed',
                        'unit_price' => 500,
                        'quantity' => 1,
                    ],
                ],
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('invoices', [
            'society_id' => $society->id,
            'flat_id' => $flat->id,
            'subtotal' => 3000,
            'total_amount' => 3050, // 3000 + 100 - 50
            'status' => 'Unpaid',
        ]);

        $this->assertDatabaseHas('invoice_items', [
            'society_id' => $society->id,
            'title' => 'Base Maintenance',
            'amount' => 2500,
        ]);
    }

    public function test_treasurer_can_record_payment_and_update_invoice_status(): void
    {
        $society = Society::factory()->create();
        $treasurer = User::factory()->create(['society_id' => $society->id]);
        $treasurer->assignRole('Treasurer');

        $tower = Tower::factory()->create(['society_id' => $society->id]);
        $flat = Flat::factory()->create(['society_id' => $society->id, 'tower_id' => $tower->id]);

        $invoice = Invoice::create([
            'society_id' => $society->id,
            'flat_id' => $flat->id,
            'invoice_number' => 'INV-202608-0002',
            'invoice_no' => 'INV-202608-0002',
            'billing_period' => '2026-08',
            'issue_date' => now(),
            'due_date' => now()->addDays(15),
            'subtotal' => 3000,
            'tax_amount' => 0,
            'discount_amount' => 0,
            'total_amount' => 3000,
            'paid_amount' => 0,
            'status' => 'Unpaid',
        ]);

        $response = $this->actingAs($treasurer)
            ->post(route('payments.store'), [
                'invoice_id' => $invoice->id,
                'amount' => 3000,
                'payment_method' => 'UPI',
                'transaction_reference' => 'UPI/987654321',
                'remarks' => 'Paid in full via GPay',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('payments', [
            'society_id' => $society->id,
            'invoice_id' => $invoice->id,
            'amount' => 3000,
            'payment_method' => 'UPI',
        ]);

        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'paid_amount' => 3000,
            'status' => 'Paid',
        ]);
    }
}
