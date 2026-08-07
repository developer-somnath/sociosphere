<?php

namespace App\Services;

use App\Models\Flat;
use App\Models\Tower;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class ModuleQueryService
{
    /**
     * Apply shared search and tenant scope logic for property modules.
     */
    public function applyPropertyFilters(Builder $query, array $filters, User $user): Builder
    {
        $query->when(! $user->isSuperAdmin(), function (Builder $scope) use ($user): void {
            $scope->where('society_id', $user->society_id);
        });

        if (! empty($filters['search'])) {
            $query->where(function (Builder $scope) use ($filters): void {
                $scope->whereLike('name', $filters['search'])
                    ->orWhereLike('flat_no', $filters['search']);
            });
        }

        if (! empty($filters['tower_id'])) {
            $query->where('tower_id', (int) $filters['tower_id']);
        }

        if (! empty($filters['status'])) {
            $query->where('occupancy_status', $filters['status']);
        }

        return $query;
    }

    /**
     * Build selection options for towers, scoped to the current user's society.
     *
     * @return array<int, array{id: int, label: string}>
     */
    public function towerOptions(User $user): array
    {
        $isSuperAdmin = $user->isSuperAdmin();

        return Tower::query()
            ->with('society')
            ->when(! $isSuperAdmin, function (Builder $query) use ($user): void {
                $query->where('society_id', $user->society_id);
            })
            ->orderBy('name')
            ->get()
            ->map(function (Tower $tower) use ($isSuperAdmin): array {
                return [
                    'id' => (int) $tower->id,
                    'label' => $isSuperAdmin
                        ? trim(($tower->society?->name ?? '').' · '.$tower->name)
                        : $tower->name,
                ];
            })
            ->all();
    }

    /**
     * Build selection options for flats, scoped to the current user's society.
     *
     * @return array<int, array{id: int, label: string}>
     */
    public function flatOptions(User $user): array
    {
        $isSuperAdmin = $user->isSuperAdmin();

        return Flat::query()
            ->with(['tower', 'society'])
            ->when(! $isSuperAdmin, function (Builder $query) use ($user): void {
                $query->where('society_id', $user->society_id);
            })
            ->orderBy('flat_no')
            ->get()
            ->map(function (Flat $flat) use ($isSuperAdmin): array {
                $label = $isSuperAdmin
                    ? trim(($flat->society?->name ?? '').' · '.($flat->tower?->name ?? '').' · '.$flat->flat_no)
                    : trim(($flat->tower?->name ?? '').' · '.$flat->flat_no);

                return [
                    'id' => (int) $flat->id,
                    'label' => $label,
                ];
            })
            ->all();
    }

    /**
     * Build a summary of occupancy stats for the current user scope.
     *
     * @return array{total_units: int, occupied_units: int, vacant_units: int, occupancy_rate: float}
     */
    public function occupancyStats(User $user): array
    {
        $query = Flat::query()->when(! $user->isSuperAdmin(), function (Builder $scope) use ($user): void {
            $scope->where('society_id', $user->society_id);
        });

        $totalUnits = (clone $query)->count();
        $occupiedUnits = (clone $query)->whereIn('occupancy_status', ['Occupied', 'Self-Occupied'])->count();
        $vacantUnits = (clone $query)->where('occupancy_status', 'Vacant')->count();

        return [
            'total_units' => $totalUnits,
            'occupied_units' => $occupiedUnits,
            'vacant_units' => $vacantUnits,
            'occupancy_rate' => $totalUnits > 0
                ? round(($occupiedUnits / $totalUnits) * 100, 1)
                : 0.0,
        ];
    }
}
