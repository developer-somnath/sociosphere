<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserRequest;
use App\Models\Role;
use App\Models\Society;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a paginated, searchable list of staff and users.
     *
     * Society-bound users only see their own society's users; super
     * admins see everyone.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $search = trim((string) $request->query('search', ''));
        $role = $request->query('role');
        $status = $request->query('status');
        $sortBy = in_array($request->query('sort_by'), ['name', 'email', 'is_active', 'created_at'], true)
            ? $request->query('sort_by')
            : 'created_at';
        $sortDir = strtolower((string) $request->query('sort_dir')) === 'asc' ? 'asc' : 'desc';

        $users = User::query()
            ->with(['society', 'roles'])
            ->when(! $request->user()->isSuperAdmin(), function ($query) use ($request) {
                $query->where('society_id', $request->user()->society_id);
            })
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->whereLike('name', $search)
                        ->orWhereLike('email', $search)
                        ->orWhereLike('phone', $search);
                });
            })
            ->when($role !== null && $role !== '', function ($query) use ($role) {
                $query->whereHas('roles', function ($query) use ($role) {
                    $query->where('name', $role);
                });
            })
            ->when(in_array($status, ['Active', 'Inactive'], true), function ($query) use ($status) {
                $query->where('is_active', $status === 'Active');
            })
            ->orderBy($sortBy, $sortDir)
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('features/users/pages/index', [
            'users' => $users,
            'filters' => [
                'search' => $search,
                'role' => $role !== null && $role !== '' ? $role : null,
                'status' => in_array($status, ['Active', 'Inactive'], true) ? $status : null,
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
            'roleOptions' => $this->roleOptions($request->user()),
            'can' => [
                'create' => $request->user()->hasPermissionTo('user.create'),
                'delete' => $request->user()->hasPermissionTo('user.delete'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', User::class);

        return Inertia::render('features/users/pages/create', [
            'roleOptions' => $this->roleOptions($request->user()),
            'societies' => $this->societyOptions($request->user()),
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(UserRequest $request): RedirectResponse
    {
        $this->authorize('create', User::class);

        $user = User::create([
            ...$request->validated(),
            'society_id' => $this->resolvedSocietyId($request),
            'email_verified_at' => now(),
            'is_active' => $request->boolean('is_active', true),
        ]);

        $user->syncRoles([$request->input('role')]);

        return redirect()
            ->route('users.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Show the form for editing a user.
     */
    public function edit(Request $request, User $user): Response
    {
        $this->authorize('update', $user);

        $user->load(['society', 'roles']);

        return Inertia::render('features/users/pages/edit', [
            'user' => [
                ...$user->only(['id', 'uuid', 'society_id', 'name', 'email', 'phone', 'is_active', 'created_at']),
                'role' => $user->roles->pluck('name')->first(),
                'society_name' => $user->society?->name,
            ],
            'roleOptions' => $this->roleOptions($request->user()),
            'societies' => $this->societyOptions($request->user()),
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(UserRequest $request, User $user): RedirectResponse
    {
        $this->authorize('update', $user);

        $data = collect($request->validated())
            ->except(['role', 'society_id', 'password'])
            ->all();

        if ($request->filled('password')) {
            $data['password'] = $request->input('password');
        }

        $data['society_id'] = $this->resolvedSocietyId($request);
        $data['is_active'] = $request->boolean('is_active', $user->is_active);

        $user->update($data);
        $user->syncRoles([$request->input('role')]);

        return redirect()
            ->route('users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove (soft-delete) the specified user.
     *
     * A user cannot remove their own account.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        $this->authorize('delete', $user);

        $user->delete();

        return redirect()
            ->route('users.index')
            ->with('success', 'User removed successfully.');
    }

    /**
     * Invite a new user by generating an invitation token.
     */
    public function invite(Request $request): RedirectResponse
    {
        $this->authorize('invite', User::class);

        $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'role' => ['required', 'string'],
        ]);

        $societyId = $request->user()->society_id ?? $request->input('society_id');

        $invitation = \App\Models\UserInvitation::create([
            'society_id' => $societyId,
            'email' => $request->input('email'),
            'role_name' => $request->input('role'),
            'token' => \Illuminate\Support\Str::random(32),
            'invited_by' => $request->user()->id,
            'expires_at' => now()->addDays(7),
        ]);

        app(\App\Services\ActivityLogger::class)->log(
            action: 'invite',
            module: 'User',
            entityType: \App\Models\UserInvitation::class,
            entityId: (string) $invitation->id,
            remarks: "Invited {$invitation->email} with role {$invitation->role_name}"
        );

        return redirect()
            ->route('users.index')
            ->with('success', "Invitation generated for {$invitation->email}. Link token: {$invitation->token}");
    }

    /**
     * Toggle a user's active status.
     */
    public function toggleStatus(Request $request, User $user): RedirectResponse
    {
        $this->authorize('toggleStatus', $user);

        $user->update(['is_active' => ! $user->is_active]);

        $statusLabel = $user->is_active ? 'activated' : 'deactivated';

        app(\App\Services\ActivityLogger::class)->log(
            action: 'toggle_status',
            module: 'User',
            entityType: User::class,
            entityId: (string) $user->id,
            remarks: "User account {$user->email} was {$statusLabel}"
        );

        return redirect()
            ->route('users.index')
            ->with('success', "User account {$statusLabel} successfully.");
    }

    /**
     * Restore a soft-deleted user.
     */
    public function restore(Request $request, int $id): RedirectResponse
    {
        $user = User::withTrashed()->findOrFail($id);
        $this->authorize('restore', $user);

        $user->restore();

        app(\App\Services\ActivityLogger::class)->log(
            action: 'restore',
            module: 'User',
            entityType: User::class,
            entityId: (string) $user->id,
            remarks: "User account {$user->email} restored"
        );

        return redirect()
            ->route('users.index')
            ->with('success', 'User account restored successfully.');
    }

    /**
     * Resolve the society for a user.
     *
     * Society-bound users always get their own society. Super admins use
     * the submitted society id (which may be null for a SuperAdmin user).
     */
    private function resolvedSocietyId(Request $request): ?int
    {
        $userSocietyId = $request->user()->society_id;

        if ($userSocietyId !== null) {
            return (int) $userSocietyId;
        }

        $societyId = $request->input('society_id');

        return $societyId !== null && $societyId !== ''
            ? (int) $societyId
            : null;
    }

    /**
     * Assignable role options for the current user.
     *
     * All roles are read from the database so custom roles created through
     * role management appear automatically. Non-super admins cannot assign
     * the SuperAdmin role.
     *
     * @return array<int, array{name: string, label: string}>
     */
    private function roleOptions(User $user): array
    {
        $roles = Role::query()
            ->when(! $user->isSuperAdmin(), function ($query) {
                $query->where('name', '!=', 'SuperAdmin');
            })
            ->orderBy('name')
            ->get(['name']);

        return $roles
            ->map(fn (Role $role) => ['name' => $role->name, 'label' => $role->name])
            ->all();
    }

    /**
     * Society options for super admins; empty for society-bound users.
     *
     * @return array<int, array{id: int, label: string}>
     */
    private function societyOptions(User $user): array
    {
        if (! $user->isSuperAdmin()) {
            return [];
        }

        return Society::query()
            ->orderBy('name')
            ->get()
            ->map(fn (Society $society) => [
                'id' => $society->id,
                'label' => $society->name,
            ])
            ->all();
    }
}
