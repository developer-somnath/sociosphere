<?php

namespace App\Models;

use App\Models\Traits\BelongsToSociety;
use App\Models\Traits\HasPublicUuid;
use App\Models\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AmenityBooking extends Model
{
    use BelongsToSociety, HasFactory, HasPublicUuid, LogsActivity;

    protected $fillable = [
        'society_id',
        'amenity_id',
        'flat_id',
        'resident_id',
        'booking_date',
        'start_time',
        'end_time',
        'total_fee',
        'status',
        'payment_status',
        'refunded_at',
        'refund_reference',
        'remarks',
    ];

    protected $casts = [
        'booking_date' => 'date',
        'total_fee' => 'decimal:2',
        'refunded_at' => 'datetime',
    ];

    public function society(): BelongsTo
    {
        return $this->belongsTo(Society::class);
    }

    public function amenity(): BelongsTo
    {
        return $this->belongsTo(Amenity::class);
    }

    public function flat(): BelongsTo
    {
        return $this->belongsTo(Flat::class);
    }

    public function resident(): BelongsTo
    {
        return $this->belongsTo(Resident::class);
    }
}
