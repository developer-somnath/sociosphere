<?php

namespace App\Models;

use App\Models\Traits\HasPublicUuid;
use App\Models\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Society extends Model
{
    use HasFactory, HasPublicUuid, LogsActivity, SoftDeletes;

    protected $fillable = [
        'name',
        'registration_no',
        'address',
        'city',
        'state',
        'country',
        'postal_code',
        'phone',
        'email',
        'status',
    ];

    public function towers()
    {
        return $this->hasMany(Tower::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
