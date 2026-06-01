<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasPublicUuid;

class ComplaintCategory extends Model
{
    //
    use HasFactory, HasPublicUuid;
    protected $fillable = [
        'society_id',
        'name',
    ];
}
