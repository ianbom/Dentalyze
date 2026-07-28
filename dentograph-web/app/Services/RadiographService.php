<?php

namespace App\Services;

use App\Models\Patient;
use App\Models\Radiograph;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class RadiographService
{
    /**
     * @return array<string, mixed>
     */
    public function indexData(User $viewer): array
    {
        $radiographs = Radiograph::query()
            ->when($viewer->role === 'pasien', fn ($query) => $query->where('patient_nik', $viewer->patient?->nik ?? '__none__'))
            ->with(['patient.user:id,name,email,phone', 'dokter:id,name', 'radiografer:id,name', 'detections'])
            ->latest()
            ->get()
            ->map(fn (Radiograph $radiograph): array => [
                ...$this->payload($radiograph),
                'can_delete' => $this->canDelete($radiograph, $viewer),
            ])
            ->values();

        return [
            'radiographs' => $radiographs,
            'patients' => $this->patientOptions(),
            'filters' => [
                'total' => $radiographs->count(),
                'waiting' => $radiographs->where('status', 'menunggu')->count(),
                'verified' => $radiographs->where('status', 'terverifikasi')->count(),
            ],
            'permissions' => [
                'create' => in_array($viewer->role, ['admin', 'radiografer'], true),
                'analyze' => in_array($viewer->role, ['admin', 'dokter', 'radiografer'], true),
                'delete' => in_array($viewer->role, ['admin', 'radiografer'], true),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function detailData(string $radiograph, ?User $viewer = null): array
    {
        $radiograph = $this->findForViewer($radiograph, $viewer);
        $isFinalized = $radiograph->status === 'terverifikasi';
        $canAnalyze = $viewer && ! $isFinalized
            ? in_array($viewer->role, ['admin', 'dokter', 'radiografer'], true)
            : false;
        $canFinalize = $viewer && ! $isFinalized
            ? in_array($viewer->role, ['admin', 'dokter'], true)
            : false;

        return [
            'radiograph' => $this->payload($radiograph),
            'detections' => $radiograph->detections
                ->sortByDesc(fn ($detection): float => (float) ($detection->confidence ?? 0))
                ->unique('no_fdi')
                ->sortBy('no_fdi')
                ->map(fn ($detection): array => [
                    'id_detection' => $detection->id_detection,
                    'no_fdi' => $detection->no_fdi,
                    'abnormality' => $detection->abnormality,
                    'analysis' => $detection->analysis,
                    'bbox' => $detection->bbox,
                    'crop_image' => $detection->crop_image,
                    'crop_image_url' => $detection->crop_image ? Storage::url($detection->crop_image) : null,
                    'confidence' => $detection->confidence,
                    'is_active' => $detection->is_active,
                    'source' => $detection->source,
                ])
                ->values(),
            'permissions' => [
                'analyze' => $canAnalyze,
                'finalize' => $canFinalize,
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function historyData(string $radiograph): array
    {
        return [
            'radiograph' => $radiograph,
            'history' => [],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function historyIndexData(User $viewer): array
    {
        $radiographs = Radiograph::query()
            ->when($viewer->role === 'pasien', fn ($query) => $query->where('patient_nik', $viewer->patient?->nik ?? '__none__'))
            ->with(['patient.user:id,name,email,phone', 'dokter:id,name', 'radiografer:id,name', 'detections'])
            ->withCount('detections')
            ->latest()
            ->get()
            ->map(fn (Radiograph $radiograph): array => [
                ...$this->payload($radiograph),
                'detections_count' => $radiograph->detections_count,
                'relative_time' => optional($radiograph->updated_at)->diffForHumans(),
                'can_delete' => $this->canDelete($radiograph, $viewer),
            ])
            ->values();

        return [
            'radiographs' => $radiographs,
            'filters' => [
                'total' => $radiographs->count(),
                'waiting' => $radiographs->where('status', 'menunggu')->count(),
                'verified' => $radiographs->where('status', 'terverifikasi')->count(),
            ],
            'viewer_role' => $viewer->role,
            'permissions' => [
                'delete' => in_array($viewer->role, ['admin', 'radiografer'], true),
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data, User $radiographer): string
    {
        $id = 'RAD-'.now()->format('YmdHis').'-'.Str::upper(Str::random(4));
        $image = $data['image']->store('radiographs', 'public');

        Radiograph::create([
            'id_radiograph' => $id,
            'id_dokter' => null,
            'id_radiografer' => $radiographer->id,
            'patient_nik' => $data['patient_nik'],
            'image' => $image,
            'status' => 'menunggu',
        ]);

        return $id;
    }

    public function delete(string $radiograph, User $viewer): void
    {
        $radiograph = $this->find($radiograph);

        abort_unless($this->canDelete($radiograph, $viewer), 403);

        DB::transaction(function () use ($radiograph): void {
            $files = collect([
                $radiograph->image,
                $radiograph->result_image,
                'reports/qr/'.$radiograph->id_radiograph.'.png',
            ]);

            $files = $files
                ->merge($radiograph->detections->pluck('crop_image'))
                ->filter()
                ->unique()
                ->values();

            $radiograph->detections()->delete();
            $radiograph->delete();

            Storage::disk('public')->delete($files->all());
        });
    }

    private function canDelete(Radiograph $radiograph, User $viewer): bool
    {
        if ($viewer->role === 'admin') {
            return true;
        }

        return $viewer->role === 'radiografer'
            && (int) $radiograph->id_radiografer === (int) $viewer->id;
    }

    public function find(string $radiograph): Radiograph
    {
        return Radiograph::query()
            ->with(['patient.user:id,name,email,phone', 'detections', 'dokter:id,name', 'radiografer:id,name'])
            ->findOrFail($radiograph);
    }

    private function findForViewer(string $radiograph, ?User $viewer): Radiograph
    {
        return Radiograph::query()
            ->when($viewer?->role === 'pasien', fn ($query) => $query->where('patient_nik', $viewer->patient?->nik ?? '__none__'))
            ->with(['patient.user:id,name,email,phone', 'detections', 'dokter:id,name', 'radiografer:id,name'])
            ->findOrFail($radiograph);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function patientOptions(): array
    {
        return Patient::query()
            ->with('user:id,name')
            ->latest()
            ->get()
            ->map(fn (Patient $patient): array => [
                'nik' => $patient->nik,
                'name' => $patient->user?->name ?? $patient->nik,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(Radiograph $radiograph): array
    {
        $status = match ($radiograph->status) {
            'draft', 'analyzed' => 'menunggu',
            'verified' => 'terverifikasi',
            default => $radiograph->status,
        };
        $detectedTeethCount = $radiograph->detections
            ->where('is_active', true)
            ->pluck('no_fdi')
            ->unique()
            ->count();

        return [
            'id_radiograph' => $radiograph->id_radiograph,
            'patient_nik' => $radiograph->patient_nik,
            'patient_name' => $radiograph->patient?->user?->name ?? $radiograph->patient_nik,
            'patient' => [
                'nik' => $radiograph->patient_nik,
                'name' => $radiograph->patient?->user?->name ?? '-',
                'email' => $radiograph->patient?->user?->email,
                'phone' => $radiograph->patient?->user?->phone,
                'birth_date' => optional($radiograph->patient?->birth_date)->format('Y-m-d'),
                'age' => $radiograph->patient?->age,
                'gender' => $radiograph->patient?->gender,
                'address' => $radiograph->patient?->address,
            ],
            'doctor_name' => $radiograph->dokter?->name,
            'radiographer_name' => $radiograph->radiografer?->name,
            'image_url' => Storage::url($radiograph->image),
            'result_image_url' => $radiograph->result_image
                ? Storage::url($radiograph->result_image).'?v='.optional($radiograph->updated_at)->timestamp
                : null,
            'status' => $status,
            'detected_teeth_count' => $detectedTeethCount,
            'missing_teeth_count' => $status === 'menunggu' && $detectedTeethCount === 0
                ? null
                : max(32 - $detectedTeethCount, 0),
            'created_at' => optional($radiograph->created_at)->format('Y-m-d'),
            'updated_at' => optional($radiograph->updated_at)->timestamp,
        ];
    }
}
