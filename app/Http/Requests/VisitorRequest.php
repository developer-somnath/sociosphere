<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VisitorRequest extends FormRequest
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
        $user = $this->user();
        $isSuperAdmin = $user->isSuperAdmin();

        // The flat being visited must belong to the user's society, unless
        // the user is a super admin (who can manage any society).
        $flatExists = Rule::exists('flats', 'id')->whereNull('deleted_at');

        if (! $isSuperAdmin) {
            $flatExists->where('society_id', $user->society_id);
        }

        return [
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'phone' => [
                'required',
                'string',
                'max:20',
            ],
            'email' => [
                'nullable',
                'email',
                'max:255',
            ],
            'notes' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'flat_id' => [
                'required',
                'integer',
                $flatExists,
            ],
            'purpose' => [
                'required',
                'string',
                'max:100',
            ],
            'vehicle_number' => [
                'nullable',
                'string',
                'max:20',
            ],
            'scheduled_for' => [
                'nullable',
                'date',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'The visitor name is required.',
            'phone.required' => 'The visitor phone number is required.',
            'flat_id.required' => 'Please select the flat being visited.',
            'flat_id.exists' => 'The selected flat is not valid for your society.',
            'purpose.required' => 'The purpose of the visit is required.',
            'scheduled_for.date' => 'Please enter a valid visit date.',
        ];
    }
}
