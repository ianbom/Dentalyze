<?php

namespace App\Http\Controllers;

use App\Http\Requests\Knowledge\StoreKnowledgeRequest;
use App\Http\Requests\Knowledge\UpdateKnowledgeRequest;
use App\Models\AiKnowledgeBase;
use App\Services\AiEmbeddingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class KnowledgeController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->role === 'admin', 403);

        return Inertia::render('knowledge/index', [
            'knowledge' => AiKnowledgeBase::query()
                ->latest('updated_at')
                ->get()
                ->map(fn (AiKnowledgeBase $knowledge): array => [
                    'id' => $knowledge->id,
                    'title' => $knowledge->title,
                    'category' => $knowledge->category,
                    'condition_name' => $knowledge->condition_name,
                    'status' => $knowledge->status,
                    'embedding_model' => $knowledge->embedding_model,
                    'has_embedding' => filled($knowledge->embedding),
                    'updated_at' => optional($knowledge->updated_at)->toDateTimeString(),
                ]),
        ]);
    }

    public function create(Request $request): Response
    {
        abort_unless($request->user()?->role === 'admin', 403);

        return Inertia::render('knowledge/form', [
            'mode' => 'create',
            'knowledge' => null,
        ]);
    }

    public function store(StoreKnowledgeRequest $request, AiEmbeddingService $embeddingService): RedirectResponse
    {
        $knowledge = AiKnowledgeBase::create($request->validated());

        $this->syncEmbedding($knowledge, $embeddingService);

        return to_route('knowledge.index');
    }

    public function edit(Request $request, AiKnowledgeBase $knowledge): Response
    {
        abort_unless($request->user()?->role === 'admin', 403);

        return Inertia::render('knowledge/form', [
            'mode' => 'edit',
            'knowledge' => [
                'id' => $knowledge->id,
                'title' => $knowledge->title,
                'category' => $knowledge->category,
                'condition_name' => $knowledge->condition_name,
                'content' => $knowledge->content,
                'status' => $knowledge->status,
                'embedding_model' => $knowledge->embedding_model,
                'has_embedding' => filled($knowledge->embedding),
            ],
        ]);
    }

    public function update(
        UpdateKnowledgeRequest $request,
        AiKnowledgeBase $knowledge,
        AiEmbeddingService $embeddingService,
    ): RedirectResponse {
        $validated = $request->validated();
        $knowledge->update($validated);
        $this->syncEmbedding($knowledge, $embeddingService);

        return to_route('knowledge.index');
    }

    public function destroy(Request $request, AiKnowledgeBase $knowledge): RedirectResponse
    {
        abort_unless($request->user()?->role === 'admin', 403);

        $knowledge->delete();

        return to_route('knowledge.index');
    }

    private function syncEmbedding(AiKnowledgeBase $knowledge, AiEmbeddingService $embeddingService): void
    {
        try {
            $result = $embeddingService->embed($knowledge->content);

            $this->storeEmbeddingVector($knowledge, $result['embedding'], $result['model']);
        } catch (Throwable) {
            $knowledge->forceFill([
                'embedding' => null,
                'embedding_model' => null,
            ])->save();
        }
    }

    /**
     * @param  array<int, float>  $embedding
     */
    private function storeEmbeddingVector(AiKnowledgeBase $knowledge, array $embedding, string $model): void
    {
        $vector = '['.implode(',', array_map(
            fn (float|int|string $value): string => (string) (float) $value,
            $embedding,
        )).']';

        if (DB::connection()->getDriverName() === 'mysql') {
            DB::table($knowledge->getTable())
                ->where($knowledge->getKeyName(), $knowledge->getKey())
                ->update([
                    'embedding' => DB::raw('STRING_TO_VECTOR('.DB::getPdo()->quote($vector).')'),
                    'embedding_model' => $model,
                    'updated_at' => now(),
                ]);

            return;
        }

        $knowledge->forceFill([
            'embedding' => $embedding,
            'embedding_model' => $model,
        ])->save();
    }
}
