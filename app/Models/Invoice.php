<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasPublicUuid;

class Invoice extends Model
{
    use HasFactory, HasPublicUuid;
    protected $fillable = [
        'society_id',
        'flat_id',
        'invoice_no',
        'billing_month',
        'billing_year',
        'due_date',
        'subtotal',
        'penalty',
        'total_amount',
        'status',
        'generated_by',
    ];
}
