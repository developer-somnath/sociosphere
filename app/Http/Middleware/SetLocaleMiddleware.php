<?php

namespace App\Http\Middleware;

use App\Models\Language;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;

class SetLocaleMiddleware
{
    /**
     * All active locale codes supported by the i18n engine, cached per request.
     *
     * @var array<int, string>|null
     */
    private ?array $activeCodes = null;

    /**
     * Resolve the active locale from the user record, session, Accept-Language
     * header, or application default — then bind it for the request.
     */
    public function handle(Request $request, Closure $next)
    {
        $locale = $this->resolveLocale($request);

        App::setLocale($locale);

        return $next($request);
    }

    /**
     * Determine the locale for the current request.
     */
    protected function resolveLocale(Request $request): string
    {
        $user = $request->user();

        if ($user && ! empty($user->locale)) {
            return $this->sanitize($user->locale);
        }

        if ($request->session()->has('locale')) {
            return $this->sanitize((string) $request->session()->get('locale'));
        }

        $headerLocale = $request->hasHeader('Accept-Language')
            ? substr((string) $request->header('Accept-Language'), 0, 5)
            : null;

        if ($headerLocale) {
            // Prefer the full tag (zh-CN / zh-TW) but fall back to the 2-letter prefix.
            $candidates = [$headerLocale, substr($headerLocale, 0, 2)];
            foreach ($candidates as $candidate) {
                $sanitized = $this->sanitize($candidate);
                if ($sanitized !== config('app.locale', 'en')) {
                    return $sanitized;
                }
            }
        }

        return config('app.locale', 'en');
    }

    /**
     * Return the locale only if it exists in the active languages catalog,
     * otherwise the application default.
     */
    protected function sanitize(string $locale): string
    {
        $locale = trim($locale);

        if ($this->activeCodes === null) {
            $this->activeCodes = Language::query()
                ->where('is_active', true)
                ->pluck('code')
                ->map(fn ($code) => (string) $code)
                ->all();
        }

        if (in_array($locale, $this->activeCodes, true)) {
            return $locale;
        }

        foreach ($this->activeCodes as $code) {
            if (strcasecmp($code, $locale) === 0) {
                return $code;
            }
        }

        return config('app.locale', 'en');
    }
}
