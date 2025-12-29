<?php

namespace App\Jobs;

use App\Models\Document;
use App\Services\EncryptedStorageService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class PurgeExpiredDocuments implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job.
     */
    public function handle(EncryptedStorageService $storageService): void
    {
        // Find documents scheduled for deletion
        $documents = Document::scheduledForDeletion()
            ->with('fields', 'auditLogs')
            ->get();

        foreach ($documents as $document) {
            try {
                // Delete from S3
                if ($storageService->exists($document->storage_path)) {
                    $storageService->delete($document->storage_path);
                }

                // Soft delete document (keeps metadata for audit)
                $document->delete();

                Log::info("Document purged", [
                    'document_id' => $document->id,
                    'tenant_id' => $document->tenant_id,
                ]);

            } catch (\Exception $e) {
                Log::error("Failed to purge document", [
                    'document_id' => $document->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }
}
