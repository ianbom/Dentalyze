<?php

namespace Database\Seeders;

use App\Services\AiEmbeddingService;
use App\Services\MarkdownChunker;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class RagKnowledgeSeeder extends Seeder
{
    private const TITLE_PREFIX = '[RAG] ';

    private const EMBEDDING_DIMENSIONS = 1024;

    private const EMBEDDING_BATCH_SIZE = 16;

    public function run(): void
    {
        $documents = $this->loadDocuments();
        $chunks = collect($documents)
            ->flatMap(fn (array $document): array => $document['chunks'])
            ->values()
            ->all();

        if ($chunks === []) {
            throw new RuntimeException('No Markdown chunks found in database/data-rag.');
        }

        $embeddingService = app(AiEmbeddingService::class);
        $embeddedChunks = [];

        foreach (array_chunk($chunks, self::EMBEDDING_BATCH_SIZE) as $batch) {
            $result = $embeddingService->embedMany(array_column($batch, 'content'));

            if ($result['dimensions'] !== self::EMBEDDING_DIMENSIONS) {
                throw new RuntimeException(sprintf(
                    'Expected %d-dimensional embeddings, received %d.',
                    self::EMBEDDING_DIMENSIONS,
                    $result['dimensions'],
                ));
            }

            foreach ($batch as $index => $chunk) {
                $embeddedChunks[] = [
                    ...$chunk,
                    'embedding' => $result['embeddings'][$index],
                    'embedding_model' => $result['model'],
                ];
            }
        }

        DB::transaction(function () use ($embeddedChunks): void {
            DB::table('ai_knowledge_bases')
                ->where('title', 'like', self::TITLE_PREFIX.'%')
                ->delete();

            foreach ($embeddedChunks as $chunk) {
                DB::table('ai_knowledge_bases')->insert([
                    'title' => $chunk['title'],
                    'category' => 'general',
                    'condition_name' => null,
                    'content' => $chunk['content'],
                    'embedding' => $this->vectorValue($chunk['embedding']),
                    'embedding_model' => $chunk['embedding_model'],
                    'status' => 'active',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        });

        $this->command?->info(sprintf('Seeded %d embedded RAG chunks.', count($embeddedChunks)));
    }

    /**
     * @return array<int, array{chunks: array<int, array{title: string, content: string}>}>
     */
    private function loadDocuments(): array
    {
        $files = glob(database_path('data-rag/*.md')) ?: [];
        sort($files);

        if ($files === []) {
            throw new RuntimeException('No Markdown files found in database/data-rag.');
        }

        $chunker = app(MarkdownChunker::class);

        return array_map(function (string $file) use ($chunker): array {
            $content = file_get_contents($file);

            if ($content === false || trim($content) === '') {
                throw new RuntimeException("Unable to read Markdown file: {$file}");
            }

            $documentTitle = $this->documentTitle($content, pathinfo($file, PATHINFO_FILENAME));
            $sourceName = pathinfo($file, PATHINFO_BASENAME);
            $chunks = $chunker->chunk($content);

            if ($chunks === []) {
                throw new RuntimeException("Markdown file produced no chunks: {$file}");
            }

            return [
                'chunks' => array_map(
                    fn (string $chunk, int $index): array => [
                        'title' => self::TITLE_PREFIX.mb_substr($documentTitle, 0, 150).' ('.$sourceName.') #'.str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT),
                        'content' => $chunk,
                    ],
                    $chunks,
                    array_keys($chunks),
                ),
            ];
        }, $files);
    }

    private function documentTitle(string $content, string $fallback): string
    {
        if (preg_match('/^#\s+(.+)$/m', $content, $matches) === 1) {
            return trim($matches[1]);
        }

        return str_replace('_', ' ', $fallback);
    }

    /**
     * @param  array<int, float>  $embedding
     */
    private function vectorValue(array $embedding): mixed
    {
        if (DB::connection()->getDriverName() !== 'mysql') {
            return json_encode($embedding, JSON_THROW_ON_ERROR);
        }

        $vector = '['.implode(',', array_map(
            fn (float|int|string $value): string => (string) (float) $value,
            $embedding,
        )).']';

        return DB::raw('STRING_TO_VECTOR('.DB::getPdo()->quote($vector).')');
    }
}
