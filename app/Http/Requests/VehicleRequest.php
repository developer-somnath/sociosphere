<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vehicle_number' => ['nullable', 'string', 'max:20'],
            'vehicle_model' => ['nullable', 'string', 'max:255'],
            'vehicle_type' => ['sometimes', Rule::in(['Car', 'Bike', 'SUV', 'Other'])],
            'parking_slot' => ['nullable', 'string', 'max:50'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
