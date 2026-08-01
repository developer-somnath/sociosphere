<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TowerRequest extends FormRequest
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

        // Uniqueness is scoped to the society: the user's own society for
        // society-bound roles, or the society chosen in the request for
        // super admins.
        $societyId = $this->input('society_id', $user->society_id);

        $unique = Rule::unique('towers', 'name')
            ->where(function ($query) use ($societyId) {
                $query->where('society_id', $societyId)
                    ->whereNull('deleted_at');
            });

        if ($this->route('tower')) {
            $unique->ignore($this->route('tower')->id);
        }

        $rules = [
            'name' => [
                'required',
                'string',
                'max:255',
                $unique,
            ],
        ];

        // Super admins are not bound to a society and must pick one.
        if ($user->isSuperAdmin()) {
            $rules['society_id'] = [
                'required',
                'integer',
                Rule::exists('societies', 'id'),
            ];
        }

        return $rules;
    }

    /**
     * Messages for the validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.unique' => 'A tower with this name already exists in your society.',
        ];
    }
}
