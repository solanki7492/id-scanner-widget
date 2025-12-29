@extends('layouts.dashboard')

@section('title', 'Dashboard')

@section('content')
<div class="px-4 sm:px-0">
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="text-3xl font-bold text-gray-900">{{ $stats['total_documents'] }}</div>
                    </div>
                    <div class="ml-5 w-0 flex-1">
                        <dl>
                            <dt class="text-sm font-medium text-gray-500 truncate">Total Documents</dt>
                        </dl>
                    </div>
                </div>
            </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="text-3xl font-bold text-blue-600">{{ $stats['pending_documents'] }}</div>
                    </div>
                    <div class="ml-5 w-0 flex-1">
                        <dl>
                            <dt class="text-sm font-medium text-gray-500 truncate">Pending</dt>
                        </dl>
                    </div>
                </div>
            </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="text-3xl font-bold text-green-600">{{ $stats['completed_documents'] }}</div>
                    </div>
                    <div class="ml-5 w-0 flex-1">
                        <dl>
                            <dt class="text-sm font-medium text-gray-500 truncate">Completed</dt>
                        </dl>
                    </div>
                </div>
            </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="text-3xl font-bold text-red-600">{{ $stats['failed_documents'] }}</div>
                    </div>
                    <div class="ml-5 w-0 flex-1">
                        <dl>
                            <dt class="text-sm font-medium text-gray-500 truncate">Failed</dt>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Widget Setup Guide -->
    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-6 py-5 border-b border-gray-200">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Getting Started with ID Scanner Widget</h3>
            <p class="mt-1 text-sm text-gray-500">Follow these steps to integrate the ID scanner into your website</p>
        </div>
        
        <div class="px-6 py-6">
            <div class="space-y-6">
                <!-- Step 1: Generate API Key -->
                <div class="flex">
                    <div class="flex-shrink-0">
                        <div class="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                            1
                        </div>
                    </div>
                    <div class="ml-4 flex-1">
                        <h4 class="text-base font-semibold text-gray-900">Generate API Key</h4>
                        <p class="mt-1 text-sm text-gray-600">Create an API key to authenticate your widget requests. Keep this key secure and never expose it in client-side code.</p>
                        <div class="mt-3">
                            <a href="{{ route('dashboard.api-keys.create') }}" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Generate API Key
                            </a>
                            <a href="{{ route('dashboard.api-keys.index') }}" class="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                View All Keys
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Step 2: Setup Webhook -->
                <div class="flex">
                    <div class="flex-shrink-0">
                        <div class="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                            2
                        </div>
                    </div>
                    <div class="ml-4 flex-1">
                        <h4 class="text-base font-semibold text-gray-900">Configure Webhook</h4>
                        <p class="mt-1 text-sm text-gray-600">Set up a webhook URL to receive real-time notifications when documents are processed, completed, or failed.</p>
                        <div class="mt-3">
                            <a href="{{ route('dashboard.webhooks.create') }}" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Add Webhook
                            </a>
                            <a href="{{ route('dashboard.webhooks.index') }}" class="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Manage Webhooks
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Step 3: Embed Widget -->
                <div class="flex">
                    <div class="flex-shrink-0">
                        <div class="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                            3
                        </div>
                    </div>
                    <div class="ml-4 flex-1">
                        <h4 class="text-base font-semibold text-gray-900">Embed the Widget</h4>
                        <p class="mt-1 text-sm text-gray-600">Add the ID scanner widget to your website using the simple embed code below:</p>
                        <div class="mt-3 bg-gray-900 rounded-lg p-4">
                            <pre class="text-sm text-gray-100 overflow-x-auto"><code>&lt;div id="idscan"&gt;&lt;/div&gt;
&lt;script src="{{ url('/widget/idscan.js') }}"&gt;&lt;/script&gt;
&lt;script&gt;
  IdScan.mount("#idscan", { token: "YOUR_API_KEY" });
&lt;/script&gt;</code></pre>
                        </div>
                        <p class="mt-2 text-xs text-gray-500">Replace YOUR_API_KEY with your actual API key from step 1</p>
                    </div>
                </div>

                <!-- Step 4: Test Integration -->
                <div class="flex">
                    <div class="flex-shrink-0">
                        <div class="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                            4
                        </div>
                    </div>
                    <div class="ml-4 flex-1">
                        <h4 class="text-base font-semibold text-gray-900">Test Your Integration</h4>
                        <p class="mt-1 text-sm text-gray-600">Test the widget with sample ID documents and monitor the results in your dashboard.</p>
                        <div class="mt-3">
                            <a href="{{ route('dashboard.documents.index') }}" class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                View Documents
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
