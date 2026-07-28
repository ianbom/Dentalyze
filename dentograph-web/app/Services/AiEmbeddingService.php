<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class AiEmbeddingService
{
    /**
     * @return array{embedding: array<int, float>, model: string, dimensions: int}
     */
    public function embed(string $text): array
    {   
        $response = Http::timeout((int) config('services.ai_embedding.timeout', 60))
            ->connectTimeout((int) config('services.ai_embedding.connect_timeout', 8))
            ->post(rtrim((string) config('services.ai_embedding.url'), '/').'/embeddings', [
                'texts' => [$text],
            ])
            ->throw();

        $embedding = $response->json('embeddings.0');

        if (! is_array($embedding)) {
            throw new RuntimeException('FastAPI embedding response missing embeddings.0.');
        }

        return [
            'embedding' => array_map('floatval', $embedding),
            'model' => (string) $response->json('model'),
            'dimensions' => (int) $response->json('dimensions'),
        ];
    }
}
