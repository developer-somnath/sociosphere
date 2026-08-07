<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AmenityBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amenity_id' => ['required', 'exists:amenities,id'],
            'flat_id' => ['required', 'exists:flats,id'],
            'resident_id' => ['required', 'exists:residents,id'],
            'booking_date' => ['required', 'date', 'after_or_equal:today'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'booking_date.after_or_equal' => 'Booking date cannot be in the past.',
            'end_time.after' => 'End time must be after start time.',
        ];
    }
}
