<?php

namespace App\Models;

use App\Models\Traits\BelongsToSociety;
use App\Models\Traits\HasPublicUuid;
use App\Models\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SecurityLog extends Model
{
    use BelongsToSociety, HasFactory, HasPublicUuid, LogsActivity;

    protected $fillable = [
        'society_id',
        'guard_id',
        'event_type',
        'title',
        'description',
        'severity',
    ];

    public function society()
    {
        return $this->belongsTo(Society::class);
    }

    public function recordedBy()
    {
        return $this->belongsTo(User::class, 'guard_id');
    }
}
