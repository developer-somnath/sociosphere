<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FamilyMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'relation' => ['required', Rule::in(['Spouse', 'Child', 'Parent', 'Sibling', 'Other'])],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'gender' => ['nullable', Rule::in(['Male', 'Female', 'Other'])],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'is_dependent' => ['sometimes', 'boolean'],
        ];
    }
}
