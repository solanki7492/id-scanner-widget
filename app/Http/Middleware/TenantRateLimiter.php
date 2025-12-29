<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class TenantRateLimiter
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = $request->get('tenant');

        if (!$tenant) {
            return $next($request);
        }

        $key = 'rate_limit:tenant:' . $tenant->id;
        $limit = $tenant->rate_limit_per_minute;

        $executed = RateLimiter::attempt(
            $key,
            $limit,
            function() {},
            60 // 1 minute
        );

        if (!$executed) {
            $retryAfter = RateLimiter::availableIn($key);
            
            return response()->json([
                'error' => 'Too Many Requests',
                'message' => 'Rate limit exceeded. Please try again later.',
                'retry_after' => $retryAfter
            ], 429)->header('Retry-After', $retryAfter);
        }

        // Add rate limit headers
        $remaining = RateLimiter::remaining($key, $limit);
        
        $response = $next($request);
        
        return $response->withHeaders([
            'X-RateLimit-Limit' => $limit,
            'X-RateLimit-Remaining' => $remaining,
        ]);
    }
}
