<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Traits\HasPublicUuid;
use App\Models\Traits\BelongsToSociety;
use App\Models\Traits\LogsActivity;

class Tower extends Model
{
    use HasFactory, HasPublicUuid, BelongsToSociety, SoftDeletes, LogsActivity;

    protected $fillable = [
        'society_id',
        'name',
    ];

    public function society()
    {
        return $this->belongsTo(Society::class);
    }

    public function flats(): HasMany
    {
        return $this->hasMany(Flat::class);
    }
}
