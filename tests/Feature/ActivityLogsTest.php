<?php

namespace Tests\Feature;

use App\Jobs\LogActivityJob;
use App\Models\Society;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class ActivityLogsTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_logs_business_activity_with_context(): void
    {
        $society = Society::factory()->create();
        $user = User::factory()->create([
            'society_id' => $society->id,
        ]);

        $this->actingAs($user);

        $request = request()->create('/residents', 'POST', server: [
            'REMOTE_ADDR' => '127.0.0.1',
            'HTTP_USER_AGENT' => 'phpunit',
        ]);

        $logger = app(ActivityLogger::class);

        $logger->log(
            action: 'created',
            module: 'Residents',
            entityType: 'App\\Models\\Resident',
            entityId: 'resident-1',
            properties: ['status' => 'active'],
            remarks: 'Resident created via test',
            request: $request,
        );

        $this->assertDatabaseHas('activity_logs', [
            'causer_id' => $user->id,
            'society_id' => $society->id,
            'module' => 'Residents',
            'action' => 'created',
            'entity_type' => 'App\\Models\\Resident',
            'entity_id' => 'resident-1',
            'remarks' => 'Resident created via test',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'phpunit',
            'method' => 'POST',
            'request_url' => '/residents',
        ]);
    }

    public function test_it_returns_null_when_activity_logging_is_disabled(): void
    {
        Config::set('activity-log.enabled', false);

        $logger = app(ActivityLogger::class);

        $this->assertNull(
            $logger->log(
                action: 'created',
                module: 'Towers',
                entityType: 'App\\Models\\Tower',
                entityId: '1',
            ),
        );

        $this->assertDatabaseCount('activity_logs', 0);
    }

    public function test_it_dispatches_a_queued_job_when_queue_is_enabled(): void
    {
        Queue::fake();

        Config::set('activity-log.queue', true);
        Config::set('activity-log.queue_connection', 'database');

        $logger = app(ActivityLogger::class);

        $logger->log(
            action: 'created',
            module: 'Towers',
            entityType: 'App\\Models\\Tower',
            entityId: 'tower-42',
            properties: ['name' => 'A'],
            remarks: 'Created Tower via queued job',
        );

        Queue::assertPushed(LogActivityJob::class, function (LogActivityJob $job) {
            return $job->payload['action'] === 'created'
                && $job->payload['module'] === 'Towers'
                && $job->payload['entity_id'] === 'tower-42';
        });

        // Nothing written synchronously when queued.
        $this->assertDatabaseCount('activity_logs', 0);
    }

    public function test_model_events_are_logged_for_create_update_and_delete(): void
    {
        $society = Society::factory()->create();

        $society->update(['name' => 'Green Valley Residency']);
        $societyId = $society->id;
        $society->delete();

        $this->assertDatabaseHas('activity_logs', [
            'module' => 'Society',
            'action' => 'created',
            'entity_id' => (string) $societyId,
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'module' => 'Society',
            'action' => 'updated',
            'entity_id' => (string) $societyId,
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'module' => 'Society',
            'action' => 'deleted',
            'entity_id' => (string) $societyId,
        ]);
    }

    public function test_model_activity_excludes_sensitive_attributes(): void
    {
        $user = User::factory()->create([
            'name' => 'Original Name',
        ]);

        $user->update(['name' => 'Renamed Member']);

        $log = \App\Models\ActivityLog::query()
            ->where('module', 'User')
            ->where('action', 'updated')
            ->where('entity_id', (string) $user->id)
            ->latest('id')
            ->first();

        $this->assertNotNull($log);
        $this->assertSame('Original Name', $log->old_values['name'] ?? null);
        $this->assertSame('Renamed Member', $log->new_values['name'] ?? null);
        $this->assertArrayNotHasKey('password', $log->old_values ?? []);
        $this->assertArrayNotHasKey('password', $log->new_values ?? []);
        $this->assertArrayNotHasKey('remember_token', $log->new_values ?? []);
    }

    public function test_login_event_is_logged(): void
    {
        $user = User::factory()->create([
            'email' => 'login-event@example.com',
        ]);

        $this->post('/login', [
            'email' => 'login-event@example.com',
            'password' => 'password',
        ])->assertRedirect();

        $this->assertDatabaseHas('activity_logs', [
            'causer_id' => $user->id,
            'module' => 'Auth',
            'action' => 'login',
            'entity_id' => (string) $user->id,
            'remarks' => 'User signed in',
        ]);
    }

    public function test_logout_event_is_logged(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/logout');

        $this->assertDatabaseHas('activity_logs', [
            'causer_id' => $user->id,
            'module' => 'Auth',
            'action' => 'logout',
            'remarks' => 'User signed out',
        ]);
    }

    public function test_failed_login_attempt_is_logged(): void
    {
        User::factory()->create([
            'email' => 'failed-attempt@example.com',
        ]);

        $this->post('/login', [
            'email' => 'failed-attempt@example.com',
            'password' => 'wrong-password',
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'module' => 'Auth',
            'action' => 'failed',
            'remarks' => 'Failed sign-in attempt',
        ]);
    }
}
