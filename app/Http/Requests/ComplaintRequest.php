<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ComplaintRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isUpdate = $this->isMethod('PUT') || $this->isMethod('PATCH');

        $rules = [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:5000'],
            'priority' => ['required', Rule::in(['Low', 'Medium', 'High', 'Critical'])],
        ];

        if (! $isUpdate) {
            // Create-only fields
            $rules['flat_id'] = ['required', 'exists:flats,id'];
            $rules['resident_id'] = ['required', 'exists:residents,id'];
            $rules['category_id'] = ['required', 'exists:complaint_categories,id'];
        }

        if ($isUpdate) {
            $rules['status'] = ['sometimes', Rule::in(['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'])];
            $rules['assigned_to'] = ['nullable', 'exists:users,id'];
            $rules['category_id'] = ['sometimes', 'exists:complaint_categories,id'];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'flat_id.required' => 'Please select a flat.',
            'resident_id.required' => 'Please select the reporting resident.',
            'category_id.required' => 'Please select a complaint category.',
        ];
    }
}
