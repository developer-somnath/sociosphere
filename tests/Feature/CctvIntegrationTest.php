<?php

namespace Tests\Feature;

use App\Models\CctvCamera;
use App\Models\Society;
use App\Models\Tower;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CctvIntegrationTest extends TestCase
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

    public function test_society_admin_and_guard_can_view_cctv_cameras(): void
    {
        $society = Society::factory()->create();
        $admin = User::factory()->societyAdmin($society->id)->create();

        CctvCamera::create([
            'society_id' => $society->id,
            'name' => 'Main Gate Cam 01',
            'camera_group' => 'Main Gate',
            'stream_url' => 'rtsp://192.168.1.100/stream1',
            'status' => 'Online',
        ]);

        $this->actingAs($admin)
            ->get(route('cctv-cameras.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/cctv/pages/index')
                ->has('cameras.data', 1)
            );
    }

    public function test_society_admin_can_create_cctv_camera(): void
    {
        $society = Society::factory()->create();
        $admin = User::factory()->societyAdmin($society->id)->create();

        $response = $this->actingAs($admin)
            ->post(route('cctv-cameras.store'), [
                'name' => 'Basement Bay Cam 02',
                'camera_group' => 'Basement Parking',
                'stream_url' => 'rtsp://192.168.1.102/stream1',
                'status' => 'Online',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('cctv_cameras', [
            'society_id' => $society->id,
            'name' => 'Basement Bay Cam 02',
        ]);
    }

    public function test_society_admin_can_update_and_delete_cctv_camera(): void
    {
        $society = Society::factory()->create();
        $admin = User::factory()->societyAdmin($society->id)->create();

        $camera = CctvCamera::create([
            'society_id' => $society->id,
            'name' => 'Perimeter Cam 03',
            'camera_group' => 'Perimeter',
            'stream_url' => 'rtsp://192.168.1.103/stream1',
            'status' => 'Online',
        ]);

        $this->actingAs($admin)
            ->put(route('cctv-cameras.update', $camera), [
                'name' => 'Perimeter Cam 03 (Updated)',
                'camera_group' => 'Perimeter',
                'stream_url' => 'rtsp://192.168.1.103/stream1',
                'status' => 'Maintenance',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('cctv_cameras', [
            'id' => $camera->id,
            'status' => 'Maintenance',
        ]);

        $this->actingAs($admin)
            ->delete(route('cctv-cameras.destroy', $camera))
            ->assertRedirect();

        $this->assertSoftDeleted('cctv_cameras', ['id' => $camera->id]);
    }
}
