<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\HasPublicUuid;

class Resident extends Model
{
    use HasFactory, HasPublicUuid;
    protected $fillable = [
        'society_id',
        'flat_id',
        'name',
        'email',
        'phone',
        'date_of_birth',
        'gender',
        'occupation',
        'is_primary_contact',
    ];

    public function flat()
    {
        return $this->belongsTo(Flat::class);
    }
}
