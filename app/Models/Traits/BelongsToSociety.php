<?php

namespace App\Models\Traits;

use App\Models\Scopes\SocietyScope;
use Illuminate\Database\Eloquent\Model;

/**
 * @mixin Model
 */
trait BelongsToSociety
{
    protected static function bootBelongsToSociety(): void
    {
        static::addGlobalScope(
            new SocietyScope()
        );

        static::creating(function ($model) {

            if (
                empty($model->society_id)
                && society_id()
            ) {
                $model->society_id =
                    society_id();
            }
        });
    }
}
