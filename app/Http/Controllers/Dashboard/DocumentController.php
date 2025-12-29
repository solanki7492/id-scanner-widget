<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Services\EncryptedStorageService;

class DocumentController extends Controller
{
     public function __construct(
        private EncryptedStorageService $storageService
    ) {
        $this->storageService = $storageService;
    }

    public function index(Request $request)
    {
        $tenant = $request->user()->tenant;

        $query = Document::with('apiKey')
            ->where('tenant_id', $tenant->id)
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search') && $request->search !== '') {
            $query->where(function ($q) use ($request) {
                $q->where('uuid', 'like', '%' . $request->search . '%')
                  ->orWhere('original_filename', 'like', '%' . $request->search . '%');
            });
        }

        $documents = $query->paginate(20);

        return view('dashboard.documents.index', compact('documents'));
    }

    public function show(Request $request, string $uuid)
    {
        $tenant = $request->user()->tenant;

        $document = Document::with(['fields', 'apiKey', 'auditLogs'])
            ->where('uuid', $uuid)
            ->where('tenant_id', $tenant->id)
            ->firstOrFail();

        return view('dashboard.documents.show', compact('document'));
    }

    public function image(Document $document)
    {
        $decrypted = $this->storageService->retrieve($document->storage_path, $document->encryption_key);

        return response($decrypted, 200, [
            'Content-Type' => 'image/png',
            'Cache-Control' => 'private, max-age=3600',
        ]);
    }
}
