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

class PropertyRestoreTest extends TestCase
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

    public function test_super_admin_can_restore_soft_deleted_tower(): void
    {
        $society = Society::factory()->create();
        $tower = Tower::factory()->create(['society_id' => $society->id]);
        $tower->delete();

        $this->assertSoftDeleted('towers', ['id' => $tower->id]);

        $superAdmin = User::factory()->superAdmin()->create();

        $response = $this->actingAs($superAdmin)
            ->post(route('towers.restore', $tower->id));

        $response->assertRedirect();
        $this->assertDatabaseHas('towers', [
            'id' => $tower->id,
            'deleted_at' => null,
        ]);
    }

    public function test_super_admin_can_restore_soft_deleted_flat(): void
    {
        $society = Society::factory()->create();
        $tower = Tower::factory()->create(['society_id' => $society->id]);
        $flat = Flat::factory()->create(['society_id' => $society->id, 'tower_id' => $tower->id]);
        $flat->delete();

        $this->assertSoftDeleted('flats', ['id' => $flat->id]);

        $superAdmin = User::factory()->superAdmin()->create();

        $response = $this->actingAs($superAdmin)
            ->post(route('flats.restore', $flat->id));

        $response->assertRedirect();
        $this->assertDatabaseHas('flats', [
            'id' => $flat->id,
            'deleted_at' => null,
        ]);
    }
}
