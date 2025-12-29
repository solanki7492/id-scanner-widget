<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Webhook;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WebhookController extends Controller
{
    public function index(Request $request)
    {
        $tenant = $request->user()->tenant;

        $webhooks = Webhook::where('tenant_id', $tenant->id)
            ->withCount('deliveries')
            ->orderBy('created_at', 'desc')
            ->get();

        return view('dashboard.webhooks.index', compact('webhooks'));
    }

    public function create()
    {
        return view('dashboard.webhooks.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'url' => 'required|url|max:500',
            'events' => 'nullable|array',
            'events.*' => 'in:document.completed,document.failed',
        ]);

        $tenant = $request->user()->tenant;

        // Check for duplicate
        $existing = Webhook::where('tenant_id', $tenant->id)
            ->where('url', $request->url)
            ->first();

        if ($existing) {
            return back()
                ->withInput()
                ->with('error', 'A webhook with this URL already exists');
        }

        $secret = Str::random(64);

        $webhook = Webhook::create([
            'tenant_id' => $tenant->id,
            'url' => $request->url,
            'secret' => $secret,
            'events' => $request->events ?? [],
            'is_active' => true,
            'max_retries' => 3,
        ]);

        // Log action
        AuditLog::logAction(
            $tenant->id,
            'webhook.created',
            $request->user()->id,
            null,
            'Webhook',
            $webhook->id,
            ['url' => $request->url]
        );

        return redirect()
            ->route('dashboard.webhooks.show', $webhook)
            ->with('success', 'Webhook created successfully')
            ->with('webhook_secret', $secret);
    }

    public function show(Webhook $webhook)
    {
        $this->authorize('view', $webhook);

        $webhook->load(['deliveries' => function ($query) {
            $query->orderBy('created_at', 'desc')->limit(20);
        }]);

        return view('dashboard.webhooks.show', compact('webhook'));
    }

    public function edit(Webhook $webhook)
    {
        $this->authorize('update', $webhook);

        return view('dashboard.webhooks.edit', compact('webhook'));
    }

    public function update(Request $request, Webhook $webhook)
    {
        $this->authorize('update', $webhook);

        $request->validate([
            'url' => 'required|url|max:500',
            'events' => 'nullable|array',
            'events.*' => 'in:document.completed,document.failed',
            'is_active' => 'boolean',
        ]);

        $webhook->update([
            'url' => $request->url,
            'events' => $request->events ?? [],
            'is_active' => $request->boolean('is_active'),
        ]);

        // Log action
        AuditLog::logAction(
            $request->user()->tenant->id,
            'webhook.updated',
            $request->user()->id,
            null,
            'Webhook',
            $webhook->id
        );

        return redirect()
            ->route('dashboard.webhooks.show', $webhook)
            ->with('success', 'Webhook updated successfully');
    }

    public function destroy(Request $request, Webhook $webhook)
    {
        $this->authorize('delete', $webhook);

        $tenant = $request->user()->tenant;

        // Log action
        AuditLog::logAction(
            $tenant->id,
            'webhook.deleted',
            $request->user()->id,
            null,
            'Webhook',
            $webhook->id,
            ['url' => $webhook->url]
        );

        $webhook->delete();

        return redirect()
            ->route('dashboard.webhooks.index')
            ->with('success', 'Webhook deleted successfully');
    }
}
