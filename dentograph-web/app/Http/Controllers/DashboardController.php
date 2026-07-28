<?php

namespace App\Http\Controllers;

use App\Models\Radiograph;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request, DashboardService $service): Response
    {
        return Inertia::render('dashboard/index', $service->getDashboardData($request->user()));
    }

    public function notifications(Request $request, DashboardService $service): JsonResponse
    {
        abort_unless($request->user()?->role === 'admin', 403);

        $notifications = $service->adminNotifications();

        return response()->json([
            'count' => Radiograph::query()->where('status', 'menunggu')->count(),
            'notifications' => $notifications,
        ]);
    }
}
