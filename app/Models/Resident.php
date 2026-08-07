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

    protected static function booted(): void
    {
        static::saved(function (self $resident): void {
            if (! $resident->is_primary_contact || empty($resident->flat_id)) {
                return;
            }

            $resident->newQuery()
                ->where('flat_id', $resident->flat_id)
                ->where('id', '!=', $resident->id)
                ->update(['is_primary_contact' => false]);
        });
    }

    protected $casts = [
        'is_primary_contact' => 'boolean',
    ];

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
