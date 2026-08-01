<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FlatRequest extends FormRequest
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

        // Flat numbers must be unique within a tower. Soft-deleted flats
        // don't count, so the number can be reused after removal.
        $flatNoUnique = Rule::unique('flats', 'flat_no')
            ->where(function ($query) {
                $query->where('tower_id', $this->input('tower_id'))
                    ->whereNull('deleted_at');
            });

        if ($this->route('flat')) {
            $flatNoUnique->ignore($this->route('flat')->id);
        }

        // The chosen tower must belong to the user's society, unless the
        // user is a super admin (who can manage any society).
        $towerExists = Rule::exists('towers', 'id');

        if (! $isSuperAdmin) {
            $towerExists->where(function ($query) use ($user) {
                $query->where('society_id', $user->society_id)
                    ->whereNull('deleted_at');
            });
        }

        return [
            'tower_id' => [
                'required',
                'integer',
                $towerExists,
            ],
            'flat_no' => [
                'required',
                'string',
                'max:50',
                $flatNoUnique,
            ],
            'floor_no' => [
                'nullable',
                'integer',
                'min:0',
                'max:100',
            ],
            'flat_type' => [
                'nullable',
                'string',
                'max:50',
            ],
            'area_sqft' => [
                'nullable',
                'integer',
                'min:1',
                'max:100000',
            ],
            'ownership_type' => [
                'required',
                Rule::in(['Owner', 'Tenant']),
            ],
            'occupancy_status' => [
                'required',
                Rule::in(['Occupied', 'Vacant', 'Self-Occupied']),
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
            'flat_no.unique' => 'A flat with this number already exists in the selected tower.',
        ];
    }
}
