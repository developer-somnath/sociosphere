<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasPublicUuid;

class Complaint extends Model
{
    use HasFactory, HasPublicUuid;
    //
    protected $fillable = [
        'society_id',
        'flat_id',
        'resident_id',
        'category_id',
        'title',
        'description',
        'priority',
        'status',
        'assigned_to',
        'resolved_at',
    ];
}
