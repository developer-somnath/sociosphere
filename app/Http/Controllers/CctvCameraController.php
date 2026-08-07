<?php

namespace App\Http\Controllers;

use App\Http\Requests\CctvCameraRequest;
use App\Models\CctvCamera;
use App\Models\Tower;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CctvCameraController extends Controller
{
    /**
     * Display a paginated, filterable grid of CCTV cameras.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', CctvCamera::class);

        $search = trim((string) $request->query('search', ''));
        $group = $request->query('group');
        $status = $request->query('status');
        $sortBy = in_array($request->query('sort_by'), ['name', 'camera_group', 'status', 'created_at'], true)
            ? $request->query('sort_by')
            : null;
        $sortDir = strtolower((string) $request->query('sort_dir')) === 'asc' ? 'asc' : 'desc';

        $query = CctvCamera::query()
            ->with(['tower'])
            ->when($search !== '', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('location_details', 'like', "%{$search}%");
            })
            ->when($group !== null && $group !== '', function ($q) use ($group) {
                $q->where('camera_group', $group);
            })
            ->when($status !== null && $status !== '', function ($q) use ($status) {
                $q->where('status', $status);
            });

        $cameras = $query
            ->when($sortBy !== null, function ($q) use ($sortBy, $sortDir) {
                $q->orderBy($sortBy, $sortDir);
            })
            ->when($sortBy === null, function ($q) {
                $q->latest('id');
            })
            ->paginate(100)
            ->withQueryString();

        $stats = [
            'total' => CctvCamera::count(),
            'online' => CctvCamera::where('status', 'Online')->count(),
            'offline' => CctvCamera::where('status', 'Offline')->count(),
            'maintenance' => CctvCamera::where('status', 'Maintenance')->count(),
            'groups' => CctvCamera::query()
                ->selectRaw('camera_group, COUNT(*) as total')
                ->groupBy('camera_group')
                ->pluck('total', 'camera_group')
                ->all(),
        ];

        return Inertia::render('features/cctv/pages/index', [
            'cameras' => $cameras,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'group' => $group !== '' ? $group : null,
                'status' => $status !== '' ? $status : null,
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
            'towers' => Tower::query()->orderBy('name')->get(['id', 'name']),
            'can' => [
                'create' => $request->user()->hasPermissionTo('cctv.create'),
                'update' => $request->user()->hasPermissionTo('cctv.update'),
                'delete' => $request->user()->hasPermissionTo('cctv.delete'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new CCTV camera stream.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', CctvCamera::class);

        return Inertia::render('features/cctv/pages/create', [
            'towers' => Tower::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Store a newly created CCTV camera stream.
     */
    public function store(CctvCameraRequest $request): RedirectResponse
    {
        $this->authorize('create', CctvCamera::class);

        $towerId = $request->input('tower_id');
        $societyId = $request->user()->society_id
            ?? society_id()
            ?? ($towerId ? \App\Models\Tower::where('id', $towerId)->value('society_id') : null);

        if (! $societyId) {
            return redirect()
                ->back()
                ->with('error', 'Please select a society before creating a CCTV camera stream.');
        }

        $camera = CctvCamera::create([
            ...$request->validated(),
            'society_id' => $societyId,
        ]);

        app(ActivityLogger::class)->log(
            action: 'create',
            module: 'CCTV',
            entityType: CctvCamera::class,
            entityId: (string) $camera->id,
            remarks: "Added CCTV camera {$camera->name} ({$camera->camera_group})"
        );

        return redirect()
            ->route('cctv-cameras.index')
            ->with('success', 'CCTV Camera configured successfully.');
    }

    /**
     * Show the form for editing a CCTV camera stream.
     */
    public function edit(Request $request, CctvCamera $cctvCamera): Response
    {
        $this->authorize('update', $cctvCamera);

        return Inertia::render('features/cctv/pages/edit', [
            'camera' => $cctvCamera,
            'towers' => Tower::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Update the specified CCTV camera stream.
     */
    public function update(CctvCameraRequest $request, CctvCamera $cctvCamera): RedirectResponse
    {
        $this->authorize('update', $cctvCamera);

        $cctvCamera->update($request->validated());

        app(ActivityLogger::class)->log(
            action: 'update',
            module: 'CCTV',
            entityType: CctvCamera::class,
            entityId: (string) $cctvCamera->id,
            remarks: "Updated CCTV camera {$cctvCamera->name}"
        );

        return redirect()
            ->route('cctv-cameras.index')
            ->with('success', 'CCTV Camera stream updated successfully.');
    }

    /**
     * Remove (soft-delete) the specified CCTV camera stream.
     */
    public function destroy(Request $request, CctvCamera $cctvCamera): RedirectResponse
    {
        $this->authorize('delete', $cctvCamera);

        $cctvCamera->delete();

        app(ActivityLogger::class)->log(
            action: 'delete',
            module: 'CCTV',
            entityType: CctvCamera::class,
            entityId: (string) $cctvCamera->id,
            remarks: "Removed CCTV camera {$cctvCamera->name}"
        );

        return redirect()
            ->route('cctv-cameras.index')
            ->with('success', 'CCTV Camera feed removed successfully.');
    }
}
