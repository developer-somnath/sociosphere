<?php

namespace App\Http\Controllers;

use App\Http\Requests\SecurityLogRequest;
use App\Models\SecurityLog;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SecurityLogController extends Controller
{
    /**
     * Display a paginated, filterable guard logbook and incident history.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', SecurityLog::class);

        $search = trim((string) $request->query('search', ''));
        $eventType = $request->query('event_type');
        $severity = $request->query('severity');
        $sortBy = in_array($request->query('sort_by'), ['title', 'event_type', 'severity', 'created_at'], true)
            ? $request->query('sort_by')
            : null;
        $sortDir = strtolower((string) $request->query('sort_dir')) === 'asc' ? 'asc' : 'desc';

        $query = SecurityLog::query()
            ->with(['recordedBy'])
            ->when($search !== '', function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($eventType !== null && $eventType !== '', function ($q) use ($eventType) {
                $q->where('event_type', $eventType);
            })
            ->when($severity !== null && $severity !== '', function ($q) use ($severity) {
                $q->where('severity', $severity);
            });

        $logs = $query
            ->when($sortBy !== null, function ($q) use ($sortBy, $sortDir) {
                $q->orderBy($sortBy, $sortDir);
            })
            ->when($sortBy === null, function ($q) {
                $q->latest('id');
            })
            ->paginate(15)
            ->withQueryString();

        $stats = [
            'total' => SecurityLog::count(),
            'incidents' => SecurityLog::where('event_type', 'Incident Report')->count(),
            'critical' => SecurityLog::where('severity', 'Critical')->count(),
            'handovers' => SecurityLog::where('event_type', 'Shift Handover')->count(),
        ];

        return Inertia::render('features/security-logs/pages/index', [
            'logs' => $logs,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'event_type' => $eventType !== '' ? $eventType : null,
                'severity' => $severity !== '' ? $severity : null,
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
            'can' => [
                'create' => $request->user()->hasPermissionTo('security_log.create'),
            ],
        ]);
    }

    /**
     * Store a new security log entry or incident report.
     */
    public function store(SecurityLogRequest $request): RedirectResponse
    {
        $this->authorize('create', SecurityLog::class);

        $societyId = $request->user()->society_id ?? society_id();

        if (! $societyId) {
            return redirect()
                ->back()
                ->with('error', 'Please select a society before creating a security log entry.');
        }

        $log = SecurityLog::create([
            ...$request->validated(),
            'society_id' => $societyId,
            'guard_id' => $request->user()->id,
        ]);

        app(ActivityLogger::class)->log(
            action: 'create',
            module: 'SecurityLog',
            entityType: SecurityLog::class,
            entityId: (string) $log->id,
            remarks: "Security log entry created: {$log->title} ({$log->severity})"
        );

        return redirect()
            ->route('security-logs.index')
            ->with('success', 'Security log entry recorded successfully.');
    }
}
