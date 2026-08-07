<?php

namespace Tests\Feature;

use App\Models\Flat;
use App\Models\ParkingSlot;
use App\Models\Society;
use App\Models\Tower;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ParkingTest extends TestCase
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

    public function test_society_admin_can_view_parking_slots_index(): void
    {
        $society = Society::factory()->create();
        $admin = User::factory()->societyAdmin($society->id)->create();

        ParkingSlot::create([
            'society_id' => $society->id,
            'slot_number' => 'B1-P01',
            'type' => 'Four Wheeler',
            'status' => 'Available',
        ]);

        $this->actingAs($admin)
            ->get(route('parking-slots.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/parking/pages/index')
                ->has('slots', 1)
            );
    }

    public function test_society_admin_can_create_parking_slot(): void
    {
        $society = Society::factory()->create();
        $admin = User::factory()->societyAdmin($society->id)->create();

        $response = $this->actingAs($admin)
            ->post(route('parking-slots.store'), [
                'slot_number' => 'B1-P02',
                'type' => 'Four Wheeler',
                'status' => 'Available',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('parking_slots', [
            'society_id' => $society->id,
            'slot_number' => 'B1-P02',
        ]);
    }

    public function test_society_admin_can_update_and_deallocate_parking_slot(): void
    {
        $society = Society::factory()->create();
        $tower = Tower::factory()->create(['society_id' => $society->id]);
        $flat = Flat::factory()->create(['society_id' => $society->id, 'tower_id' => $tower->id]);
        $admin = User::factory()->societyAdmin($society->id)->create();

        $slot = ParkingSlot::create([
            'society_id' => $society->id,
            'tower_id' => $tower->id,
            'flat_id' => $flat->id,
            'slot_number' => 'B1-P03',
            'type' => 'Four Wheeler',
            'status' => 'Allocated',
            'vehicle_number' => 'MH-12-AB-1234',
        ]);

        $this->actingAs($admin)
            ->post(route('parking-slots.deallocate', $slot))
            ->assertRedirect();

        $this->assertDatabaseHas('parking_slots', [
            'id' => $slot->id,
            'flat_id' => null,
            'status' => 'Available',
            'vehicle_number' => null,
        ]);
    }

    public function test_society_admin_can_delete_parking_slot(): void
    {
        $society = Society::factory()->create();
        $admin = User::factory()->societyAdmin($society->id)->create();

        $slot = ParkingSlot::create([
            'society_id' => $society->id,
            'slot_number' => 'B1-P04',
            'type' => 'Two Wheeler',
            'status' => 'Available',
        ]);

        $this->actingAs($admin)
            ->delete(route('parking-slots.destroy', $slot))
            ->assertRedirect();

        $this->assertSoftDeleted('parking_slots', ['id' => $slot->id]);
    }
}
