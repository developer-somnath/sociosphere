<?php

namespace App\Models;

use App\Models\Traits\BelongsToSociety;
use App\Models\Traits\HasPublicUuid;
use App\Models\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BillingRunHistory extends Model
{
    use BelongsToSociety, HasFactory, HasPublicUuid, LogsActivity;

    protected $fillable = [
        'society_id',
        'billing_period',
        'total_flats',
        'billed_flats',
        'excluded_flats',
        'skipped_flats',
        'subtotal',
        'tax_amount',
        'total_amount',
        'invoices_generated',
        'status',          // Completed | Partial | Failed
        'run_by',
        'notes',
    ];

    protected $casts = [
        'total_flats' => 'integer',
        'billed_flats' => 'integer',
        'excluded_flats' => 'integer',
        'skipped_flats' => 'integer',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'invoices_generated' => 'integer',
    ];

    public function society()
    {
        return $this->belongsTo(Society::class);
    }

    public function runBy()
    {
        return $this->belongsTo(User::class, 'run_by');
    }
}
