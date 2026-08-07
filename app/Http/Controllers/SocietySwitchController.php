<?php

namespace App\Http\Controllers;

use App\Models\Society;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SocietySwitchController extends Controller
{
    /**
     * Switch active society context for SuperAdmins.
     */
    public function __invoke(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (!$user || !$user->isSuperAdmin()) {
            abort(403, 'Unauthorized tenant context switch.');
        }

        $validated = $request->validate([
            'society_id' => ['nullable', 'integer', 'exists:societies,id'],
        ]);

        if (!empty($validated['society_id'])) {
            $society = Society::findOrFail($validated['society_id']);
            $request->session()->put('current_society_id', $society->id);

            return back()->with('success', "Switched society context to {$society->name}.");
        }

        $request->session()->forget('current_society_id');

        return back()->with('success', 'Switched to All Societies portfolio view.');
    }
}
