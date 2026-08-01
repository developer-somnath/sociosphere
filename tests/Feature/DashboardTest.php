<?php

namespace Tests\Feature;

use App\Models\Flat;
use App\Models\Resident;
use App\Models\Society;
use App\Models\Tower;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
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
        $this->get(route('overview'))->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_view_dashboard_with_stats(): void
    {
        $society = Society::factory()->create();
        $user = User::factory()->societyAdmin($society->id)->create();

        $tower = Tower::factory()->create([
            'society_id' => $society->id,
        ]);

        Flat::factory()->count(2)->create([
            'society_id' => $society->id,
            'tower_id' => $tower->id,
            'occupancy_status' => 'Occupied',
        ]);

        Flat::factory()->create([
            'society_id' => $society->id,
            'tower_id' => $tower->id,
            'occupancy_status' => 'Vacant',
        ]);

        $flat = Flat::where('society_id', $society->id)
            ->where('occupancy_status', 'Occupied')
            ->first();

        Resident::factory()->create([
            'society_id' => $society->id,
            'flat_id' => $flat->id,
        ]);

        $response = $this->actingAs($user)->get(route('overview'));

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/dashboard/pages/dashboard-page')
                ->has('stats', fn ($stats) => $stats
                    ->where('residents', 1)
                    ->where('flats', 3)
                    ->where('occupied_flats', 2)
                    ->where('towers', 1)
                    ->where('open_complaints', 0)
                    ->where('active_notices', 0)
                    ->where('pending_payments', 0)
                    ->etc()
                )
            );
    }

    public function test_dashboard_stats_are_scoped_to_the_users_society(): void
    {
        $ownSociety = Society::factory()->create();
        $otherSociety = Society::factory()->create();
        $user = User::factory()->societyAdmin($ownSociety->id)->create();

        Tower::factory()->create(['society_id' => $otherSociety->id]);

        $response = $this->actingAs($user)->get(route('overview'));

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('stats', fn ($stats) => $stats
                    ->where('towers', 0)
                    ->etc()
                )
            );
    }

    public function test_super_admin_role_helpers(): void
    {
        $user = User::factory()->superAdmin()->create();

        $this->assertTrue($user->isSuperAdmin());
        $this->assertFalse($user->isSocietyAdmin());
        $this->assertContains('SuperAdmin', $user->roleNames());
        $this->assertNotContains('SocietyAdmin', $user->roleNames());
    }
}
