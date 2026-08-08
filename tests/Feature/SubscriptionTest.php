<?php

namespace Tests\Feature;

use App\Models\Flat;
use App\Models\Society;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\Tower;
use App\Models\User;
use App\Services\SubscriptionService;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\SubscriptionPlanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriptionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([
            RoleSeeder::class,
            PermissionSeeder::class,
            RolePermissionSeeder::class,
            SubscriptionPlanSeeder::class,
        ]);
    }

    private function makeSociety(): Society
    {
        return Society::factory()->create();
    }

    private function makeSubscription(Society $society, ?SubscriptionPlan $plan = null, array $overrides = []): Subscription
    {
        $plan ??= SubscriptionPlan::query()->where('code', 'professional')->firstOrFail();

        return Subscription::factory()->create(array_merge([
            'society_id' => $society->id,
            'plan_id' => $plan->id,
        ], $overrides));
    }

    /* ─── Overview page ─────────────────────────────────────────────────── */

    public function test_society_admin_can_view_subscription_overview(): void
    {
        $society = $this->makeSociety();
        $plan = SubscriptionPlan::query()->where('code', 'professional')->firstOrFail();
        $this->makeSubscription($society, $plan);
        $admin = User::factory()->societyAdmin($society->id)->create();

        $this->actingAs($admin)
            ->get(route('subscription.show'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/subscription/pages/overview')
                ->has('subscription.plan')
                ->has('usage', 10)
                ->where('can.manage', false)
            );
    }

    public function test_resident_cannot_view_subscription_overview(): void
    {
        $society = $this->makeSociety();
        $resident = User::factory()->resident($society->id)->create();

        $this->actingAs($resident)
            ->get(route('subscription.show'))
            ->assertForbidden();
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $this->get(route('subscription.show'))
            ->assertRedirect(route('login'));
    }

    /* ─── Usage page ────────────────────────────────────────────────────── */

    public function test_society_admin_can_view_usage_page(): void
    {
        $society = $this->makeSociety();
        $this->makeSubscription($society);
        $admin = User::factory()->societyAdmin($society->id)->create();

        $this->actingAs($admin)
            ->get(route('subscription.usage'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/subscription/pages/usage')
                ->has('usage', 10)
                ->where('can.manage', false)
            );
    }

    /* ─── Entitlement enforcement ───────────────────────────────────────── */

    public function test_creating_beyond_flat_limit_is_blocked(): void
    {
        $society = $this->makeSociety();
        $tower = Tower::factory()->create(['society_id' => $society->id]);
        $admin = User::factory()->societyAdmin($society->id)->create();

        // Starter default plan caps flats at 10.
        for ($i = 0; $i < 10; $i++) {
            Flat::factory()->create([
                'society_id' => $society->id,
                'tower_id' => $tower->id,
                'flat_no' => "A-{$i}",
            ]);
        }

        $this->actingAs($admin)
            ->from(route('flats.create'))
            ->post(route('flats.store'), [
                'tower_id' => $tower->id,
                'flat_no' => 'A-101',
                'floor_no' => 1,
                'flat_type' => '2BHK',
                'area_sqft' => 950,
                'ownership_type' => 'Owner',
                'occupancy_status' => 'Occupied',
            ])
            ->assertSessionHasErrors('entitlement');

        $this->assertDatabaseCount('flats', 10);
    }

    public function test_creating_within_limit_succeeds(): void
    {
        $society = $this->makeSociety();
        $tower = Tower::factory()->create(['society_id' => $society->id]);
        $admin = User::factory()->societyAdmin($society->id)->create();

        $this->actingAs($admin)
            ->post(route('flats.store'), [
                'tower_id' => $tower->id,
                'flat_no' => 'A-101',
                'floor_no' => 1,
                'flat_type' => '2BHK',
                'area_sqft' => 950,
                'ownership_type' => 'Owner',
                'occupancy_status' => 'Occupied',
            ])
            ->assertRedirect(route('flats.index'));

        $this->assertDatabaseCount('flats', 1);
    }

    /* ─── SuperAdmin plan administration ────────────────────────────────── */

    public function test_super_admin_can_view_subscriptions_admin_page(): void
    {
        $society = $this->makeSociety();
        $this->makeSubscription($society);
        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)
            ->get(route('subscriptions.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/subscription/pages/admin')
                ->has('societies.data', 1)
                ->has('plans')
                ->where('can.assign', true)
            );
    }

    public function test_society_admin_cannot_view_subscriptions_admin_page(): void
    {
        $society = $this->makeSociety();
        $admin = User::factory()->societyAdmin($society->id)->create();

        $this->actingAs($admin)
            ->get(route('subscriptions.index'))
            ->assertForbidden();
    }

    public function test_super_admin_can_assign_a_plan(): void
    {
        $society = $this->makeSociety();
        $plan = SubscriptionPlan::query()->where('code', 'professional')->firstOrFail();
        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)
            ->post(route('subscriptions.assign', $society), [
                'plan_uuid' => $plan->uuid,
                'billing_cycle' => 'yearly',
                'trial_days' => 14,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('subscriptions', [
            'society_id' => $society->id,
            'plan_id' => $plan->id,
            'status' => 'trialing',
            'billing_cycle' => 'yearly',
        ]);
    }

    public function test_super_admin_can_cancel_a_subscription(): void
    {
        $society = $this->makeSociety();
        $subscription = $this->makeSubscription($society);
        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)
            ->post(route('subscriptions.cancel', $subscription))
            ->assertRedirect();

        $this->assertDatabaseHas('subscriptions', [
            'id' => $subscription->id,
            'status' => 'cancelled',
        ]);
    }

    public function test_super_admin_can_resume_a_cancelled_subscription(): void
    {
        $society = $this->makeSociety();
        $subscription = $this->makeSubscription($society, null, ['status' => 'cancelled']);
        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)
            ->post(route('subscriptions.resume', $subscription))
            ->assertRedirect();

        $this->assertDatabaseHas('subscriptions', [
            'id' => $subscription->id,
            'status' => 'active',
            'cancelled_at' => null,
        ]);
    }

    /* ─── Plan catalog ──────────────────────────────────────────────────── */

    public function test_super_admin_can_view_plans_index(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)
            ->get(route('plans.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/subscription/pages/plans/index')
                ->has('plans.data', 3)
                ->where('can.create', true)
            );
    }

    public function test_super_admin_can_create_a_plan(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)
            ->post(route('plans.store'), [
                'name' => 'Premium',
                'code' => 'premium',
                'price_monthly' => 999,
                'price_yearly' => 9990,
                'currency' => 'INR',
                'is_active' => true,
                'is_default' => false,
                'sort_order' => 4,
                'features' => [
                    ['feature_key' => 'towers', 'limit_value' => 10],
                    ['feature_key' => 'flats', 'limit_value' => 100],
                ],
            ])
            ->assertRedirect(route('plans.index'));

        $plan = SubscriptionPlan::query()->where('code', 'premium')->first();
        $this->assertNotNull($plan);
        $this->assertSame(2, $plan->features()->count());
    }

    public function test_society_admin_cannot_access_plans(): void
    {
        $society = $this->makeSociety();
        $admin = User::factory()->societyAdmin($society->id)->create();

        $this->actingAs($admin)
            ->get(route('plans.index'))
            ->assertForbidden();
    }

    /* ─── Status synchronisation command ────────────────────────────────── */

    public function test_sync_command_promotes_ended_trial_to_active(): void
    {
        $society = $this->makeSociety();
        $this->makeSubscription($society, null, [
            'status' => 'trialing',
            'trial_ends_at' => now()->subDay(),
        ]);
        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)
            ->artisan('subscriptions:sync')
            ->expectsOutputToContain('updated 1')
            ->assertSuccessful();

        $this->assertDatabaseHas('subscriptions', [
            'society_id' => $society->id,
            'status' => 'active',
        ]);
    }

    public function test_sync_command_expires_overdue_active_subscription(): void
    {
        $society = $this->makeSociety();
        $this->makeSubscription($society, null, [
            'status' => 'active',
            'ends_at' => now()->subDay(),
        ]);
        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)
            ->artisan('subscriptions:sync')
            ->assertSuccessful();

        $this->assertDatabaseHas('subscriptions', [
            'society_id' => $society->id,
            'status' => 'expired',
        ]);
    }

    public function test_subscription_service_activate_cancels_previous_live(): void
    {
        $society = $this->makeSociety();
        $starter = SubscriptionPlan::query()->where('code', 'starter')->firstOrFail();
        $professional = SubscriptionPlan::query()->where('code', 'professional')->firstOrFail();
        $service = app(SubscriptionService::class);

        $first = $service->activate($society, $starter, 'monthly', 14);
        $second = $service->activate($society, $professional, 'yearly');

        $this->assertSame('cancelled', $first->fresh()->status);
        $this->assertSame('active', $second->fresh()->status);
        $this->assertSame(2, Subscription::query()->where('society_id', $society->id)->count());
    }
}
