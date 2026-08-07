<?php

namespace App\Models;

use App\Models\Traits\BelongsToSociety;
use App\Models\Traits\HasPublicUuid;
use App\Models\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use BelongsToSociety, HasFactory, HasPublicUuid, LogsActivity;

    protected $fillable = [
        'society_id',
        'invoice_id',
        'flat_id',
        'payment_number',
        'amount',
        'payment_method',
        'transaction_reference',
        'gateway_reference',
        'paid_at',
        'status',
        'remarks',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function society()
    {
        return $this->belongsTo(Society::class);
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function flat()
    {
        return $this->belongsTo(Flat::class);
    }
}
