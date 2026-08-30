<?php

namespace Tests\Feature;

use App\Models\PushSubscription;
use App\Models\SecurityLog;
use App\Models\Society;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmergencySosTest extends TestCase
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

    public function test_resident_can_trigger_emergency_sos(): void
    {
        $society = Society::factory()->create();
        $resident = User::factory()->resident($society->id)->create(['phone' => '+919876543210']);
        $guard = User::factory()->securityGuard($society->id)->create();

        PushSubscription::factory()->create([
            'society_id' => $society->id,
            'user_id' => $guard->id,
        ]);

        $service = \Mockery::mock(\App\Services\WebPushService::class);
        $service->shouldReceive('broadcast')
            ->once()
            ->andReturn(1);

        $this->app->instance(\App\Services\WebPushService::class, $service);

        $payload = [
            'emergency_type' => 'Fire',
            'location' => 'Tower A - 302',
            'description' => 'Smoke observed near main meter board.',
        ];

        $response = $this->actingAs($resident)
            ->post(route('emergency-sos.store'), $payload);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Verify critical incident log created in SecurityLog
        $log = SecurityLog::where('society_id', $society->id)
            ->where('event_type', 'Emergency SOS')
            ->first();

        $this->assertNotNull($log);
        $this->assertEquals('Critical', $log->severity);
        $this->assertStringContainsString('Fire', $log->title);
        $this->assertStringContainsString('Tower A - 302', $log->title);
        $this->assertStringContainsString('Smoke observed near main meter board', $log->description);
    }

    public function test_emergency_sos_json_response_for_mobile_pwa(): void
    {
        $society = Society::factory()->create();
        $resident = User::factory()->resident($society->id)->create();

        $payload = [
            'emergency_type' => 'Medical',
            'location' => 'Clubhouse Gym',
            'description' => 'Resident collapsed, immediate first-aid needed.',
        ];

        $response = $this->actingAs($resident)
            ->postJson(route('emergency-sos.store'), $payload);

        $response->assertOk();
        $response->assertJson([
            'status' => 'success',
        ]);
    }

    public function test_emergency_sos_requires_valid_emergency_type(): void
    {
        $society = Society::factory()->create();
        $resident = User::factory()->resident($society->id)->create();

        $response = $this->actingAs($resident)
            ->post(route('emergency-sos.store'), [
                'emergency_type' => 'InvalidType',
            ]);

        $response->assertSessionHasErrors(['emergency_type']);
    }
}
