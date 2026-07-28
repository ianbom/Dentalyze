<?php

namespace App\Services;

use App\Models\Patient;
use App\Models\Radiograph;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PatientService
{
    /**
     * @return array<string, mixed>
     */
    public function indexData(User $viewer): array
    {
        $patients = Patient::query()
            ->with('user:id,name,email,phone,role')
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
                'create' => in_array($viewer->role, ['admin', 'radiografer'], true),
                'update' => in_array($viewer->role, ['admin', 'radiografer'], true),
                'delete' => in_array($viewer->role, ['admin', 'radiografer'], true),
                'view_history' => in_array($viewer->role, ['admin', 'radiografer', 'dokter'], true),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function detailData(string $patient, ?User $viewer = null): array
    {
        $patient = $this->findByNik($patient);

        return [
            'patient' => $this->patientPayload($patient),
            'permissions' => [
                'update' => $viewer ? in_array($viewer->role, ['admin', 'radiografer'], true) : true,
                'delete' => in_array($viewer?->role, ['admin', 'radiografer'], true),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function historyData(string $patient): array
    {
        $patient = $this->findByNik($patient);
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
    public function create(array $data): string
    {
        return DB::transaction(function () use ($data): string {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
                'password' => Hash::make($data['nik']),
                'role' => 'pasien',
            ]);

            Patient::create([
                'nik' => $data['nik'],
                'user_id' => $user->id,
                'birth_place' => $data['birth_place'],
                'birth_date' => $data['birth_date'],
                'address' => $data['address'],
                'age' => $data['age'],
                'gender' => $data['gender'],
            ]);

            return (string) $data['nik'];
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(string $patient, array $data): string
    {
        $patientModel = $this->findByNik($patient);

        DB::transaction(function () use ($data, $patientModel): void {
            $patientModel->user()->update([
                'name' => $data['name'],
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
            ]);

            $patientModel->update([
                'birth_place' => $data['birth_place'],
                'birth_date' => $data['birth_date'],
                'address' => $data['address'],
                'age' => $data['age'],
                'gender' => $data['gender'],
            ]);
        });

        return $patientModel->nik;
    }

    public function delete(string $patient): void
    {
        $patientModel = $this->findByNik($patient);

        DB::transaction(function () use ($patientModel): void {
            $user = $patientModel->user;

            $patientModel->delete();
            $user?->delete();
        });
    }

    private function findByNik(string $patient): Patient
    {
        return Patient::query()
            ->with('user:id,name,email,phone,role')
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
        ];
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
