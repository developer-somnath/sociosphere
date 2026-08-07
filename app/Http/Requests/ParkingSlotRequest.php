<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ParkingSlotRequest extends FormRequest
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
            'slot_number' => ['required', 'string', 'max:50'],
            'type' => ['required', Rule::in(['Four Wheeler', 'Two Wheeler', 'Visitor'])],
            'status' => ['required', Rule::in(['Available', 'Allocated', 'Reserved', 'Maintenance'])],
            'tower_id' => ['nullable', 'exists:towers,id'],
            'flat_id' => ['nullable', 'exists:flats,id'],
            'vehicle_number' => ['nullable', 'string', 'max:50'],
            'vehicle_model' => ['nullable', 'string', 'max:100'],
            'rfid_tag' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
