<?php

namespace App\Models\Traits;

use Illuminate\Support\Str;

trait HasPublicUuid
{
    protected static function bootHasPublicUuid()
    {
        static::creating(function ($model) {

            if (empty($model->uuid)) {

                $model->uuid =
                    (string) Str::uuid();

            }

        });
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }
}
