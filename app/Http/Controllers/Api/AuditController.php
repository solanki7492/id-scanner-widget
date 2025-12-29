<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditController extends Controller
{
    /**
     * Get audit logs for tenant
     * 
     * GET /v1/audit
     */
    public function index(Request $request): JsonResponse
    {
        $tenant = $request->get('tenant');

        $query = AuditLog::with(['user', 'document'])
            ->where('tenant_id', $tenant->id)
            ->orderBy('created_at', 'desc');

        // Filter by action
        if ($request->has('action')) {
            $query->where('action', 'like', '%' . $request->action . '%');
        }

        // Filter by document
        if ($request->has('document_id')) {
            $document = Document::where('uuid', $request->document_id)
                ->where('tenant_id', $tenant->id)
                ->first();
            
            if ($document) {
                $query->where('document_id', $document->id);
            }
        }

        // Filter by date range
        if ($request->has('from')) {
            $query->where('created_at', '>=', $request->from);
        }

        if ($request->has('to')) {
            $query->where('created_at', '<=', $request->to);
        }

        // Pagination
        $perPage = min($request->get('per_page', 50), 100);
        $logs = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'audit_logs' => $logs->map(function ($log) {
                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'user' => $log->user ? [
                        'id' => $log->user->id,
                        'name' => $log->user->name,
                        'email' => $log->user->email,
                    ] : null,
                    'document_id' => $log->document?->uuid,
                    'entity_type' => $log->entity_type,
                    'metadata' => $log->metadata,
                    'ip_address' => $log->ip_address,
                    'timestamp' => $log->created_at->toIso8601String(),
                ];
            }),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ]
        ]);
    }

    /**
     * Get audit logs for specific document
     * 
     * GET /v1/audit/{documentUuid}
     */
    public function show(Request $request, string $documentUuid): JsonResponse
    {
        $tenant = $request->get('tenant');

        $document = Document::where('uuid', $documentUuid)
            ->where('tenant_id', $tenant->id)
            ->first();

        if (!$document) {
            return response()->json([
                'error' => 'Not Found',
                'message' => 'Document not found'
            ], 404);
        }

        $logs = AuditLog::with('user')
            ->where('document_id', $document->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'document_id' => $document->uuid,
            'audit_logs' => $logs->map(function ($log) {
                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'user' => $log->user ? [
                        'id' => $log->user->id,
                        'name' => $log->user->name,
                        'email' => $log->user->email,
                    ] : null,
                    'metadata' => $log->metadata,
                    'ip_address' => $log->ip_address,
                    'timestamp' => $log->created_at->toIso8601String(),
                ];
            })
        ]);
    }
}
