<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BlockImpersonatorActions
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (session()->has('impersonator_id')) {
            // Define patterns for sensitive write routes we want to restrict
            $sensitivePatterns = [
                '*/password*',
                '*/profile*',
                '*/api-tokens*',
                'admin/security*',
                '*/delete*',
                'roles*',
                'admin/users*',
            ];

            // Allow the developer to leave impersonation
            if ($request->routeIs('admin.impersonate.leave')) {
                return $next($request);
            }

            foreach ($sensitivePatterns as $pattern) {
                if ($request->is($pattern) && ! $request->isMethod('GET')) {
                    if ($request->header('X-Inertia')) {
                        return back()->with('error', 'Sensitive security operations are disabled while impersonating a user.');
                    }

                    return response()->json([
                        'message' => 'Sensitive security operations are disabled while impersonating a user.',
                    ], 403);
                }
            }
        }

        return $next($request);
    }
}
