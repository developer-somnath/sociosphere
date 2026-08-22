<?php

namespace App\Http\Controllers;

use App\Http\Requests\FamilyMemberRequest;
use App\Models\FamilyMember;
use App\Models\Resident;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FamilyMemberController extends Controller
{
    /**
     * Store a new family member for the given resident.
     */
    public function store(FamilyMemberRequest $request, Resident $resident): RedirectResponse
    {
        $this->authorize('create', FamilyMember::class);
        $this->authorize('update', $resident);

        $resident->familyMembers()->create([
            ...$request->validated(),
            'society_id' => $resident->society_id,
            'is_dependent' => $request->boolean('is_dependent', true),
        ]);

        return redirect()
            ->route('residents.edit', $resident->uuid)
            ->with('success', 'Family member added successfully.');
    }

    /**
     * Update the specified family member.
     */
    public function update(FamilyMemberRequest $request, Resident $resident, FamilyMember $familyMember): RedirectResponse
    {
        $this->authorize('update', $familyMember);

        $familyMember->update([
            ...$request->validated(),
            'is_dependent' => $request->boolean('is_dependent', $familyMember->is_dependent),
        ]);

        return redirect()
            ->route('residents.edit', $resident->uuid)
            ->with('success', 'Family member updated successfully.');
    }

    /**
     * Remove the specified family member.
     */
    public function destroy(Request $request, Resident $resident, FamilyMember $familyMember): RedirectResponse
    {
        $this->authorize('delete', $familyMember);

        $familyMember->delete();

        return redirect()
            ->route('residents.edit', $resident->uuid)
            ->with('success', 'Family member removed successfully.');
    }
}
