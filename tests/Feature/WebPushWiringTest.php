<?php

namespace Tests\Feature;

use App\Models\Notice;
use App\Models\PushSubscription;
use App\Models\Society;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class WebPushWiringTest extends TestCase
{
    use RefreshDatabase;

    protected Society $society;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([
            RoleSeeder::class,
            PermissionSeeder::class,
            RolePermissionSeeder::class,
        ]);

        $this->society = Society::factory()->create();
        $this->admin = User::factory()->create(['society_id' => $this->society->id]);
        $this->admin->assignRole('SocietyAdmin');
    }

    public function test_publishing_a_notice_broadcasts_web_push_to_subscribers(): void
    {
        PushSubscription::factory()->create([
            'society_id' => $this->society->id,
            'user_id' => $this->admin->id,
        ]);

        $service = Mockery::mock(\App\Services\WebPushService::class);
        $service->shouldReceive('broadcast')
            ->once()
            ->with(Mockery::type('Illuminate\Database\Eloquent\Collection'), Mockery::on(function ($payload) {
                return ($payload['type'] ?? null) === 'notice.published'
                    && ($payload['title'] ?? null) === 'Fire Drill';
            }))
            ->andReturn(1);

        $this->app->instance(\App\Services\WebPushService::class, $service);

        $this->actingAs($this->admin)
            ->post(route('notices.store'), [
                'title' => 'Fire Drill',
                'description' => 'Scheduled drill at 10am.',
                'category' => 'General',
                'target_audience' => 'All',
                'publish_from' => now()->toDateTimeString(),
                'is_pinned' => false,
            ])
            ->assertRedirect(route('notices.index'));

        $this->assertDatabaseHas('notices', ['title' => 'Fire Drill']);
    }

    public function test_publishing_without_subscribers_does_not_broadcast(): void
    {
        $service = Mockery::mock(\App\Services\WebPushService::class);
        $service->shouldNotReceive('broadcast');
        $service->shouldNotReceive('sendToUser');

        $this->app->instance(\App\Services\WebPushService::class, $service);

        $this->actingAs($this->admin)
            ->post(route('notices.store'), [
                'title' => 'Quiet Notice',
                'description' => 'No subscribers yet.',
                'category' => 'General',
                'target_audience' => 'All',
                'publish_from' => now()->toDateTimeString(),
                'is_pinned' => false,
            ])
            ->assertRedirect(route('notices.index'));
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
