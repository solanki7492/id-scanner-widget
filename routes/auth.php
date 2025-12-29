<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

Route::middleware('guest')->group(function () {
    Route::get('login', function () {
        return view('auth.login');
    })->name('login');

    Route::post('login', function () {
        $credentials = request()->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($credentials, request()->boolean('remember'))) {
            request()->session()->regenerate();
            return redirect()->intended('/dashboard');
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    });

    Route::get('register', function () {
        return view('auth.register');
    })->name('register');

    Route::post('register', function () {
        request()->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'company_name' => 'nullable|string|max:255',
        ]);

        // Create tenant
        $tenant = \App\Models\Tenant::create([
            'name' => request('name'),
            'email' => request('email'),
            'company_name' => request('company_name'),
            'is_active' => true,
            'rate_limit_per_minute' => 60,
            'data_retention_days' => 90,
            'auto_delete_images' => false,
        ]);

        // Create user
        $user = \App\Models\User::create([
            'tenant_id' => $tenant->id,
            'name' => request('name'),
            'email' => request('email'),
            'password' => bcrypt(request('password')),
            'role' => 'admin',
        ]);

        Auth::login($user);

        return redirect('/dashboard');
    });
});

Route::middleware('auth')->group(function () {
    Route::post('logout', function () {
        Auth::logout();
        request()->session()->invalidate();
        request()->session()->regenerateToken();
        return redirect('/');
    })->name('logout');
});
