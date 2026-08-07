<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Role;
use App\Models\Society;
use App\Models\User;
use App\Services\ActivityLogger;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActivityLogTest extends TestCase
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

    public function test_sensitive_fields_are_redacted_in_activity_logger(): void
    {
        $payload = [
            'name' => 'John Doe',
            'password' => 'Secret123!',
            'password_confirmation' => 'Secret123!',
            'remember_token' => 'token_xyz',
            'nested' => [
                'pin' => '1234',
                'normal' => 'safe_value',
            ],
        ];

        $redacted = ActivityLogger::redact($payload);

        $this->assertEquals('John Doe', $redacted['name']);
        $this->assertEquals('[REDACTED]', $redacted['password']);
        $this->assertEquals('[REDACTED]', $redacted['password_confirmation']);
        $this->assertEquals('[REDACTED]', $redacted['remember_token']);
        $this->assertEquals('[REDACTED]', $redacted['nested']['pin']);
        $this->assertEquals('safe_value', $redacted['nested']['normal']);
    }

    public function test_prune_activity_logs_command_removes_old_logs(): void
    {
        $society = Society::factory()->create();

        $oldLog = ActivityLog::create([
            'society_id' => $society->id,
            'module' => 'System',
            'action' => 'test',
            'created_at' => now()->subDays(100),
        ]);

        $recentLog = ActivityLog::create([
            'society_id' => $society->id,
            'module' => 'System',
            'action' => 'test',
            'created_at' => now()->subDays(10),
        ]);

        $this->artisan('activity-logs:prune', ['--days' => 90])
            ->assertExitCode(0);

        $this->assertDatabaseMissing('activity_logs', ['id' => $oldLog->id]);
        $this->assertDatabaseHas('activity_logs', ['id' => $recentLog->id]);
    }

    public function test_role_permission_sync_creates_activity_log(): void
    {
        $society = Society::factory()->create();
        $admin = User::factory()->superAdmin()->create();

        $role = Role::create(['name' => 'CustomManager']);

        $this->actingAs($admin)
            ->put(route('roles.update', $role), [
                'name' => 'CustomManager',
                'description' => 'Updated desc',
                'permissions' => [],
            ]);

        $this->assertDatabaseHas('activity_logs', [
            'module' => 'Role',
            'action' => 'permission.sync',
            'entity_id' => (string) $role->id,
        ]);
    }

    public function test_activity_logs_index_and_export(): void
    {
        $society = Society::factory()->create();
        $admin = User::factory()->societyAdmin($society->id)->create();

        ActivityLog::create([
            'society_id' => $society->id,
            'causer_id' => $admin->id,
            'module' => 'Tower',
            'action' => 'create',
            'remarks' => 'Test Audit Log Event',
            'created_at' => now(),
        ]);

        $this->actingAs($admin)
            ->get(route('activity-logs.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/activity-logs/pages/index')
                ->has('logs.data', 1)
            );

        $this->actingAs($admin)
            ->get(route('activity-logs.export'))
            ->assertOk()
            ->assertHeader('content-type', 'text/csv; charset=UTF-8');
    }
}
