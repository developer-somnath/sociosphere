<?php

namespace Tests\Feature;

use App\Models\Flat;
use App\Models\Society;
use App\Models\Tower;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TowerTest extends TestCase
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

    private function makeSociety(): Society
    {
        return Society::factory()->create();
    }

    public function test_guests_are_redirected_to_login(): void
    {
        $this->get(route('towers.index'))->assertRedirect(route('login'));
    }

    public function test_society_admin_can_view_towers_index(): void
    {
        $society = $this->makeSociety();
        $user = User::factory()->societyAdmin($society->id)->create();

        Tower::factory()->create([
            'society_id' => $society->id,
            'name' => 'Tower A',
        ]);

        $this->actingAs($user)
            ->get(route('towers.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/towers/pages/index')
                ->has('towers.data', 1)
                ->where('towers.data.0.name', 'Tower A'));
    }

    public function test_towers_are_scoped_to_the_users_society(): void
    {
        $society = $this->makeSociety();
        $otherSociety = $this->makeSociety();
        $user = User::factory()->societyAdmin($society->id)->create();

        Tower::factory()->create([
            'society_id' => $otherSociety->id,
            'name' => 'Other Society Tower',
        ]);

        $this->actingAs($user)
            ->get(route('towers.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('towers.total', 0));
    }

    public function test_society_admin_can_create_a_tower(): void
    {
        $society = $this->makeSociety();
        $user = User::factory()->societyAdmin($society->id)->create();

        $this->actingAs($user)
            ->post(route('towers.store'), [
                'name' => 'Tower B',
            ])
            ->assertRedirect(route('towers.index'));

        $this->assertDatabaseHas('towers', [
            'society_id' => $society->id,
            'name' => 'Tower B',
        ]);
    }

    public function test_duplicate_tower_name_in_same_society_is_rejected(): void
    {
        $society = $this->makeSociety();
        $user = User::factory()->societyAdmin($society->id)->create();

        Tower::factory()->create([
            'society_id' => $society->id,
            'name' => 'Tower A',
        ]);

        $this->actingAs($user)
            ->from(route('towers.create'))
            ->post(route('towers.store'), [
                'name' => 'Tower A',
            ])
            ->assertSessionHasErrors('name');

        $this->assertDatabaseCount('towers', 1);
    }

    public function test_same_tower_name_in_different_society_is_allowed(): void
    {
        $society = $this->makeSociety();
        $otherSociety = $this->makeSociety();
        $user = User::factory()->societyAdmin($society->id)->create();

        Tower::factory()->create([
            'society_id' => $otherSociety->id,
            'name' => 'Tower A',
        ]);

        $this->actingAs($user)
            ->post(route('towers.store'), [
                'name' => 'Tower A',
            ])
            ->assertRedirect(route('towers.index'));

        $this->assertDatabaseHas('towers', [
            'society_id' => $society->id,
            'name' => 'Tower A',
        ]);
    }

    public function test_society_admin_can_update_a_tower(): void
    {
        $society = $this->makeSociety();
        $user = User::factory()->societyAdmin($society->id)->create();

        $tower = Tower::factory()->create([
            'society_id' => $society->id,
            'name' => 'Old Tower Name',
        ]);

        $this->actingAs($user)
            ->put(route('towers.update', $tower->uuid), [
                'name' => 'New Tower Name',
            ])
            ->assertRedirect(route('towers.index'));

        $this->assertDatabaseHas('towers', [
            'id' => $tower->id,
            'name' => 'New Tower Name',
        ]);
    }

    public function test_society_admin_can_delete_a_tower_without_flats(): void
    {
        $society = $this->makeSociety();
        $user = User::factory()->societyAdmin($society->id)->create();

        $tower = Tower::factory()->create([
            'society_id' => $society->id,
            'name' => 'Empty Tower',
        ]);

        $this->actingAs($user)
            ->delete(route('towers.destroy', $tower->uuid))
            ->assertRedirect(route('towers.index'));

        $this->assertSoftDeleted('towers', ['id' => $tower->id]);
    }

    public function test_tower_with_flats_cannot_be_deleted(): void
    {
        $society = $this->makeSociety();
        $user = User::factory()->societyAdmin($society->id)->create();

        $tower = Tower::factory()->create([
            'society_id' => $society->id,
            'name' => 'Occupied Tower',
        ]);

        Flat::factory()->create([
            'society_id' => $society->id,
            'tower_id' => $tower->id,
        ]);

        $this->actingAs($user)
            ->delete(route('towers.destroy', $tower->uuid))
            ->assertForbidden();

        $this->assertDatabaseHas('towers', [
            'id' => $tower->id,
            'deleted_at' => null,
        ]);
    }

    public function test_treasurer_cannot_view_towers(): void
    {
        $society = $this->makeSociety();
        $user = User::factory()->treasurer($society->id)->create();

        $this->actingAs($user)
            ->get(route('towers.index'))
            ->assertForbidden();
    }

    public function test_super_admin_can_create_a_tower_for_any_society(): void
    {
        $society = $this->makeSociety();
        $user = User::factory()->superAdmin()->create();

        $this->actingAs($user)
            ->post(route('towers.store'), [
                'name' => 'Super Tower',
                'society_id' => $society->id,
            ])
            ->assertRedirect(route('towers.index'));

        $this->assertDatabaseHas('towers', [
            'society_id' => $society->id,
            'name' => 'Super Tower',
        ]);
    }
}
