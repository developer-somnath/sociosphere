<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Traits\HasPublicUuid;
use App\Models\Traits\BelongsToSociety;
use App\Models\Traits\LogsActivity;

class Vehicle extends Model
{
    use HasFactory, HasPublicUuid, BelongsToSociety, SoftDeletes, LogsActivity;

    protected $fillable = [
        'society_id',
        'resident_id',
        'vehicle_number',
        'vehicle_model',
        'vehicle_type',
        'parking_slot',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function resident()
    {
        return $this->belongsTo(Resident::class);
    }

    public function society()
    {
        return $this->belongsTo(Society::class);
    }
}
