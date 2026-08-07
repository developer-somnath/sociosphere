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

class ResidentTest extends TestCase
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

    private function makeSocietyWithFlat(): array
    {
        $society = Society::factory()->create();
        $tower = Tower::factory()->create(['society_id' => $society->id]);

        $flat = Flat::factory()->create([
            'society_id' => $society->id,
            'tower_id' => $tower->id,
            'occupancy_status' => 'Occupied',
        ]);

        return [$society, $flat];
    }

    public function test_guests_are_redirected_to_login(): void
    {
        $this->get(route('residents.index'))->assertRedirect(route('login'));
    }

    public function test_society_admin_can_view_residents_index(): void
    {
        [$society, $flat] = $this->makeSocietyWithFlat();
        $user = User::factory()->societyAdmin($society->id)->create();

        Resident::factory()->create([
            'society_id' => $society->id,
            'flat_id' => $flat->id,
            'name' => 'Aarav Sharma',
        ]);

        $this->actingAs($user)
            ->get(route('residents.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/residents/pages/index')
                ->has('residents.data', 1)
                ->where('residents.data.0.name', 'Aarav Sharma'));
    }

    public function test_residents_are_scoped_to_the_users_society(): void
    {
        [$society] = $this->makeSocietyWithFlat();
        [$otherSociety, $otherFlat] = $this->makeSocietyWithFlat();

        $user = User::factory()->societyAdmin($society->id)->create();

        Resident::factory()->create([
            'society_id' => $otherSociety->id,
            'flat_id' => $otherFlat->id,
            'name' => 'Other Society Resident',
        ]);

        $this->actingAs($user)
            ->get(route('residents.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('residents.total', 0));
    }

    public function test_society_admin_can_create_a_resident(): void
    {
        [$society, $flat] = $this->makeSocietyWithFlat();
        $user = User::factory()->societyAdmin($society->id)->create();

        $this->actingAs($user)
            ->post(route('residents.store'), [
                'flat_id' => $flat->id,
                'name' => 'Priya Patel',
                'email' => 'priya@example.com',
                'phone' => '9876543210',
                'date_of_birth' => '1990-05-15',
                'gender' => 'Female',
                'occupation' => 'Doctor',
                'is_primary_contact' => true,
            ])
            ->assertRedirect(route('residents.index'));

        $this->assertDatabaseHas('residents', [
            'society_id' => $society->id,
            'flat_id' => $flat->id,
            'name' => 'Priya Patel',
            'is_primary_contact' => true,
        ]);
    }

    public function test_create_validates_flat_belongs_to_same_society(): void
    {
        [$society] = $this->makeSocietyWithFlat();
        [$otherSociety, $otherFlat] = $this->makeSocietyWithFlat();

        $user = User::factory()->societyAdmin($society->id)->create();

        $this->actingAs($user)
            ->from(route('residents.create'))
            ->post(route('residents.store'), [
                'flat_id' => $otherFlat->id,
                'name' => 'Invalid Flat Resident',
                'phone' => '9876543210',
            ])
            ->assertSessionHasErrors('flat_id');

        $this->assertDatabaseMissing('residents', [
            'name' => 'Invalid Flat Resident',
        ]);
    }

    public function test_society_admin_can_update_a_resident(): void
    {
        [$society, $flat] = $this->makeSocietyWithFlat();
        $user = User::factory()->societyAdmin($society->id)->create();

        $resident = Resident::factory()->create([
            'society_id' => $society->id,
            'flat_id' => $flat->id,
            'name' => 'Old Name',
        ]);

        $this->actingAs($user)
            ->put(route('residents.update', $resident->uuid), [
                'flat_id' => $flat->id,
                'name' => 'New Name',
                'email' => 'new@example.com',
                'phone' => '9123456780',
                'gender' => 'Male',
            ])
            ->assertRedirect(route('residents.index'));

        $this->assertDatabaseHas('residents', [
            'id' => $resident->id,
            'name' => 'New Name',
        ]);
    }

    public function test_society_admin_can_delete_a_resident(): void
    {
        [$society, $flat] = $this->makeSocietyWithFlat();
        $user = User::factory()->societyAdmin($society->id)->create();

        $resident = Resident::factory()->create([
            'society_id' => $society->id,
            'flat_id' => $flat->id,
        ]);

        $this->actingAs($user)
            ->delete(route('residents.destroy', $resident->uuid))
            ->assertRedirect(route('residents.index'));

        $this->assertSoftDeleted('residents', ['id' => $resident->id]);
    }

    public function test_primary_contact_is_reassigned_when_a_new_resident_is_marked_primary(): void
    {
        [$society, $flat] = $this->makeSocietyWithFlat();
        $user = User::factory()->societyAdmin($society->id)->create();

        $existingPrimary = Resident::factory()->create([
            'society_id' => $society->id,
            'flat_id' => $flat->id,
            'name' => 'Existing Primary',
            'is_primary_contact' => true,
        ]);

        $this->actingAs($user)
            ->post(route('residents.store'), [
                'flat_id' => $flat->id,
                'name' => 'New Primary',
                'phone' => '9876543210',
                'is_primary_contact' => true,
            ])
            ->assertRedirect(route('residents.index'));

        $existingPrimary->refresh();
        $newResident = Resident::query()->where('name', 'New Primary')->firstOrFail();

        $this->assertFalse($existingPrimary->is_primary_contact);
        $this->assertTrue($newResident->is_primary_contact);
    }

    public function test_treasurer_can_view_but_not_create_residents(): void
    {
        [$society, $flat] = $this->makeSocietyWithFlat();
        $user = User::factory()->treasurer($society->id)->create();

        $this->actingAs($user)
            ->get(route('residents.index'))
            ->assertOk();

        $this->actingAs($user)
            ->post(route('residents.store'), [
                'flat_id' => $flat->id,
                'name' => 'Not Allowed',
                'phone' => '9876543210',
            ])
            ->assertForbidden();
    }
}
