<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ApiKeyController extends Controller
{
    public function index(Request $request)
    {
        $tenant = $request->user()->tenant;

        $apiKeys = ApiKey::where('tenant_id', $tenant->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return view('dashboard.api-keys.index', compact('apiKeys'));
    }

    public function create()
    {
        return view('dashboard.api-keys.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'expires_at' => 'nullable|date|after:today',
        ]);

        $tenant = $request->user()->tenant;
        $key = ApiKey::generate();
        $keyHash = ApiKey::hashKey($key);

        $apiKey = ApiKey::create([
            'tenant_id' => $tenant->id,
            'name' => $request->name,
            'key' => $key,
            'key_hash' => $keyHash,
            'is_active' => true,
            'expires_at' => $request->expires_at,
        ]);

        // Log action
        AuditLog::logAction(
            $tenant->id,
            'api_key.created',
            $request->user()->id,
            null,
            'ApiKey',
            $apiKey->id,
            ['name' => $request->name]
        );

        return redirect()
            ->route('dashboard.api-keys.index', $apiKey)
            ->with('success', 'API key created successfully')
            ->with('new_key', $key);
    }

    public function show(ApiKey $apiKey)
    {
        return view('dashboard.api-keys.show', compact('apiKey'));
    }

    public function destroy(Request $request, ApiKey $apiKey)
    {
        $tenant = $request->user()->tenant;

        // Log action
        AuditLog::logAction(
            $tenant->id,
            'api_key.deleted',
            $request->user()->id,
            null,
            'ApiKey',
            $apiKey->id,
            ['name' => $apiKey->name]
        );

        $apiKey->delete();

        return redirect()
            ->route('dashboard.api-keys.index')
            ->with('success', 'API key deleted successfully');
    }

    public function toggle(Request $request, ApiKey $apiKey)
    {
        $apiKey->update([
            'is_active' => !$apiKey->is_active
        ]);

        $status = $apiKey->is_active ? 'activated' : 'deactivated';

        return redirect()
            ->back()
            ->with('success', "API key {$status} successfully");
    }
}
