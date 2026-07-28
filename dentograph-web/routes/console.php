<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use App\Models\KnowledgeChunk;
use App\Models\KnowledgeDocument;
use Symfony\Component\Process\Process;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('knowledge:ingest-journals {path=../JURNAL} {--python=python}', function (string $path): int {
    $directory = realpath(base_path($path));
    $python = (string) $this->option('python');
    $pythonPath = realpath($python) ?: realpath(base_path($python)) ?: $python;
    $extractorPath = realpath(base_path('../dentograph-yolo/app/extract_pdf_text.py'));

    if (! $directory || ! is_dir($directory)) {
        $this->error('Folder jurnal tidak ditemukan: '.$path);

        return self::FAILURE;
    }

    if (! $extractorPath) {
        $this->error('Script ekstrak tidak ditemukan: ../dentograph-yolo/app/extract_pdf_text.py');

        return self::FAILURE;
    }

    $files = collect(glob($directory.DIRECTORY_SEPARATOR.'*.pdf') ?: []);

    if ($files->isEmpty()) {
        $this->warn('Tidak ada file PDF di folder: '.$directory);

        return self::SUCCESS;
    }

    $this->info('Mengimpor '.$files->count().' jurnal dari: '.$directory);

    $files->each(function (string $file) use ($pythonPath, $extractorPath): void {
        $title = pathinfo($file, PATHINFO_FILENAME);
        $process = new Process([
            $pythonPath,
            $extractorPath,
            $file,
        ]);
        $process->setTimeout(180);
        $process->run();

        if (! $process->isSuccessful()) {
            $this->error('Gagal ekstrak: '.$title);
            $this->line($process->getErrorOutput());

            return;
        }

        $text = trim($process->getOutput());

        if ($text === '') {
            $this->warn('Lewati jurnal kosong/tidak terbaca: '.$title);

            return;
        }

        $document = KnowledgeDocument::updateOrCreate(
            ['source' => $file],
            [
                'title' => $title,
                'file_path' => $file,
                'status' => 'indexed',
            ],
        );

        $document->chunks()->delete();

        collect(str_split($text, 1800))
            ->map(function (string $chunk): string {
                $chunk = iconv('UTF-8', 'UTF-8//IGNORE', $chunk) ?: '';

                return trim($chunk);
            })
            ->filter()
            ->values()
            ->each(fn (string $chunk, int $index) => KnowledgeChunk::create([
                'knowledge_document_id' => $document->id,
                'chunk_index' => $index,
                'content' => $chunk,
            ]));

        $this->line('✓ '.$title);
    });

    $this->info('Selesai. Total dokumen: '.KnowledgeDocument::count().', chunks: '.KnowledgeChunk::count());

    return self::SUCCESS;
})->purpose('Import PDF jurnal ke knowledge base chatbot');
