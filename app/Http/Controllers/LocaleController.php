<?php

namespace App\Http\Controllers;

use App\Models\Language;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;

class LocaleController extends Controller
{
    /**
     * Switch the active application locale for the current user/session.
     *
     * Validates against the active `languages` catalog (42 locales), persists
     * the preference on the user record when authenticated (falling back to the
     * session for guests), then redirects back to the previous page.
     */
    public function __invoke(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'locale' => ['required', 'string', 'max:10'],
        ]);

        $language = Language::query()
            ->where('code', $validated['locale'])
            ->where('is_active', true)
            ->first();

        if (! $language) {
            return back()->with('error', __('locale.invalid'));
        }

        App::setLocale($language->code);

        if ($user = $request->user()) {
            $user->forceFill(['locale' => $language->code])->save();
        }

        $request->session()->put('locale', $language->code);
        $request->session()->flash('success', __('locale.switched', ['language' => $language->native_name]));

        return back();
    }
}
