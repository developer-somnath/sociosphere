<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\HasPublicUuid;

class Payment extends Model
{
    //
    use HasFactory, HasPublicUuid;
    protected $fillable = [
        'society_id',
        'invoice_id',
        'amount',
        'payment_method',
        'transaction_reference',
        'gateway_reference',
        'paid_at',
        'status',
    ];
}
