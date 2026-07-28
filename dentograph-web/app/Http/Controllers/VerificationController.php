<?php

namespace App\Http\Controllers;

use App\Services\VerificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VerificationController extends Controller
{
    public function tasks(Request $request, VerificationService $service): Response
    {
        return Inertia::render('verification/tasks', $service->taskData($request->user()));
    }
}
