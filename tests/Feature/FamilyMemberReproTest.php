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

class FamilyMemberReproTest extends TestCase
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

    public function test_society_admin_can_add_family_member(): void
    {
        $society = Society::factory()->create();
        $tower = Tower::factory()->create(['society_id' => $society->id]);
        $flat = Flat::factory()->create([
            'society_id' => $society->id,
            'tower_id' => $tower->id,
            'occupancy_status' => 'Occupied',
        ]);
        $resident = Resident::factory()->create([
            'society_id' => $society->id,
            'flat_id' => $flat->id,
        ]);
        $admin = User::factory()->societyAdmin($society->id)->create();

        $this->actingAs($admin)
            ->post(route('residents.family-members.store', $resident->uuid), [
                'name' => 'Junior Sharma',
                'relation' => 'Child',
                'gender' => 'Male',
                'is_dependent' => true,
            ]);

        $this->assertDatabaseHas('family_members', [
            'resident_id' => $resident->id,
            'name' => 'Junior Sharma',
        ]);
    }

    public function test_duplicate_family_member_name_for_same_resident_is_rejected(): void
    {
        $society = Society::factory()->create();
        $tower = Tower::factory()->create(['society_id' => $society->id]);
        $flat = Flat::factory()->create([
            'society_id' => $society->id,
            'tower_id' => $tower->id,
            'occupancy_status' => 'Occupied',
        ]);
        $resident = Resident::factory()->create([
            'society_id' => $society->id,
            'flat_id' => $flat->id,
        ]);
        $admin = User::factory()->societyAdmin($society->id)->create();

        $payload = [
            'name' => 'Somnath Bhunia',
            'relation' => 'Spouse',
            'gender' => 'Female',
            'is_dependent' => true,
        ];

        $this->actingAs($admin)
            ->post(route('residents.family-members.store', $resident->uuid), $payload)
            ->assertRedirect();

        $this->assertDatabaseHas('family_members', [
            'resident_id' => $resident->id,
            'name' => 'Somnath Bhunia',
        ]);

        // Second attempt with the same name + resident must be rejected.
        $this->actingAs($admin)
            ->post(route('residents.family-members.store', $resident->uuid), $payload)
            ->assertSessionHasErrors('name');

        // A different resident may reuse the same name (scoped uniqueness).
        $otherResident = Resident::factory()->create([
            'society_id' => $society->id,
            'flat_id' => $flat->id,
        ]);

        $this->actingAs($admin)
            ->post(route('residents.family-members.store', $otherResident->uuid), $payload)
            ->assertRedirect();
    }

    public function test_updating_a_member_with_the_same_name_is_allowed(): void
    {
        $society = Society::factory()->create();
        $tower = Tower::factory()->create(['society_id' => $society->id]);
        $flat = Flat::factory()->create([
            'society_id' => $society->id,
            'tower_id' => $tower->id,
            'occupancy_status' => 'Occupied',
        ]);
        $resident = Resident::factory()->create([
            'society_id' => $society->id,
            'flat_id' => $flat->id,
        ]);
        $admin = User::factory()->societyAdmin($society->id)->create();

        $member = \App\Models\FamilyMember::create([
            'society_id' => $society->id,
            'resident_id' => $resident->id,
            'name' => 'Somnath Bhunia',
            'relation' => 'Spouse',
        ]);

        // Re-saving the same name on the same record must not be rejected.
        $this->actingAs($admin)
            ->put(route('residents.family-members.update', [$resident->uuid, $member->uuid]), [
                'name' => 'Somnath Bhunia',
                'relation' => 'Spouse',
                'gender' => 'Female',
                'is_dependent' => true,
            ])
            ->assertRedirect();
    }
}
