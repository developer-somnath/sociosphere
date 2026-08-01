<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasPublicUuid;
use App\Models\Traits\LogsActivity;

class ComplaintCategory extends Model
{
    //
    use HasFactory, HasPublicUuid, LogsActivity;
    protected $fillable = [
        'society_id',
        'name',
    ];
}
