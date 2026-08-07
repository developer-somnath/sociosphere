<?php

namespace App\Models;

use App\Models\Traits\BelongsToSociety;
use App\Models\Traits\HasPublicUuid;
use App\Models\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Notice extends Model
{
    use BelongsToSociety, HasFactory, HasPublicUuid, LogsActivity;

    protected $fillable = [
        'society_id',
        'title',
        'category',
        'is_pinned',
        'target_audience',
        'description',
        'attachments',
        'publish_from',
        'publish_to',
        'created_by',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
        'attachments' => 'array',
        'publish_from' => 'date',
        'publish_to' => 'date',
    ];

    /* ─── Relationships ───────────────────────────────────────── */

    public function society(): BelongsTo
    {
        return $this->belongsTo(Society::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function acknowledgements(): HasMany
    {
        return $this->hasMany(NoticeAcknowledgement::class);
    }

    /* ─── Scopes ──────────────────────────────────────────────── */

    /**
     * Scope to currently published notices (within publish window).
     */
    public function scopePublished($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('publish_from')->orWhere('publish_from', '<=', now());
        })->where(function ($q) {
            $q->whereNull('publish_to')->orWhere('publish_to', '>=', now());
        });
    }
}
