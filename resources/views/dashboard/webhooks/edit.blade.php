@extends('layouts.dashboard')

@section('title', 'Edit Webhook')
@section('page-title', 'Edit Webhook')

@section('content')
<div class="max-w-3xl">
    <a href="{{ route('dashboard.webhooks.index') }}" class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Webhooks
    </a>

    <div class="bg-white rounded-lg shadow-sm p-6">
        <form method="POST" action="{{ route('dashboard.webhooks.update', $webhook) }}" class="space-y-6">
            @csrf
            @method('PUT')

            <div>
                <label for="url" class="block text-sm font-medium text-gray-700">Webhook URL *</label>
                <input 
                    type="url" 
                    name="url" 
                    id="url" 
                    required
                    value="{{ old('url', $webhook->url) }}"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900"
                >
            </div>

            <div>
                <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                <input 
                    type="text" 
                    name="description" 
                    id="description"
                    value="{{ old('description', $webhook->description) }}"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900"
                >
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Events *</label>
                <div class="space-y-2">
                    <label class="flex items-center">
                        <input type="checkbox" name="events[]" value="document.created" 
                            {{ in_array('document.created', $webhook->events ?? []) ? 'checked' : '' }}
                            class="rounded border-gray-300 text-gray-900 focus:ring-gray-900">
                        <span class="ml-2 text-sm text-gray-700">Document Created</span>
                    </label>
                    <label class="flex items-center">
                        <input type="checkbox" name="events[]" value="document.processed"
                            {{ in_array('document.processed', $webhook->events ?? []) ? 'checked' : '' }}
                            class="rounded border-gray-300 text-gray-900 focus:ring-gray-900">
                        <span class="ml-2 text-sm text-gray-700">Document Processed</span>
                    </label>
                    <label class="flex items-center">
                        <input type="checkbox" name="events[]" value="document.failed"
                            {{ in_array('document.failed', $webhook->events ?? []) ? 'checked' : '' }}
                            class="rounded border-gray-300 text-gray-900 focus:ring-gray-900">
                        <span class="ml-2 text-sm text-gray-700">Document Failed</span>
                    </label>
                </div>
            </div>

            <div>
                <label for="secret" class="block text-sm font-medium text-gray-700">Webhook Secret</label>
                <input 
                    type="text" 
                    name="secret" 
                    id="secret"
                    value="{{ old('secret', $webhook->secret) }}"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900"
                >
                <p class="mt-1 text-xs text-gray-500">Leave unchanged to keep current secret</p>
            </div>

            <div class="flex items-center">
                <input type="checkbox" name="is_active" id="is_active" value="1" 
                    {{ old('is_active', $webhook->is_active) ? 'checked' : '' }}
                    class="rounded border-gray-300 text-gray-900 focus:ring-gray-900">
                <label for="is_active" class="ml-2 text-sm text-gray-700">Active</label>
            </div>

            <div class="flex justify-end space-x-3 pt-4 border-t">
                <a href="{{ route('dashboard.webhooks.index') }}" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    Cancel
                </a>
                <button type="submit" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800">
                    Update Webhook
                </button>
            </div>
        </form>
    </div>
</div>
@endsection
