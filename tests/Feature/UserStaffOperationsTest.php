<?php

namespace Tests\Feature;

use App\Models\Society;
use App\Models\StaffProfile;
use App\Models\User;
use App\Models\UserInvitation;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class UserStaffOperationsTest extends TestCase
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

    public function test_society_admin_can_generate_user_invitation(): void
    {
        $society = Society::factory()->create();
        $admin = User::factory()->societyAdmin($society->id)->create();

        $response = $this->actingAs($admin)
            ->post(route('users.invite'), [
                'email' => 'invited.guard@example.com',
                'role' => 'SecurityGuard',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('user_invitations', [
            'society_id' => $society->id,
            'email' => 'invited.guard@example.com',
            'role_name' => 'SecurityGuard',
        ]);
    }

    public function test_user_can_accept_invitation_and_register_account(): void
    {
        $society = Society::factory()->create();
        $invitation = UserInvitation::create([
            'society_id' => $society->id,
            'email' => 'new.member@example.com',
            'role_name' => 'Resident',
            'token' => Str::random(32),
            'expires_at' => now()->addDays(7),
        ]);

        $response = $this->get(route('invitations.register', $invitation->token));
        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/auth/pages/invitation-register')
                ->where('invitation.email', 'new.member@example.com')
            );

        $acceptResponse = $this->post(route('invitations.accept', $invitation->token), [
            'name' => 'New Resident',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $acceptResponse->assertRedirect(route('overview'));
        $this->assertDatabaseHas('users', [
            'email' => 'new.member@example.com',
            'society_id' => $society->id,
        ]);
    }

    public function test_expired_or_invalid_invitation_token_is_rejected(): void
    {
        $response = $this->get(route('invitations.register', 'invalid_token_xyz'));
        $response->assertRedirect(route('login'));
        $response->assertSessionHas('error');
    }

    public function test_society_admin_can_toggle_user_status(): void
    {
        $society = Society::factory()->create();
        $admin = User::factory()->societyAdmin($society->id)->create();
        $user = User::factory()->create(['society_id' => $society->id, 'is_active' => true]);

        $this->actingAs($admin)
            ->post(route('users.toggle-status', $user))
            ->assertRedirect();

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'is_active' => false,
        ]);
    }

    public function test_super_admin_can_restore_soft_deleted_user(): void
    {
        $society = Society::factory()->create();
        $user = User::factory()->create(['society_id' => $society->id]);
        $user->delete();

        $this->assertSoftDeleted('users', ['id' => $user->id]);

        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)
            ->post(route('users.restore', $user->id))
            ->assertRedirect();

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'deleted_at' => null,
        ]);
    }

    public function test_staff_profile_creation(): void
    {
        $society = Society::factory()->create();
        $user = User::factory()->create(['society_id' => $society->id]);

        $profile = StaffProfile::create([
            'society_id' => $society->id,
            'user_id' => $user->id,
            'department' => 'Security',
            'designation' => 'Head Guard',
            'shift' => 'Night',
            'status' => 'Active',
        ]);

        $this->assertDatabaseHas('staff_profiles', [
            'id' => $profile->id,
            'department' => 'Security',
            'shift' => 'Night',
        ]);
    }
}
