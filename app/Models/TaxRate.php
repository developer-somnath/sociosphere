<?php

namespace App\Models;

use App\Models\Traits\HasPublicUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaxRate extends Model
{
    use HasFactory, HasPublicUuid;

    protected $fillable = [
        'tax_profile_id',
        'name',
        'code',
        'rate',
        'rate_percentage',
        'type',
        'fixed_amount',
        'is_compound',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'rate' => 'decimal:2',
        'fixed_amount' => 'decimal:2',
        'is_compound' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected $appends = ['rate_percentage', 'is_inclusive'];

    public function getRatePercentageAttribute(): float
    {
        return (float) ($this->attributes['rate'] ?? 0);
    }

    public function setRatePercentageAttribute($value): void
    {
        $this->attributes['rate'] = $value;
    }

    public function getIsInclusiveAttribute(): bool
    {
        return false;
    }

    public function taxProfile()
    {
        return $this->belongsTo(TaxProfile::class);
    }

    public function profile()
    {
        return $this->belongsTo(TaxProfile::class, 'tax_profile_id');
    }
}