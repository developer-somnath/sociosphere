<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\HasPublicUuid;
use App\Models\Traits\LogsActivity;

class InvoiceItem extends Model
{
    use HasFactory, HasPublicUuid, LogsActivity;
    protected $fillable = [
        'invoice_id',
        'head_id',
        'description',
        'amount',
    ];
}
