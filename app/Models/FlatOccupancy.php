<?php

namespace App\Models;

use App\Models\Traits\BelongsToSociety;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FlatOccupancy extends Model
{
    use BelongsToSociety, HasFactory;

    protected $fillable = [
        'society_id',
        'flat_id',
        'resident_id',
        'occupancy_type',
        'move_in_date',
        'move_out_date',
        'is_active',
    ];

    protected $casts = [
        'move_in_date' => 'date',
        'move_out_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function flat()
    {
        return $this->belongsTo(Flat::class);
    }

    public function resident()
    {
        return $this->belongsTo(Resident::class);
    }
}
