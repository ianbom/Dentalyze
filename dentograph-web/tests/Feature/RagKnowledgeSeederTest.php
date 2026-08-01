<?php

use App\Models\AiKnowledgeBase;
use Database\Seeders\RagKnowledgeSeeder;
use Illuminate\Http\Client\Request;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;

test('rag knowledge seeder chunks embeds and stores every markdown document idempotently', function () {
    config()->set('services.ai_embedding.url', 'http://127.0.0.1:8001');

    Http::fake(fn (Request $request) => Http::response([
        'model' => 'bge-m3:567m',
        'dimensions' => 1024,
        'embeddings' => array_map(
            fn (): array => array_fill(0, 1024, 0.25),
            $request['texts'],
        ),
    ]));

    $seeder = app(RagKnowledgeSeeder::class);
    $seeder->run();

    $files = collect(glob(database_path('data-rag/*.md')) ?: []);
    $knowledge = AiKnowledgeBase::query()
        ->where('title', 'like', '[RAG] %')
        ->get();

    expect($files)->toHaveCount(12)
        ->and($knowledge->count())->toBeGreaterThan($files->count());

    foreach ($knowledge as $chunk) {
        expect($chunk->title)->toStartWith('[RAG] ')
            ->and($chunk->category)->toBe('general')
            ->and($chunk->status)->toBe('active')
            ->and($chunk->embedding_model)->toBe('bge-m3:567m')
            ->and($chunk->embedding)->toHaveCount(1024)
            ->and(trim($chunk->content))->not->toBeEmpty();
    }

    $count = $knowledge->count();
    $seeder->run();

    expect(AiKnowledgeBase::query()->where('title', 'like', '[RAG] %')->count())->toBe($count);
});

test('rag knowledge seeder keeps existing data when embedding fails', function () {
    config()->set('services.ai_embedding.url', 'http://127.0.0.1:8001');
    Http::fake(['http://127.0.0.1:8001/embeddings' => Http::response([], 500)]);

    $existing = AiKnowledgeBase::create([
        'title' => '[RAG] Existing #0001',
        'category' => 'general',
        'content' => 'Data lama yang tidak boleh hilang ketika embedding gagal.',
        'embedding_model' => 'bge-m3:567m',
        'status' => 'active',
    ]);

    expect(fn () => app(RagKnowledgeSeeder::class)->run())
        ->toThrow(RequestException::class);

    expect($existing->fresh())->not->toBeNull();
});
