<?php

namespace App\Models;

use App\Models\Traits\BelongsToSociety;
use App\Models\Traits\HasPublicUuid;
use App\Models\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Amenity extends Model
{
    use BelongsToSociety, HasFactory, HasPublicUuid, LogsActivity, SoftDeletes;

    protected $fillable = [
        'society_id',
        'name',
        'description',
        'booking_type',
        'capacity',
        'fee_per_slot',
        'rules',
        'is_active',
    ];

    protected $casts = [
        'capacity' => 'integer',
        'fee_per_slot' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function society(): BelongsTo
    {
        return $this->belongsTo(Society::class);
    }

    public function slots(): HasMany
    {
        return $this->hasMany(AmenitySlot::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(AmenityBooking::class);
    }
}
