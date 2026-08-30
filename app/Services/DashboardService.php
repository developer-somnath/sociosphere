<?php

namespace App\Services;

use App\Models\AmenityBooking;
use App\Models\CctvCamera;
use App\Models\Complaint;
use App\Models\Flat;
use App\Models\Invoice;
use App\Models\Notice;
use App\Models\Payment;
use App\Models\Resident;
use App\Models\Scopes\SocietyScope;
use App\Models\SecurityLog;
use App\Models\Tower;
use App\Models\User;
use App\Models\VisitorPass;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;

class DashboardService
{
    /**
     * Aggregate role-scoped headline statistics and dashboard telemetry.
     *
     * @return array<string, mixed>
     */
    public function stats(?int $societyId, ?User $user = null): array
    {
        $now = Carbon::now();
        $isResidentOnly = $user !== null
            && $user->hasRole('Resident')
            && ! $user->hasAnyRole(['SuperAdmin', 'SocietyAdmin', 'Treasurer', 'SecurityManager']);
        $isSecurityOnly = $user !== null
            && $user->hasRole('SecurityGuard')
            && ! $user->hasAnyRole(['SuperAdmin', 'SocietyAdmin', 'Treasurer']);

        // ── 1. Resident Scoped Telemetry ──────────────────────────────────────────
        if ($isResidentOnly) {
            $residentProfile = Resident::query()
                ->where('email', $user->email)
                ->with(['flat.tower'])
                ->first();

            $flatIds = Resident::query()
                ->where('email', $user->email)
                ->pluck('flat_id')
                ->filter()
                ->unique()
                ->toArray();

            $myUnpaidInvoices = Invoice::query()
                ->whereIn('flat_id', $flatIds)
                ->where('status', '!=', 'Paid');

            $myBalanceDue = (float) (clone $myUnpaidInvoices)->sum('total_amount') - (float) (clone $myUnpaidInvoices)->sum('paid_amount');

            $residentIds = Resident::query()
                ->where('email', $user->email)
                ->pluck('id')
                ->toArray();

            $myOpenComplaints = Complaint::query()
                ->where('society_id', $societyId)
                ->where(function ($q) use ($residentIds, $flatIds) {
                    $q->whereIn('resident_id', $residentIds)
                        ->orWhereIn('flat_id', $flatIds);
                })
                ->whereIn('status', ['Open', 'Assigned', 'In Progress'])
                ->count();

            $myActiveBookings = AmenityBooking::query()
                ->where('society_id', $societyId)
                ->where(function ($q) use ($residentIds, $flatIds) {
                    $q->whereIn('resident_id', $residentIds)
                        ->orWhereIn('flat_id', $flatIds);
                })
                ->whereIn('status', ['Approved', 'Pending'])
                ->where('booking_date', '>=', $now->toDateString())
                ->count();

            $activeNotices = $this->forSociety(Notice::query(), $societyId)
                ->where(fn ($q) => $q->whereNull('publish_from')->orWhere('publish_from', '<=', $now))
                ->where(fn ($q) => $q->whereNull('publish_to')->orWhere('publish_to', '>=', $now))
                ->count();

            return [
                'is_resident_dashboard' => true,
                'my_flat_no' => $residentProfile?->flat?->flat_no ?? '—',
                'my_tower_name' => $residentProfile?->flat?->tower?->name ?? '—',
                'my_flat_type' => $residentProfile?->flat?->flat_type ?? '—',
                'my_ownership_type' => $residentProfile?->flat?->ownership_type ?? 'Resident',
                'my_balance_due' => (float) $myBalanceDue,
                'my_open_complaints' => $myOpenComplaints,
                'my_active_bookings' => $myActiveBookings,
                'active_notices' => $activeNotices,
                // Fallbacks
                'residents' => 0,
                'flats' => 0,
                'occupied_flats' => 0,
                'towers' => 0,
                'open_complaints' => $myOpenComplaints,
                'pending_payments' => 0,
            ];
        }

        // ── 2. Security Guard Scoped Telemetry ────────────────────────────────────
        if ($isSecurityOnly) {
            $todayVisitors = VisitorPass::query()
                ->where('society_id', $societyId)
                ->whereDate('created_at', $now->toDateString())
                ->count();

            $activeCctv = CctvCamera::query()
                ->where('society_id', $societyId)
                ->whereIn('status', ['Online', 'online'])
                ->count();

            $emergencyLogs = SecurityLog::query()
                ->where('society_id', $societyId)
                ->where('severity', 'Critical')
                ->where('created_at', '>=', $now->copy()->subHours(24))
                ->count();

            return [
                'is_security_dashboard' => true,
                'today_visitors' => $todayVisitors,
                'active_cctv' => $activeCctv,
                'emergency_logs' => $emergencyLogs,
                'active_notices' => $this->forSociety(Notice::query(), $societyId)->count(),
                'residents' => 0,
                'flats' => 0,
                'occupied_flats' => 0,
                'towers' => 0,
                'open_complaints' => 0,
                'pending_payments' => 0,
            ];
        }

        // ── 3. Society Admin / Treasurer / Super Admin Telemetry ──────────────────
        return [
            'is_resident_dashboard' => false,
            'residents' => $this->forSociety(Resident::query(), $societyId)->count(),
            'flats' => $this->forSociety(Flat::query(), $societyId)->count(),
            'occupied_flats' => $this->forSociety(Flat::query(), $societyId)
                ->whereRaw('LOWER(occupancy_status) LIKE ?', ['%occupied%'])
                ->count(),
            'towers' => $this->forSociety(Tower::query(), $societyId)->count(),
            'open_complaints' => $this->forSociety(Complaint::query(), $societyId)
                ->whereIn('status', ['Open', 'Assigned', 'In Progress'])
                ->count(),
            'active_notices' => $this->forSociety(Notice::query(), $societyId)
                ->where(fn ($query) => $query->whereNull('publish_from')->orWhere('publish_from', '<=', $now))
                ->where(fn ($query) => $query->whereNull('publish_to')->orWhere('publish_to', '>=', $now))
                ->count(),
            'pending_payments' => $this->forSociety(Payment::query(), $societyId)
                ->whereIn('status', ['Pending', 'Failed'])
                ->count(),
        ];
    }

    private function forSociety(Builder $query, ?int $societyId): Builder
    {
        return $query
            ->withoutGlobalScope(SocietyScope::class)
            ->when(
                $societyId !== null,
                fn (Builder $query) => $query->where('society_id', $societyId),
            );
    }
}
