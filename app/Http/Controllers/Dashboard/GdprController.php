<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Services\GdprComplianceService;
use Illuminate\Http\Request;

class GdprController extends Controller
{
    public function __construct(
        private GdprComplianceService $gdprService
    ) {}

    public function index(Request $request)
    {
        $tenant = $request->user()->tenant;
        $report = $this->gdprService->getRetentionReport($tenant);

        return view('dashboard.gdpr.index', compact('report'));
    }

    public function exportData(Request $request)
    {
        $tenant = $request->user()->tenant;

        try {
            $filename = $this->gdprService->exportTenantData($tenant);

            return response()->download($filename, 'data-export-' . now()->format('Y-m-d') . '.json')
                ->deleteFileAfterSend();

        } catch (\Exception $e) {
            return back()->with('error', 'Failed to export data: ' . $e->getMessage());
        }
    }

    public function deleteData(Request $request)
    {
        $request->validate([
            'confirmation' => 'required|in:DELETE ALL DATA',
        ]);

        $tenant = $request->user()->tenant;

        try {
            $this->gdprService->deleteTenantData($tenant);

            auth()->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect('/')->with('success', 'All data has been deleted successfully.');

        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete data: ' . $e->getMessage());
        }
    }
}
