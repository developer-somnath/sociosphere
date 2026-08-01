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

class FlatTest extends TestCase
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

    private function makeTower(Society $society, string $name = 'Tower A'): Tower
    {
        return Tower::factory()->create([
            'society_id' => $society->id,
            'name' => $name,
        ]);
    }

    public function test_guests_are_redirected_to_login(): void
    {
        $this->get(route('flats.index'))->assertRedirect(route('login'));
    }

    public function test_society_admin_can_view_flats_index(): void
    {
        $society = $this->makeSociety();
        $user = User::factory()->societyAdmin($society->id)->create();
        $tower = $this->makeTower($society, 'Tower A');

        Flat::factory()->create([
            'society_id' => $society->id,
            'tower_id' => $tower->id,
            'flat_no' => 'A-101',
            'ownership_type' => 'Owner',
            'occupancy_status' => 'Occupied',
        ]);

        $this->actingAs($user)
            ->get(route('flats.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/flats/pages/index')
                ->has('flats.data', 1)
                ->where('flats.data.0.flat_no', 'A-101')
                ->where('flats.data.0.tower.name', 'Tower A')
                ->where('stats.total_units', 1)
                ->where('stats.occupied_units', 1)
                ->where('can.create', true));
    }

    public function test_flats_are_scoped_to_the_users_society(): void
    {
        $society = $this->makeSociety();
        $otherSociety = $this->makeSociety();
        $user = User::factory()->societyAdmin($society->id)->create();

        $otherTower = $this->makeTower($otherSociety, 'Other Tower');

        Flat::factory()->create([
            'society_id' => $otherSociety->id,
            'tower_id' => $otherTower->id,
            'flat_no' => 'B-101',
            'ownership_type' => 'Tenant',
            'occupancy_status' => 'Vacant',
        ]);

        $this->actingAs($user)
            ->get(route('flats.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('flats.total', 0)
                ->where('stats.total_units', 0));
    }

    public function test_society_admin_can_create_a_flat(): void
    {
        $society = $this->makeSociety();
        $user = User::factory()->societyAdmin($society->id)->create();
        $tower = $this->makeTower($society, 'Tower A');

        $this->actingAs($user)
            ->post(route('flats.store'), [
                'tower_id' => $tower->id,
                'flat_no' => 'A-102',
                'floor_no' => 1,
                'flat_type' => '2BHK',
                'area_sqft' => 950,
                'ownership_type' => 'Owner',
                'occupancy_status' => 'Occupied',
            ])
            ->assertRedirect(route('flats.index'));

        $this->assertDatabaseHas('flats', [
            'society_id' => $society->id,
            'tower_id' => $tower->id,
            'flat_no' => 'A-102',
            'ownership_type' => 'Owner',
            'occupancy_status' => 'Occupied',
        ]);
    }

    public function test_duplicate_flat_no_in_same_tower_is_rejected(): void
    {
        $society = $this->makeSociety();
        $user = User::factory()->societyAdmin($society->id)->create();
        $tower = $this->makeTower($society, 'Tower A');

        Flat::factory()->create([
            'society_id' => $society->id,
            'tower_id' => $tower->id,
            'flat_no' => 'A-101',
            'ownership_type' => 'Owner',
            'occupancy_status' => 'Occupied',
        ]);

        $this->actingAs($user)
            ->from(route('flats.create'))
            ->post(route('flats.store'), [
                'tower_id' => $tower->id,
                'flat_no' => 'A-101',
                'ownership_type' => 'Owner',
                'occupancy_status' => 'Occupied',
            ])
            ->assertSessionHasErrors('flat_no');

        $this->assertDatabaseCount('flats', 1);
    }

    public function test_same_flat_no_in_different_tower_is_allowed(): void
    {
        $society = $this->makeSociety();
        $user = User::factory()->societyAdmin($society->id)->create();
        $towerA = $this->makeTower($society, 'Tower A');
        $towerB = $this->makeTower($society, 'Tower B');

        Flat::factory()->create([
            'society_id' => $society->id,
            'tower_id' => $towerA->id,
            'flat_no' => 'A-101',
            'ownership_type' => 'Owner',
            'occupancy_status' => 'Occupied',
        ]);

        $this->actingAs($user)
            ->post(route('flats.store'), [
                'tower_id' => $towerB->id,
                'flat_no' => 'A-101',
                'ownership_type' => 'Tenant',
                'occupancy_status' => 'Vacant',
            ])
            ->assertRedirect(route('flats.index'));

        $this->assertDatabaseHas('flats', [
            'society_id' => $society->id,
            'tower_id' => $towerB->id,
            'flat_no' => 'A-101',
        ]);
    }

    public function test_flat_cannot_be_created_in_a_tower_from_another_society(): void
    {
        $society = $this->makeSociety();
        $otherSociety = $this->makeSociety();
        $user = User::factory()->societyAdmin($society->id)->create();

        $otherTower = $this->makeTower($otherSociety, 'Foreign Tower');

        $this->actingAs($user)
            ->from(route('flats.create'))
            ->post(route('flats.store'), [
                'tower_id' => $otherTower->id,
                'flat_no' => 'A-103',
                'ownership_type' => 'Owner',
                'occupancy_status' => 'Vacant',
            ])
            ->assertSessionHasErrors('tower_id');

        $this->assertDatabaseCount('flats', 0);
    }

    public function test_society_admin_can_update_a_flat(): void
    {
        $society = $this->makeSociety();
        $user = User::factory()->societyAdmin($society->id)->create();
        $tower = $this->makeTower($society, 'Tower A');

        $flat = Flat::factory()->create([
            'society_id' => $society->id,
            'tower_id' => $tower->id,
            'flat_no' => 'A-101',
            'ownership_type' => 'Owner',
            'occupancy_status' => 'Occupied',
        ]);

        $this->actingAs($user)
            ->put(route('flats.update', $flat->uuid), [
                'tower_id' => $tower->id,
                'flat_no' => 'A-101',
                'floor_no' => 2,
                'flat_type' => '3BHK',
                'area_sqft' => 1200,
                'ownership_type' => 'Tenant',
                'occupancy_status' => 'Vacant',
            ])
            ->assertRedirect(route('flats.index'));

        $this->assertDatabaseHas('flats', [
            'id' => $flat->id,
            'flat_no' => 'A-101',
            'floor_no' => 2,
            'flat_type' => '3BHK',
            'ownership_type' => 'Tenant',
            'occupancy_status' => 'Vacant',
        ]);
    }

    public function test_society_admin_can_delete_a_flat_without_residents(): void
    {
        $society = $this->makeSociety();
        $user = User::factory()->societyAdmin($society->id)->create();
        $tower = $this->makeTower($society, 'Tower A');

        $flat = Flat::factory()->create([
            'society_id' => $society->id,
            'tower_id' => $tower->id,
            'flat_no' => 'A-101',
            'ownership_type' => 'Owner',
            'occupancy_status' => 'Vacant',
        ]);

        $this->actingAs($user)
            ->delete(route('flats.destroy', $flat->uuid))
            ->assertRedirect(route('flats.index'));

        $this->assertSoftDeleted('flats', ['id' => $flat->id]);
    }

    public function test_flat_with_residents_cannot_be_deleted(): void
    {
        $society = $this->makeSociety();
        $user = User::factory()->societyAdmin($society->id)->create();
        $tower = $this->makeTower($society, 'Tower A');

        $flat = Flat::factory()->create([
            'society_id' => $society->id,
            'tower_id' => $tower->id,
            'flat_no' => 'A-101',
            'ownership_type' => 'Owner',
            'occupancy_status' => 'Occupied',
        ]);

        Resident::factory()->create([
            'society_id' => $society->id,
            'flat_id' => $flat->id,
            'name' => 'Jane Doe',
            'is_primary_contact' => true,
        ]);

        $this->actingAs($user)
            ->delete(route('flats.destroy', $flat->uuid))
            ->assertForbidden();

        $this->assertDatabaseHas('flats', [
            'id' => $flat->id,
            'deleted_at' => null,
        ]);
    }

    public function test_flat_with_residents_cannot_be_deleted_even_by_super_admin(): void
    {
        $society = $this->makeSociety();
        $user = User::factory()->superAdmin()->create();
        $tower = $this->makeTower($society, 'Tower A');

        $flat = Flat::factory()->create([
            'society_id' => $society->id,
            'tower_id' => $tower->id,
            'flat_no' => 'A-101',
            'ownership_type' => 'Owner',
            'occupancy_status' => 'Occupied',
        ]);

        Resident::factory()->create([
            'society_id' => $society->id,
            'flat_id' => $flat->id,
            'name' => 'John Smith',
            'is_primary_contact' => true,
        ]);

        $this->actingAs($user)
            ->delete(route('flats.destroy', $flat->uuid))
            ->assertForbidden();

        $this->assertDatabaseHas('flats', [
            'id' => $flat->id,
            'deleted_at' => null,
        ]);
    }

    public function test_treasurer_cannot_view_flats(): void
    {
        $society = $this->makeSociety();
        $user = User::factory()->treasurer($society->id)->create();

        $this->actingAs($user)
            ->get(route('flats.index'))
            ->assertForbidden();
    }

    public function test_super_admin_can_create_a_flat_for_any_society(): void
    {
        $society = $this->makeSociety();
        $user = User::factory()->superAdmin()->create();
        $tower = $this->makeTower($society, 'Tower A');

        $this->actingAs($user)
            ->post(route('flats.store'), [
                'tower_id' => $tower->id,
                'flat_no' => 'X-001',
                'ownership_type' => 'Owner',
                'occupancy_status' => 'Vacant',
            ])
            ->assertRedirect(route('flats.index'));

        $this->assertDatabaseHas('flats', [
            'society_id' => $society->id,
            'tower_id' => $tower->id,
            'flat_no' => 'X-001',
        ]);
    }
}
