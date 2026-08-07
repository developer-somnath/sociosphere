<?php

namespace App\Models;

use App\Models\Traits\BelongsToSociety;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffProfile extends Model
{
    use BelongsToSociety, HasFactory;

    protected $fillable = [
        'society_id',
        'user_id',
        'department',
        'designation',
        'emergency_phone',
        'shift',
        'joining_date',
        'status',
    ];

    protected $casts = [
        'joining_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
