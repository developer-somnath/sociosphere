<?php

namespace App\Http\Controllers;

use App\Http\Requests\EmergencySosRequest;
use App\Models\PushSubscription;
use App\Models\SecurityLog;
use App\Models\User;
use App\Services\ActivityLogger;
use App\Services\WebPushService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Emergency SOS & Broadcast Engine (Phase 20 — Cobra v2.6.0).
 */
class EmergencySosController extends Controller
{
    public function __construct(
        private readonly WebPushService $webPush,
    ) {
    }

    /**
     * Trigger an Emergency SOS alert across the society and log an incident.
     */
    public function store(EmergencySosRequest $request): RedirectResponse|JsonResponse
    {
        $user = $request->user();
        $societyId = $user->society_id ?? society_id();

        if (! $societyId) {
            return redirect()
                ->back()
                ->with('error', 'Society context required for Emergency SOS.');
        }

        $validated = $request->validated();
        $type = $validated['emergency_type'];
        $location = $validated['location'] ?? 'Unknown location';
        $desc = $validated['description'] ?? "Emergency SOS triggered by {$user->name}";

        // 1. Create Critical Incident in SecurityLog
        $log = SecurityLog::create([
            'society_id' => $societyId,
            'guard_id' => $user->id,
            'event_type' => 'Emergency SOS',
            'severity' => 'Critical',
            'title' => "🚨 SOS: {$type} at {$location}",
            'description' => "Triggered by: {$user->name} ({$user->email}, Phone: {$user->phone}).\nDetails: {$desc}",
        ]);

        // 2. Broadcast High-Priority WebPush to guards and society admins
        $guardSubscriptions = PushSubscription::query()
            ->whereHas('user', function ($q) use ($societyId) {
                $q->where('society_id', $societyId)
                    ->whereHas('roles', function ($rq) {
                        $rq->whereIn('name', ['SecurityGuard', 'SecurityManager', 'SocietyAdmin', 'SuperAdmin']);
                    });
            })
            ->get();

        if ($guardSubscriptions->isNotEmpty()) {
            $this->webPush->broadcast($guardSubscriptions, [
                'title' => "🚨 EMERGENCY SOS: {$type}",
                'body' => "{$user->name} reported {$type} at {$location}.",
                'data' => [
                    'url' => route('security-logs.index'),
                    'tag' => "emergency-sos-{$log->id}",
                    'urgency' => 'high',
                ],
            ]);
        }

        // 3. Activity audit
        app(ActivityLogger::class)->log(
            action: 'create',
            module: 'EmergencySOS',
            entityType: SecurityLog::class,
            entityId: (string) $log->id,
            remarks: "Emergency SOS triggered: {$type} by {$user->name} ({$location})"
        );

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'message' => "Emergency alert dispatched! Guard station notified.",
                'log_id' => $log->id,
            ]);
        }

        return redirect()
            ->back()
            ->with('success', "🚨 Emergency alert dispatched to Security & Administration! Ref: #{$log->id}");
    }
}
