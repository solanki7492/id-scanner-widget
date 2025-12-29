<?php

use App\Http\Controllers\Api\AuditController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\WebhookController;
use App\Http\Middleware\AuthenticateApiToken;
use App\Http\Middleware\LogApiRequest;
use App\Http\Middleware\TenantRateLimiter;
use Illuminate\Support\Facades\Route;

// API v1 routes - protected by API token authentication
Route::prefix('v1')->middleware([
    AuthenticateApiToken::class,
    TenantRateLimiter::class,
    LogApiRequest::class,
])->group(function () {
    
    // Document endpoints
    Route::post('/documents', [DocumentController::class, 'store']);
    Route::get('/documents', [DocumentController::class, 'index']);
    Route::get('/documents/{uuid}', [DocumentController::class, 'show']);
    
    // Webhook endpoints
    Route::get('/webhooks', [WebhookController::class, 'index']);
    Route::post('/webhooks', [WebhookController::class, 'store']);
    Route::put('/webhooks/{id}', [WebhookController::class, 'update']);
    Route::delete('/webhooks/{id}', [WebhookController::class, 'destroy']);
    
    // Audit endpoints
    Route::get('/audit', [AuditController::class, 'index']);
    Route::get('/audit/{documentUuid}', [AuditController::class, 'show']);
});
