<?php

namespace App\Http\Middleware;

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

        if (!$user->isSuperAdmin() && !$user->society_id) {
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
