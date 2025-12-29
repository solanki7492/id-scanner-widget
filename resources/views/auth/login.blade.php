@extends('layouts.auth')

@section('title', 'Login')
@section('subtitle', 'Sign in to your account')

@section('content')
<form method="POST" action="{{ route('login') }}" class="space-y-6">
    @csrf

    <div>
        <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
        <input 
            id="email" 
            type="email" 
            name="email" 
            value="{{ old('email') }}" 
            required 
            autofocus 
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-900 focus:border-gray-900"
        >
    </div>

    <div>
        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
        <input 
            id="password" 
            type="password" 
            name="password" 
            required 
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-900 focus:border-gray-900"
        >
    </div>

    <div class="flex items-center">
        <input 
            id="remember" 
            type="checkbox" 
            name="remember" 
            class="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
        >
        <label for="remember" class="ml-2 block text-sm text-gray-700">
            Remember me
        </label>
    </div>

    <button 
        type="submit" 
        class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
    >
        Sign in
    </button>

    <div class="text-center">
        <p class="text-sm text-gray-600">
            Don't have an account?
            <a href="{{ route('register') }}" class="font-medium text-gray-900 hover:text-gray-700">
                Create one
            </a>
        </p>
    </div>
</form>
@endsection
