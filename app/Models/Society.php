<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\HasPublicUuid;
use App\Models\Traits\LogsActivity;

class Society extends Model
{
    use HasFactory, HasPublicUuid, LogsActivity;

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
