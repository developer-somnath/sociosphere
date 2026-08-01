<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Traits\HasPublicUuid;
use App\Models\Traits\BelongsToSociety;
use App\Models\Traits\LogsActivity;

class Resident extends Model
{
    use HasFactory, HasPublicUuid, BelongsToSociety, SoftDeletes, LogsActivity;

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

    public function society()
    {
        return $this->belongsTo(Society::class);
    }
}
