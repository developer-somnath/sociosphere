<?php

namespace Tests\Feature;

use App\Models\Society;
use App\Models\Tower;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SocietyTest extends TestCase
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

    public function test_super_admin_can_view_societies_index(): void
    {
        Society::factory()->count(2)->create();
        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)
            ->get(route('societies.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/societies/pages/index')
                ->has('societies.data', 2)
            );
    }

    public function test_super_admin_can_create_a_society(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();

        $response = $this->actingAs($superAdmin)
            ->post(route('societies.store'), [
                'name' => 'Royal Heights',
                'registration_no' => 'REG-99182',
                'city' => 'Mumbai',
                'state' => 'Maharashtra',
                'country' => 'India',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('societies', [
            'name' => 'Royal Heights',
            'registration_no' => 'REG-99182',
        ]);
    }

    public function test_society_admin_can_view_and_update_own_society(): void
    {
        $society = Society::factory()->create(['name' => 'Original Name']);
        $user = User::factory()->societyAdmin($society->id)->create();

        $this->actingAs($user)
            ->get(route('societies.show', $society))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/societies/pages/show')
                ->where('society.name', 'Original Name')
            );

        $this->actingAs($user)
            ->put(route('societies.update', $society), [
                'name' => 'Updated Name',
                'registration_no' => 'REG-1002',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('societies', [
            'id' => $society->id,
            'name' => 'Updated Name',
        ]);
    }

    public function test_cannot_delete_society_with_towers_or_users(): void
    {
        $society = Society::factory()->create();
        Tower::factory()->create(['society_id' => $society->id]);
        $superAdmin = User::factory()->superAdmin()->create();

        $response = $this->actingAs($superAdmin)
            ->delete(route('societies.destroy', $society));

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('societies', ['id' => $society->id]);
    }
}
