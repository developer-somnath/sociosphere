<?php

namespace Tests\Feature;

use App\Models\Language;
use App\Models\User;
use Database\Seeders\LanguageSeeder;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InternationalizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(LanguageSeeder::class);
    }

    public function test_languages_seeder_populates_42_global_locales(): void
    {
        $this->assertDatabaseHas('languages', [
            'code' => 'en',
            'script_dir' => 'ltr',
        ]);

        $this->assertDatabaseHas('languages', [
            'code' => 'ar',
            'script_dir' => 'rtl',
        ]);

        $this->assertDatabaseHas('languages', [
            'code' => 'bn',
            'native_name' => 'বাংলা',
        ]);

        $this->assertDatabaseHas('languages', [
            'code' => 'hi',
            'native_name' => 'हिन्दी',
        ]);

        $this->assertGreaterThanOrEqual(40, Language::count());
    }

    public function test_user_can_switch_language_context(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->post(route('language.switch'), [
                'locale' => 'ar',
            ]);

        $response->assertRedirect();
        $this->assertEquals('ar', session('locale'));
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'locale' => 'ar',
        ]);
    }

    public function test_unsupported_language_switch_is_rejected(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->post(route('language.switch'), [
                'locale' => 'invalid',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');
    }
}
