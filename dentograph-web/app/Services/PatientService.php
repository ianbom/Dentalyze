<?php

namespace App\Services;

use App\Models\Faskes;
use App\Models\Patient;
use App\Models\Radiograph;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PatientService
{
    public function __construct(private FaskesAccessService $access) {}

    /**
     * @return array<string, mixed>
     */
    public function indexData(User $viewer): array
    {
        $patients = $this->access->scopePatients(Patient::query(), $viewer)
            ->with(['user:id,name,email,phone,role', 'faskes:id,name'])
            ->latest()
            ->get()
            ->map(fn (Patient $patient): array => [
                'id' => $patient->id,
                'nik' => $patient->nik,
                'name' => $patient->user?->name ?? '-',
                'email' => $patient->user?->email,
                'phone' => $patient->user?->phone,
                'birth_place' => $patient->birth_place,
                'birth_date' => optional($patient->birth_date)->format('Y-m-d'),
                'age' => $patient->age,
                'gender' => $patient->gender,
                'address' => $patient->address,
                'created_at' => optional($patient->created_at)->format('Y-m-d'),
                'faskes_name' => $patient->faskes?->name,
                'can_manage' => $this->access->canManagePatient($viewer, $patient),
            ])
            ->values();

        return [
            'patients' => $patients,
            'filters' => [
                'total' => $patients->count(),
                'male' => $patients->where('gender', 'male')->count(),
                'female' => $patients->where('gender', 'female')->count(),
            ],
            'permissions' => [
                'create' => $this->access->canCreatePatient($viewer),
                'update' => in_array($viewer->role, ['admin', 'radiografer'], true),
                'delete' => in_array($viewer->role, ['admin', 'radiografer'], true),
                'view_history' => in_array($viewer->role, ['admin', 'radiografer', 'dokter'], true),
            ],
            'faskesOptions' => $this->faskesOptions($viewer),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function formData(User $viewer): array
    {
        return ['faskesOptions' => $this->faskesOptions($viewer)];
    }

    /**
     * @return array<string, mixed>
     */
    public function detailData(string $patient, ?User $viewer = null): array
    {
        $patient = $this->findByNik($patient);
        abort_unless(! $viewer || $this->access->canViewPatient($viewer, $patient), 403);

        return [
            'patient' => $this->patientPayload($patient),
            'permissions' => [
                'update' => $viewer ? $this->access->canManagePatient($viewer, $patient) : true,
                'delete' => $viewer ? $this->access->canManagePatient($viewer, $patient) : false,
            ],
            'faskesOptions' => $viewer ? $this->faskesOptions($viewer) : [],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function historyData(string $patient, User $viewer): array
    {
        $patient = $this->findByNik($patient);
        abort_unless($this->access->canViewPatient($viewer, $patient), 403);
        $radiographs = Radiograph::query()
            ->with(['dokter:id,name', 'radiografer:id,name'])
            ->withCount('detections')
            ->where('patient_nik', $patient->nik)
            ->latest()
            ->get()
            ->map(fn (Radiograph $radiograph): array => [
                'id_radiograph' => $radiograph->id_radiograph,
                'title' => 'Radiograf '.$radiograph->id_radiograph,
                'date' => optional($radiograph->created_at)->format('Y-m-d'),
                'status' => $this->normalizeRadiographStatus($radiograph->status),
                'doctor_name' => $radiograph->dokter?->name,
                'radiographer_name' => $radiograph->radiografer?->name,
                'detections_count' => $radiograph->detections_count,
            ])
            ->values();

        return [
            'patient' => $this->patientPayload($patient),
            'radiographs' => $radiographs,
            'filters' => [
                'total' => $radiographs->count(),
                'waiting' => $radiographs->where('status', 'menunggu')->count(),
                'verified' => $radiographs->where('status', 'terverifikasi')->count(),
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data, User $actor): string
    {
        $data['age'] = Carbon::parse($data['birth_date'])->age;
        $data['faskes_id'] = $actor->role === 'admin' ? ($data['faskes_id'] ?? null) : $actor->faskes_id;
        $data['faskes_id'] ??= Faskes::query()->where('type', 'legacy')->value('id');
        abort_unless($data['faskes_id'], 422);

        DB::transaction(function () use ($data): void {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
                'password' => Hash::make($data['nik']),
                'role' => 'pasien',
                'faskes_id' => $data['faskes_id'],
            ]);

            Patient::create([
                'nik' => $data['nik'],
                'user_id' => $user->id,
                'faskes_id' => $data['faskes_id'],
                'birth_place' => $data['birth_place'],
                'birth_date' => $data['birth_date'],
                'address' => $data['address'],
                'age' => $data['age'],
                'gender' => $data['gender'],
            ]);
        });

        return (string) $data['nik'];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(string $patient, array $data, User $actor): string
    {
        $data['age'] = Carbon::parse($data['birth_date'])->age;

        $patientModel = $this->findByNik($patient);
        abort_unless($this->access->canManagePatient($actor, $patientModel), 403);
        $faskesId = $actor->role === 'admin'
            ? ($data['faskes_id'] ?? $patientModel->faskes_id)
            : $patientModel->faskes_id;

        DB::transaction(function () use ($data, $faskesId, $patientModel): void {
            $patientModel->user()->update([
                'name' => $data['name'],
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
                'faskes_id' => $faskesId,
            ]);

            $patientModel->update([
                'faskes_id' => $faskesId,
                'birth_place' => $data['birth_place'],
                'birth_date' => $data['birth_date'],
                'address' => $data['address'],
                'age' => $data['age'],
                'gender' => $data['gender'],
            ]);
        });

        return $patientModel->nik;
    }

    public function delete(string $patient, User $actor): void
    {
        $patientModel = $this->findByNik($patient);
        abort_unless($this->access->canManagePatient($actor, $patientModel), 403);

        DB::transaction(function () use ($patientModel): void {
            $user = $patientModel->user;

            $patientModel->delete();
            $user?->delete();
        });
    }

    private function findByNik(string $patient): Patient
    {
        return Patient::query()
            ->with(['user:id,name,email,phone,role', 'faskes:id,name'])
            ->where('nik', $patient)
            ->firstOrFail();
    }

    /**
     * @return array<string, mixed>
     */
    private function patientPayload(Patient $patient): array
    {
        return [
            'id' => $patient->id,
            'nik' => $patient->nik,
            'name' => $patient->user?->name ?? '-',
            'email' => $patient->user?->email,
            'phone' => $patient->user?->phone,
            'birth_place' => $patient->birth_place,
            'birth_date' => optional($patient->birth_date)->format('Y-m-d'),
            'age' => $patient->age,
            'gender' => $patient->gender,
            'address' => $patient->address,
            'created_at' => optional($patient->created_at)->format('Y-m-d'),
            'faskes_id' => $patient->faskes_id,
            'faskes_name' => $patient->faskes?->name,
        ];
    }

    /**
     * @return array<int, array{id: int, name: string}>
     */
    private function faskesOptions(User $viewer): array
    {
        if ($viewer->role !== 'admin') {
            return [];
        }

        return Faskes::query()
            ->where('type', '!=', 'legacy')
            ->orderBy('name')
            ->get(['id', 'name'])
            ->toArray();
    }

    private function normalizeRadiographStatus(?string $status): string
    {
        return match ($status) {
            'draft', 'analyzed' => 'menunggu',
            'verified' => 'terverifikasi',
            default => $status ?? 'menunggu',
        };
    }
}
