@extends('layouts.dashboard')

@section('title', 'Create API Key')

@section('content')
<div class="px-4 sm:px-0 max-w-2xl">
    <h2 class="text-2xl font-bold mb-6">Create API Key</h2>

    <div class="bg-white shadow sm:rounded-lg">
        <form method="POST" action="{{ route('dashboard.api-keys.store') }}" class="p-6">
            @csrf

            <div class="mb-4">
                <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" name="name" id="name" required 
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value="{{ old('name') }}">
                @error('name')
                    <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                @enderror
            </div>

            <div class="mb-6">
                <label for="expires_at" class="block text-sm font-medium text-gray-700">Expiration Date (Optional)</label>
                <input type="date" name="expires_at" id="expires_at" 
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value="{{ old('expires_at') }}">
                @error('expires_at')
                    <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                @enderror
            </div>

            <div class="flex justify-end space-x-3">
                <a href="{{ route('dashboard.api-keys.index') }}" class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    Cancel
                </a>
                <button type="submit" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                    Create API Key
                </button>
            </div>
        </form>
    </div>
</div>
@endsection
