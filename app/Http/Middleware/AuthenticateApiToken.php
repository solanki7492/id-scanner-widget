<?php

namespace App\Http\Middleware;

use App\Models\ApiKey;
use App\Models\AuditLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateApiToken
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'API token is required'
            ], 401);
        }

        $keyHash = ApiKey::hashKey($token);
        $apiKey = ApiKey::with('tenant')
            ->where('key_hash', $keyHash)
            ->first();

        if (!$apiKey) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Invalid API token'
            ], 401);
        }

        if (!$apiKey->isValid()) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'API token is inactive or expired'
            ], 401);
        }

        if (!$apiKey->tenant->is_active) {
            return response()->json([
                'error' => 'Forbidden',
                'message' => 'Account is inactive'
            ], 403);
        }

        // Mark API key as used
        $apiKey->markAsUsed();

        // Attach tenant and API key to request
        $request->merge([
            'tenant' => $apiKey->tenant,
            'api_key' => $apiKey,
        ]);

        return $next($request);
    }
}
