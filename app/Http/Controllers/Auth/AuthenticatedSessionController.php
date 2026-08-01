<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('features/auth/pages/login-page', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        return redirect()->intended($this->homeRouteFor($request->user()));
    }

    /**
     * Resolve the post-login landing route for the authenticated user.
     *
     * Users who cannot view the dashboard (e.g. custom roles granted only
     * a subset of feature permissions) land on their first permitted page
     * instead of receiving a 403 on the default overview.
     */
    private function homeRouteFor($user): string
    {
        if ($user->can('dashboard.view')) {
            return route('overview', absolute: false);
        }

        $fallbacks = [
            'resident.view' => 'residents.index',
            'tower.view' => 'towers.index',
            'flat.view' => 'flats.index',
            'visitor.view' => 'visitors.index',
            'user.view' => 'users.index',
            'role.view' => 'roles.index',
        ];

        foreach ($fallbacks as $permission => $routeName) {
            if ($user->can($permission)) {
                return route($routeName, absolute: false);
            }
        }

        return route('overview', absolute: false);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
