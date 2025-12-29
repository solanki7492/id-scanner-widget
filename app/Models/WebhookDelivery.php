<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WebhookDelivery extends Model
{
    use HasFactory;

    protected $fillable = [
        'webhook_id',
        'document_id',
        'event',
        'payload',
        'status',
        'attempts',
        'response_code',
        'response_body',
        'error_message',
        'sent_at',
        'next_retry_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'attempts' => 'integer',
        'response_code' => 'integer',
        'sent_at' => 'datetime',
        'next_retry_at' => 'datetime',
    ];

    public function webhook(): BelongsTo
    {
        return $this->belongsTo(Webhook::class);
    }

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    /**
     * Check if delivery should be retried
     */
    public function shouldRetry(): bool
    {
        return $this->status === 'failed' 
            && $this->attempts < $this->webhook->max_retries
            && $this->next_retry_at 
            && $this->next_retry_at->isPast();
    }

    public function scopePendingRetry($query)
    {
        return $query->where('status', 'failed')
            ->whereNotNull('next_retry_at')
            ->where('next_retry_at', '<=', now())
            ->whereColumn('attempts', '<', 'max_retries');
    }
}
