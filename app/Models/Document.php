<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Document extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'tenant_id',
        'api_key_id',
        'original_filename',
        'storage_path',
        'encryption_key',
        'status',
        'document_type',
        'error_message',
        'processed_at',
        'will_be_deleted_at',
        'client_ip',
        'user_agent',
    ];

    protected $casts = [
        'processed_at' => 'datetime',
        'will_be_deleted_at' => 'datetime',
    ];

    protected $hidden = [
        'encryption_key',
        'storage_path',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($document) {
            if (!$document->uuid) {
                $document->uuid = (string) Str::uuid();
            }
        });
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function apiKey(): BelongsTo
    {
        return $this->belongsTo(ApiKey::class);
    }

    public function fields(): HasMany
    {
        return $this->hasMany(DocumentField::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    /**
     * Get normalized extraction data
     */
    public function getNormalizedData(): array
    {
        $data = [];
        foreach ($this->fields as $field) {
            $data[$field->field_name] = $field->normalized_value;
        }
        return $data;
    }

    /**
     * Get raw extraction data with confidence
     */
    public function getRawData(): array
    {
        $data = [];
        foreach ($this->fields as $field) {
            $data[$field->field_name] = [
                'value' => $field->raw_value,
                'confidence' => $field->confidence,
                'metadata' => $field->metadata,
            ];
        }
        return $data;
    }

    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeProcessing($query)
    {
        return $query->where('status', 'processing');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeScheduledForDeletion($query)
    {
        return $query->whereNotNull('will_be_deleted_at')
            ->where('will_be_deleted_at', '<=', now());
    }

    public function getImageUrlAttribute()
    {
        return route('dashboard.documents.image', $this);
    }
}
