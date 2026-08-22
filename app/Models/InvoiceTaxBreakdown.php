<?php

namespace App\Models;

use App\Models\Traits\HasPublicUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoiceTaxBreakdown extends Model
{
    use HasFactory, HasPublicUuid;

    protected $fillable = [
        'invoice_id',
        'tax_name',
        'tax_code',
        'rate',
        'taxable_amount',
        'tax_amount',
        'sort_order',
    ];

    protected $casts = [
        'rate' => 'decimal:2',
        'taxable_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'sort_order' => 'integer',
    ];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}