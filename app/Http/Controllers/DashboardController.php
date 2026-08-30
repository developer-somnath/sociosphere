<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private readonly DashboardService $dashboardService) {}

    /**
     * Render the authenticated society overview.
     */
    public function index(Request $request): Response
    {
        $societyId = society_id();

        return Inertia::render('features/dashboard/pages/dashboard-page', [
            'stats' => $this->dashboardService->stats($societyId, $request->user()),
        ]);
    }
}
