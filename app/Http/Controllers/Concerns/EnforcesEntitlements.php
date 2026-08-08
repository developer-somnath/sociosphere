<?php

namespace App\Http\Controllers\Concerns;

use App\Services\EntitlementService;
use Illuminate\Validation\ValidationException;

/**
 * Enforces the subscription entitlement engine at resource creation points
 * (Phase 14 — Eagle). Controllers use `$this->enforceEntitlement('towers')`
 * inside their store() flow; when the society has reached its plan limit a
 * ValidationException is raised and the request redirects back with an error.
 */
trait EnforcesEntitlements
{
    /**
     * Abort the request when the current society has exhausted its entitlement
     * for the given resource feature.
     *
     * @throws ValidationException
     */
    protected function enforceEntitlement(string $feature): void
    {
        $societyId = society_id() ?? auth()->user()?->society_id;

        if ($societyId === null) {
            return; // platform context without a selected society: skip
        }

        app(EntitlementService::class)->assertWithinLimit((int) $societyId, $feature);
    }
}
