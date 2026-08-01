<?php

use App\Models\AiKnowledgeBase;
use Database\Seeders\MateriKnowledgeSeeder;
use Illuminate\Http\Client\Request;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;

function materiMarkdownChunkCount(): int
{
    return collect(glob(database_path('materi/*.md')) ?: [])
        ->sum(function (string $file): int {
            $markdown = file_get_contents($file);

            return $markdown === false
                ? 0
                : preg_match_all('/<!--\s*CHUNK_START:\s*[A-Za-z0-9_-]+\s*-->/', $markdown);
        });
}

test('materi knowledge seeder stores every marked markdown section with embeddings idempotently', function () {
    config()->set('services.ai_embedding.url', 'http://127.0.0.1:8001');

    Http::fake(fn (Request $request) => Http::response([
        'model' => 'bge-m3:567m',
        'dimensions' => 1024,
        'embeddings' => array_map(
            fn (): array => array_fill(0, 1024, 0.25),
            $request['texts'],
        ),
    ]));

    AiKnowledgeBase::create([
        'title' => '[RAG] Existing #0001',
        'category' => 'general',
        'content' => 'Knowledge lama yang tidak boleh dihapus.',
        'status' => 'active',
    ]);

    $seeder = app(MateriKnowledgeSeeder::class);
    $seeder->run();

    $expectedChunks = materiMarkdownChunkCount();
    $knowledge = AiKnowledgeBase::query()
        ->where('title', 'like', '[MATERI] %')
        ->get();

    expect($expectedChunks)->toBe(199)
        ->and($knowledge)->toHaveCount($expectedChunks)
        ->and($knowledge->pluck('condition_name')->unique()->sort()->values()->all())->toBe([
            'impaksi gigi',
            'karies gigi',
            'lesi periapikal gigi',
            'resorpsi gigi',
        ])
        ->and(AiKnowledgeBase::query()->where('title', 'like', '[RAG] %')->count())->toBe(1);

    foreach ($knowledge as $chunk) {
        expect($chunk->title)->toStartWith('[MATERI] ')
            ->and($chunk->category)->toBe('disease')
            ->and($chunk->status)->toBe('active')
            ->and($chunk->embedding_model)->toBe('bge-m3:567m')
            ->and($chunk->embedding)->toHaveCount(1024)
            ->and(trim($chunk->content))->not->toBeEmpty()
            ->and($chunk->content)->not->toContain('CHUNK_START')
            ->and($chunk->content)->not->toContain('CHUNK_END')
            ->and($chunk->content)->not->toStartWith('---');
    }

    $seeder->run();

    expect(AiKnowledgeBase::query()->where('title', 'like', '[MATERI] %')->count())->toBe($expectedChunks)
        ->and(AiKnowledgeBase::query()->where('title', 'like', '[RAG] %')->count())->toBe(1);
});

test('materi knowledge seeder keeps existing material when embedding fails', function () {
    config()->set('services.ai_embedding.url', 'http://127.0.0.1:8001');
    Http::fake(['http://127.0.0.1:8001/embeddings' => Http::response([], 500)]);

    $existing = AiKnowledgeBase::create([
        'title' => '[MATERI] Existing [chunk_01]',
        'category' => 'disease',
        'condition_name' => 'existing',
        'content' => 'Materi lama yang tidak boleh hilang ketika embedding gagal.',
        'embedding_model' => 'bge-m3:567m',
        'status' => 'active',
    ]);

    expect(fn () => app(MateriKnowledgeSeeder::class)->run())
        ->toThrow(RequestException::class);

    expect($existing->fresh())->not->toBeNull();
});
