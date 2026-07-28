<?php

use App\Services\AiEmbeddingService;
use Illuminate\Support\Facades\Http;

test('ai embedding service posts text to fastapi embeddings endpoint', function () {
    config()->set('services.ai_embedding.url', 'http://127.0.0.1:8001');

    Http::fake([
        'http://127.0.0.1:8001/embeddings' => Http::response([
            'model' => 'bge-m3:567m',
            'dimensions' => 1024,
            'embeddings' => [array_fill(0, 1024, 0.5)],
        ]),
    ]);

    $result = app(AiEmbeddingService::class)->embed('contoh knowledge');

    expect($result['model'])->toBe('bge-m3:567m')
        ->and($result['dimensions'])->toBe(1024)
        ->and($result['embedding'])->toHaveCount(1024);

    Http::assertSent(fn ($request): bool => $request->url() === 'http://127.0.0.1:8001/embeddings'
        && $request['texts'] === ['contoh knowledge']);
});
