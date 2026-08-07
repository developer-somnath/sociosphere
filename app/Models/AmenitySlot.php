<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AmenitySlot extends Model
{
    use HasFactory;

    protected $fillable = [
        'amenity_id',
        'start_time',
        'end_time',
        'max_bookings',
        'is_active',
    ];

    protected $casts = [
        'max_bookings' => 'integer',
        'is_active' => 'boolean',
    ];

    public function amenity(): BelongsTo
    {
        return $this->belongsTo(Amenity::class);
    }
}
