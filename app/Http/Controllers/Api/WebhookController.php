<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Webhook;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class WebhookController extends Controller
{
    /**
     * Register a webhook
     * 
     * POST /v1/webhooks
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'url' => 'required|url|max:500',
            'events' => 'nullable|array',
            'events.*' => 'in:document.completed,document.failed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation Failed',
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        $tenant = $request->get('tenant');

        try {
            // Check if webhook already exists for this URL
            $existing = Webhook::where('tenant_id', $tenant->id)
                ->where('url', $request->url)
                ->first();

            if ($existing) {
                return response()->json([
                    'error' => 'Duplicate Webhook',
                    'message' => 'A webhook with this URL already exists'
                ], 409);
            }

            // Generate webhook secret
            $secret = Str::random(64);

            // Create webhook
            $webhook = Webhook::create([
                'tenant_id' => $tenant->id,
                'url' => $request->url,
                'secret' => $secret,
                'events' => $request->events ?? [],
                'is_active' => true,
                'max_retries' => 3,
            ]);

            // Log action
            AuditLog::logAction(
                $tenant->id,
                'webhook.created',
                null,
                null,
                'Webhook',
                $webhook->id,
                ['url' => $request->url]
            );

            return response()->json([
                'success' => true,
                'webhook' => [
                    'id' => $webhook->id,
                    'url' => $webhook->url,
                    'secret' => $secret, // Only returned on creation
                    'events' => $webhook->events,
                    'is_active' => $webhook->is_active,
                ],
                'message' => 'Webhook registered successfully. Store the secret securely - it will not be shown again.'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Registration Failed',
                'message' => 'Failed to register webhook: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * List webhooks
     * 
     * GET /v1/webhooks
     */
    public function index(Request $request): JsonResponse
    {
        $tenant = $request->get('tenant');

        $webhooks = Webhook::where('tenant_id', $tenant->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'webhooks' => $webhooks->map(function ($webhook) {
                return [
                    'id' => $webhook->id,
                    'url' => $webhook->url,
                    'events' => $webhook->events,
                    'is_active' => $webhook->is_active,
                    'last_triggered_at' => $webhook->last_triggered_at?->toIso8601String(),
                    'created_at' => $webhook->created_at->toIso8601String(),
                ];
            })
        ]);
    }

    /**
     * Update webhook
     * 
     * PUT /v1/webhooks/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'url' => 'sometimes|url|max:500',
            'events' => 'sometimes|array',
            'events.*' => 'in:document.completed,document.failed',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation Failed',
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        $tenant = $request->get('tenant');

        $webhook = Webhook::where('id', $id)
            ->where('tenant_id', $tenant->id)
            ->first();

        if (!$webhook) {
            return response()->json([
                'error' => 'Not Found',
                'message' => 'Webhook not found'
            ], 404);
        }

        $webhook->update($request->only(['url', 'events', 'is_active']));

        // Log action
        AuditLog::logAction(
            $tenant->id,
            'webhook.updated',
            null,
            null,
            'Webhook',
            $webhook->id
        );

        return response()->json([
            'success' => true,
            'webhook' => [
                'id' => $webhook->id,
                'url' => $webhook->url,
                'events' => $webhook->events,
                'is_active' => $webhook->is_active,
            ]
        ]);
    }

    /**
     * Delete webhook
     * 
     * DELETE /v1/webhooks/{id}
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $tenant = $request->get('tenant');

        $webhook = Webhook::where('id', $id)
            ->where('tenant_id', $tenant->id)
            ->first();

        if (!$webhook) {
            return response()->json([
                'error' => 'Not Found',
                'message' => 'Webhook not found'
            ], 404);
        }

        // Log action
        AuditLog::logAction(
            $tenant->id,
            'webhook.deleted',
            null,
            null,
            'Webhook',
            $webhook->id,
            ['url' => $webhook->url]
        );

        $webhook->delete();

        return response()->json([
            'success' => true,
            'message' => 'Webhook deleted successfully'
        ]);
    }
}
