<?php

namespace App\Models;

use App\Models\Traits\BelongsToSociety;
use App\Models\Traits\HasPublicUuid;
use App\Models\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class SocietyDocument extends Model
{
    use BelongsToSociety, HasFactory, HasPublicUuid, LogsActivity, SoftDeletes;

    protected $fillable = [
        'society_id',
        'title',
        'category',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
        'is_public',
        'uploaded_by',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'is_public' => 'boolean',
    ];

    /* ─── Relationships ───────────────────────────────────────── */

    public function society(): BelongsTo
    {
        return $this->belongsTo(Society::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}