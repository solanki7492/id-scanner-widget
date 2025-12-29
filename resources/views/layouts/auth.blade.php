<!DOCTYPE html>
<html lang="en" class="h-full bg-gray-50">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Authentication') - ID Scanner Widget</title>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</head>
<body class="h-full">
    <div class="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
            <!-- Logo -->
            <div class="text-center">
                <h1 class="text-3xl font-bold text-gray-900">📄 ID Scanner</h1>
                <p class="mt-2 text-sm text-gray-600">@yield('subtitle', 'Secure document processing')</p>
            </div>

            <!-- Content Card -->
            <div class="bg-white rounded-lg shadow-sm p-8">
                @if (session('success'))
                    <div class="mb-4 bg-green-50 border-l-4 border-green-400 p-3 text-sm text-green-700">
                        {{ session('success') }}
                    </div>
                @endif

                @if (session('error'))
                    <div class="mb-4 bg-red-50 border-l-4 border-red-400 p-3 text-sm text-red-700">
                        {{ session('error') }}
                    </div>
                @endif

                @if ($errors->any())
                    <div class="mb-4 bg-red-50 border-l-4 border-red-400 p-3 text-sm text-red-700">
                        <ul class="list-disc list-inside space-y-1">
                            @foreach ($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                @yield('content')
            </div>

            <!-- Footer -->
            <p class="text-center text-xs text-gray-500">
                &copy; {{ date('Y') }} ID Scanner Widget. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
