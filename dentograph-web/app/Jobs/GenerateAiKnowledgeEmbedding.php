<?php

namespace App\Jobs;

use App\Models\AiKnowledgeBase;
use App\Services\AiEmbeddingService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Throwable;

class GenerateAiKnowledgeEmbedding implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public function __construct(
        public AiKnowledgeBase $knowledge,
    ) {}

    public function handle(AiEmbeddingService $embeddingService): void
    {
        $this->knowledge->refresh();

        try {
            $result = $embeddingService->embed($this->knowledge->content);

            $this->storeEmbeddingVector($result['embedding'], $result['model']);
        } catch (Throwable) {
            $this->knowledge->forceFill([
                'embedding' => null,
                'embedding_model' => null,
            ])->save();
        }
    }

    /**
     * @param  array<int, float>  $embedding
     */
    private function storeEmbeddingVector(array $embedding, string $model): void
    {
        $vector = '['.implode(',', array_map(
            fn (float|int|string $value): string => (string) (float) $value,
            $embedding,
        )).']';

        if (DB::connection()->getDriverName() === 'mysql') {
            DB::table($this->knowledge->getTable())
                ->where($this->knowledge->getKeyName(), $this->knowledge->getKey())
                ->update([
                    'embedding' => DB::raw('STRING_TO_VECTOR('.DB::getPdo()->quote($vector).')'),
                    'embedding_model' => $model,
                    'updated_at' => now(),
                ]);

            return;
        }

        $this->knowledge->forceFill([
            'embedding' => $embedding,
            'embedding_model' => $model,
        ])->save();
    }
}
