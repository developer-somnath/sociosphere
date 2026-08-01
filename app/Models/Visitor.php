<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Traits\HasPublicUuid;
use App\Models\Traits\BelongsToSociety;
use App\Models\Traits\LogsActivity;

class Visitor extends Model
{
    use HasFactory, HasPublicUuid, BelongsToSociety, LogsActivity;

    protected $fillable = [
        'society_id',
        'name',
        'phone',
        'email',
        'notes',
        'created_by',
    ];

    /**
     * All gate passes issued for this visitor.
     */
    public function passes(): HasMany
    {
        return $this->hasMany(VisitorPass::class);
    }

    public function society()
    {
        return $this->belongsTo(Society::class);
    }
}
