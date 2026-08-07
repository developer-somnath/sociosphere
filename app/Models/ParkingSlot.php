<?php

namespace App\Models;

use App\Models\Traits\BelongsToSociety;
use App\Models\Traits\HasPublicUuid;
use App\Models\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ParkingSlot extends Model
{
    use BelongsToSociety, HasFactory, HasPublicUuid, LogsActivity, SoftDeletes;

    protected $fillable = [
        'society_id',
        'tower_id',
        'flat_id',
        'slot_number',
        'type',
        'status',
        'vehicle_number',
        'vehicle_model',
        'rfid_tag',
        'expires_at',
        'notes',
    ];

    public function society()
    {
        return $this->belongsTo(Society::class);
    }

    public function tower()
    {
        return $this->belongsTo(Tower::class);
    }

    public function flat()
    {
        return $this->belongsTo(Flat::class);
    }
}
