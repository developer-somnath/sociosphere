<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SecurityLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'event_type' => ['required', 'string', 'in:Shift Handover,Incident Report,Blacklist Alert,Gate Trigger,Patrol Check'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'severity' => ['required', 'string', 'in:Low,Medium,High,Critical'],
        ];
    }
}
