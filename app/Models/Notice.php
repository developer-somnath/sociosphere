<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\HasPublicUuid;

class Notice extends Model
{
    use HasFactory, HasPublicUuid;
    protected $fillable = [
        'society_id',
        'title',
        'description',
        'publish_from',
        'publish_to',
        'created_by',
    ];
}
