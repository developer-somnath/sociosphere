<?php

namespace Tests\Feature;

use App\Models\Flat;
use App\Models\FlatOccupancy;
use App\Models\FlatOwnership;
use App\Models\Resident;
use App\Models\Society;
use App\Models\Tower;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ResidentLifecycleTest extends TestCase
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

    public function test_flat_ownership_and_occupancy_history_tracking(): void
    {
        $society = Society::factory()->create();
        $tower = Tower::factory()->create(['society_id' => $society->id]);
        $flat = Flat::factory()->create(['society_id' => $society->id, 'tower_id' => $tower->id]);
        $resident = Resident::factory()->create(['society_id' => $society->id, 'flat_id' => $flat->id]);

        $ownership = FlatOwnership::create([
            'society_id' => $society->id,
            'flat_id' => $flat->id,
            'owner_name' => 'John Owner',
            'owner_email' => 'owner@example.com',
            'ownership_start' => now(),
            'is_current' => true,
        ]);

        $occupancy = FlatOccupancy::create([
            'society_id' => $society->id,
            'flat_id' => $flat->id,
            'resident_id' => $resident->id,
            'occupancy_type' => 'Tenant',
            'move_in_date' => now(),
            'is_active' => true,
        ]);

        $this->assertDatabaseHas('flat_ownerships', [
            'id' => $ownership->id,
            'owner_name' => 'John Owner',
        ]);

        $this->assertDatabaseHas('flat_occupancies', [
            'id' => $occupancy->id,
            'occupancy_type' => 'Tenant',
        ]);
    }
}
