@extends('layouts.dashboard')

@section('title', 'Document Details')
@section('page-title', 'Document Details')

@section('content')
<div class="space-y-6">
    <!-- Back Button -->
    <a href="{{ route('dashboard.documents.index') }}" class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Documents
    </a>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Document Image -->
        <div class="lg:col-span-2">
            <div class="bg-white rounded-lg shadow-sm p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Document Image</h3>
                @if(isset($document) && $document->image_url)
                <img src="{{ $document->image_url }}" alt="Document" class="w-full rounded-lg border border-gray-200">
                @else
                <div class="bg-gray-100 rounded-lg flex items-center justify-center h-96">
                    <div class="text-center">
                        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p class="mt-2 text-sm text-gray-500">No image available</p>
                    </div>
                </div>
                @endif
            </div>
        </div>

        <!-- Document Details -->
        <div class="space-y-6">
            <!-- Info Card -->
            <div class="bg-white rounded-lg shadow-sm p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Information</h3>
                <dl class="space-y-3">
                    <div>
                        <dt class="text-xs font-medium text-gray-500 uppercase">UUID</dt>
                        <dd class="mt-1 text-sm text-gray-900 font-mono">{{ $document->uuid ?? 'N/A' }}</dd>
                    </div>
                    <div>
                        <dt class="text-xs font-medium text-gray-500 uppercase">Status</dt>
                        <dd class="mt-1">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {{ ucfirst($document->status ?? 'Unknown') }}
                            </span>
                        </dd>
                    </div>
                    <div>
                        <dt class="text-xs font-medium text-gray-500 uppercase">Type</dt>
                        <dd class="mt-1 text-sm text-gray-900">{{ ucfirst($document->document_type ?? 'N/A') }}</dd>
                    </div>
                    <div>
                        <dt class="text-xs font-medium text-gray-500 uppercase">Uploaded</dt>
                        <dd class="mt-1 text-sm text-gray-900">{{ $document->created_at->format('M d, Y H:i') ?? 'N/A' }}</dd>
                    </div>
                    <div>
                        <dt class="text-xs font-medium text-gray-500 uppercase">Processed</dt>
                        <dd class="mt-1 text-sm text-gray-900">{{ $document->processed_at?->format('M d, Y H:i') ?? 'Pending' }}</dd>
                    </div>
                </dl>
            </div>

            <!-- Actions -->
            <div class="bg-white rounded-lg shadow-sm p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Actions</h3>
                <div class="space-y-2">
                    <button class="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download JSON
                    </button>
                    <button class="w-full inline-flex items-center justify-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Document
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Extracted Fields -->
    <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Extracted Data</h3>
        @if(isset($document) && $document->fields && $document->fields->count() > 0)
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @foreach($document->fields as $field)
            <div class="border border-gray-200 rounded-lg p-4">
                <dt class="text-sm font-medium text-gray-500">{{ $field->field_name }}</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ $field->field_value }}</dd>
                <dd class="mt-1 text-xs text-gray-400">Confidence: {{ number_format($field->confidence * 100, 1) }}%</dd>
            </div>
            @endforeach
        </div>
        @else
        <p class="text-sm text-gray-500">No extracted data available</p>
        @endif
    </div>
</div>
@endsection
