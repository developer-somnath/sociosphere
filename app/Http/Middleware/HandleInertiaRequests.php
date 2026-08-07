<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        $currentSociety = null;
        if ($user) {
            if ($user->isSuperAdmin()) {
                if (app()->bound('society_id')) {
                    $societyModel = \App\Models\Society::find(app('society_id'));
                    if ($societyModel) {
                        $currentSociety = [
                            'id' => $societyModel->id,
                            'uuid' => $societyModel->uuid,
                            'name' => $societyModel->name,
                            'registration_no' => $societyModel->registration_no,
                        ];
                    }
                }
            } elseif ($user->society) {
                $currentSociety = [
                    'id' => $user->society->id,
                    'uuid' => $user->society->uuid,
                    'name' => $user->society->name,
                    'registration_no' => $user->society->registration_no,
                ];
            }
        }

        $availableSocieties = [];
        if ($user?->isSuperAdmin()) {
            $availableSocieties = \App\Models\Society::query()
                ->select(['id', 'uuid', 'name', 'registration_no'])
                ->orderBy('name')
                ->get()
                ->toArray();
        }

        return array_merge(parent::share($request), [

            'auth' => [

                'user' => $user
                    ? [
                        'id' => $user->id,
                        'uuid' => $user->uuid,
                        'name' => $user->name,
                        'email' => $user->email,
                        'roles' => $user->roleNames(),
                        'permissions' => $user->permissionNames(),
                        'society_id' => $user->society_id,
                        'is_super_admin' => $user->isSuperAdmin(),
                    ]
                    : null,

                'society' => $currentSociety,
                'societies' => $availableSocieties,
            ],

            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],

            // Bell notification center (blueprint §2) — latest 10, mapped to the
            // front-end AppNotification shape. Lazy closure: only computed when
            // the Inertia page actually reads `notifications`.
            'notifications' => fn () => $user
                ? $user->notifications()
                    ->latest()
                    ->limit(10)
                    ->get()
                    ->map(fn ($notification) => [
                        'id' => $notification->id,
                        'title' => $notification->data['title'] ?? 'Notification',
                        'description' => $notification->data['description'] ?? null,
                        'href' => $notification->data['href'] ?? null,
                        'read' => $notification->read_at !== null,
                        'created_at' => $notification->created_at?->toISOString() ?? now()->toISOString(),
                        'type' => $notification->data['type'] ?? 'info',
                    ])
                    ->all()
                : [],
        ]);
    }
}
