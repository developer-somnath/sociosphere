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
        // The route binds {resident} by its uuid; resolve the underlying
        // numeric id so the uniqueness check is scoped to that resident.
        $residentId = $this->resolveResidentId();

        // On update the route also binds {familyMember}; ignore the row
        // being edited so re-saving the same name is allowed.
        $ignoreId = $this->resolveFamilyMemberId();

        $unique = Rule::unique('family_members', 'name')
            ->where('resident_id', $residentId);

        if ($ignoreId !== null) {
            $unique->ignore($ignoreId);
        }

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                $unique,
            ],
            'relation' => ['required', Rule::in(['Spouse', 'Child', 'Parent', 'Sibling', 'Other'])],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'gender' => ['nullable', Rule::in(['Male', 'Female', 'Other'])],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'is_dependent' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * Resolve the resident id from the {resident} route binding.
     *
     * Laravel implicitly binds the route param to a Resident model, but the
     * param may also arrive as the raw uuid string or a numeric id.
     */
    protected function resolveResidentId(): ?int
    {
        $param = $this->route('resident');

        if ($param === null) {
            return null;
        }

        if ($param instanceof \App\Models\Resident) {
            return $param->id;
        }

        if (is_numeric($param)) {
            return (int) $param;
        }

        $resident = \App\Models\Resident::where('uuid', $param)->first();

        return $resident?->id;
    }

    /**
     * Resolve the family member id from the {familyMember} route binding
     * (present only on update). Returns null when creating.
     */
    protected function resolveFamilyMemberId(): ?int
    {
        $param = $this->route('familyMember');

        if ($param === null) {
            return null;
        }

        if ($param instanceof \App\Models\FamilyMember) {
            return $param->id;
        }

        if (is_numeric($param)) {
            return (int) $param;
        }

        $member = \App\Models\FamilyMember::where('uuid', $param)->first();

        return $member?->id;
    }
}
