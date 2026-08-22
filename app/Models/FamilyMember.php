<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Traits\HasPublicUuid;
use App\Models\Traits\BelongsToSociety;
use App\Models\Traits\LogsActivity;

class FamilyMember extends Model
{
    use HasFactory, HasPublicUuid, BelongsToSociety, SoftDeletes, LogsActivity;

    protected $fillable = [
        'society_id',
        'resident_id',
        'name',
        'relation',
        'date_of_birth',
        'gender',
        'phone',
        'email',
        'is_dependent',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'is_dependent' => 'boolean',
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
