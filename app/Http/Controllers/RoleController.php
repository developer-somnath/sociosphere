<?php

namespace App\Http\Controllers;

use App\Http\Requests\RoleRequest;
use App\Models\Permission;
use App\Models\Role;
use App\Support\PermissionCatalog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    /**
     * Display a paginated, searchable list of roles with their permission
     * and member counts.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Role::class);

        $search = trim((string) $request->query('search', ''));

        $roles = Role::query()
            ->withCount(['users', 'permissions'])
            ->when($search !== '', function ($query) use ($search) {
                $query->whereLike('name', $search)
                    ->orWhereLike('description', $search);
            })
            ->orderByRaw("case when name = 'SuperAdmin' then 0 else 1 end")
            ->orderBy('is_system', 'desc')
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('features/roles/pages/index', [
            'roles' => $roles,
            'filters' => [
                'search' => $search,
            ],
            'can' => [
                'create' => $request->user()->hasPermissionTo('role.create'),
                'update' => $request->user()->hasPermissionTo('role.update'),
                'delete' => $request->user()->hasPermissionTo('role.delete'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new role with feature-wise permissions.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', Role::class);

        return Inertia::render('features/roles/pages/create', [
            'permissionGroups' => $this->permissionGroups(),
        ]);
    }

    /**
     * Store a newly created role and sync its permissions.
     */
    public function store(RoleRequest $request): RedirectResponse
    {
        $this->authorize('create', Role::class);

        $role = Role::create([
            'name' => $request->input('name'),
            'description' => $request->input('description') ?: null,
        ]);

        $role->syncPermissions($this->selectedPermissions($request));

        return redirect()
            ->route('roles.index')
            ->with('success', 'Role created successfully.');
    }

    /**
     * Show the form for editing a role and its permissions.
     */
    public function edit(Request $request, Role $role): Response
    {
        $this->authorize('update', $role);

        return Inertia::render('features/roles/pages/edit', [
            'role' => [
                'uuid' => $role->uuid,
                'name' => $role->name,
                'description' => $role->description,
                'is_system' => $role->isSystem(),
                'permissions' => $role->permissions
                    ->pluck('id')
                    ->map(fn ($id) => (int) $id)
                    ->all(),
            ],
            'permissionGroups' => $this->permissionGroups(),
        ]);
    }

    /**
     * Update the role and resync its permissions.
     */
    public function update(RoleRequest $request, Role $role): RedirectResponse
    {
        $this->authorize('update', $role);

        $role->update([
            'name' => $request->input('name'),
            'description' => $request->input('description') ?: null,
        ]);

        $role->syncPermissions($this->selectedPermissions($request));

        return redirect()
            ->route('roles.index')
            ->with('success', 'Role updated successfully.');
    }

    /**
     * Remove a custom role that is not assigned to any user.
     */
    public function destroy(Request $request, Role $role): RedirectResponse
    {
        $this->authorize('delete', $role);

        if ($role->isSystem()) {
            return redirect()->route('roles.index')->with('error', 'System roles cannot be removed.');
        }

        if ($role->users()->exists()) {
            return redirect()->route('roles.index')->with('error', 'Cannot remove a role that is assigned to users.');
        }

        $role->delete();

        return redirect()
            ->route('roles.index')
            ->with('success', 'Role removed successfully.');
    }

    /**
     * All permissions grouped by feature for the role form.
     */
    private function permissionGroups(): array
    {
        return PermissionCatalog::groups(
            Permission::query()->orderBy('name')->get()
        );
    }

    /**
     * The Permission models selected in the request.
     */
    private function selectedPermissions(RoleRequest $request): Collection
    {
        return Permission::query()
            ->whereIn('id', $request->input('permissions', []))
            ->get();
    }
}
