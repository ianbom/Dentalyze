<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use InvalidArgumentException;
use RuntimeException;

class AiEmbeddingService
{
    /**
     * @return array{embedding: array<int, float>, model: string, dimensions: int}
     */
    public function embed(string $text): array
    {
        $result = $this->embedMany([$text]);

        return [
            'embedding' => $result['embeddings'][0],
            'model' => $result['model'],
            'dimensions' => $result['dimensions'],
        ];
    }

    /**
     * @param  array<int, string>  $texts
     * @return array{embeddings: array<int, array<int, float>>, model: string, dimensions: int}
     */
    public function embedMany(array $texts): array
    {
        $texts = array_values($texts);

        if ($texts === [] || collect($texts)->contains(fn (mixed $text): bool => ! is_string($text) || trim($text) === '')) {
            throw new InvalidArgumentException('Embedding texts must contain at least one non-empty string.');
        }

        $response = Http::timeout((int) config('services.ai_embedding.timeout', 60))
            ->connectTimeout((int) config('services.ai_embedding.connect_timeout', 8))
            ->post(rtrim((string) config('services.ai_embedding.url'), '/').'/embeddings', [
                'texts' => $texts,
            ])
            ->throw();

        $embeddings = $response->json('embeddings');
        $model = (string) $response->json('model');
        $dimensions = (int) $response->json('dimensions');

        if (! is_array($embeddings) || count($embeddings) !== count($texts)) {
            throw new RuntimeException('FastAPI embedding response count does not match the requested texts.');
        }

        if ($model === '' || $dimensions < 1) {
            throw new RuntimeException('FastAPI embedding response is missing model or dimensions.');
        }

        $normalizedEmbeddings = array_map(function (mixed $embedding) use ($dimensions): array {
            if (! is_array($embedding) || count($embedding) !== $dimensions) {
                throw new RuntimeException('FastAPI embedding response contains an invalid vector.');
            }

            return array_map(function (mixed $value): float {
                if (! is_int($value) && ! is_float($value) && ! (is_string($value) && is_numeric($value))) {
                    throw new RuntimeException('FastAPI embedding response contains a non-numeric value.');
                }

                return (float) $value;
            }, array_values($embedding));
        }, array_values($embeddings));

        return [
            'embeddings' => $normalizedEmbeddings,
            'model' => $model,
            'dimensions' => $dimensions,
        ];
    }
}
