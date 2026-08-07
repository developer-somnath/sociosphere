<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class NoticeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:100'],
            'is_pinned' => ['sometimes', 'boolean'],
            'target_audience' => ['required', Rule::in(['All', 'Owners', 'Tenants'])],
            'description' => ['required', 'string', 'max:10000'],
            'publish_from' => ['nullable', 'date'],
            'publish_to' => ['nullable', 'date', 'after_or_equal:publish_from'],
            'attachments' => ['nullable', 'array'],
            'attachments.*' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Please provide a notice title.',
            'description.required' => 'Please provide the notice content.',
            'target_audience.required' => 'Please select the target audience.',
            'publish_to.after_or_equal' => 'End date must be on or after the start date.',
        ];
    }
}