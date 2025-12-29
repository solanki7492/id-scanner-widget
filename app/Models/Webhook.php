<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Webhook extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'url',
        'secret',
        'is_active',
        'events',
        'max_retries',
        'last_triggered_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'events' => 'array',
        'max_retries' => 'integer',
        'last_triggered_at' => 'datetime',
    ];

    protected $hidden = [
        'secret',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(WebhookDelivery::class);
    }

    /**
     * Check if webhook should handle this event
     */
    public function handlesEvent(string $event): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if (empty($this->events)) {
            return true; // Handle all events if none specified
        }

        return in_array($event, $this->events);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
