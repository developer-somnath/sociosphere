<?php

namespace Tests\Feature;

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

    public function test_guests_are_redirected_to_login(): void
    {
        $this->get(route('activity-logs.index'))
            ->assertRedirect(route('login'));
    }

    public function test_super_admin_can_view_activity_logs_index(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $this->actingAs($admin)
            ->get(route('activity-logs.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/activity-logs/pages/index')
                ->has('logs.data')
                ->has('filterOptions.modules')
                ->has('filterOptions.actions')
                ->has('filterOptions.causers')
                ->has('stats.today')
                ->where('filters.search', ''));
    }

    public function test_super_admin_sees_logs_from_all_societies(): void
    {
        $societyA = Society::factory()->create();
        $societyB = Society::factory()->create();
        $admin = User::factory()->superAdmin()->create();

        $logger = app(ActivityLogger::class);
        $logger->log('created', 'Towers', 'App\\Models\\Tower', 't-a', societyId: $societyA->id);
        $logger->log('created', 'Towers', 'App\\Models\\Tower', 't-b', societyId: $societyB->id);

        $this->actingAs($admin)
            ->get(route('activity-logs.index', ['module' => 'Towers']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('logs.data', 2)
                ->where('logs.data.0.entity_id', 't-b')
                ->where('logs.data.1.entity_id', 't-a'));
    }

    public function test_society_admin_only_sees_own_society_logs(): void
    {
        $societyA = Society::factory()->create();
        $societyB = Society::factory()->create();

        $logger = app(ActivityLogger::class);
        $logger->log('created', 'Towers', 'App\\Models\\Tower', 't-a', societyId: $societyA->id);
        $logger->log('created', 'Towers', 'App\\Models\\Tower', 't-b', societyId: $societyB->id);

        $societyAdmin = User::factory()->societyAdmin($societyA->id)->create();

        $this->actingAs($societyAdmin)
            ->get(route('activity-logs.index', ['module' => 'Towers']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('logs.data', 1)
                ->where('logs.data.0.entity_id', 't-a'));
    }

    public function test_treasurer_without_permission_is_forbidden(): void
    {
        $society = Society::factory()->create();
        $treasurer = User::factory()->treasurer($society->id)->create();

        $this->actingAs($treasurer)
            ->get(route('activity-logs.index'))
            ->assertForbidden();
    }

    public function test_search_filters_logs_by_keyword(): void
    {
        $society = Society::factory()->create();
        $admin = User::factory()->superAdmin()->create();

        $logger = app(ActivityLogger::class);
        $logger->log('created', 'Towers', 'App\\Models\\Tower', 'tower-1', societyId: $society->id);
        $logger->log('created', 'Flats', 'App\\Models\\Flat', 'flat-1', societyId: $society->id);

        $this->actingAs($admin)
            ->get(route('activity-logs.index', ['search' => 'Tower']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('logs.data', 1)
                ->where('logs.data.0.module', 'Towers')
                ->where('filters.search', 'Tower'));
    }

    public function test_module_and_action_filters_work(): void
    {
        $society = Society::factory()->create();
        $admin = User::factory()->superAdmin()->create();

        $logger = app(ActivityLogger::class);
        $logger->log('created', 'Towers', 'App\\Models\\Tower', 'tower-1', societyId: $society->id);
        $logger->log('updated', 'Towers', 'App\\Models\\Tower', 'tower-2', societyId: $society->id);
        $logger->log('created', 'Flats', 'App\\Models\\Flat', 'flat-1', societyId: $society->id);

        $this->actingAs($admin)
            ->get(route('activity-logs.index', ['module' => 'Towers', 'action' => 'created']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('logs.data', 1)
                ->where('logs.data.0.module', 'Towers')
                ->where('logs.data.0.action', 'created'));
    }

    public function test_causer_filter_works(): void
    {
        $society = Society::factory()->create();
        $admin = User::factory()->superAdmin()->create();
        $causer = User::factory()->create(['society_id' => $society->id]);

        $logger = app(ActivityLogger::class);
        $logger->log('created', 'Towers', 'App\\Models\\Tower', 'tower-1', causerId: $causer->id, societyId: $society->id);
        $logger->log('created', 'Towers', 'App\\Models\\Tower', 'tower-2', causerId: $admin->id, societyId: $society->id);

        $this->actingAs($admin)
            ->get(route('activity-logs.index', ['causer_id' => $causer->id]))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('logs.data', 1)
                ->where('logs.data.0.entity_id', 'tower-1'));
    }

    public function test_export_returns_a_csv_download(): void
    {
        $society = Society::factory()->create();
        $admin = User::factory()->superAdmin()->create();

        $logger = app(ActivityLogger::class);
        $logger->log('created', 'Towers', 'App\\Models\\Tower', 'tower-1', societyId: $society->id);

        $response = $this->actingAs($admin)
            ->get(route('activity-logs.export'))
            ->assertOk();

        $this->assertStringContainsString(
            'attachment',
            (string) $response->headers->get('Content-Disposition'),
        );
    }

    public function test_export_respects_permission(): void
    {
        $society = Society::factory()->create();
        $treasurer = User::factory()->treasurer($society->id)->create();

        $this->actingAs($treasurer)
            ->get(route('activity-logs.export'))
            ->assertForbidden();
    }
}
