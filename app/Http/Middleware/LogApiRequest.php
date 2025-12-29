<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogApiRequest
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Log API request after response
        if ($tenant = $request->get('tenant')) {
            $action = $this->getActionFromRequest($request);
            
            AuditLog::create([
                'tenant_id' => $tenant->id,
                'action' => $action,
                'metadata' => [
                    'method' => $request->method(),
                    'path' => $request->path(),
                    'status_code' => $response->getStatusCode(),
                ],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        }

        return $response;
    }

    private function getActionFromRequest(Request $request): string
    {
        $method = $request->method();
        $path = $request->path();

        if (str_contains($path, 'documents') && $method === 'POST') {
            return 'api.document.uploaded';
        }

        if (str_contains($path, 'documents') && $method === 'GET') {
            return 'api.document.retrieved';
        }

        if (str_contains($path, 'webhooks') && $method === 'POST') {
            return 'api.webhook.created';
        }

        if (str_contains($path, 'audit')) {
            return 'api.audit.viewed';
        }

        return 'api.request';
    }
}
