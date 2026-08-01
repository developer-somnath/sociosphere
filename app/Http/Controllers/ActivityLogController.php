<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ActivityLogController extends Controller
{
    /**
     * Display a paginated, searchable and filterable audit trail.
     *
     * Society-bound users (e.g. society admins) only see their own
     * society's logs; super admins see every society's logs.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ActivityLog::class);

        $filters = $this->validatedFilters($request);

        $logs = $this->baseQuery($request, $filters)
            ->latest('created_at')
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        $scoped = $this->baseQuery($request, $filters);

        return Inertia::render('features/activity-logs/pages/index', [
            'logs' => $logs,
            'filters' => $filters,
            'filterOptions' => [
                'modules' => (clone $scoped)
                    ->select('module')
                    ->distinct()
                    ->orderBy('module')
                    ->pluck('module'),
                'actions' => (clone $scoped)
                    ->select('action')
                    ->distinct()
                    ->orderBy('action')
                    ->pluck('action'),
                'causers' => $this->causerOptions($scoped),
            ],
            'stats' => [
                'today' => (clone $scoped)
                    ->whereDate('created_at', today())
                    ->count(),
            ],
        ]);
    }

    /**
     * Export the filtered audit trail as a CSV download.
     */
    public function export(Request $request): StreamedResponse
    {
        $this->authorize('viewAny', ActivityLog::class);

        $filters = $this->validatedFilters($request);

        $logs = $this->baseQuery($request, $filters)
            ->with(['causer:id,name,email', 'society:id,name'])
            ->latest('created_at')
            ->latest('id')
            ->get();

        $filename = 'activity-logs-' . now()->format('Ymd-His') . '.csv';

        return response()->streamDownload(function () use ($logs) {
            $out = fopen('php://output', 'w');

            // UTF-8 BOM so Excel opens the file with correct encoding.
            fwrite($out, "\xEF\xBB\xBF");

            fputcsv($out, [
                'Timestamp', 'User', 'Email', 'Society', 'Module', 'Action',
                'Entity', 'Entity ID', 'Remarks', 'IP Address', 'Method',
                'URL', 'Properties', 'Old Values', 'New Values', 'User Agent',
            ]);

            foreach ($logs as $log) {
                fputcsv($out, [
                    $log->created_at?->toDateTimeString(),
                    $log->causer?->name ?? 'System',
                    $log->causer?->email ?? '',
                    $log->society?->name ?? '',
                    $log->module,
                    $log->action,
                    class_basename((string) $log->entity_type),
                    $log->entity_id,
                    $log->remarks,
                    $log->ip_address,
                    $log->method,
                    $log->request_url,
                    json_encode($log->properties),
                    json_encode($log->old_values),
                    json_encode($log->new_values),
                    $log->user_agent,
                ]);
            }

            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    /**
     * Shared, tenant-scoped query with search + filters applied.
     */
    private function baseQuery(Request $request, array $filters): Builder
    {
        $query = ActivityLog::query()
            ->with(['causer:id,name,email', 'society:id,name'])
            ->when(! $request->user()->isSuperAdmin(), function (Builder $query) use ($request) {
                $query->where('society_id', $request->user()->society_id);
            });

        if ($filters['search'] !== '') {
            $query->where(function (Builder $query) use ($filters) {
                $query->whereLike('remarks', $filters['search'])
                    ->orWhereLike('module', $filters['search'])
                    ->orWhereLike('action', $filters['search'])
                    ->orWhereLike('entity_type', $filters['search'])
                    ->orWhere('entity_id', $filters['search'])
                    ->orWhereLike('request_url', $filters['search'])
                    ->orWhereHas('causer', function (Builder $query) use ($filters) {
                        $query->whereLike('name', $filters['search'])
                            ->orWhereLike('email', $filters['search']);
                    });
            });
        }

        if ($filters['module'] !== null) {
            $query->where('module', $filters['module']);
        }

        if ($filters['action'] !== null) {
            $query->where('action', $filters['action']);
        }

        if ($filters['causer_id'] !== null) {
            $query->where('causer_id', $filters['causer_id']);
        }

        if ($filters['date_from'] !== null) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if ($filters['date_to'] !== null) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return $query;
    }

    /**
     * Normalize and validate the query string filter values.
     *
     * @return array{search: string, module: ?string, action: ?string, causer_id: ?int, date_from: ?string, date_to: ?string}
     */
    private function validatedFilters(Request $request): array
    {
        $data = Validator::make($request->query(), [
            'search' => ['nullable', 'string', 'max:100'],
            'module' => ['nullable', 'string', 'max:60'],
            'action' => ['nullable', 'string', 'max:60'],
            'causer_id' => ['nullable', 'integer'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
        ])->validate();

        return [
            'search' => trim((string) ($data['search'] ?? '')),
            'module' => $data['module'] ?? null,
            'action' => $data['action'] ?? null,
            'causer_id' => isset($data['causer_id']) ? (int) $data['causer_id'] : null,
            'date_from' => $data['date_from'] ?? null,
            'date_to' => $data['date_to'] ?? null,
        ];
    }

    /**
     * Users that appear as log causers within the scoped log set.
     *
     * @return array<int, array{id: int, name: string}>
     */
    private function causerOptions(Builder $scoped): array
    {
        $causerIds = (clone $scoped)
            ->whereNotNull('causer_id')
            ->distinct()
            ->pluck('causer_id');

        return User::query()
            ->whereIn('id', $causerIds)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (User $user) => [
                'id' => (int) $user->id,
                'name' => $user->name,
            ])
            ->values()
            ->all();
    }
}
