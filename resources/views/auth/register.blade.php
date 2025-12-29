@extends('layouts.auth')

@section('title', 'Register')
@section('subtitle', 'Create your account')

@section('content')
<form method="POST" action="{{ route('register') }}" class="space-y-6">
    @csrf

    <div>
        <label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
        <input 
            id="name" 
            type="text" 
            name="name" 
            value="{{ old('name') }}" 
            required 
            autofocus 
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-900 focus:border-gray-900"
        >
    </div>

    <div>
        <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
        <input 
            id="email" 
            type="email" 
            name="email" 
            value="{{ old('email') }}" 
            required 
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-900 focus:border-gray-900"
        >
    </div>

    <div>
        <label for="company_name" class="block text-sm font-medium text-gray-700">Company Name <span class="text-gray-400 font-normal">(optional)</span></label>
        <input 
            id="company_name" 
            type="text" 
            name="company_name" 
            value="{{ old('company_name') }}" 
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
        <p class="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
    </div>

    <div>
        <label for="password_confirmation" class="block text-sm font-medium text-gray-700">Confirm Password</label>
        <input 
            id="password_confirmation" 
            type="password" 
            name="password_confirmation" 
            required 
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-900 focus:border-gray-900"
        >
    </div>

    <button 
        type="submit" 
        class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
    >
        Create Account
    </button>

    <div class="text-center">
        <p class="text-sm text-gray-600">
            Already have an account?
            <a href="{{ route('login') }}" class="font-medium text-gray-900 hover:text-gray-700">
                Sign in
            </a>
        </p>
    </div>
</form>
@endsection
