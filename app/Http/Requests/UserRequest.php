<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserRequest extends FormRequest
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
        $user = $this->user();
        $userId = $this->route('user')?->id;

        $isSuperAdmin = $user->isSuperAdmin();

        // Assignable roles are DB-driven so custom roles are always available.
        // Only super admins may assign the SuperAdmin role.
        $assignableRoles = \App\Models\Role::query()
            ->when(! $isSuperAdmin, fn ($query) => $query->where('name', '!=', 'SuperAdmin'))
            ->pluck('name')
            ->all();

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')
                    ->whereNull('deleted_at')
                    ->ignore($userId),
            ],
            'phone' => ['nullable', 'string', 'max:20'],
            'password' => $this->isMethod('post')
                ? ['required', 'string', 'min:8', 'confirmed']
                : ['nullable', 'string', 'min:8', 'confirmed'],
            'role' => ['required', 'string', Rule::in($assignableRoles)],
            'society_id' => Rule::when(
                $this->input('role') === 'SuperAdmin' || ! $isSuperAdmin,
                'prohibited',
                ['required', 'integer', Rule::exists('societies', 'id')],
            ),
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Get custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.unique' => 'A user with this email already exists.',
            'password.required' => 'A password is required.',
            'password.min' => 'The password must be at least 8 characters.',
            'role.in' => 'The selected role is not assignable.',
            'society_id.required' => 'Please select a society.',
        ];
    }
}
