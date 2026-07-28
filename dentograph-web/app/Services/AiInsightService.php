<?php

namespace App\Services;

use App\Models\AiInsight;
use App\Models\Patient;
use App\Models\Radiograph;
use Illuminate\Support\Collection;

class AiInsightService
{
    /**
     * @return array<int, array<string, mixed>>
     */
    public function insightsForPatient(Patient $patient): array
    {
        $radiographs = Radiograph::query()
            ->with('detections')
            ->where('patient_nik', $patient->nik)
            ->where('status', 'terverifikasi')
            ->latest('updated_at')
            ->limit(2)
            ->get();

        $latest = $radiographs->first();

        if (! $latest) {
            return [];
        }

        $previous = $radiographs->get(1);
        $generated = $this->generate($patient, $latest, $previous);

        foreach ($generated as $insight) {
            AiInsight::updateOrCreate(
                [
                    'patient_nik' => $patient->nik,
                    'id_radiograph' => $latest->id_radiograph,
                    'type' => $insight['type'],
                    'title' => $insight['title'],
                ],
                $insight,
            );
        }

        return AiInsight::query()
            ->where('patient_nik', $patient->nik)
            ->where('id_radiograph', $latest->id_radiograph)
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (AiInsight $insight): array => [
                'type' => $insight->type,
                'severity' => $insight->severity,
                'title' => $insight->title,
                'description' => $insight->description,
                'recommendation' => $insight->recommendation,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function generate(Patient $patient, Radiograph $latest, ?Radiograph $previous): array
    {
        $latestActive = $latest->detections->where('is_active', true);
        $previousActive = $previous?->detections?->where('is_active', true) ?? collect();
        $latestAbnormal = $this->abnormal($latestActive);
        $previousAbnormal = $this->abnormal($previousActive);
        $newFindings = $latestAbnormal
            ->reject(fn ($detection) => $previousAbnormal->contains('no_fdi', $detection->no_fdi))
            ->values();

        $insights = [];

        if ($newFindings->isNotEmpty()) {
            $first = $newFindings->first();
            $insights[] = [
                'patient_nik' => $patient->nik,
                'id_radiograph' => $latest->id_radiograph,
                'type' => 'new_finding',
                'severity' => $this->severityFor($first->abnormality),
                'title' => $first->abnormality.' ditemukan pada gigi '.$first->no_fdi,
                'description' => 'AI menemukan temuan baru pada gigi '.$first->no_fdi.' berdasarkan radiograf terakhir.',
                'recommendation' => 'Diskusikan hasil ini dengan dokter gigi agar pemeriksaan klinis dapat mengonfirmasi kondisi tersebut.',
                'metadata' => ['fdi' => $first->no_fdi, 'abnormality' => $first->abnormality],
            ];
        }

        $delta = $latestAbnormal->count() - $previousAbnormal->count();
        $insights[] = [
            'patient_nik' => $patient->nik,
            'id_radiograph' => $latest->id_radiograph,
            'type' => 'trend',
            'severity' => $delta > 0 ? 'warning' : ($delta < 0 ? 'positive' : 'info'),
            'title' => $delta > 0 ? 'Ada indikasi penurunan kondisi' : ($delta < 0 ? 'Ada indikasi perbaikan' : 'Kondisi relatif stabil'),
            'description' => $this->trendDescription($delta, $latestAbnormal->count(), $previousAbnormal->count()),
            'recommendation' => $delta > 0
                ? 'Prioritaskan kontrol lanjutan dan perawatan pada gigi yang memiliki temuan baru.'
                : 'Tetap lanjutkan pemantauan dan kebiasaan perawatan gigi rutin.',
            'metadata' => [
                'latest_abnormal' => $latestAbnormal->count(),
                'previous_abnormal' => $previousAbnormal->count(),
            ],
        ];

        if ($latestActive->where('abnormality', 'Normal')->count() > 0) {
            $insights[] = [
                'patient_nik' => $patient->nik,
                'id_radiograph' => $latest->id_radiograph,
                'type' => 'healthy_area',
                'severity' => 'positive',
                'title' => 'Sebagian gigi terpantau normal',
                'description' => 'Beberapa gigi pada radiograf terakhir tidak menunjukkan kelainan pada hasil AI.',
                'recommendation' => 'Pertahankan kebiasaan menyikat gigi, flossing, dan pemeriksaan berkala.',
                'metadata' => ['normal_count' => $latestActive->where('abnormality', 'Normal')->count()],
            ];
        }

        return $insights;
    }

    private function abnormal(Collection $detections): Collection
    {
        return $detections
            ->filter(fn ($detection): bool => strcasecmp((string) $detection->abnormality, 'Normal') !== 0)
            ->values();
    }

    private function severityFor(string $abnormality): string
    {
        return match (strtolower($abnormality)) {
            'karies', 'lesiperiapikal' => 'warning',
            'impaksi', 'resorpsi' => 'info',
            default => 'info',
        };
    }

    private function trendDescription(int $delta, int $latest, int $previous): string
    {
        if ($previous === 0) {
            return 'Radiograf ini menjadi dasar awal pemantauan kesehatan gigi dengan '.$latest.' temuan non-normal.';
        }

        if ($delta > 0) {
            return 'Jumlah temuan non-normal naik dari '.$previous.' menjadi '.$latest.' pada radiograf terbaru.';
        }

        if ($delta < 0) {
            return 'Jumlah temuan non-normal turun dari '.$previous.' menjadi '.$latest.' pada radiograf terbaru.';
        }

        return 'Jumlah temuan non-normal tetap '.$latest.' dibanding pemeriksaan sebelumnya.';
    }
}
