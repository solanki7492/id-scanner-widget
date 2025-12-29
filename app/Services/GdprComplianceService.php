<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Document;
use App\Models\Tenant;
use Illuminate\Support\Facades\DB;
use ZipArchive;

class GdprComplianceService
{
    /**
     * Export all data for a tenant (GDPR Right to Access)
     */
    public function exportTenantData(Tenant $tenant): string
    {
        $exportData = [
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'email' => $tenant->email,
                'company_name' => $tenant->company_name,
                'created_at' => $tenant->created_at->toIso8601String(),
            ],
            'users' => $tenant->users()->get()->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'created_at' => $user->created_at->toIso8601String(),
                ];
            }),
            'api_keys' => $tenant->apiKeys()->get()->map(function ($key) {
                return [
                    'id' => $key->id,
                    'name' => $key->name,
                    'usage_count' => $key->usage_count,
                    'last_used_at' => $key->last_used_at?->toIso8601String(),
                    'created_at' => $key->created_at->toIso8601String(),
                ];
            }),
            'documents' => $tenant->documents()->get()->map(function ($doc) {
                return [
                    'id' => $doc->uuid,
                    'status' => $doc->status,
                    'document_type' => $doc->document_type,
                    'original_filename' => $doc->original_filename,
                    'created_at' => $doc->created_at->toIso8601String(),
                    'processed_at' => $doc->processed_at?->toIso8601String(),
                    'fields' => $doc->fields->map(function ($field) {
                        return [
                            'field_name' => $field->field_name,
                            'raw_value' => $field->raw_value,
                            'normalized_value' => $field->normalized_value,
                            'confidence' => $field->confidence,
                        ];
                    }),
                ];
            }),
            'audit_logs' => $tenant->auditLogs()->get()->map(function ($log) {
                return [
                    'action' => $log->action,
                    'entity_type' => $log->entity_type,
                    'ip_address' => $log->ip_address,
                    'created_at' => $log->created_at->toIso8601String(),
                ];
            }),
        ];

        $filename = storage_path('app/gdpr-exports/tenant-' . $tenant->id . '-' . now()->timestamp . '.json');
        
        if (!is_dir(dirname($filename))) {
            mkdir(dirname($filename), 0755, true);
        }

        file_put_contents($filename, json_encode($exportData, JSON_PRETTY_PRINT));

        return $filename;
    }

    /**
     * Delete all tenant data (GDPR Right to Erasure)
     */
    public function deleteTenantData(Tenant $tenant): void
    {
        DB::transaction(function () use ($tenant) {
            // Delete documents and related data
            foreach ($tenant->documents as $document) {
                // Delete from S3
                if (app(EncryptedStorageService::class)->exists($document->storage_path)) {
                    app(EncryptedStorageService::class)->delete($document->storage_path);
                }
                
                $document->fields()->delete();
                $document->auditLogs()->delete();
                $document->forceDelete(); // Hard delete
            }

            // Delete webhooks and deliveries
            foreach ($tenant->webhooks as $webhook) {
                $webhook->deliveries()->delete();
                $webhook->delete();
            }

            // Delete API keys
            $tenant->apiKeys()->delete();

            // Delete audit logs
            $tenant->auditLogs()->delete();

            // Delete users
            $tenant->users()->delete();

            // Finally delete tenant
            $tenant->forceDelete();
        });
    }

    /**
     * Anonymize tenant data (Partial deletion)
     */
    public function anonymizeTenantData(Tenant $tenant): void
    {
        DB::transaction(function () use ($tenant) {
            // Anonymize tenant
            $tenant->update([
                'name' => 'Anonymized User',
                'email' => 'anonymized-' . $tenant->id . '@example.com',
                'company_name' => null,
                'tax_id' => null,
                'settings' => null,
            ]);

            // Anonymize users
            foreach ($tenant->users as $user) {
                $user->update([
                    'name' => 'Anonymized User',
                    'email' => 'anonymized-user-' . $user->id . '@example.com',
                ]);
            }

            // Delete document fields (keep metadata)
            foreach ($tenant->documents as $document) {
                $document->fields()->delete();
                
                // Delete from S3
                if (app(EncryptedStorageService::class)->exists($document->storage_path)) {
                    app(EncryptedStorageService::class)->delete($document->storage_path);
                }
            }

            // Anonymize audit logs
            AuditLog::where('tenant_id', $tenant->id)->update([
                'ip_address' => '0.0.0.0',
                'user_agent' => 'anonymized',
                'metadata' => null,
            ]);
        });
    }

    /**
     * Get data retention report for a tenant
     */
    public function getRetentionReport(Tenant $tenant): array
    {
        $totalDocuments = Document::where('tenant_id', $tenant->id)->count();
        $scheduledForDeletion = Document::where('tenant_id', $tenant->id)
            ->whereNotNull('will_be_deleted_at')
            ->count();
        $deletionDue = Document::where('tenant_id', $tenant->id)
            ->scheduledForDeletion()
            ->count();

        return [
            'tenant_id' => $tenant->id,
            'data_retention_days' => $tenant->data_retention_days,
            'auto_delete_images' => $tenant->auto_delete_images,
            'total_documents' => $totalDocuments,
            'scheduled_for_deletion' => $scheduledForDeletion,
            'deletion_due_now' => $deletionDue,
            'oldest_document' => Document::where('tenant_id', $tenant->id)
                ->oldest('created_at')
                ->first()?->created_at,
            'newest_document' => Document::where('tenant_id', $tenant->id)
                ->latest('created_at')
                ->first()?->created_at,
        ];
    }
}
