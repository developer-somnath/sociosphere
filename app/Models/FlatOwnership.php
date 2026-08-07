<?php

namespace App\Models;

use App\Models\Traits\BelongsToSociety;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FlatOwnership extends Model
{
    use BelongsToSociety, HasFactory;

    protected $fillable = [
        'society_id',
        'flat_id',
        'owner_name',
        'owner_email',
        'owner_phone',
        'ownership_start',
        'ownership_end',
        'is_current',
    ];

    protected $casts = [
        'ownership_start' => 'date',
        'ownership_end' => 'date',
        'is_current' => 'boolean',
    ];

    public function flat()
    {
        return $this->belongsTo(Flat::class);
    }
}
