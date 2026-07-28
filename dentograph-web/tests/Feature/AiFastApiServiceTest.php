<?php

use App\Services\AiDetectionService;
use Illuminate\Support\Facades\Http;

test('ai detection service posts prediction requests to fastapi default endpoint', function () {
    config()->set('services.ai.url', 'http://127.0.0.1:8001');

    Http::fake([
        'http://127.0.0.1:8001/predict' => Http::response([
            'results' => [],
            'result_image' => null,
        ]),
    ]);

    $response = app(AiDetectionService::class)->sendRequestToFastApi([
        'image_path' => 'example.jpg',
    ]);

    expect($response)->toBe([
        'results' => [],
        'result_image' => null,
    ]);

    Http::assertSent(fn ($request): bool => $request->url() === 'http://127.0.0.1:8001/predict');
});
