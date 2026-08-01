<?php

use App\Services\MarkdownChunker;

test('markdown chunker splits long content without empty or oversized chunks', function () {
    $content = "# Panduan Karies\n\n".implode("\n\n", [
        str_repeat('Etiologi karies perlu dipahami oleh dokter dan pasien. ', 3),
        str_repeat('Diagnosis memerlukan pemeriksaan klinis dan radiograf. ', 3),
        str_repeat('Tatalaksana disesuaikan dengan kondisi jaringan gigi. ', 3),
        'Penutup dokumen yang wajib tetap terbaca.',
    ]);

    $chunks = (new MarkdownChunker(maxCharacters: 180, overlapCharacters: 30))->chunk($content);

    expect(count($chunks))->toBeGreaterThan(1)
        ->and($chunks[0])->toStartWith('# Panduan Karies')
        ->and($chunks[array_key_last($chunks)])->toContain('Penutup dokumen');

    foreach ($chunks as $chunk) {
        expect(trim($chunk))->not->toBeEmpty()
            ->and(mb_strlen($chunk))->toBeLessThanOrEqual(180);
    }
});

test('markdown chunker returns short content as one chunk', function () {
    $chunks = (new MarkdownChunker)->chunk("# Impaksi\n\nGigi impaksi memerlukan evaluasi radiograf.");

    expect($chunks)->toBe(["# Impaksi\n\nGigi impaksi memerlukan evaluasi radiograf."]);
});
