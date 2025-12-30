<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessDocumentExtraction;
use App\Models\AuditLog;
use App\Models\Document;
use App\Services\EncryptedStorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Services\DocumentOcrService;

class DocumentController extends Controller
{
    public function __construct(
        private EncryptedStorageService $storageService,
        private DocumentOcrService $ocrService
    ) {}

    /**
     * Upload and process a document
     * 
     * POST /v1/documents
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|file|mimes:jpg,jpeg,png,pdf|max:10240',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation Failed',
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        $tenant = $request->get('tenant');
        $apiKey = $request->get('api_key');

        try {

            $extractedFields = $this->ocrService->extractData($request->file('image'));

            // Store encrypted file
            $storageData = $this->storageService->store(
                $request->file('image'),
                $tenant->id
            );

            // Create document record
            $document = Document::create([
                'tenant_id' => $tenant->id,
                'api_key_id' => $apiKey->id,
                'original_filename' => $storageData['original_filename'],
                'storage_path' => $storageData['storage_path'],
                'encryption_key' => $storageData['encryption_key'],
                'status' => 'pending',
                'client_ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            // Log action
            AuditLog::logAction(
                $tenant->id,
                'document.uploaded',
                null,
                $document->id,
                'Document',
                $document->id,
                [
                    'filename' => $storageData['original_filename'],
                    'api_key_id' => $apiKey->id,
                ]
            );

            // Dispatch extraction job
            ProcessDocumentExtraction::dispatch($document);

            return response()->json([
                'success' => true,
                'extracted_fields' => $extractedFields,
                'document_id' => $document->uuid,
                'status' => $document->status,
                'message' => 'Document uploaded successfully and is being processed'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Upload Failed',
                'message' => 'Failed to upload document: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get document details and extraction results
     * 
     * GET /v1/documents/{uuid}
     */
    public function show(Request $request, string $uuid): JsonResponse
    {
        $tenant = $request->get('tenant');

        $document = Document::with('fields')
            ->where('uuid', $uuid)
            ->where('tenant_id', $tenant->id)
            ->first();

        if (!$document) {
            return response()->json([
                'error' => 'Not Found',
                'message' => 'Document not found'
            ], 404);
        }

        // Log access
        AuditLog::logAction(
            $tenant->id,
            'document.retrieved',
            null,
            $document->id,
            'Document',
            $document->id
        );

        return response()->json([
            'success' => true,
            'document' => [
                'id' => $document->uuid,
                'status' => $document->status,
                'document_type' => $document->document_type,
                'created_at' => $document->created_at->toIso8601String(),
                'processed_at' => $document->processed_at?->toIso8601String(),
                'normalized' => $document->getNormalizedData(),
                'raw' => $document->getRawData(),
                'error_message' => $document->error_message,
            ]
        ]);
    }

    /**
     * List documents for tenant
     * 
     * GET /v1/documents
     */
    public function index(Request $request): JsonResponse
    {
        $tenant = $request->get('tenant');

        $query = Document::where('tenant_id', $tenant->id)
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Pagination
        $perPage = min($request->get('per_page', 20), 100);
        $documents = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'documents' => $documents->map(function ($doc) {
                return [
                    'id' => $doc->uuid,
                    'status' => $doc->status,
                    'document_type' => $doc->document_type,
                    'created_at' => $doc->created_at->toIso8601String(),
                    'processed_at' => $doc->processed_at?->toIso8601String(),
                ];
            }),
            'meta' => [
                'current_page' => $documents->currentPage(),
                'last_page' => $documents->lastPage(),
                'per_page' => $documents->perPage(),
                'total' => $documents->total(),
            ]
        ]);
    }
}
