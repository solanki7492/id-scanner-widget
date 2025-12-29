@extends('layouts.dashboard')

@section('title', 'Settings')
@section('page-title', 'Settings')

@section('content')
<div class="max-w-4xl space-y-6">
    <!-- Account Settings -->
    <div class="bg-white rounded-lg shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Account Settings</h3>
            <p class="mt-1 text-sm text-gray-500">Manage your tenant account configuration</p>
        </div>
        <form method="POST" action="{{ route('dashboard.settings.update') }}" class="p-6 space-y-6">
            @csrf
            @method('PUT')

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label for="name" class="block text-sm font-medium text-gray-700">Tenant Name *</label>
                    <input 
                        type="text" 
                        name="name" 
                        id="name" 
                        value="{{ old('name', $tenant->name ?? '') }}"
                        required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900"
                    >
                </div>

                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">Email *</label>
                    <input 
                        type="email" 
                        name="email" 
                        id="email" 
                        value="{{ old('email', $tenant->email ?? '') }}"
                        required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900"
                    >
                </div>

                <div>
                    <label for="company_name" class="block text-sm font-medium text-gray-700">Company Name</label>
                    <input 
                        type="text" 
                        name="company_name" 
                        id="company_name" 
                        value="{{ old('company_name', $tenant->company_name ?? '') }}"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900"
                    >
                </div>

                <div>
                    <label for="tax_id" class="block text-sm font-medium text-gray-700">Tax ID</label>
                    <input 
                        type="text" 
                        name="tax_id" 
                        id="tax_id" 
                        value="{{ old('tax_id', $tenant->tax_id ?? '') }}"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900"
                    >
                </div>
            </div>

            <div class="pt-4 border-t">
                <button type="submit" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800">
                    Save Changes
                </button>
            </div>
        </form>
    </div>

    <!-- API Configuration -->
    <div class="bg-white rounded-lg shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">API Configuration</h3>
            <p class="mt-1 text-sm text-gray-500">Configure rate limits and retention policies</p>
        </div>
        <form method="POST" action="{{ route('dashboard.settings.update') }}" class="p-6 space-y-6">
            @csrf
            @method('PUT')

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label for="rate_limit_per_minute" class="block text-sm font-medium text-gray-700">Rate Limit (per minute) *</label>
                    <input 
                        type="number" 
                        name="rate_limit_per_minute" 
                        id="rate_limit_per_minute" 
                        value="{{ old('rate_limit_per_minute', $tenant->rate_limit_per_minute ?? 60) }}"
                        min="1"
                        max="1000"
                        required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900"
                    >
                    <p class="mt-1 text-xs text-gray-500">Maximum API requests allowed per minute</p>
                </div>

                <div>
                    <label for="data_retention_days" class="block text-sm font-medium text-gray-700">Data Retention (days) *</label>
                    <input 
                        type="number" 
                        name="data_retention_days" 
                        id="data_retention_days" 
                        value="{{ old('data_retention_days', $tenant->data_retention_days ?? 90) }}"
                        min="1"
                        max="365"
                        required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900"
                    >
                    <p class="mt-1 text-xs text-gray-500">How long to keep document data before deletion</p>
                </div>
            </div>

            <div>
                <div class="flex items-center">
                    <input 
                        type="checkbox" 
                        name="auto_delete_images" 
                        id="auto_delete_images" 
                        value="1"
                        {{ old('auto_delete_images', $tenant->auto_delete_images ?? false) ? 'checked' : '' }}
                        class="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                    >
                    <label for="auto_delete_images" class="ml-2 text-sm text-gray-700">
                        Auto-delete images after processing
                    </label>
                </div>
                <p class="mt-1 ml-6 text-xs text-gray-500">Images will be deleted immediately after OCR extraction completes</p>
            </div>

            <div class="pt-4 border-t">
                <button type="submit" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800">
                    Save Configuration
                </button>
            </div>
        </form>
    </div>

    <!-- Profile Settings -->
    <div class="bg-white rounded-lg shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Profile Settings</h3>
            <p class="mt-1 text-sm text-gray-500">Update your personal information</p>
        </div>
        <form method="POST" action="{{ route('dashboard.settings.update') }}" class="p-6 space-y-6">
            @csrf
            @method('PUT')

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label for="user_name" class="block text-sm font-medium text-gray-700">Full Name *</label>
                    <input 
                        type="text" 
                        name="user_name" 
                        id="user_name" 
                        value="{{ old('user_name', auth()->user()->name) }}"
                        required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900"
                    >
                </div>

                <div>
                    <label for="user_email" class="block text-sm font-medium text-gray-700">Email *</label>
                    <input 
                        type="email" 
                        name="user_email" 
                        id="user_email" 
                        value="{{ old('user_email', auth()->user()->email) }}"
                        required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900"
                    >
                </div>
            </div>

            <div class="pt-4 border-t">
                <button type="submit" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800">
                    Update Profile
                </button>
            </div>
        </form>
    </div>

    <!-- Danger Zone -->
    <div class="bg-white rounded-lg shadow-sm border-2 border-red-200">
        <div class="px-6 py-4 border-b border-red-200 bg-red-50">
            <h3 class="text-lg font-medium text-red-900">Danger Zone</h3>
            <p class="mt-1 text-sm text-red-700">Irreversible and destructive actions</p>
        </div>
        <div class="p-6 space-y-4">
            <div class="flex items-center justify-between">
                <div>
                    <h4 class="text-sm font-medium text-gray-900">Delete Account</h4>
                    <p class="text-sm text-gray-500">Permanently delete your tenant account and all associated data</p>
                </div>
                <button type="button" class="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50">
                    Delete Account
                </button>
            </div>
        </div>
    </div>
</div>
@endsection
