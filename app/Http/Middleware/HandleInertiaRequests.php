<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
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
                $societyId = app()->bound('society_id')
                    ? app('society_id')
                    : $request->session()->get('current_society_id');

                if ($societyId) {
                    $societyModel = \App\Models\Society::find($societyId);
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

        $activeLocale = App::getLocale();
        $rtlCodes = ['ar', 'ur', 'fa', 'he'];
        $isRtl = in_array($activeLocale, $rtlCodes, true);

        $languagesList = \App\Models\Language::where('is_active', true)
            ->orderBy('name')
            ->get(['code', 'name', 'native_name', 'script_dir'])
            ->toArray();

        if (empty($languagesList)) {
            $languagesList = [
                ['code' => 'en', 'name' => 'English', 'native_name' => 'English', 'script_dir' => 'ltr'],
                ['code' => 'ar', 'name' => 'Arabic', 'native_name' => 'العربية', 'script_dir' => 'rtl'],
                ['code' => 'bn', 'name' => 'Bengali', 'native_name' => 'বাংলা', 'script_dir' => 'ltr'],
                ['code' => 'hi', 'name' => 'Hindi', 'native_name' => 'हिन्दी', 'script_dir' => 'ltr'],
                ['code' => 'ur', 'name' => 'Urdu', 'native_name' => 'اردو', 'script_dir' => 'rtl'],
                ['code' => 'es', 'name' => 'Spanish', 'native_name' => 'Español', 'script_dir' => 'ltr'],
                ['code' => 'fr', 'name' => 'French', 'native_name' => 'Français', 'script_dir' => 'ltr'],
                ['code' => 'de', 'name' => 'German', 'native_name' => 'Deutsch', 'script_dir' => 'ltr'],
            ];
        }

        return array_merge(parent::share($request), [

            // Platform release info (blueprint §3 — version display). Keep in
            // sync with docs/ARCHITECTURE_AND_ROADMAP.md "Current Platform Version".
            'version' => config('app.version', 'v2.1.0 — Eagle'),
            'environment' => app()->environment(),

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
                        'locale' => $user->locale ?? $activeLocale,
                    ]
                    : null,

                'society' => $currentSociety,
                'societies' => $availableSocieties,
                'locale' => $activeLocale,
                'is_rtl' => $isRtl,
                'languages' => $languagesList,
            ],

            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],

            // WebPush VAPID public key — needed by the frontend to create a
            // push subscription (PWA — S4-1). Empty until keys are generated.
            'vapid_public_key' => config('services.webpush.vapid_public_key'),

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
