<?php

use App\Http\Controllers\Dashboard\ApiKeyController;
use App\Http\Controllers\Dashboard\AuditLogController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Dashboard\DocumentController;
use App\Http\Controllers\Dashboard\SettingsController;
use App\Http\Controllers\Dashboard\WebhookController;
use App\Http\Middleware\EnsureTenantAccess;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/test-widget', fn() => view('test-widget'));

// Dashboard routes - protected by authentication
Route::middleware(['auth', EnsureTenantAccess::class])->prefix('dashboard')->name('dashboard.')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('index');
    
    // API Keys
    Route::resource('api-keys', ApiKeyController::class)->except(['update']);
    Route::post('api-keys/{apiKey}/toggle', [ApiKeyController::class, 'toggle'])->name('api-keys.toggle');
    
    // Documents
    Route::get('documents', [DocumentController::class, 'index'])->name('documents.index');
    Route::get('documents/{uuid}', [DocumentController::class, 'show'])->name('documents.show');
    
    // Webhooks
    Route::resource('webhooks', WebhookController::class);
    
    // Audit Logs
    Route::get('audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
    
    // Settings
    Route::get('settings', [SettingsController::class, 'index'])->name('settings');
    Route::put('settings', [SettingsController::class, 'update'])->name('settings.update');
});

require __DIR__.'/auth.php';
