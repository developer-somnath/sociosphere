<?php

namespace App\Http\Controllers;

use App\Models\Resident;
use Inertia\Inertia;

class ResidentController extends Controller
{
    public function index()
    {
        $residents = Resident::query()
            ->with([
                'flat',
                'flat.tower',
            ])
            ->paginate(10);
        return Inertia::render(
            'Features/Residents/Pages/Index',
            [
                'residents' => $residents,
            ]
        );
    }
}
