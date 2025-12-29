<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $tenant = $request->user()->tenant;

        $query = AuditLog::with(['user', 'document'])
            ->where('tenant_id', $tenant->id)
            ->orderBy('created_at', 'desc');

        // Filter by action
        if ($request->has('action') && $request->action !== '') {
            $query->where('action', 'like', '%' . $request->action . '%');
        }

        // Filter by date range
        if ($request->has('from') && $request->from !== '') {
            $query->whereDate('created_at', '>=', $request->from);
        }

        if ($request->has('to') && $request->to !== '') {
            $query->whereDate('created_at', '<=', $request->to);
        }

        $logs = $query->paginate(50);

        return view('dashboard.audit-logs.index', compact('logs'));
    }
}
