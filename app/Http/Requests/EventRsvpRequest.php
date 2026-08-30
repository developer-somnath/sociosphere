<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EventRsvpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', 'in:attending,maybe,declined'],
            'guests_count' => ['nullable', 'integer', 'min:0', 'max:20'],
            'remarks' => ['nullable', 'string', 'max:500'],
        ];
    }
}
