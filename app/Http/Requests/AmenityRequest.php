<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AmenityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'booking_type' => ['required', Rule::in(['Slot', 'Hourly', 'Daily'])],
            'capacity' => ['required', 'integer', 'min:1', 'max:1000'],
            'fee_per_slot' => ['required', 'numeric', 'min:0', 'max:100000'],
            'rules' => ['nullable', 'string', 'max:5000'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
