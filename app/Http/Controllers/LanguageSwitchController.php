<?php

namespace App\Http\Controllers;

use App\Models\Language;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;

class LanguageSwitchController extends Controller
{
    /**
     * Handle language context switch.
     */
    public function __invoke(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'locale' => ['required', 'string', 'max:10'],
        ]);

        $code = $validated['locale'];
        $exists = Language::where('code', $code)->where('is_active', true)->exists();

        if (! $exists && ! in_array($code, ['en', 'ar', 'bn', 'hi', 'ur', 'es', 'fr', 'de'], true)) {
            return back()->with('error', 'Unsupported language code.');
        }

        $request->session()->put('locale', $code);
        App::setLocale($code);

        if ($user = $request->user()) {
            $user->update(['locale' => $code]);
        }

        return back()->with('success', "Language switched to {$code}.");
    }
}
