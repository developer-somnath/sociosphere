<?php

namespace App\Services;

use App\Models\Amenity;
use App\Models\CctvCamera;
use App\Models\Complaint;
use App\Models\Flat;
use App\Models\Notice;
use App\Models\ParkingSlot;
use App\Models\Resident;
use App\Models\Society;
use App\Models\SubscriptionPlan;
use App\Models\SubscriptionPlanFeature;
use App\Models\Tower;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

/**
 * Dynamic SaaS resource entitlement engine (Phase 14 — Eagle).
 *
 * Maps the platform's countable resources to plan feature keys, computes
 * current usage per society and enforces plan limits on creation.
 */
class EntitlementService
{
    /**
     * Feature key => i18n label key used across the app.
     *
     * @return array<string, string>
     */
    public function featureKeys(): array
    {
        return [
            'towers' => 'feature.towers',
            'flats' => 'feature.flats',
            'residents' => 'feature.residents',
            'users' => 'feature.users',
            'amenities' => 'feature.amenities',
            'documents' => 'feature.documents',
            'notices' => 'feature.notices',
            'cctv_cameras' => 'feature.cctvCameras',
            'parking_slots' => 'feature.parkingSlots',
            'complaints' => 'feature.complaints',
        ];
    }

    /**
     * The fallback plan applied when a society has no live subscription.
     */
    public function defaultPlan(): ?SubscriptionPlan
    {
        return SubscriptionPlan::query()
            ->where('is_active', true)
            ->where('is_default', true)
            ->with('features')
            ->first();
    }

    /**
     * The plan currently governing a society: its live subscription plan,
     * falling back to the platform default plan.
     */
    public function planFor(int $societyId): ?SubscriptionPlan
    {
        $plan = app(SubscriptionService::class)->currentFor($societyId)?->plan;

        return $plan ?? $this->defaultPlan();
    }

    /**
     * Current raw usage counts per feature key for a society.
     *
     * Uses withoutGlobalScopes so counts reflect actual rows even when the
     * current request is scoped to a different society (SuperAdmin context).
     *
     * @return array<string, int>
     */
    public function usage(int $societyId): array
    {
        return [
            'towers' => Tower::withoutGlobalScopes()->where('society_id', $societyId)->count(),
            'flats' => Flat::withoutGlobalScopes()->where('society_id', $societyId)->count(),
            'residents' => Resident::withoutGlobalScopes()->where('society_id', $societyId)->count(),
            'users' => User::withoutGlobalScopes()->where('society_id', $societyId)->count(),
            'amenities' => Amenity::withoutGlobalScopes()->where('society_id', $societyId)->count(),
            'documents' => DB::table('society_documents')->where('society_id', $societyId)->count(),
            'notices' => Notice::withoutGlobalScopes()->where('society_id', $societyId)->count(),
            'cctv_cameras' => CctvCamera::withoutGlobalScopes()->where('society_id', $societyId)->count(),
            'parking_slots' => ParkingSlot::withoutGlobalScopes()->where('society_id', $societyId)->count(),
            'complaints' => Complaint::withoutGlobalScopes()->where('society_id', $societyId)->count(),
        ];
    }

    /**
     * Effective limits (feature key => int|null; null = unlimited).
     *
     * @return array<string, int|null>
     */
    public function limits(int $societyId): array
    {
        $plan = $this->planFor($societyId);

        if (! $plan) {
            // No plan and no default: deny nothing — allow everything.
            return array_fill_keys(array_keys($this->featureKeys()), null);
        }

        $limits = [];

        /** @var SubscriptionPlanFeature $feature */
        foreach ($plan->features as $feature) {
            $limits[$feature->feature_key] = $feature->limit_value;
        }

        // Any resource without an explicit limit is unlimited.
        foreach (array_keys($this->featureKeys()) as $key) {
            $limits[$key] ??= null;
        }

        return $limits;
    }

    /**
     * A per-feature snapshot: used/limit/remaining/pct/status.
     *
     * @return array<int, array<string, mixed>>
     */
    public function snapshot(int $societyId): array
    {
        $usage = $this->usage($societyId);
        $limits = $this->limits($societyId);
        $rows = [];

        foreach ($this->featureKeys() as $key => $label) {
            $used = $usage[$key] ?? 0;
            $limit = $limits[$key] ?? null;
            $remaining = $limit === null ? null : max(0, $limit - $used);
            $pct = $limit === null ? null : ($limit > 0 ? (int) round(($used / $limit) * 100) : ($used > 0 ? 100 : 0));

            $status = 'ok';
            if ($limit !== null) {
                if ($used > $limit) {
                    $status = 'over';
                } elseif ($used === $limit) {
                    $status = 'at';
                } elseif ($pct >= 80) {
                    $status = 'warn';
                }
            }

            $rows[] = [
                'key' => $key,
                'label' => $label,
                'used' => $used,
                'limit' => $limit,
                'remaining' => $remaining,
                'pct' => $pct,
                'status' => $status,
            ];
        }

        return $rows;
    }

    /**
     * Whether a society may still create a resource of the given feature.
     */
    public function isWithinLimit(int $societyId, string $feature): bool
    {
        $limit = $this->limits($societyId)[$feature] ?? null;

        return $limit === null || ($this->usage($societyId)[$feature] ?? 0) < $limit;
    }

    /**
     * Throw a ValidationException when the society has hit its plan limit.
     *
     * @throws ValidationException
     */
    public function assertWithinLimit(int $societyId, string $feature): void
    {
        if ($this->isWithinLimit($societyId, $feature)) {
            return;
        }

        $label = __($this->featureKeys()[$feature] ?? $feature);

        throw ValidationException::withMessages([
            'entitlement' => __('Subscription limit reached for :feature. Please upgrade your plan to continue.', [
                'feature' => $label,
            ]),
        ]);
    }
}
