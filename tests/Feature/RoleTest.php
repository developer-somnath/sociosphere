<?php

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Role;
use App\Models\Society;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleTest extends TestCase
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

    public function test_guests_are_redirected_to_login(): void
    {
        $this->get(route('roles.index'))->assertRedirect(route('login'));
    }

    public function test_super_admin_can_view_roles_index(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $this->actingAs($admin)
            ->get(route('roles.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/roles/pages/index')
                ->has('roles.data', 6)
                ->where('can.create', true)
                ->where('can.update', true)
                ->where('can.delete', true));
    }

    public function test_roles_index_includes_user_and_permission_counts(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $this->actingAs($admin)
            ->get(route('roles.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('roles.data.0.name', 'SuperAdmin')
                ->where('roles.data.0.is_system', true)
                ->has('roles.data.0.users_count')
                ->has('roles.data.0.permissions_count'));
    }

    public function test_society_admin_cannot_view_roles(): void
    {
        $society = Society::factory()->create();
        $societyAdmin = User::factory()->societyAdmin($society->id)->create();

        $this->actingAs($societyAdmin)
            ->get(route('roles.index'))
            ->assertForbidden();
    }

    public function test_super_admin_can_open_create_form_with_permission_groups(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $this->actingAs($admin)
            ->get(route('roles.create'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/roles/pages/create')
                ->has('permissionGroups')
                ->has('permissionGroups.0.label')
                ->has('permissionGroups.0.permissions'));
    }

    public function test_super_admin_can_create_a_custom_role_with_permissions(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $permissionIds = Permission::query()
            ->whereIn('name', ['visitor.view', 'visitor.create', 'visitor.update'])
            ->pluck('id')
            ->all();

        $this->actingAs($admin)
            ->post(route('roles.store'), [
                'name' => 'Gate Manager',
                'description' => 'Manages gate visitors.',
                'permissions' => $permissionIds,
            ])
            ->assertRedirect(route('roles.index'));

        $role = Role::where('name', 'Gate Manager')->firstOrFail();

        $this->assertFalse($role->isSystem());
        $this->assertEquals(
            ['visitor.create', 'visitor.update', 'visitor.view'],
            $role->permissions->pluck('name')->sort()->values()->all(),
        );

        $this->assertDatabaseHas('roles', [
            'name' => 'Gate Manager',
            'description' => 'Manages gate visitors.',
            'is_system' => false,
        ]);
    }

    public function test_duplicate_role_name_is_rejected(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $this->actingAs($admin)
            ->post(route('roles.store'), [
                'name' => 'Treasurer',
                'permissions' => [],
            ])
            ->assertSessionHasErrors('name');
    }

    public function test_custom_role_name_is_required_and_validated(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $this->actingAs($admin)
            ->post(route('roles.store'), [
                'name' => '',
                'permissions' => [],
            ])
            ->assertSessionHasErrors('name');

        $this->actingAs($admin)
            ->post(route('roles.store'), [
                'name' => 'Invalid@Name!',
                'permissions' => [],
            ])
            ->assertSessionHasErrors('name');
    }

    public function test_invalid_permission_id_is_rejected(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $this->actingAs($admin)
            ->post(route('roles.store'), [
                'name' => 'Broken Role',
                'permissions' => [999999],
            ])
            ->assertSessionHasErrors('permissions.0');
    }

    public function test_super_admin_can_open_edit_form_with_existing_permissions(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $role = Role::findByName('Treasurer');
        $permissionIds = $role->permissions->pluck('id')->sort()->values()->all();

        $this->actingAs($admin)
            ->get(route('roles.edit', $role->uuid))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/roles/pages/edit')
                ->where('role.name', 'Treasurer')
                ->where('role.is_system', true)
                ->where('role.permissions', $permissionIds));
    }

    public function test_super_admin_can_update_role_name_and_permissions(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $role = Role::findByName('Treasurer');
        $permissionIds = Permission::query()
            ->whereIn('name', ['invoice.view', 'invoice.create', 'collection.view'])
            ->pluck('id')
            ->all();

        $this->actingAs($admin)
            ->put(route('roles.update', $role->uuid), [
                'name' => 'Finance Officer',
                'description' => 'Owns invoicing.',
                'permissions' => $permissionIds,
            ])
            ->assertRedirect(route('roles.index'));

        $role->refresh();

        $this->assertEquals('Finance Officer', $role->name);
        $this->assertEquals('Owns invoicing.', $role->description);
        $this->assertEquals(
            ['collection.view', 'invoice.create', 'invoice.view'],
            $role->permissions->pluck('name')->sort()->values()->all(),
        );
    }

    public function test_super_admin_role_cannot_be_edited(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $role = Role::findByName('SuperAdmin');

        $this->actingAs($admin)
            ->get(route('roles.edit', $role->uuid))
            ->assertForbidden();

        $this->actingAs($admin)
            ->put(route('roles.update', $role->uuid), [
                'name' => 'Hacked Admin',
                'permissions' => [],
            ])
            ->assertForbidden();
    }

    public function test_system_roles_cannot_be_deleted(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $role = Role::findByName('Resident');

        $this->actingAs($admin)
            ->delete(route('roles.destroy', $role->uuid))
            ->assertForbidden();

        $this->assertDatabaseHas('roles', ['id' => $role->id]);
    }

    public function test_super_admin_can_delete_an_unassigned_custom_role(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $role = Role::create(['name' => 'Temp Role']);

        $this->actingAs($admin)
            ->delete(route('roles.destroy', $role->uuid))
            ->assertRedirect(route('roles.index'));

        $this->assertDatabaseMissing('roles', ['id' => $role->id]);
    }

    public function test_role_assigned_to_users_cannot_be_deleted(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $role = Role::create(['name' => 'Occupied Role']);
        $admin->assignRole($role->name);

        $this->actingAs($admin)
            ->delete(route('roles.destroy', $role->uuid))
            ->assertRedirect(route('roles.index'))
            ->assertSessionHas('error', 'Cannot remove a role that is assigned to users.');

        $this->assertDatabaseHas('roles', ['id' => $role->id]);
    }

    public function test_custom_role_grants_access_to_granted_features(): void
    {
        $admin = User::factory()->superAdmin()->create();

        // Gate Manager: can view visitors but not create passes.
        $permissionIds = Permission::query()
            ->where('name', 'visitor.view')
            ->pluck('id')
            ->all();

        $role = Role::create(['name' => 'Gate Manager']);
        $role->syncPermissions($permissionIds);

        $society = Society::factory()->create();
        $user = User::factory()->create([
            'society_id' => $society->id,
            'email' => 'gate@example.com',
        ]);
        $user->assignRole($role->name);

        $this->actingAs($user)
            ->get(route('visitors.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('can.create', false)
                ->where('can.update', false)
                ->where('can.delete', false));

        $this->actingAs($user)
            ->get(route('visitors.create'))
            ->assertForbidden();
    }

    public function test_custom_role_does_not_grant_access_to_other_features(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $permissionIds = Permission::query()
            ->where('name', 'visitor.view')
            ->pluck('id')
            ->all();

        $role = Role::create(['name' => 'Gate Manager']);
        $role->syncPermissions($permissionIds);

        $society = Society::factory()->create();
        $user = User::factory()->create([
            'society_id' => $society->id,
            'email' => 'gate2@example.com',
        ]);
        $user->assignRole($role->name);

        $this->actingAs($user)
            ->get(route('flats.index'))
            ->assertForbidden();
    }

    public function test_roles_index_search_filters_by_name(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $this->actingAs($admin)
            ->get(route('roles.index', ['search' => 'Treasurer']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('roles.total', 1)
                ->where('roles.data.0.name', 'Treasurer')
                ->where('filters.search', 'Treasurer'));
    }

    public function test_custom_roles_appear_in_user_role_options(): void
    {
        $admin = User::factory()->superAdmin()->create();

        Role::create(['name' => 'Gate Manager']);

        $this->actingAs($admin)
            ->get(route('users.create'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('roleOptions', 7)
                ->where('roleOptions.0.name', 'Gate Manager'));
    }
}
