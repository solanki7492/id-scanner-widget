<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class RegisterController extends Controller
{
    /**
     * Show the registration form
     */
    public function showRegistrationForm()
    {
        return view('auth.register');
    }

    /**
     * Handle registration request
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::min(8)],
            'company_name' => 'nullable|string|max:255',
        ]);

        try {
            DB::beginTransaction();

            // Create tenant first
            $tenant = Tenant::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'company_name' => $validated['company_name'] ?? null,
                'is_active' => true,
                'rate_limit_per_minute' => 60,
                'data_retention_days' => 90,
                'auto_delete_images' => false,
            ]);

            // Create user and associate with tenant
            $user = User::create([
                'tenant_id' => $tenant->id,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => 'admin', // First user of a tenant is admin
            ]);

            DB::commit();

            // Log the user in
            Auth::login($user);

            return redirect()->route('dashboard.index')->with('success', 'Welcome! Your account has been created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()
                ->withInput($request->except('password', 'password_confirmation'))
                ->withErrors(['email' => 'An error occurred during registration. Please try again.']);
        }
    }
}
