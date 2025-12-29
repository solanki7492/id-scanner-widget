<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentField extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_id',
        'field_name',
        'raw_value',
        'normalized_value',
        'confidence',
        'metadata',
    ];

    protected $casts = [
        'confidence' => 'decimal:2',
        'metadata' => 'array',
    ];

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }
}
