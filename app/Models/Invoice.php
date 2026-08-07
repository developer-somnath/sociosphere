<?php

namespace App\Models;

use App\Models\Traits\BelongsToSociety;
use App\Models\Traits\HasPublicUuid;
use App\Models\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use BelongsToSociety, HasFactory, HasPublicUuid, LogsActivity, SoftDeletes;

    protected $fillable = [
        'society_id',
        'flat_id',
        'invoice_number',
        'invoice_no',
        'billing_period',
        'billing_month',
        'billing_year',
        'issue_date',
        'due_date',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'penalty',
        'total_amount',
        'paid_amount',
        'status',
        'notes',
        'generated_by',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'due_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
    ];

    public function society()
    {
        return $this->belongsTo(Society::class);
    }

    public function flat()
    {
        return $this->belongsTo(Flat::class);
    }

    public function items()
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
