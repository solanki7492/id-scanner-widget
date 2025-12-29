<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantAccess
{
    /**
     * Handle an incoming request.
     * 
     * Ensures that authenticated users can only access their own tenant's data
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        if (!$user->tenant || !$user->tenant->is_active) {
            auth()->logout();
            return redirect()->route('login')
                ->with('error', 'Your account is inactive. Please contact support.');
        }

        // Share tenant with all views
        view()->share('currentTenant', $user->tenant);

        return $next($request);
    }
}
