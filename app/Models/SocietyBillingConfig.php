<?php

namespace App\Models;

use App\Models\Traits\BelongsToSociety;
use App\Models\Traits\HasPublicUuid;
use App\Models\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SocietyBillingConfig extends Model
{
    use BelongsToSociety, HasFactory, HasPublicUuid, LogsActivity;

    protected $fillable = [
        'society_id',
        'billing_mode',     // per_sqft | fixed
        'base_rate',
        'tax_rate',
        'due_day',
        'grace_days',
        'penalty_rate',
        'penalty_cap',
        'is_active',
    ];

    protected $casts = [
        'base_rate' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'due_day' => 'integer',
        'grace_days' => 'integer',
        'penalty_rate' => 'decimal:2',
        'penalty_cap' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function society()
    {
        return $this->belongsTo(Society::class);
    }

    /**
     * The modes supported by the auto-billing engine.
     *
     * @return array<int, string>
     */
    public static function modes(): array
    {
        return ['per_sqft', 'fixed'];
    }
}
