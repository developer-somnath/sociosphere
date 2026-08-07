<?php

namespace App\Models;

use App\Models\Traits\BelongsToSociety;
use App\Models\Traits\HasPublicUuid;
use App\Models\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoicePenalty extends Model
{
    use BelongsToSociety, HasFactory, HasPublicUuid, LogsActivity;

    protected $fillable = [
        'society_id',
        'invoice_id',
        'penalty_amount',
        'applied_on',
        'billing_period',
        'reason',
    ];

    protected $casts = [
        'penalty_amount' => 'decimal:2',
        'applied_on' => 'date',
    ];

    public function society()
    {
        return $this->belongsTo(Society::class);
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}
