<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tenant extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'company_name',
        'tax_id',
        'is_active',
        'rate_limit_per_minute',
        'data_retention_days',
        'auto_delete_images',
        'settings',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'auto_delete_images' => 'boolean',
        'settings' => 'array',
        'rate_limit_per_minute' => 'integer',
        'data_retention_days' => 'integer',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function apiKeys(): HasMany
    {
        return $this->hasMany(ApiKey::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    public function webhooks(): HasMany
    {
        return $this->hasMany(Webhook::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
