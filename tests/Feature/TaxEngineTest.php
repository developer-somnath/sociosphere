<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\Society;
use App\Models\SocietyBillingConfig;
use App\Models\TaxProfile;
use App\Models\TaxRate;
use App\Models\User;
use App\Services\BillingService;
use App\Services\TaxEngineService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class TaxEngineTest extends TestCase
{
    use RefreshDatabase;

    protected Society $society;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        Permission::findOrCreate('billing.configure', 'web');

        $this->society = Society::factory()->create(['name' => 'Tax Test Society']);

        $this->admin = User::factory()->create([
            'society_id' => $this->society->id,
        ]);
        $this->admin->givePermissionTo('billing.configure');
    }

    public function test_unauthenticated_user_cannot_access_tax_settings(): void
    {
        $response = $this->get(route('billing.tax-settings.edit'));
        $response->assertRedirect(route('login'));
    }

    public function test_authorized_user_can_view_tax_settings(): void
    {
        $response = $this->actingAs($this->admin)->get(route('billing.tax-settings.edit'));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('features/billing/pages/tax-settings'));
    }

    public function test_authorized_user_can_update_tax_profile(): void
    {
        $response = $this->actingAs($this->admin)->put(route('billing.tax-settings.update'), [
            'country' => 'India',
            'region' => 'Delhi',
            'tax_scheme' => 'GST',
            'currency_code' => 'INR',
            'currency_symbol' => '₹',
            'rounding_mode' => 'round',
            'rounding_precision' => 2,
            'tax_registration_no' => '07AAAAA0000A1Z5',
            'is_active' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('tax_profiles', [
            'society_id' => $this->society->id,
            'tax_scheme' => 'GST',
            'tax_registration_no' => '07AAAAA0000A1Z5',
        ]);
    }

    public function test_authorized_user_can_create_and_delete_tax_rates(): void
    {
        $profile = TaxProfile::create([
            'society_id' => $this->society->id,
            'country' => 'India',
            'tax_scheme' => 'GST',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->post(route('billing.tax-settings.rates.store'), [
            'name' => 'GST 18%',
            'code' => 'GST',
            'rate_percentage' => 18.00,
            'is_compound' => false,
            'is_inclusive' => false,
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('tax_rates', [
            'tax_profile_id' => $profile->id,
            'code' => 'GST',
            'rate' => 18.00,
        ]);

        $rate = TaxRate::where('tax_profile_id', $profile->id)->firstOrFail();

        $delResponse = $this->actingAs($this->admin)->delete(route('billing.tax-settings.rates.destroy', $rate));
        $delResponse->assertRedirect();
        $this->assertDatabaseMissing('tax_rates', ['id' => $rate->id]);
    }

    public function test_tax_engine_calculates_intra_state_gst_split_correctly(): void
    {
        $profile = TaxProfile::create([
            'society_id' => $this->society->id,
            'country' => 'India',
            'region' => 'Delhi',
            'tax_scheme' => 'GST',
            'rounding_mode' => 'round',
            'rounding_precision' => 2,
            'is_active' => true,
        ]);

        TaxRate::create([
            'tax_profile_id' => $profile->id,
            'name' => 'GST 18%',
            'code' => 'GST',
            'rate' => 18.0,
            'rate_percentage' => 18.0,
            'is_compound' => false,
            'is_inclusive' => false,
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $service = new TaxEngineService;
        $result = $service->calculateTax($this->society, 10000.00);

        $this->assertEquals(10000.00, $result['subtotal']);
        $this->assertEquals(1800.00, $result['tax_total']);
        $this->assertEquals(11800.00, $result['grand_total']);
        $this->assertCount(2, $result['items']);

        $cgst = $result['items'][0];
        $sgst = $result['items'][1];

        $this->assertEquals('CGST', $cgst['code']);
        $this->assertEquals(9.0, $cgst['rate']);
        $this->assertEquals(900.00, $cgst['tax_amount']);

        $this->assertEquals('SGST', $sgst['code']);
        $this->assertEquals(9.0, $sgst['rate']);
        $this->assertEquals(900.00, $sgst['tax_amount']);
    }

    public function test_tax_engine_applies_rounding_modes(): void
    {
        $profile = TaxProfile::create([
            'society_id' => $this->society->id,
            'country' => 'UK',
            'tax_scheme' => 'VAT',
            'rounding_mode' => 'ceil',
            'rounding_precision' => 2,
            'is_active' => true,
        ]);

        TaxRate::create([
            'tax_profile_id' => $profile->id,
            'name' => 'VAT 20%',
            'code' => 'VAT',
            'rate' => 20.0,
            'rate_percentage' => 20.0,
            'is_active' => true,
        ]);

        $service = new TaxEngineService;
        $result = $service->calculateTax($this->society, 100.33);

        $this->assertEquals(20.07, $result['tax_total']);
    }

    public function test_billing_service_attaches_tax_breakdowns_to_generated_invoices(): void
    {
        SocietyBillingConfig::create([
            'society_id' => $this->society->id,
            'billing_mode' => 'fixed',
            'base_rate' => 5000.00,
            'tax_rate' => 18.0,
            'due_day' => 10,
            'grace_days' => 5,
            'penalty_rate' => 2.0,
            'is_active' => true,
        ]);

        $profile = TaxProfile::create([
            'society_id' => $this->society->id,
            'country' => 'India',
            'tax_scheme' => 'GST',
            'rounding_mode' => 'round',
            'rounding_precision' => 2,
            'is_active' => true,
        ]);

        TaxRate::create([
            'tax_profile_id' => $profile->id,
            'name' => 'GST 18%',
            'code' => 'GST',
            'rate' => 18.0,
            'rate_percentage' => 18.0,
            'is_active' => true,
        ]);

        $tower = \App\Models\Tower::factory()->create(['society_id' => $this->society->id]);

        $flat = \App\Models\Flat::factory()->create([
            'society_id' => $this->society->id,
            'tower_id' => $tower->id,
            'flat_no' => '101',
        ]);

        $billingService = new BillingService;
        $res = $billingService->executeRun($this->society->id, '2026-08', [], $this->admin->id);

        $this->assertEquals('Completed', $res['status']);
        $this->assertEquals(1, $res['invoices_generated']);

        $invoice = Invoice::where('society_id', $this->society->id)->firstOrFail();

        $this->assertDatabaseHas('invoice_tax_breakdowns', [
            'invoice_id' => $invoice->id,
            'tax_code' => 'CGST',
            'tax_amount' => 450.00,
        ]);

        $this->assertDatabaseHas('invoice_tax_breakdowns', [
            'invoice_id' => $invoice->id,
            'tax_code' => 'SGST',
            'tax_amount' => 450.00,
        ]);
    }
}
