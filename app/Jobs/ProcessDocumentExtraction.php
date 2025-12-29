<?php

namespace App\Jobs;

use App\Models\Document;
use App\Models\DocumentField;
use App\Services\DocumentOcrService;
use App\Services\EncryptedStorageService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessDocumentExtraction implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 300; // 5 minutes

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Document $document
    ) {}

    /**
     * Execute the job.
     */
    public function handle(
        EncryptedStorageService $storageService,
        DocumentOcrService $ocrService
    ): void {
        try {
            // Update status to processing
            $this->document->update(['status' => 'processing']);

            // Retrieve encrypted image
            $imageContent = $storageService->retrieve(
                $this->document->storage_path,
                $this->document->encryption_key
            );

            // Perform OCR extraction
            $extractedFields = $ocrService->extractData($imageContent);

            // Save extracted fields
            foreach ($extractedFields as $fieldName => $fieldData) {
                DocumentField::create([
                    'document_id' => $this->document->id,
                    'field_name' => $fieldName,
                    'raw_value' => $fieldData['raw_value'],
                    'normalized_value' => $fieldData['normalized_value'],
                    'confidence' => $fieldData['confidence'],
                    'metadata' => $fieldData['metadata'] ?? null,
                ]);
            }

            // Determine document type based on extracted fields
            $documentType = $this->determineDocumentType($extractedFields);

            // Update document status
            $this->document->update([
                'status' => 'completed',
                'document_type' => $documentType,
                'processed_at' => now(),
            ]);

            // Schedule deletion if tenant has auto-delete enabled
            if ($this->document->tenant->auto_delete_images) {
                $this->document->update([
                    'will_be_deleted_at' => now()->addDays($this->document->tenant->data_retention_days)
                ]);
            }

            // Trigger webhook
            TriggerWebhook::dispatch($this->document, 'document.completed');

            Log::info("Document extraction completed", [
                'document_id' => $this->document->id,
                'tenant_id' => $this->document->tenant_id,
            ]);

        } catch (\Exception $e) {
            Log::error("Document extraction failed", [
                'document_id' => $this->document->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $this->document->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            // Trigger webhook for failure
            TriggerWebhook::dispatch($this->document, 'document.failed');

            throw $e;
        }
    }

    /**
     * Determine document type from extracted fields
     */
    private function determineDocumentType(array $fields): ?string
    {
        // Simple heuristic - can be improved with ML
        $hasName = !empty($fields['name']['normalized_value']);
        $hasDob = !empty($fields['dob']['normalized_value']);
        $hasNationality = !empty($fields['nationality']['normalized_value']);
        $hasDocNumber = !empty($fields['document_number']['normalized_value']);

        if ($hasName && $hasDob && $hasNationality && $hasDocNumber) {
            return 'passport';
        }

        if ($hasName && $hasDob && $hasDocNumber) {
            return 'id_card';
        }

        return 'unknown';
    }
}
