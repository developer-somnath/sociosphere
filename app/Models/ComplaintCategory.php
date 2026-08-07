<?php

namespace App\Models;

use App\Models\Traits\BelongsToSociety;
use App\Models\Traits\HasPublicUuid;
use App\Models\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ComplaintCategory extends Model
{
    use BelongsToSociety, HasFactory, HasPublicUuid, LogsActivity;

    protected $fillable = [
        'society_id',
        'name',
    ];

    /* ─── Relationships ───────────────────────────────────────── */

    public function society(): BelongsTo
    {
        return $this->belongsTo(Society::class);
    }

    public function complaints(): HasMany
    {
        return $this->hasMany(Complaint::class, 'category_id');
    }
}
