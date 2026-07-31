<?php

namespace App\Services;

use App\Models\Radiograph;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class VerificationService
{
    public function __construct(private FaskesAccessService $access) {}

    /**
     * @return array<string, mixed>
     */
    public function taskData(User $doctor): array
    {
        $canVerify = in_array($doctor->role, ['admin', 'dokter'], true);
        $tasks = collect();

        if ($canVerify) {
            $tasks = Radiograph::query()
                ->with(['patient.user:id,name,email,phone', 'radiografer:id,name', 'faskes:id,name'])
                ->where('status', 'menunggu')
                ->when($doctor->role === 'dokter', fn ($query) => $this->access->scopeRadiographs($query, $doctor))
                ->latest()
                ->get()
                ->map(fn (Radiograph $radiograph): array => [
                    'id_radiograph' => $radiograph->id_radiograph,
                    'patient_name' => $radiograph->patient?->user?->name ?? $radiograph->patient_nik,
                    'patient_nik' => $radiograph->patient_nik,
                    'radiographer_name' => $radiograph->radiografer?->name,
                    'faskes_name' => $radiograph->faskes?->name,
                    'image_url' => Storage::url($radiograph->image),
                    'status' => 'menunggu',
                    'created_at' => optional($radiograph->created_at)->format('Y-m-d'),
                ])
                ->values();
        }

        return [
            'tasks' => $tasks,
            'filters' => [
                'total' => $tasks->count(),
            ],
            'permissions' => [
                'verify' => $canVerify,
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function finalize(string $radiograph, array $data, User $doctor): array
    {
        $radiographModel = Radiograph::query()
            ->with('detections')
            ->findOrFail($radiograph);
        abort_unless($this->access->canFinalize($doctor, $radiographModel), 403);

        $activeDetections = collect($data['detections'] ?? [])
            ->filter(fn (array $item): bool => (bool) ($item['is_active'] ?? true))
            ->values();

        if ($radiographModel->status === 'terverifikasi') {
            if ($this->matchesFinalResult($radiographModel, $activeDetections, $data['result_image'] ?? null)) {
                return [
                    'radiograph' => $radiograph,
                    'status' => 'terverifikasi',
                    'detections' => $radiographModel->detections->toArray(),
                    'already_finalized' => true,
                ];
            }

            throw new ConflictHttpException(__('Hasil radiograf sudah difinalisasi dan tidak dapat diubah.'));
        }

        if ($activeDetections->isEmpty()) {
            throw ValidationException::withMessages([
                'detections' => __('Jalankan deteksi atau tambahkan odontogram manual sebelum menyimpan hasil final.'),
            ]);
        }

        DB::transaction(function () use ($activeDetections, $data, $doctor, $radiographModel): void {
            $this->replaceDetections($radiographModel, $activeDetections);

            $radiographModel->update([
                'id_dokter' => $doctor->id,
                'result_image' => $data['result_image'] ?? $radiographModel->result_image,
                'status' => 'terverifikasi',
            ]);
        });

        return [
            'radiograph' => $radiograph,
            'status' => 'terverifikasi',
            'detections' => $data['detections'] ?? [],
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function saveDraft(string $radiograph, array $data, User $viewer): void
    {
        $radiographModel = Radiograph::query()
            ->with('detections')
            ->findOrFail($radiograph);
        abort_unless($this->access->canViewRadiograph($viewer, $radiographModel), 403);

        if ($radiographModel->status === 'terverifikasi') {
            throw new ConflictHttpException(__('Hasil radiograf sudah difinalisasi dan tidak dapat diubah.'));
        }

        abort_unless($this->access->canEditRadiograph($viewer, $radiographModel), 403);

        $activeDetections = collect($data['detections'] ?? [])
            ->filter(fn (array $item): bool => (bool) ($item['is_active'] ?? true))
            ->values();

        DB::transaction(function () use ($activeDetections, $data, $radiographModel): void {
            $this->replaceDetections($radiographModel, $activeDetections);

            if (filled($data['result_image'] ?? null)) {
                $radiographModel->update(['result_image' => $data['result_image']]);
            }
        });
    }

    private function replaceDetections(Radiograph $radiograph, iterable $detections): void
    {
        $radiograph->detections()->delete();

        foreach ($detections as $item) {
            $radiograph->detections()->create([
                'id_radiograph' => $radiograph->id_radiograph,
                'no_fdi' => $item['no_fdi'],
                'abnormality' => $item['abnormality'],
                'analysis' => $item['analysis'] ?? null,
                'bbox' => $item['bbox'] ?? null,
                'crop_image' => $item['crop_image'] ?? null,
                'confidence' => $item['confidence'] ?? null,
                'is_active' => true,
                'source' => $item['source'] ?? 'manual',
            ]);
        }
    }

    private function matchesFinalResult(Radiograph $radiograph, $submitted, ?string $resultImage): bool
    {
        $normalize = fn ($items): array => collect($items)
            ->filter(fn ($item): bool => (bool) data_get($item, 'is_active', true))
            ->map(fn ($item): array => [
                'no_fdi' => (string) data_get($item, 'no_fdi'),
                'abnormality' => (string) data_get($item, 'abnormality'),
                'analysis' => data_get($item, 'analysis'),
                'bbox' => data_get($item, 'bbox'),
                'crop_image' => data_get($item, 'crop_image'),
                'confidence' => data_get($item, 'confidence') === null ? null : (float) data_get($item, 'confidence'),
                'source' => (string) data_get($item, 'source', 'manual'),
            ])
            ->sortBy('no_fdi')
            ->values()
            ->all();

        return $normalize($submitted) === $normalize($radiograph->detections)
            && ($resultImage ?? $radiograph->result_image) === $radiograph->result_image;
    }
}
