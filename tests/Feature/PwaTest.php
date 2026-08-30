<?php

namespace Tests\Feature;

use App\Models\PushSubscription;
use App\Models\Society;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PwaTest extends TestCase
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

    public function test_webmanifest_file_exists_and_is_valid_pwa_json(): void
    {
        $manifestPath = public_path('manifest.webmanifest');
        $this->assertFileExists($manifestPath);

        $content = file_get_contents($manifestPath);
        $manifest = json_decode($content, true);

        $this->assertIsArray($manifest);
        $this->assertEquals('SocioSphere — Society Management', $manifest['name']);
        $this->assertEquals('SocioSphere', $manifest['short_name']);
        $this->assertEquals('/', $manifest['start_url']);
        $this->assertEquals('standalone', $manifest['display']);
        $this->assertEquals('#10b981', $manifest['theme_color']);
        $this->assertNotEmpty($manifest['icons']);

        // Check icons
        $iconPurposes = array_column($manifest['icons'], 'purpose');
        $this->assertContains('any', $iconPurposes);
        $this->assertContains('maskable', $iconPurposes);
    }

    public function test_service_worker_file_exists_and_contains_caching_and_push_listeners(): void
    {
        $swPath = public_path('sw.js');
        $this->assertFileExists($swPath);

        $content = file_get_contents($swPath);
        $this->assertStringContainsString("self.addEventListener('install'", $content);
        $this->assertStringContainsString("self.addEventListener('activate'", $content);
        $this->assertStringContainsString("self.addEventListener('fetch'", $content);
        $this->assertStringContainsString("self.addEventListener('push'", $content);
        $this->assertStringContainsString("self.addEventListener('notificationclick'", $content);
    }

    public function test_pwa_icons_exist_in_public_root(): void
    {
        $this->assertFileExists(public_path('icon.svg'));
        $this->assertFileExists(public_path('icon-maskable.svg'));
    }

    public function test_authenticated_user_can_subscribe_and_unsubscribe_to_web_push(): void
    {
        $society = Society::factory()->create();
        $resident = User::factory()->resident($society->id)->create();

        $endpoint = 'https://fcm.googleapis.com/fcm/send/test-pwa-sub-123';

        // 1. Subscribe
        $response = $this->actingAs($resident)->postJson(route('push.subscribe'), [
            'subscription' => [
                'endpoint' => $endpoint,
                'keys' => [
                    'p256dh' => 'BDx_test_key_p256dh',
                    'auth' => 'test_auth_token_123',
                ],
            ],
        ]);

        $response->assertOk();
        $response->assertJson(['ok' => true]);

        $sub = PushSubscription::where('endpoint', $endpoint)->first();
        $this->assertNotNull($sub);
        $this->assertEquals($resident->id, $sub->user_id);
        $this->assertEquals('BDx_test_key_p256dh', $sub->p256dh);
        $this->assertEquals('test_auth_token_123', $sub->auth);

        // 2. Unsubscribe
        $unsubResponse = $this->actingAs($resident)->postJson(route('push.unsubscribe'), [
            'subscription' => [
                'endpoint' => $endpoint,
            ],
        ]);

        $unsubResponse->assertOk();
        $unsubResponse->assertJson(['ok' => true]);

        $this->assertNull(PushSubscription::where('endpoint', $endpoint)->first());
    }
}
