<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CctvCameraRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'camera_group' => ['required', 'string', 'in:Main Gate,Basement Parking,Tower Lobby,Perimeter,Amenities'],
            'stream_url' => ['required', 'string', 'max:1024'],
            'tower_id' => ['nullable', 'integer', 'exists:towers,id'],
            'ip_address' => ['nullable', 'string', 'max:45'],
            'location_details' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'string', 'in:Online,Offline,Maintenance'],
            'is_recording' => ['sometimes', 'boolean'],
        ];
    }
}
