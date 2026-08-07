<?php

namespace Tests\Feature;

use App\Models\SecurityLog;
use App\Models\Society;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityLogbookTest extends TestCase
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

    public function test_security_guard_can_view_logbook_and_create_entry(): void
    {
        $society = Society::factory()->create();
        $guard = User::factory()->create(['society_id' => $society->id]);
        $guard->assignRole('SecurityGuard');

        $this->actingAs($guard)
            ->get(route('security-logs.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/security-logs/pages/index')
            );

        $response = $this->actingAs($guard)
            ->post(route('security-logs.store'), [
                'event_type' => 'Shift Handover',
                'title' => 'Shift Handover Night to Morning',
                'description' => 'All gates secured. 12 visitors logged.',
                'severity' => 'Low',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('security_logs', [
            'society_id' => $society->id,
            'guard_id' => $guard->id,
            'event_type' => 'Shift Handover',
        ]);
    }

    public function test_security_guard_can_report_critical_incident(): void
    {
        $society = Society::factory()->create();
        $guard = User::factory()->create(['society_id' => $society->id]);
        $guard->assignRole('SecurityGuard');

        $response = $this->actingAs($guard)
            ->post(route('security-logs.store'), [
                'event_type' => 'Incident Report',
                'title' => 'Unauthorized entry attempt at Gate 2',
                'description' => 'Vehicle without registration badge was denied entry.',
                'severity' => 'Critical',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('security_logs', [
            'society_id' => $society->id,
            'severity' => 'Critical',
        ]);
    }
}
