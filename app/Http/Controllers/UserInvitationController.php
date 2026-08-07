<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserInvitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserInvitationController extends Controller
{
    /**
     * Display registration form for an invitation token.
     */
    public function showRegistrationForm(string $token): Response|RedirectResponse
    {
        $invitation = UserInvitation::where('token', $token)->first();

        if (! $invitation || $invitation->isExpired() || $invitation->isAccepted()) {
            return redirect()
                ->route('login')
                ->with('error', 'This invitation token is invalid or expired.');
        }

        $invitation->load('society');

        return Inertia::render('features/auth/pages/invitation-register', [
            'invitation' => [
                'token' => $invitation->token,
                'email' => $invitation->email,
                'role_name' => $invitation->role_name,
                'society_name' => $invitation->society?->name,
            ],
        ]);
    }

    /**
     * Accept invitation and register user account.
     */
    public function acceptInvitation(Request $request, string $token): RedirectResponse
    {
        $invitation = UserInvitation::where('token', $token)->first();

        if (! $invitation || $invitation->isExpired() || $invitation->isAccepted()) {
            return redirect()
                ->route('login')
                ->with('error', 'This invitation token is invalid or expired.');
        }

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::create([
            'society_id' => $invitation->society_id,
            'name' => $request->input('name'),
            'email' => $invitation->email,
            'phone' => $request->input('phone'),
            'password' => Hash::make($request->input('password')),
            'email_verified_at' => now(),
            'is_active' => true,
        ]);

        $user->assignRole($invitation->role_name);

        $invitation->update(['accepted_at' => now()]);

        Auth::login($user);

        return redirect()
            ->route('overview')
            ->with('success', 'Account created successfully. Welcome to SocioSphere!');
    }
}
