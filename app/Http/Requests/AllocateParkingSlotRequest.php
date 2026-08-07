<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AllocateParkingSlotRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'flat_id' => ['required', 'exists:flats,id'],
            'vehicle_number' => ['nullable', 'string', 'max:50'],
            'vehicle_model' => ['nullable', 'string', 'max:100'],
            'rfid_tag' => ['nullable', 'string', 'max:100'],
            'expires_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
