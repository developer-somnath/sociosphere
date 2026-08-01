<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'causer_id',
        'society_id',
        'module',
        'action',
        'entity_type',
        'entity_id',
        'properties',
        'old_values',
        'new_values',
        'remarks',
        'ip_address',
        'user_agent',
        'method',
        'request_url',
        'created_at',
    ];

    protected $casts = [
        'properties' => 'array',
        'old_values' => 'array',
        'new_values' => 'array',
        'created_at' => 'datetime',
    ];

    public function causer()
    {
        return $this->belongsTo(User::class, 'causer_id');
    }

    public function society()
    {
        return $this->belongsTo(Society::class);
    }
}
