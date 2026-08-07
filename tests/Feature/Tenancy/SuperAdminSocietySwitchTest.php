<?php

namespace Tests\Feature\Tenancy;

use App\Models\Society;
use App\Models\Tower;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class SuperAdminSocietySwitchTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([
            \Database\Seeders\RoleSeeder::class,
            \Database\Seeders\PermissionSeeder::class,
            \Database\Seeders\RolePermissionSeeder::class,
        ]);
    }

    public function test_super_admin_can_switch_society_context(): void
    {
        $societyA = Society::factory()->create(['name' => 'Alpha Palms']);
        $societyB = Society::factory()->create(['name' => 'Beta Towers']);

        $superAdmin = User::factory()->create(['society_id' => null]);
        $superAdmin->assignRole('SuperAdmin');

        $response = $this->actingAs($superAdmin)
            ->post(route('society.switch'), [
                'society_id' => $societyA->id,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('current_society_id', $societyA->id);
    }

    public function test_super_admin_sees_scoped_towers_when_society_selected(): void
    {
        $societyA = Society::factory()->create(['name' => 'Alpha Palms']);
        $societyB = Society::factory()->create(['name' => 'Beta Towers']);

        $towerA = Tower::factory()->create(['society_id' => $societyA->id, 'name' => 'Tower Alpha']);
        $towerB = Tower::factory()->create(['society_id' => $societyB->id, 'name' => 'Tower Beta']);

        $superAdmin = User::factory()->create(['society_id' => null]);
        $superAdmin->assignRole('SuperAdmin');

        // Switch to Society A
        $this->actingAs($superAdmin)
            ->withSession(['current_society_id' => $societyA->id])
            ->get(route('towers.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/towers/pages/index')
                ->has('towers.data', 1)
                ->where('towers.data.0.name', 'Tower Alpha')
            );
    }

    public function test_super_admin_can_clear_society_switch_to_all(): void
    {
        $superAdmin = User::factory()->create(['society_id' => null]);
        $superAdmin->assignRole('SuperAdmin');

        $response = $this->actingAs($superAdmin)
            ->withSession(['current_society_id' => 999])
            ->post(route('society.switch'), [
                'society_id' => null,
            ]);

        $response->assertRedirect();
        $response->assertSessionMissing('current_society_id');
    }

    public function test_non_super_admin_cannot_switch_society(): void
    {
        $society = Society::factory()->create();
        $user = User::factory()->create(['society_id' => $society->id]);
        $user->assignRole('SocietyAdmin');

        $response = $this->actingAs($user)
            ->post(route('society.switch'), [
                'society_id' => $society->id,
            ]);

        $response->assertStatus(403);
    }
}
