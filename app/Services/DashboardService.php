<?php

namespace App\Services;

use App\Models\Complaint;
use App\Models\Flat;
use App\Models\Notice;
use App\Models\Payment;
use App\Models\Resident;
use App\Models\Scopes\SocietyScope;
use App\Models\Tower;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;

class DashboardService
{
    /**
     * Aggregate the headline statistics for a society's dashboard.
     *
     * Society-bound users see their tenant. SuperAdmins receive an explicit
     * portfolio view across all societies.
     *
     * @return array<string, int>
     */
    public function stats(?int $societyId): array
    {
        $now = Carbon::now();

        return [
            'residents' => $this->forSociety(Resident::query(), $societyId)->count(),
            'flats' => $this->forSociety(Flat::query(), $societyId)->count(),
            'occupied_flats' => $this->forSociety(Flat::query(), $societyId)
                ->whereRaw('LOWER(occupancy_status) = ?', ['occupied'])
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
