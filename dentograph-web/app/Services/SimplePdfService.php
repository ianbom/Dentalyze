<?php

namespace App\Services;

use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class SimplePdfService
{
    /**
     * @param  array<string, mixed>  $report
     */
    public function radiographReport(array $report): string
    {
        $patient = $report['patient'];
        $radiograph = $report['radiograph'];
        $detections = $report['detections']
            ->where('is_active', true)
            ->values();
        $abnormalDetections = $detections
            ->filter(fn (array $detection): bool => strcasecmp(trim((string) ($detection['abnormality'] ?? '')), 'Normal') !== 0)
            ->values();
        $missingTeethCount = max(32 - $detections->pluck('no_fdi')->unique()->count(), 0);
        $conditionCounts = $this->conditionCounts($detections);
        $qrCodePath = $report['qr_code_path'] ?? null;

        $pages = [
            $this->coverPage($patient, $radiograph, $detections, $abnormalDetections->count(), $missingTeethCount),
            $this->resultPage($radiograph, $abnormalDetections, $missingTeethCount, $conditionCounts, $qrCodePath),
        ];

        return $this->build($pages);
    }

    /**
     * @param  array<string, mixed>  $patient
     * @param  array<string, mixed>  $radiograph
     * @param  Collection<int, array<string, mixed>>  $detections
     * @return array<int, array<int, mixed>>
     */
    private function coverPage(array $patient, array $radiograph, Collection $detections, int $abnormalCount, int $missingTeethCount): array
    {
        return [
            ['fill_rect', 0, 0, 595, 842, [0.97, 0.99, 1]],
            ['fill_rect', 0, 810, 595, 32, [0.9, 0.98, 1]],
            ['fill_rect', 42, 796, 28, 28, [0.08, 0.72, 1]],
            ['text', 80, 813, 'DeTech Dental AI', 12, true, [0.03, 0.27, 0.38]],
            ['text', 42, 770, 'LAPORAN VERIFIKASI RADIOGRAF', 22, true, [0.03, 0.27, 0.38]],
            ['text', 42, 748, 'DAN ANALISIS KLINIS', 18, true, [0.03, 0.48, 0.88]],
            ['fill_rect', 405, 760, 148, 38, [0.9, 0.99, 0.95]],
            ['stroke_rect', 405, 760, 148, 38, [0.68, 0.93, 0.78]],
            ['text', 426, 782, 'DOKUMEN ASLI', 9, true, [0.06, 0.55, 0.28]],
            ['text', 426, 768, 'Terverifikasi sistem', 7, false, [0.32, 0.42, 0.55]],
            ['stroke_rect', 42, 736, 511, 1, [0.78, 0.9, 0.96]],

            ...$this->statCards($patient, $abnormalCount, $missingTeethCount),

            ['fill_rect', 42, 560, 245, 102, [1, 1, 1]],
            ['stroke_rect', 42, 560, 245, 102, [0.78, 0.9, 0.96]],
            ['text', 60, 638, 'NAMA PASIEN', 8, true, [0.55, 0.64, 0.74]],
            ['text', 60, 618, Str::limit((string) ($patient['name'] ?? '-'), 28), 15, true, [0.03, 0.27, 0.38]],
            ...$this->infoLines(60, 592, [
                ['Nama', $patient['name'] ?? '-'],
                ['NIK', $patient['nik'] ?? '-'],
                ['Telepon', $patient['phone'] ?? '-'],
            ]),

            ['fill_rect', 308, 560, 245, 102, [1, 1, 1]],
            ['stroke_rect', 308, 560, 245, 102, [0.78, 0.9, 0.96]],
            ['text', 326, 638, 'ID PEMERIKSAAN', 8, true, [0.55, 0.64, 0.74]],
            ['text', 326, 618, '#'.$radiograph['id_radiograph'], 12, true, [0.03, 0.27, 0.38]],
            ...$this->infoLines(326, 592, [
                ['Radiografer', $radiograph['radiographer_name'] ?? '-'],
                ['Dokter', $radiograph['doctor_name'] ?? '-'],
                ['Tanggal verifikasi', $radiograph['verified_at'] ?? '-'],
            ]),

            ['text', 42, 528, 'CITRA RADIOGRAFI PANORAMIK', 10, true, [0.1, 0.55, 0.85]],
            ['fill_rect', 42, 304, 511, 208, [0.02, 0.08, 0.1]],
            ['image_fit', 50, 312, 495, 192, $radiograph['image_path'] ?? null],

            ['text', 42, 270, 'ODONTOGRAM FDI', 10, true, [0.1, 0.55, 0.85]],
            ['fill_rect', 42, 104, 511, 146, [1, 1, 1]],
            ['stroke_rect', 42, 104, 511, 146, [0.78, 0.9, 0.96]],
            ...$this->odontogramCommands($detections, 62, 182),
            ...$this->odontogramLegend(62, 122),

            ['text', 42, 68, 'HASIL ANALISIS PER GIGI', 11, true, [0.03, 0.27, 0.38]],
            ['text', 42, 50, 'Temuan non-normal dan catatan dokter tersedia pada halaman berikutnya.', 8, false, [0.45, 0.55, 0.68]],
        ];
    }

    /**
     * @param  array<string, mixed>  $radiograph
     * @param  Collection<int, array<string, mixed>>  $detections
     * @return array<int, array<int, mixed>>
     */
    private function resultPage(array $radiograph, Collection $detections, int $missingTeethCount, array $conditionCounts, ?string $qrCodePath): array
    {
        return [
            ['fill_rect', 0, 0, 595, 842, [0.97, 0.99, 1]],
            ['fill_rect', 0, 810, 595, 32, [0.9, 0.98, 1]],
            ['text', 42, 814, 'DeTech Dental AI', 11, true, [0.03, 0.27, 0.38]],
            ['text', 42, 778, 'HASIL ANALISIS PER GIGI', 20, true, [0.03, 0.27, 0.38]],
            ['text', 42, 758, '#'.$radiograph['id_radiograph'], 9, false, [0.45, 0.55, 0.68]],

            ['text', 42, 724, 'RINGKASAN KONDISI GIGI', 10, true, [0.1, 0.55, 0.85]],
            ...$this->conditionSummaryCards($conditionCounts, $missingTeethCount, 42, 656),

            ['text', 42, 622, 'DETAIL TEMUAN KLINIS', 11, true, [0.03, 0.27, 0.38]],
            ...$this->detectionRows($detections->all(), 42, 590),

            ['fill_rect', 42, 84, 300, 76, [0.96, 0.99, 1]],
            ['stroke_rect', 42, 84, 300, 76, [0.78, 0.9, 0.96]],
            ['text', 60, 136, 'Pernyataan Verifikasi', 11, true, [0.03, 0.27, 0.38]],
            ['text', 60, 116, 'Dokumen ini diterbitkan oleh sistem Dentalyze AI.', 9, false, [0.32, 0.42, 0.55]],
            ['text', 60, 100, 'Scan QR untuk memastikan dokumen asli.', 9, false, [0.32, 0.42, 0.55]],

            ['text', 402, 154, 'Dokter Pemeriksa,', 10, false, [0.03, 0.27, 0.38]],
            ['image', 398, 54, 96, 96, $qrCodePath],
            ['stroke_rect', 394, 50, 104, 104, [0.78, 0.9, 0.96]],
            ['text', 382, 30, $radiograph['doctor_name'] ?? '-', 11, true, [0.03, 0.27, 0.38]],
            ['text', 360, 16, 'SCAN TO VERIFY ORIGINAL DOCUMENT', 7, true, [0.45, 0.55, 0.68]],
        ];
    }

    /**
     * @param  array<string, mixed>  $patient
     * @return array<int, array<int, mixed>>
     */
    private function statCards(array $patient, int $abnormalCount, int $missingTeethCount): array
    {
        return [
            ['fill_rect', 42, 676, 158, 44, [1, 1, 1]],
            ['stroke_rect', 42, 676, 158, 44, [0.78, 0.9, 0.96]],
            ['text', 58, 704, 'PASIEN', 7, true, [0.55, 0.64, 0.74]],
            ['text', 58, 686, Str::limit((string) ($patient['name'] ?? '-'), 18), 12, true, [0.03, 0.27, 0.38]],
            ['fill_rect', 218, 676, 158, 44, [1, 1, 1]],
            ['stroke_rect', 218, 676, 158, 44, [0.78, 0.9, 0.96]],
            ['text', 234, 704, 'TOTAL TEMUAN', 7, true, [0.55, 0.64, 0.74]],
            ['text', 234, 686, $abnormalCount.' gigi', 12, true, [0.03, 0.48, 0.88]],
            ['fill_rect', 394, 676, 159, 44, [1, 1, 1]],
            ['stroke_rect', 394, 676, 159, 44, [0.78, 0.9, 0.96]],
            ['text', 410, 704, 'GIGI HILANG', 7, true, [0.55, 0.64, 0.74]],
            ['text', 410, 686, $missingTeethCount.' gigi', 12, true, [0.03, 0.48, 0.88]],
        ];
    }

    /**
     * @param  array{Normal: int, Karies: int, LesiPeriapikal: int, Resorpsi: int, Impaksi: int}  $conditionCounts
     * @return array<int, array<int, mixed>>
     */
    private function conditionSummaryCards(array $conditionCounts, int $missingTeethCount, int $startX, int $y): array
    {
        $items = [
            ['Normal', $conditionCounts['Normal'], [0.9, 0.99, 0.95], [0.06, 0.55, 0.28]],
            ['Karies', $conditionCounts['Karies'], [1, 0.96, 0.78], [0.65, 0.43, 0]],
            ['Lesi', $conditionCounts['LesiPeriapikal'], [0.94, 0.89, 1], [0.39, 0.2, 0.82]],
            ['Resorpsi', $conditionCounts['Resorpsi'], [1, 0.91, 0.84], [0.78, 0.29, 0.04]],
            ['Impaksi', $conditionCounts['Impaksi'], [0.88, 0.96, 1], [0.03, 0.48, 0.88]],
            ['Hilang', $missingTeethCount, [0.93, 0.96, 0.99], [0.45, 0.55, 0.68]],
        ];

        $commands = [];
        $x = $startX;

        foreach ($items as [$label, $value, $fill, $color]) {
            $commands[] = ['fill_rect', $x, $y, 78, 48, $fill];
            $commands[] = ['stroke_rect', $x, $y, 78, 48, [0.78, 0.9, 0.96]];
            $commands[] = ['text', $x + 9, $y + 30, $label, 7, true, [0.45, 0.55, 0.68]];
            $commands[] = ['text', $x + 9, $y + 9, (string) $value, 16, true, $color];
            $x += 86;
        }

        return $commands;
    }

    /**
     * @param  Collection<int, array<string, mixed>>  $detections
     * @return array<int, array<int, mixed>>
     */
    private function odontogramCommands(Collection $detections, int $x, int $startY): array
    {
        $byFdi = $detections->keyBy('no_fdi');
        $rows = [
            ['18', '17', '16', '15', '14', '13', '12', '11', '21', '22', '23', '24', '25', '26', '27', '28'],
            ['48', '47', '46', '45', '44', '43', '42', '41', '31', '32', '33', '34', '35', '36', '37', '38'],
        ];
        $commands = [];

        foreach ($rows as $rowIndex => $row) {
            $y = $startY - ($rowIndex * 44);

            foreach ($row as $index => $fdi) {
                $detection = $byFdi->get($fdi);
                [$fill, $text] = $this->toothColors(is_array($detection) ? (string) ($detection['abnormality'] ?? '') : null);
                $boxX = $x + ($index * 29);

                $commands[] = ['fill_rect', $boxX, $y, 23, 24, $fill];
                $commands[] = ['stroke_rect', $boxX, $y, 23, 24, [0.82, 0.9, 0.96]];
                $commands[] = ['text', $boxX + 5, $y + 8, $fdi, 7, true, $text];
            }
        }

        return $commands;
    }

    /**
     * @return array<int, array<int, mixed>>
     */
    private function odontogramLegend(int $x, int $y): array
    {
        $items = [
            ['Terdeteksi', [0.04, 0.78, 0.52]],
            ['Hilang', [0.91, 0.94, 0.97]],
            ['Karies', [1, 0.82, 0.18]],
            ['Lesi', [0.55, 0.31, 0.94]],
            ['Impaksi', [0.06, 0.65, 0.93]],
            ['Resorpsi', [0.97, 0.42, 0.05]],
        ];
        $commands = [];

        foreach ($items as $index => [$label, $fill]) {
            $itemX = $x + ($index * 76);
            $commands[] = ['fill_rect', $itemX, $y, 9, 9, $fill];
            $commands[] = ['text', $itemX + 14, $y - 1, $label, 6, false, [0.45, 0.55, 0.68]];
        }

        return $commands;
    }

    /**
     * @return array{0: array{0: float, 1: float, 2: float}, 1: array{0: float, 1: float, 2: float}}
     */
    private function toothColors(?string $abnormality): array
    {
        return match (strtolower(trim((string) $abnormality))) {
            'karies' => [[1, 0.82, 0.18], [0.35, 0.25, 0]],
            'lesiperiapikal' => [[0.55, 0.31, 0.94], [1, 1, 1]],
            'impaksi' => [[0.06, 0.65, 0.93], [1, 1, 1]],
            'resorpsi' => [[0.97, 0.42, 0.05], [1, 1, 1]],
            'normal' => [[0.04, 0.78, 0.52], [1, 1, 1]],
            default => [[0.91, 0.94, 0.97], [0.64, 0.7, 0.78]],
        };
    }

    /**
     * @param  array<int, array{0: string, 1: mixed}>  $rows
     * @return array<int, array<int, mixed>>
     */
    private function infoLines(int $x, int $startY, array $rows): array
    {
        $commands = [];
        $y = $startY;

        foreach ($rows as [$label, $value]) {
            $commands[] = ['text', $x, $y, $label, 8, true, [0.55, 0.64, 0.74]];
            $commands[] = ['text', $x + 88, $y, Str::limit((string) $value, 30), 9, false, [0.03, 0.27, 0.38]];
            $y -= 18;
        }

        return $commands;
    }

    /**
     * @param  Collection<int, array<string, mixed>>  $detections
     * @return array{Normal: int, Karies: int, LesiPeriapikal: int, Resorpsi: int, Impaksi: int}
     */
    private function conditionCounts(Collection $detections): array
    {
        $counts = [
            'Normal' => 0,
            'Karies' => 0,
            'LesiPeriapikal' => 0,
            'Resorpsi' => 0,
            'Impaksi' => 0,
        ];

        foreach ($detections as $detection) {
            $abnormality = trim((string) ($detection['abnormality'] ?? ''));

            foreach (array_keys($counts) as $condition) {
                if (strcasecmp($abnormality, $condition) === 0) {
                    $counts[$condition]++;
                    break;
                }
            }
        }

        return $counts;
    }

    /**
     * @param  array<int, array<string, mixed>>  $detections
     * @return array<int, array<int, mixed>>
     */
    private function detectionRows(array $detections, int $x, int $startY): array
    {
        $rows = [
            ['fill_rect', $x, $startY, 511, 26, [0.93, 0.98, 1]],
            ['text', $x + 12, $startY + 9, 'CROP', 8, true, [0.55, 0.64, 0.74]],
            ['text', $x + 92, $startY + 9, 'FDI', 8, true, [0.55, 0.64, 0.74]],
            ['text', $x + 134, $startY + 9, 'KELAINAN', 8, true, [0.55, 0.64, 0.74]],
            ['text', $x + 246, $startY + 9, 'CATATAN DOKTER', 8, true, [0.55, 0.64, 0.74]],
        ];
        $y = $startY - 58;

        if ($detections === []) {
            return [
                ...$rows,
                ['fill_rect', $x, $startY - 54, 511, 42, [0.98, 1, 0.98]],
                ['text', $x + 16, $startY - 30, 'Tidak ada kelainan non-normal yang perlu ditampilkan.', 10, false, [0.06, 0.55, 0.28]],
            ];
        }

        foreach (array_slice($detections, 0, 8) as $index => $detection) {
            $rows[] = ['fill_rect', $x, $y - 8, 511, 52, $index % 2 === 0 ? [0.99, 1, 1] : [0.96, 0.99, 1]];
            $rows[] = ['stroke_rect', $x, $y - 8, 511, 52, [0.86, 0.94, 0.98]];

            if (filled($detection['crop_image_path'] ?? null) && is_file($detection['crop_image_path'])) {
                $rows[] = ['image_fit', $x + 12, $y, 40, 40, $detection['crop_image_path']];
            } else {
                $rows[] = ['text', $x + 15, $y + 18, 'Manual', 8, false, [0.55, 0.64, 0.74]];
            }

            $rows[] = ['text', $x + 92, $y + 17, (string) $detection['no_fdi'], 11, true, [0.03, 0.48, 0.88]];
            $rows[] = ['text', $x + 134, $y + 17, (string) $detection['abnormality'], 9, true, [0.03, 0.27, 0.38]];
            $rows[] = ['text', $x + 246, $y + 20, Str::limit((string) ($detection['analysis'] ?? '-'), 56), 8, false, [0.32, 0.42, 0.55]];
            $y -= 58;
        }

        if (count($detections) > 8) {
            $rows[] = ['text', $x + 12, $y + 22, '+ '.(count($detections) - 8).' temuan lain tersimpan di sistem.', 9, true, [0.45, 0.55, 0.68]];
        }

        return $rows;
    }

    /**
     * @param  array<int, array<int, array<int, mixed>>>  $pages
     */
    private function build(array $pages): string
    {
        $objects = [];
        $pageObjectNumbers = [];
        $fontObject = 3;
        $nextObject = 4;

        $objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
        $objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';

        foreach ($pages as $page) {
            $content = '';
            $xobjects = [];

            foreach ($page as $command) {
                if ($command[0] === 'text') {
                    [, $x, $y, $text, $size, $bold] = $command;

                    if ($size <= 0) {
                        continue;
                    }

                    $color = $command[6] ?? [0, 0, 0];
                    $content .= $this->fillColor($color);
                    $content .= sprintf(
                        "BT /F1 %d Tf %d %d Td (%s) Tj ET\n",
                        $bold ? $size + 1 : $size,
                        $x,
                        $y,
                        $this->escape((string) $text),
                    );
                }

                if ($command[0] === 'fill_rect') {
                    [, $x, $y, $w, $h, $color] = $command;
                    $content .= $this->fillColor($color);
                    $content .= sprintf("%d %d %d %d re f\n", $x, $y, $w, $h);
                }

                if ($command[0] === 'stroke_rect') {
                    [, $x, $y, $w, $h, $color] = $command;
                    $content .= $this->strokeColor($color);
                    $content .= sprintf("%d %d %d %d re S\n", $x, $y, $w, $h);
                }

                if ($command[0] === 'rect') {
                    [, $x, $y, $w, $h] = $command;
                    $content .= sprintf("%d %d %d %d re S\n", $x, $y, $w, $h);
                }

                if ($command[0] === 'image' && filled($command[5]) && is_file($command[5])) {
                    [, $x, $y, $w, $h, $path] = $command;
                    $name = 'Im'.count($xobjects);
                    $imageObject = $nextObject++;
                    $xobjects[$name] = $imageObject;
                    $objects[$imageObject] = $this->imageObject($path);
                    $content .= sprintf("q %d 0 0 %d %d %d cm /%s Do Q\n", $w, $h, $x, $y, $name);
                }

                if ($command[0] === 'image_fit' && filled($command[5]) && is_file($command[5])) {
                    [, $x, $y, $w, $h, $path] = $command;
                    [$fitX, $fitY, $fitW, $fitH] = $this->fitImage($path, $x, $y, $w, $h);
                    $name = 'Im'.count($xobjects);
                    $imageObject = $nextObject++;
                    $xobjects[$name] = $imageObject;
                    $objects[$imageObject] = $this->imageObject($path);
                    $content .= sprintf("q %d 0 0 %d %d %d cm /%s Do Q\n", $fitW, $fitH, $fitX, $fitY, $name);
                }
            }

            $contentObject = $nextObject++;
            $pageObject = $nextObject++;
            $pageObjectNumbers[] = $pageObject;
            $objects[$contentObject] = '<< /Length '.strlen($content)." >>\nstream\n".$content.'endstream';
            $xobjectDictionary = collect($xobjects)
                ->map(fn (int $object, string $name): string => "/{$name} {$object} 0 R")
                ->implode(' ');
            $objects[$pageObject] = sprintf(
                '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 %d 0 R >> /XObject << %s >> >> /Contents %d 0 R >>',
                $fontObject,
                $xobjectDictionary,
                $contentObject,
            );
        }

        $objects[2] = '<< /Type /Pages /Kids ['.collect($pageObjectNumbers)->map(fn (int $object): string => "{$object} 0 R")->implode(' ').'] /Count '.count($pageObjectNumbers).' >>';
        ksort($objects);

        $pdf = "%PDF-1.4\n";
        $offsets = [0];

        foreach ($objects as $number => $body) {
            $offsets[$number] = strlen($pdf);
            $pdf .= "{$number} 0 obj\n{$body}\nendobj\n";
        }

        $xref = strlen($pdf);
        $pdf .= "xref\n0 ".(count($objects) + 1)."\n0000000000 65535 f \n";

        for ($i = 1; $i <= count($objects); $i++) {
            $pdf .= sprintf("%010d 00000 n \n", $offsets[$i]);
        }

        return $pdf."trailer\n<< /Size ".(count($objects) + 1)." /Root 1 0 R >>\nstartxref\n{$xref}\n%%EOF";
    }

    private function imageObject(string $path): string
    {
        $info = getimagesize($path);
        $jpeg = $this->jpegBytes($path, $info[2] ?? null);
        [$width, $height] = getimagesizefromstring($jpeg);

        return "<< /Type /XObject /Subtype /Image /Width {$width} /Height {$height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ".strlen($jpeg)." >>\nstream\n".$jpeg."\nendstream";
    }

    /**
     * @return array{0: int, 1: int, 2: int, 3: int}
     */
    private function fitImage(string $path, int $x, int $y, int $w, int $h): array
    {
        [$sourceWidth, $sourceHeight] = getimagesize($path) ?: [$w, $h];

        if ($sourceWidth <= 0 || $sourceHeight <= 0) {
            return [$x, $y, $w, $h];
        }

        $scale = min($w / $sourceWidth, $h / $sourceHeight);
        $fitW = max(1, (int) floor($sourceWidth * $scale));
        $fitH = max(1, (int) floor($sourceHeight * $scale));
        $fitX = $x + (int) floor(($w - $fitW) / 2);
        $fitY = $y + (int) floor(($h - $fitH) / 2);

        return [$fitX, $fitY, $fitW, $fitH];
    }

    private function jpegBytes(string $path, ?int $type): string
    {
        if ($type === IMAGETYPE_JPEG) {
            return file_get_contents($path);
        }

        $image = imagecreatefromstring(file_get_contents($path));
        ob_start();
        imagejpeg($image, null, 92);
        imagedestroy($image);

        return ob_get_clean();
    }

    /**
     * @param  array{0: float|int, 1: float|int, 2: float|int}  $color
     */
    private function fillColor(array $color): string
    {
        return sprintf("%.3F %.3F %.3F rg\n", $color[0], $color[1], $color[2]);
    }

    /**
     * @param  array{0: float|int, 1: float|int, 2: float|int}  $color
     */
    private function strokeColor(array $color): string
    {
        return sprintf("%.3F %.3F %.3F RG\n", $color[0], $color[1], $color[2]);
    }

    private function escape(string $text): string
    {
        return str_replace(['\\', '(', ')'], ['\\\\', '\(', '\)'], $text);
    }
}
