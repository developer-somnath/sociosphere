<?php

namespace App\Http\Middleware;

use App\Models\Society;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SocietyMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            abort(401);
        }

        if ($user->isSuperAdmin()) {
            $selectedSocietyId = $request->session()->get('current_society_id');

            if ($selectedSocietyId) {
                if (Society::where('id', $selectedSocietyId)->exists()) {
                    app()->instance('society_id', (int) $selectedSocietyId);
                } else {
                    $request->session()->forget('current_society_id');
                }
            }

            return $next($request);
        }

        if (!$user->society_id) {
            abort(
                403,
                'No society assigned.'
            );
        }

        app()->instance(
            'society_id',
            $user->society_id
        );

        return $next($request);
    }
}

