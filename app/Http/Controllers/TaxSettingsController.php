<?php

namespace App\Http\Controllers;

use App\Models\TaxProfile;
use App\Models\TaxRate;
use App\Services\TaxEngineService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TaxSettingsController extends Controller
{
    /**
     * Display the tax configuration page.
     */
    public function edit(Request $request): Response
    {
        $societyId = $request->user()->society_id;

        $profile = TaxProfile::firstOrCreate(
            ['society_id' => $societyId],
            [
                'country' => 'India',
                'region' => 'Delhi',
                'tax_scheme' => 'GST',
                'currency_code' => 'INR',
                'currency_symbol' => '₹',
                'locale' => 'en',
                'rounding_mode' => 'round',
                'rounding_precision' => 2,
                'tax_registration_no' => '07AAAAA0000A1Z5',
                'is_active' => true,
            ]
        );

        $profile->load(['rates' => fn ($q) => $q->orderBy('sort_order')]);

        return Inertia::render('features/billing/pages/tax-settings', [
            'profile' => $profile,
            'schemes' => TaxProfile::schemes(),
            'roundingModes' => TaxProfile::roundingModes(),
        ]);
    }

    /**
     * Update the tax profile settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $societyId = $request->user()->society_id;
        $profile = TaxProfile::firstOrCreate(
            ['society_id' => $societyId],
            [
                'country' => 'India',
                'region' => 'Delhi',
                'tax_scheme' => 'GST',
                'currency_code' => 'INR',
                'currency_symbol' => '₹',
                'rounding_mode' => 'round',
                'rounding_precision' => 2,
                'is_active' => true,
            ]
        );

        $validated = $request->validate([
            'country' => ['required', 'string', 'max:100'],
            'region' => ['nullable', 'string', 'max:100'],
            'tax_scheme' => ['required', 'string', 'in:GST,VAT,Sales Tax,None'],
            'currency_code' => ['required', 'string', 'max:10'],
            'currency_symbol' => ['required', 'string', 'max:10'],
            'rounding_mode' => ['required', 'string', 'in:round,ceil,floor'],
            'rounding_precision' => ['required', 'integer', 'min:0', 'max:4'],
            'tax_registration_no' => ['nullable', 'string', 'max:50'],
            'is_active' => ['required', 'boolean'],
        ]);

        $profile->update($validated);

        return back()->with('success', 'Tax profile configuration updated successfully.');
    }

    /**
     * Store a new tax rate for the active tax profile.
     */
    public function storeRate(Request $request): RedirectResponse
    {
        $societyId = $request->user()->society_id;
        $profile = TaxProfile::where('society_id', $societyId)->firstOrFail();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:20'],
            'rate_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
            'is_compound' => ['boolean'],
            'is_inclusive' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $validated['rate'] = $validated['rate_percentage'];

        $profile->rates()->create($validated);

        return back()->with('success', 'Tax rate added successfully.');
    }

    /**
     * Update an existing tax rate.
     */
    public function updateRate(Request $request, TaxRate $rate): RedirectResponse
    {
        $societyId = $request->user()->society_id;
        if ($rate->taxProfile->society_id !== $societyId) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:20'],
            'rate_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
            'is_compound' => ['boolean'],
            'is_inclusive' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $validated['rate'] = $validated['rate_percentage'];

        $rate->update($validated);

        return back()->with('success', 'Tax rate updated successfully.');
    }

    /**
     * Remove a tax rate.
     */
    public function destroyRate(Request $request, TaxRate $rate): RedirectResponse
    {
        $societyId = $request->user()->society_id;
        if ($rate->taxProfile->society_id !== $societyId) {
            abort(403);
        }

        $rate->delete();

        return back()->with('success', 'Tax rate deleted successfully.');
    }

    /**
     * Preview tax calculation result for sandbox testing.
     */
    public function preview(Request $request, TaxEngineService $engine)
    {
        $subtotal = (float) $request->input('subtotal', 1000);
        $society = $request->user()->society;

        return response()->json($engine->calculateTax($society, $subtotal));
    }
}
