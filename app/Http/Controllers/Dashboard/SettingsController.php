<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function index(Request $request)
    {
        $tenant = $request->user()->tenant;

        return view('dashboard.settings.index', compact('tenant'));
    }

    public function update(Request $request)
    {
        $tenant = $request->user()->tenant;

        $request->validate([
            'name' => 'required|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'data_retention_days' => 'required|integer|min:1|max:365',
            'auto_delete_images' => 'boolean',
            'rate_limit_per_minute' => 'required|integer|min:10|max:1000',
        ]);

        $tenant->update([
            'name' => $request->name,
            'company_name' => $request->company_name,
            'data_retention_days' => $request->data_retention_days,
            'auto_delete_images' => $request->boolean('auto_delete_images'),
            'rate_limit_per_minute' => $request->rate_limit_per_minute,
        ]);

        // Log action
        AuditLog::logAction(
            $tenant->id,
            'settings.updated',
            $request->user()->id,
            null,
            'Tenant',
            $tenant->id
        );

        return redirect()
            ->route('dashboard.settings')
            ->with('success', 'Settings updated successfully');
    }
}
