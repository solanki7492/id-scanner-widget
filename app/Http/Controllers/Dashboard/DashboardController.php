<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Webhook;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $tenant = $request->user()->tenant;

        // Get statistics
        $stats = [
            'total_documents' => Document::where('tenant_id', $tenant->id)->count(),
            'pending_documents' => Document::where('tenant_id', $tenant->id)->pending()->count(),
            'completed_documents' => Document::where('tenant_id', $tenant->id)->completed()->count(),
            'failed_documents' => Document::where('tenant_id', $tenant->id)->failed()->count(),
            'active_webhooks' => Webhook::where('tenant_id', $tenant->id)->active()->count(),
        ];

        // Get recent documents
        $recentDocuments = Document::where('tenant_id', $tenant->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return view('dashboard.index', compact('stats', 'recentDocuments'));
    }
}
