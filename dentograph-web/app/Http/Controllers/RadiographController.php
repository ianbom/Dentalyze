<?php

namespace App\Http\Controllers;

use App\Http\Requests\Radiographs\AnalyzeRadiographRequest;
use App\Http\Requests\Radiographs\FinalizeRadiographRequest;
use App\Http\Requests\Radiographs\SaveRadiographDetectionsRequest;
use App\Http\Requests\Radiographs\StoreRadiographRequest;
use App\Services\AiDetectionService;
use App\Services\RadiographService;
use App\Services\VerificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RadiographController extends Controller
{
    public function index(Request $request, RadiographService $service): Response
    {
        return Inertia::render('detection/index', $service->indexData($request->user()));
    }

    public function create(): RedirectResponse
    {
        return to_route('radiographs.index');
    }

    public function store(StoreRadiographRequest $request, RadiographService $service): RedirectResponse
    {
        $radiograph = $service->create($request->validated(), $request->user());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Radiograph created.')]);

        return to_route('radiographs.show', $radiograph);
    }

    public function show(Request $request, string $radiograph, RadiographService $service): Response
    {
        $data = $service->detailData($radiograph, $request->user());
        $preview = $request->session()->pull('analysis_preview_'.$radiograph);

        if ($preview) {
            $data['detections'] = collect($preview['results'] ?? []);
            $data['radiograph']['result_image_url'] = $preview['result_image_url'] ?? null;
            $data['radiograph']['preview_result_image'] = $preview['result_image'] ?? null;
        }

        return Inertia::render('detection/show', $data);
    }

    public function history(Request $request, string $radiograph, RadiographService $service): Response
    {
        return Inertia::render('radiographs/history', $service->historyData($radiograph, $request->user()));
    }

    public function historyIndex(Request $request, RadiographService $service): Response
    {
        return Inertia::render('radiographs/history', $service->historyIndexData($request->user()));
    }

    public function analyze(AnalyzeRadiographRequest $request, string $radiograph, AiDetectionService $service): JsonResponse|RedirectResponse
    {
        $result = $service->analyze($radiograph, $request->user());

        if ($request->expectsJson()) {
            return response()->json($result, filled($result['results']) ? 200 : 422);
        }

        $request->session()->flash('analysis_preview_'.$radiograph, $result);

        Inertia::flash('toast', [
            'type' => filled($result['results']) ? 'success' : 'warning',
            'message' => filled($result['results'])
                ? __('Radiograph analysis finished.')
                : __('AI service has not returned detection results.'),
        ]);

        return to_route('radiographs.show', $radiograph);
    }

    public function finalize(FinalizeRadiographRequest $request, string $radiograph, VerificationService $service): RedirectResponse
    {
        $service->finalize($radiograph, $request->validated(), $request->user());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Radiograph finalized.')]);

        return to_route('radiographs.show', $radiograph);
    }

    public function saveDetections(SaveRadiographDetectionsRequest $request, string $radiograph, VerificationService $service): RedirectResponse
    {
        $service->saveDraft($radiograph, $request->validated(), $request->user());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Detection changes saved.')]);

        return back();
    }

    public function destroy(Request $request, string $radiograph, RadiographService $service): RedirectResponse
    {
        $service->delete($radiograph, $request->user());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Radiograph deleted.')]);

        return back();
    }
}
