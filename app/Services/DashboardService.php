<?php

namespace App\Services;

use App\Models\Complaint;
use App\Models\Flat;
use App\Models\Notice;
use App\Models\Payment;
use App\Models\Resident;
use App\Models\Tower;
use Illuminate\Support\Carbon;

class DashboardService
{
    /**
     * Aggregate the headline statistics for a society's dashboard.
     *
     * All queries are explicitly scoped by society id so the service remains
     * deterministic regardless of the request context (e.g. super-admin).
     *
     * @param  int  $societyId
     * @return array<string, int>
     */
    public function stats(int $societyId): array
    {
        $now = Carbon::now();

        return [
            'residents' => Resident::where('society_id', $societyId)->count(),
            'flats' => Flat::where('society_id', $societyId)->count(),
            'occupied_flats' => Flat::where('society_id', $societyId)
                ->whereRaw('LOWER(occupancy_status) = ?', ['occupied'])
                ->count(),
            'towers' => Tower::where('society_id', $societyId)->count(),
            'open_complaints' => Complaint::where('society_id', $societyId)
                ->whereIn('status', ['open', 'in_progress'])
                ->count(),
            'active_notices' => Notice::where('society_id', $societyId)
                ->where(fn ($query) => $query->whereNull('publish_from')->orWhere('publish_from', '<=', $now))
                ->where(fn ($query) => $query->whereNull('publish_to')->orWhere('publish_to', '>=', $now))
                ->count(),
            'pending_payments' => Payment::where('society_id', $societyId)
                ->where('status', 'pending')
                ->count(),
        ];
    }
}
