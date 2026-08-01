<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ResidentRequest extends FormRequest
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
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $flatRule = $this->user()->isSuperAdmin()
            ? Rule::exists('flats', 'id')
            : Rule::exists('flats', 'id')
                ->where('society_id', $this->user()->society_id);

        return [
            'flat_id' => [
                'required',
                'integer',
                $flatRule,
            ],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'gender' => ['nullable', Rule::in(['Male', 'Female', 'Other'])],
            'occupation' => ['nullable', 'string', 'max:255'],
            'is_primary_contact' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * Messages for the validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'flat_id.exists' => 'The selected flat does not belong to your society.',
        ];
    }
}
