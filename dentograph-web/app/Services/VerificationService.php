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
                ->with(['patient.user:id,name,email,phone', 'radiografer:id,name', 'faskes:id,name', 'reviewFaskes:id,name'])
                ->where('status', 'menunggu')
                ->when($doctor->role === 'dokter', function ($query) use ($doctor): void {
                    $query->where(function ($query) use ($doctor): void {
                        $query->where('assigned_doctor_id', $doctor->id)
                            ->orWhere(function ($query) use ($doctor): void {
                                $query->whereNull('assigned_doctor_id')
                                    ->where('review_faskes_id', $doctor->faskes_id);
                            });
                    });
                })
                ->latest()
                ->get()
                ->map(fn (Radiograph $radiograph): array => [
                    'id_radiograph' => $radiograph->id_radiograph,
                    'patient_name' => $radiograph->patient?->user?->name ?? $radiograph->patient_nik,
                    'patient_nik' => $radiograph->patient_nik,
                    'radiographer_name' => $radiograph->radiografer?->name,
                    'faskes_name' => $radiograph->faskes?->name,
                    'review_faskes_name' => $radiograph->reviewFaskes?->name,
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
            $radiographModel->detections()->delete();

            foreach ($activeDetections as $item) {
                $radiographModel->detections()->create([
                    'id_radiograph' => $radiographModel->id_radiograph,
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
