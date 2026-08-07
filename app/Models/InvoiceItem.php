<?php

namespace App\Models;

use App\Models\Traits\BelongsToSociety;
use App\Models\Traits\HasPublicUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoiceItem extends Model
{
    use BelongsToSociety, HasFactory, HasPublicUuid;

    protected $fillable = [
        'society_id',
        'invoice_id',
        'title',
        'description',
        'calculation_type',
        'unit_price',
        'quantity',
        'amount',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'quantity' => 'decimal:2',
        'amount' => 'decimal:2',
    ];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}
