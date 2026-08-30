<?php

namespace Tests\Feature;

use App\Models\Society;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\SubscriptionPlanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OnboardingTest extends TestCase
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

    public function test_public_pricing_page_renders_successfully(): void
    {
        $response = $this->get(route('pricing'));

        $response->assertOk();
    }

    public function test_public_onboarding_page_renders_successfully(): void
    {
        $plan = SubscriptionPlan::query()->where('code', 'professional')->firstOrFail();

        $response = $this->get(route('onboarding.show', ['plan' => $plan->uuid, 'cycle' => 'yearly']));

        $response->assertOk();
    }

    public function test_guest_can_complete_self_service_onboarding(): void
    {
        $plan = SubscriptionPlan::query()->where('code', 'professional')->firstOrFail();

        $payload = [
            'society_name' => 'Serene Vista Greens',
            'society_code' => 'SVG-01',
            'address' => 'Plot 101, Palm Avenue, Sector 21',
            'city' => 'Bangalore',
            'state' => 'Karnataka',
            'postal_code' => '560001',
            'country' => 'India',
            'admin_name' => 'Aditya Roy',
            'admin_email' => 'aditya@serenevista.com',
            'admin_phone' => '+91 9988776655',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'plan_uuid' => $plan->uuid,
            'billing_cycle' => 'yearly',
        ];

        $response = $this->post(route('onboarding.store'), $payload);

        $response->assertRedirect(route('overview'));

        // Assert society created
        $society = Society::where('name', 'Serene Vista Greens')->first();
        $this->assertNotNull($society);
        $this->assertEquals('Bangalore', $society->city);

        // Assert admin user created and assigned SocietyAdmin role
        $user = User::where('email', 'aditya@serenevista.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals($society->id, $user->society_id);
        $this->assertTrue($user->hasRole('SocietyAdmin'));

        // Assert trial subscription activated
        $subscription = Subscription::where('society_id', $society->id)->first();
        $this->assertNotNull($subscription);
        $this->assertEquals($plan->id, $subscription->plan_id);
        $this->assertEquals('trialing', $subscription->status);
        $this->assertEquals('yearly', $subscription->billing_cycle);
        $this->assertNotNull($subscription->trial_ends_at);

        // Assert user logged in
        $this->assertAuthenticatedAs($user);
    }

    public function test_onboarding_validates_required_fields_and_duplicate_email(): void
    {
        $existing = User::factory()->create(['email' => 'duplicate@example.com']);
        $plan = SubscriptionPlan::query()->firstOrFail();

        $response = $this->post(route('onboarding.store'), [
            'society_name' => '',
            'admin_email' => 'duplicate@example.com',
            'plan_uuid' => $plan->uuid,
        ]);

        $response->assertSessionHasErrors(['society_name', 'address', 'city', 'country', 'admin_name', 'admin_email', 'password', 'billing_cycle']);
    }
}
