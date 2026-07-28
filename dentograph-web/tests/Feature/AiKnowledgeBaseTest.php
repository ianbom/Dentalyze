<?php

use App\Jobs\GenerateAiKnowledgeEmbedding;
use App\Models\AiKnowledgeBase;
use App\Models\User;
use App\Services\AiContextService;
use App\Services\AiEmbeddingService;
use Illuminate\Support\Facades\Http;

test('admin stores knowledge base with embedding from fastapi', function () {
    config()->set('services.ai_embedding.url', 'http://127.0.0.1:8001');

    Http::fake([
        'http://127.0.0.1:8001/embeddings' => Http::response([
            'model' => 'bge-m3:567m',
            'dimensions' => 1024,
            'embeddings' => [array_fill(0, 1024, 0.25)],
        ]),
    ]);

    $admin = User::factory()->create(['role' => 'admin']);
    $content = str_repeat('Impaksi gigi adalah kondisi edukatif untuk pasien. ', 2);

    $this->actingAs($admin)
        ->post('/knowledge', [
            'title' => 'Penjelasan Impaksi Gigi',
            'category' => 'disease',
            'condition_name' => 'Impaksi',
            'content' => $content,
            'status' => 'active',
        ])
        ->assertRedirect('/knowledge');

    $this->assertDatabaseHas('ai_knowledge_bases', [
        'title' => 'Penjelasan Impaksi Gigi',
        'category' => 'disease',
        'condition_name' => 'Impaksi',
        'embedding_model' => 'bge-m3:567m',
        'status' => 'active',
    ]);

    Http::assertSentCount(1);
});

test('knowledge validation requires meaningful content', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin)
        ->from('/knowledge/create')
        ->post('/knowledge', [
            'title' => 'Pendek',
            'category' => 'disease',
            'condition_name' => 'Karies',
            'content' => 'terlalu pendek',
            'status' => 'active',
        ])
        ->assertRedirect('/knowledge/create')
        ->assertSessionHasErrors('content');
});

test('ai context uses only active knowledge bases as snippets', function () {
    $user = User::factory()->create(['role' => 'admin']);

    AiKnowledgeBase::create([
        'title' => 'Penjelasan Karies',
        'category' => 'disease',
        'condition_name' => 'Karies',
        'content' => str_repeat('Karies adalah kerusakan jaringan gigi. ', 2),
        'status' => 'active',
    ]);
    AiKnowledgeBase::create([
        'title' => 'Draft Karies',
        'category' => 'disease',
        'condition_name' => 'Karies',
        'content' => str_repeat('Draft tidak boleh digunakan chatbot. ', 2),
        'status' => 'draft',
    ]);

    $context = app(AiContextService::class)->forUser($user, 'Apa itu karies?');

    expect($context['knowledge'])->toHaveCount(1)
        ->and($context['knowledge'][0]['content'])->toContain('Karies adalah kerusakan jaringan gigi.');
});

test('admin update stores embedding when content changes', function () {
    config()->set('services.ai_embedding.url', 'http://127.0.0.1:8001');

    Http::fake([
        'http://127.0.0.1:8001/embeddings' => Http::response([
            'model' => 'bge-m3:567m',
            'dimensions' => 1024,
            'embeddings' => [array_fill(0, 1024, 0.5)],
        ]),
    ]);

    $admin = User::factory()->create(['role' => 'admin']);
    $knowledge = AiKnowledgeBase::create([
        'title' => 'Penjelasan Karies',
        'category' => 'disease',
        'condition_name' => 'Karies',
        'content' => str_repeat('Karies adalah kerusakan jaringan gigi. ', 2),
        'status' => 'draft',
    ]);
    $content = str_repeat('Karies baru untuk pasien. ', 3);

    $this->actingAs($admin)
        ->put("/knowledge/{$knowledge->id}", [
            'title' => 'Penjelasan Karies Baru',
            'category' => 'disease',
            'condition_name' => 'Karies',
            'content' => $content,
            'status' => 'active',
        ])
        ->assertRedirect('/knowledge');

    expect($knowledge->refresh()->embedding_model)->toBe('bge-m3:567m')
        ->and($knowledge->embedding)->toHaveCount(1024);

    Http::assertSentCount(1);
});

test('embedding job stores embedding from fastapi', function () {
    config()->set('services.ai_embedding.url', 'http://127.0.0.1:8001');

    Http::fake([
        'http://127.0.0.1:8001/embeddings' => Http::response([
            'model' => 'bge-m3:567m',
            'dimensions' => 1024,
            'embeddings' => [array_fill(0, 1024, 0.25)],
        ]),
    ]);

    $knowledge = AiKnowledgeBase::create([
        'title' => 'Penjelasan Impaksi Gigi',
        'category' => 'disease',
        'condition_name' => 'Impaksi',
        'content' => str_repeat('Impaksi gigi adalah kondisi edukatif untuk pasien. ', 2),
        'status' => 'active',
    ]);

    app(GenerateAiKnowledgeEmbedding::class, ['knowledge' => $knowledge])->handle(app(AiEmbeddingService::class));

    expect($knowledge->refresh()->embedding_model)->toBe('bge-m3:567m')
        ->and($knowledge->embedding)->toHaveCount(1024);

    Http::assertSentCount(1);
});
