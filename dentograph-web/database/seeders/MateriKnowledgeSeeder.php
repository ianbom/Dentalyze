<?php

namespace Database\Seeders;

use App\Services\AiEmbeddingService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class MateriKnowledgeSeeder extends Seeder
{
    private const TITLE_PREFIX = '[MATERI] ';

    private const EMBEDDING_DIMENSIONS = 1024;

    private const EMBEDDING_BATCH_SIZE = 16;

    public function run(): void
    {
        $chunks = collect($this->loadDocuments())
            ->flatMap(fn (array $document): array => $document['chunks'])
            ->values()
            ->all();

        if ($chunks === []) {
            throw new RuntimeException('No Markdown chunks found in database/materi.');
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
                    'category' => 'disease',
                    'condition_name' => $chunk['condition_name'],
                    'content' => $chunk['content'],
                    'embedding' => $this->vectorValue($chunk['embedding']),
                    'embedding_model' => $chunk['embedding_model'],
                    'status' => 'active',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        });

        $this->command?->info(sprintf('Seeded %d embedded materi chunks.', count($embeddedChunks)));
    }

    /**
     * @return array<int, array{chunks: array<int, array{title: string, condition_name: string, content: string}>}>
     */
    private function loadDocuments(): array
    {
        $files = glob(database_path('materi/*.md')) ?: [];
        sort($files);

        if ($files === []) {
            throw new RuntimeException('No Markdown files found in database/materi.');
        }

        return array_map(function (string $file): array {
            $markdown = file_get_contents($file);

            if ($markdown === false || trim($markdown) === '') {
                throw new RuntimeException("Unable to read Markdown file: {$file}");
            }

            $frontMatter = $this->frontMatter($markdown, $file);
            $documentTitle = $this->frontMatterValue($frontMatter, 'title')
                ?? str_replace('_', ' ', pathinfo($file, PATHINFO_FILENAME));
            $topic = $this->frontMatterValue($frontMatter, 'topic')
                ?? pathinfo($file, PATHINFO_FILENAME);
            $sourceName = pathinfo($file, PATHINFO_BASENAME);

            return [
                'chunks' => array_map(function (array $chunk) use ($documentTitle, $topic, $sourceName): array {
                    $sectionTitle = $this->sectionTitle($chunk['content'], $chunk['id']);
                    $title = sprintf('%s%s (%s) [%s] %s', self::TITLE_PREFIX, $documentTitle, $sourceName, $chunk['id'], $sectionTitle);

                    return [
                        'title' => mb_substr($title, 0, 250),
                        'condition_name' => str_replace('_', ' ', $topic),
                        'content' => $chunk['content'],
                    ];
                }, $this->markedChunks($markdown, $file)),
            ];
        }, $files);
    }

    private function frontMatter(string $markdown, string $file): string
    {
        if (preg_match('/\A---\R(?<front_matter>.*?)\R---(?:\R|\z)/s', $markdown, $matches) !== 1) {
            throw new RuntimeException("Missing YAML front matter in Markdown file: {$file}");
        }

        return $matches['front_matter'];
    }

    private function frontMatterValue(string $frontMatter, string $key): ?string
    {
        if (preg_match('/^'.preg_quote($key, '/').':\s*["\']?(.+?)["\']?\s*$/m', $frontMatter, $matches) !== 1) {
            return null;
        }

        return trim($matches[1], " \t\n\r\0\x0B\"'");
    }

    /**
     * @return array<int, array{id: string, content: string}>
     */
    private function markedChunks(string $markdown, string $file): array
    {
        preg_match_all('/<!--\s*CHUNK_(START|END):\s*([A-Za-z0-9_-]+)\s*-->/', $markdown, $markers, PREG_OFFSET_CAPTURE);

        if ($markers[0] === []) {
            throw new RuntimeException("No CHUNK_START/CHUNK_END markers found in Markdown file: {$file}");
        }

        $chunks = [];
        $activeId = null;
        $contentOffset = null;

        foreach ($markers[0] as $index => $marker) {
            $type = $markers[1][$index][0];
            $id = $markers[2][$index][0];
            $offset = $marker[1];
            $markerLength = strlen($marker[0]);

            if ($type === 'START') {
                if ($activeId !== null) {
                    throw new RuntimeException("Nested CHUNK_START marker '{$id}' in {$file}; '{$activeId}' is still open.");
                }

                $activeId = $id;
                $contentOffset = $offset + $markerLength;

                continue;
            }

            if ($activeId === null || $contentOffset === null) {
                throw new RuntimeException("CHUNK_END marker '{$id}' has no matching start in {$file}.");
            }

            if ($activeId !== $id) {
                throw new RuntimeException("CHUNK marker mismatch in {$file}: expected '{$activeId}', received '{$id}'.");
            }

            $content = trim(substr($markdown, $contentOffset, $offset - $contentOffset));
            if ($content === '') {
                throw new RuntimeException("Chunk '{$id}' is empty in {$file}.");
            }

            $chunks[] = ['id' => $id, 'content' => $content];
            $activeId = null;
            $contentOffset = null;
        }

        if ($activeId !== null) {
            throw new RuntimeException("CHUNK_START marker '{$activeId}' has no matching end in {$file}.");
        }

        return $chunks;
    }

    private function sectionTitle(string $content, string $fallback): string
    {
        if (preg_match('/^##\s+(.+)$/m', $content, $matches) === 1) {
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
