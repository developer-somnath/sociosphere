<?php

namespace App\Models;

use App\Models\Traits\BelongsToSociety;
use App\Models\Traits\HasPublicUuid;
use App\Models\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaxProfile extends Model
{
    use BelongsToSociety, HasFactory, HasPublicUuid, LogsActivity;

    protected $fillable = [
        'society_id',
        'country',
        'region',
        'tax_scheme',
        'currency_code',
        'currency_symbol',
        'locale',
        'rounding_mode',
        'rounding_precision',
        'tax_registration_no',
        'is_active',
    ];

    protected $casts = [
        'rounding_precision' => 'integer',
        'is_active' => 'boolean',
    ];

    public function society()
    {
        return $this->belongsTo(Society::class);
    }

    public function rates()
    {
        return $this->hasMany(TaxRate::class)->orderBy('sort_order');
    }

    public function activeRates()
    {
        return $this->hasMany(TaxRate::class)
            ->where('is_active', true)
            ->orderBy('sort_order');
    }

    /**
     * The tax schemes supported by the engine.
     *
     * @return array<int, string>
     */
    public static function schemes(): array
    {
        return ['GST', 'VAT', 'Sales Tax', 'None'];
    }

    /**
     * The rounding modes supported by the engine.
     *
     * @return array<int, string>
     */
    public static function roundingModes(): array
    {
        return ['round', 'ceil', 'floor'];
    }
}