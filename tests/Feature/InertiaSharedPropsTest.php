<?php

namespace Tests\Feature;

use App\Models\Society;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InertiaSharedPropsTest extends TestCase
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

    public function test_flash_messages_are_shared_with_inertia_pages(): void
    {
        $society = Society::factory()->create();
        $user = User::factory()->societyAdmin($society->id)->create();

        $this->actingAs($user)
            ->withSession(['success' => 'Tower added successfully.'])
            ->get(route('towers.index'))
            ->assertInertia(fn ($page) => $page
                ->where('flash.success', 'Tower added successfully.')
                ->where('flash.error', null));
    }
}
