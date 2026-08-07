<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;

class SetLocaleMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        $locale = null;

        if ($user && !empty($user->locale)) {
            $locale = $user->locale;
        } elseif ($request->session()->has('locale')) {
            $locale = $request->session()->get('locale');
        } elseif ($request->hasHeader('Accept-Language')) {
            $headerLocale = substr($request->header('Accept-Language'), 0, 2);
            if (in_array($headerLocale, ['en', 'ar', 'bn', 'hi', 'ur', 'es', 'fr', 'de'], true)) {
                $locale = $headerLocale;
            }
        }

        if (!$locale) {
            $locale = config('app.locale', 'en');
        }

        App::setLocale($locale);

        return $next($request);
    }
}
