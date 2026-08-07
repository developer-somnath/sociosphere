<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\Society;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserTest extends TestCase
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

    private function makeSociety(): Society
    {
        return Society::factory()->create();
    }

    public function test_guests_are_redirected_to_login(): void
    {
        $this->get(route('users.index'))->assertRedirect(route('login'));
    }

    public function test_society_admin_can_view_users_index(): void
    {
        $society = $this->makeSociety();
        $admin = User::factory()->societyAdmin($society->id)->create();

        User::factory()->treasurer($society->id)->create([
            'name' => 'Meera Iyer',
        ]);

        $this->actingAs($admin)
            ->get(route('users.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/users/pages/index')
                ->has('users.data', 2)
                ->where('users.data.0.name', 'Society Admin')
                ->where('can.create', true));
    }

    public function test_society_admin_only_sees_own_society_users(): void
    {
        $societyA = $this->makeSociety();
        $societyB = $this->makeSociety();
        $admin = User::factory()->societyAdmin($societyA->id)->create();

        User::factory()->treasurer($societyA->id)->create();
        User::factory()->treasurer($societyB->id)->create([
            'email' => 'treasurer-b@gvr.com',
        ]);

        $this->actingAs($admin)
            ->get(route('users.index'))
            ->assertInertia(fn ($page) => $page
                ->has('users.data', 2)
                ->where('users.total', 2));
    }

    public function test_society_admin_can_create_user_with_assignable_role(): void
    {
        $society = $this->makeSociety();
        $admin = User::factory()->societyAdmin($society->id)->create();

        $this->actingAs($admin)
            ->post(route('users.store'), [
                'name' => 'Rohan Verma',
                'email' => 'rohan@example.com',
                'phone' => '9876501234',
                'password' => 'secret123',
                'password_confirmation' => 'secret123',
                'role' => 'Treasurer',
                'is_active' => true,
            ])
            ->assertRedirect(route('users.index'));

        $this->assertDatabaseHas('users', [
            'email' => 'rohan@example.com',
            'society_id' => $society->id,
            'is_active' => true,
        ]);

        $user = User::where('email', 'rohan@example.com')->first();
        $this->assertTrue($user->hasRole('Treasurer'));
        $this->assertTrue($user->hasPermissionTo('invoice.view'));
    }

    public function test_society_admin_cannot_assign_super_admin_role(): void
    {
        $society = $this->makeSociety();
        $admin = User::factory()->societyAdmin($society->id)->create();

        $this->actingAs($admin)
            ->post(route('users.store'), [
                'name' => 'Hacker',
                'email' => 'hacker@example.com',
                'password' => 'secret123',
                'password_confirmation' => 'secret123',
                'role' => 'SuperAdmin',
            ])
            ->assertSessionHasErrors('role');
    }

    public function test_super_admin_can_assign_a_custom_role(): void
    {
        $society = $this->makeSociety();
        $admin = User::factory()->superAdmin()->create();

        $role = Role::create(['name' => 'Gate Manager', 'guard_name' => 'web']);
        $role->syncPermissions([
            'visitor.view',
            'visitor.create',
            'visitor.update',
        ]);

        $this->actingAs($admin)
            ->post(route('users.store'), [
                'name' => 'Gate Keeper',
                'email' => 'gatekeeper@example.com',
                'phone' => '9812345670',
                'password' => 'secret123',
                'password_confirmation' => 'secret123',
                'role' => 'Gate Manager',
                'society_id' => $society->id,
                'is_active' => true,
            ])
            ->assertRedirect(route('users.index'));

        $user = User::where('email', 'gatekeeper@example.com')->firstOrFail();
        $this->assertTrue($user->hasRole('Gate Manager'));
        $this->assertTrue($user->hasPermissionTo('visitor.view'));
    }

    public function test_duplicate_email_is_rejected(): void
    {
        $society = $this->makeSociety();
        $admin = User::factory()->societyAdmin($society->id)->create();

        $this->actingAs($admin)
            ->post(route('users.store'), [
                'name' => 'Duplicate',
                'email' => $admin->email,
                'password' => 'secret123',
                'password_confirmation' => 'secret123',
                'role' => 'Resident',
            ])
            ->assertSessionHasErrors('email');
    }

    public function test_soft_deleted_email_can_be_reused(): void
    {
        $society = $this->makeSociety();
        $admin = User::factory()->societyAdmin($society->id)->create();

        $old = User::factory()->treasurer($society->id)->create([
            'email' => 'reuse@example.com',
        ]);
        $old->delete();

        $this->actingAs($admin)
            ->post(route('users.store'), [
                'name' => 'Reuse',
                'email' => 'reuse@example.com',
                'password' => 'secret123',
                'password_confirmation' => 'secret123',
                'role' => 'Resident',
            ])
            ->assertRedirect(route('users.index'));

        $this->assertDatabaseHas('users', [
            'email' => 'reuse@example.com',
            'deleted_at' => null,
        ]);
    }

    public function test_society_admin_can_update_user(): void
    {
        $society = $this->makeSociety();
        $admin = User::factory()->societyAdmin($society->id)->create();
        $user = User::factory()->resident($society->id)->create([
            'name' => 'Old Name',
            'email' => 'old@example.com',
        ]);

        $this->actingAs($admin)
            ->put(route('users.update', $user->uuid), [
                'name' => 'New Name',
                'email' => 'new@example.com',
                'role' => 'SecurityGuard',
                'is_active' => false,
            ])
            ->assertRedirect(route('users.index'));

        $user->refresh();

        $this->assertSame('New Name', $user->name);
        $this->assertSame('new@example.com', $user->email);
        $this->assertFalse($user->is_active);
        $this->assertTrue($user->hasRole('SecurityGuard'));
    }

    public function test_update_without_password_keeps_existing_password(): void
    {
        $society = $this->makeSociety();
        $admin = User::factory()->societyAdmin($society->id)->create();
        $user = User::factory()->resident($society->id)->create([
            'password' => Hash::make('original-pass'),
        ]);

        $this->actingAs($admin)
            ->put(route('users.update', $user->uuid), [
                'name' => 'No Pass Change',
                'email' => $user->email,
                'role' => 'Resident',
            ])
            ->assertRedirect(route('users.index'));

        $user->refresh();

        $this->assertTrue(Hash::check('original-pass', $user->password));
    }

    public function test_update_with_password_changes_password(): void
    {
        $society = $this->makeSociety();
        $admin = User::factory()->societyAdmin($society->id)->create();
        $user = User::factory()->resident($society->id)->create([
            'password' => Hash::make('original-pass'),
        ]);

        $this->actingAs($admin)
            ->put(route('users.update', $user->uuid), [
                'name' => $user->name,
                'email' => $user->email,
                'role' => 'Resident',
                'password' => 'new-pass-123',
                'password_confirmation' => 'new-pass-123',
            ])
            ->assertRedirect(route('users.index'));

        $user->refresh();

        $this->assertTrue(Hash::check('new-pass-123', $user->password));
    }

    public function test_user_cannot_delete_themselves(): void
    {
        $society = $this->makeSociety();
        $admin = User::factory()->societyAdmin($society->id)->create();

        $this->actingAs($admin)
            ->delete(route('users.destroy', $admin->uuid))
            ->assertForbidden();

        $this->assertNotSoftDeleted('users', ['id' => $admin->id]);
    }

    public function test_super_admin_can_delete_user(): void
    {
        $society = $this->makeSociety();
        $superAdmin = User::factory()->superAdmin()->create();
        $user = User::factory()->treasurer($society->id)->create();

        $this->actingAs($superAdmin)
            ->delete(route('users.destroy', $user->uuid))
            ->assertRedirect(route('users.index'));

        $this->assertSoftDeleted('users', ['id' => $user->id]);
    }

    public function test_super_admin_can_create_user_for_any_society(): void
    {
        $society = $this->makeSociety();
        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)
            ->post(route('users.store'), [
                'name' => 'Cross Society',
                'email' => 'cross@example.com',
                'password' => 'secret123',
                'password_confirmation' => 'secret123',
                'role' => 'SocietyAdmin',
                'society_id' => $society->id,
                'is_active' => true,
            ])
            ->assertRedirect(route('users.index'));

        $this->assertDatabaseHas('users', [
            'email' => 'cross@example.com',
            'society_id' => $society->id,
        ]);
    }

    public function test_super_admin_can_create_another_super_admin(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)
            ->post(route('users.store'), [
                'name' => 'Second Super',
                'email' => 'super2@example.com',
                'password' => 'secret123',
                'password_confirmation' => 'secret123',
                'role' => 'SuperAdmin',
            ])
            ->assertRedirect(route('users.index'));

        $user = User::where('email', 'super2@example.com')->first();

        $this->assertNull($user->society_id);
        $this->assertTrue($user->hasRole('SuperAdmin'));
        $this->assertTrue($user->isSuperAdmin());
    }

    public function test_super_admin_sees_all_societies_in_index(): void
    {
        $societyA = $this->makeSociety();
        $societyB = $this->makeSociety();
        $superAdmin = User::factory()->superAdmin()->create();

        User::factory()->treasurer($societyA->id)->create();
        User::factory()->treasurer($societyB->id)->create([
            'email' => 'treasurer-b@gvr.com',
        ]);

        $this->actingAs($superAdmin)
            ->get(route('users.index'))
            ->assertInertia(fn ($page) => $page
                ->component('features/users/pages/index')
                ->where('users.total', 3)
                ->has('users.data', 3));
    }

    public function test_treasurer_cannot_view_users(): void
    {
        $society = $this->makeSociety();
        $treasurer = User::factory()->treasurer($society->id)->create();

        $this->actingAs($treasurer)
            ->get(route('users.index'))
            ->assertForbidden();
    }

    public function test_roles_are_seeded_with_permissions(): void
    {
        $roles = Role::pluck('name')->sort()->values()->all();

        $this->assertSame(
            ['MaintenanceStaff', 'Resident', 'SecurityGuard', 'SocietyAdmin', 'SuperAdmin', 'Treasurer'],
            $roles,
        );
    }
}
