<?php

namespace App\Http\Controllers;

use App\Services\PublicVerificationService;
use Inertia\Inertia;
use Inertia\Response;

class PublicVerificationController extends Controller
{
    public function show(string $radiograph, PublicVerificationService $service): Response
    {
        return Inertia::render('public/verify-result', $service->verify($radiograph));
    }
}
