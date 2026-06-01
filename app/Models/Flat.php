<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasPublicUuid;
use App\Models\Traits\BelongsToSociety;

class Flat extends Model
{
    use HasFactory, HasPublicUuid,BelongsToSociety;
    protected $fillable = [
        'society_id',
        'tower_id',
        'flat_no',
        'floor_no',
        'flat_type',
        'area_sqft',
        'ownership_type',
        'occupancy_status',
    ];

    public function tower()
    {
        return $this->belongsTo(Tower::class);
    }

    public function resident()
    {
        return $this->hasOne(Resident::class);
    }

    public function society()
    {
        return $this->belongsTo(Society::class);
    }
}
