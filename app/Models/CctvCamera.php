<?php

namespace App\Models;

use App\Models\Traits\BelongsToSociety;
use App\Models\Traits\HasPublicUuid;
use App\Models\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CctvCamera extends Model
{
    use BelongsToSociety, HasFactory, HasPublicUuid, LogsActivity, SoftDeletes;

    protected $table = 'cctv_cameras';

    protected $fillable = [
        'society_id',
        'tower_id',
        'name',
        'camera_group',
        'stream_url',
        'ip_address',
        'location_details',
        'status',
        'is_recording',
    ];

    protected $casts = [
        'is_recording' => 'boolean',
    ];

    public function society()
    {
        return $this->belongsTo(Society::class);
    }

    public function tower()
    {
        return $this->belongsTo(Tower::class);
    }
}
