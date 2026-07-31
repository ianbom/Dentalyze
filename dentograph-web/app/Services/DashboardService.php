<?php

namespace App\Services;

use App\Models\Patient;
use App\Models\Radiograph;
use App\Models\User;
use Carbon\CarbonPeriod;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Storage;

class DashboardService
{
    public function __construct(private FaskesAccessService $access) {}

    /**
     * @return array<string, mixed>
     */
    public function getDashboardData(User $user): array
    {
        $role = $user->role;
        $patientScope = $this->access->scopePatients(Patient::query(), $user);
        $radiographScope = $this->access->scopeRadiographs(Radiograph::query(), $user);

        $stats = match ($role) {
            'admin' => [
                'total_users' => User::count(),
                'total_patients' => Patient::count(),
                'total_doctors' => User::where('role', 'dokter')->count(),
                'total_radiographers' => User::where('role', 'radiografer')->count(),
                'total_radiographs' => Radiograph::count(),
                'total_detections' => Radiograph::where('status', 'terverifikasi')->count(),
                'pending_verifications' => Radiograph::where('status', 'menunggu')->count(),
                'doctor_analyses' => Radiograph::whereNotNull('id_dokter')->count(),
                'radiograph_uploads' => Radiograph::whereNotNull('id_radiografer')->count(),
            ],
            'radiografer' => [
                'total_patients' => (clone $patientScope)->count(),
                'detections_today' => Radiograph::where('id_radiografer', $user->id)
                    ->whereDate('created_at', today())
                    ->count(),
                'total_detections' => Radiograph::where('id_radiografer', $user->id)->count(),
                'pending_detections' => (clone $radiographScope)->where('status', 'menunggu')->count(),
            ],
            'dokter' => [
                'my_patients' => Radiograph::where('id_dokter', $user->id)
                    ->distinct('patient_nik')
                    ->count('patient_nik'),
                'pending_verifications' => $this->verificationQueueQuery($user)->count(),
                'completed_verifications' => Radiograph::where('id_dokter', $user->id)
                    ->where('status', 'terverifikasi')
                    ->count(),
                'total_system' => (clone $radiographScope)->count(),
            ],
            'pasien' => $this->patientStats($user),
            default => [],
        };

        return [
            'role' => $role,
            'stats' => $stats,
            'user' => $user->load('patient'),
            'activities' => $role === 'admin' ? $this->adminActivities() : [],
            'notifications' => $role === 'admin' ? $this->adminNotifications() : [],
            'charts' => $role === 'admin' ? [
                'weekly' => $this->detectionSeries('week'),
                'monthly' => $this->detectionSeries('month'),
            ] : [],
            'recent_patients' => $role === 'radiografer' ? $this->recentPatients($user) : [],
            'completed_detections' => $role === 'radiografer'
                ? $this->completedDetectionsForRadiographer($user)
                : [],
            'verification_queue' => $role === 'dokter' ? $this->verificationQueue($user) : [],
            'doctor_completed_detections' => $role === 'dokter'
                ? $this->completedDetectionsForDoctor($user)
                : [],
            'patient' => $role === 'pasien' ? $this->patientProfile($user) : null,
            'latest_radiograph' => $role === 'pasien' ? $this->latestRadiographForPatient($user) : null,
            'patient_history' => $role === 'pasien' ? $this->patientHistory($user) : [],
            'ai_insights' => $role === 'pasien' && $user->patient
                ? app(AiInsightService::class)->insightsForPatient($user->patient)
                : [],
        ];
    }

    /**
     * @return array<string, int>
     */
    private function patientStats(User $user): array
    {
        $patient = $user->patient;

        if (! $patient) {
            return [
                'my_history_count' => 0,
                'verified_count' => 0,
                'waiting_count' => 0,
                'total_detections' => 0,
                'abnormal_detections' => 0,
                'health_score' => 0,
            ];
        }

        $radiographs = Radiograph::query()
            ->where('patient_nik', $patient->nik);

        $verifiedCount = (clone $radiographs)
            ->where('status', 'terverifikasi')
            ->count();
        $waitingCount = (clone $radiographs)
            ->where('status', 'menunggu')
            ->count();
        $radiographRows = (clone $radiographs)
            ->withCount([
                'detections',
                'detections as abnormal_detections_count' => fn ($query) => $query
                    ->where('is_active', true)
                    ->where('abnormality', '!=', 'Normal'),
            ])
            ->get();
        $totalDetections = (int) $radiographRows->sum('detections_count');
        $abnormalDetections = (int) $radiographRows->sum('abnormal_detections_count');
        $healthScore = $totalDetections > 0
            ? max(0, 100 - (int) round(($abnormalDetections / max($totalDetections, 1)) * 100))
            : 0;

        return [
            'my_history_count' => (clone $radiographs)->count(),
            'verified_count' => $verifiedCount,
            'waiting_count' => $waitingCount,
            'total_detections' => $totalDetections,
            'abnormal_detections' => $abnormalDetections,
            'health_score' => $healthScore,
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function patientProfile(User $user): ?array
    {
        $patient = $user->patient;

        if (! $patient) {
            return null;
        }

        return [
            'nik' => $patient->nik,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'age' => $patient->age,
            'gender' => $patient->gender,
            'birth_date' => optional($patient->birth_date)->format('Y-m-d'),
            'address' => $patient->address,
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function latestRadiographForPatient(User $user): ?array
    {
        $patient = $user->patient;

        if (! $patient) {
            return null;
        }

        $radiograph = Radiograph::query()
            ->with(['dokter:id,name', 'radiografer:id,name'])
            ->withCount([
                'detections',
                'detections as abnormal_detections_count' => fn ($query) => $query
                    ->where('is_active', true)
                    ->where('abnormality', '!=', 'Normal'),
            ])
            ->where('patient_nik', $patient->nik)
            ->latest('updated_at')
            ->first();

        if (! $radiograph) {
            return null;
        }

        return $this->radiographPayload($radiograph);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function patientHistory(User $user): array
    {
        $patient = $user->patient;

        if (! $patient) {
            return [];
        }

        return Radiograph::query()
            ->with(['dokter:id,name', 'radiografer:id,name'])
            ->withCount([
                'detections',
                'detections as abnormal_detections_count' => fn ($query) => $query
                    ->where('is_active', true)
                    ->where('abnormality', '!=', 'Normal'),
            ])
            ->where('patient_nik', $patient->nik)
            ->latest('updated_at')
            ->limit(5)
            ->get()
            ->map(fn (Radiograph $radiograph): array => $this->radiographPayload($radiograph))
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function radiographPayload(Radiograph $radiograph): array
    {
        return [
            'id_radiograph' => $radiograph->id_radiograph,
            'status' => $radiograph->status,
            'created_at' => optional($radiograph->created_at)->format('d M Y'),
            'updated_at' => optional($radiograph->updated_at)->format('d M Y'),
            'doctor_name' => $radiograph->dokter?->name,
            'radiographer_name' => $radiograph->radiografer?->name,
            'detections_count' => (int) ($radiograph->detections_count ?? 0),
            'abnormal_detections_count' => (int) ($radiograph->abnormal_detections_count ?? 0),
            'image_url' => $radiograph->image ? Storage::url($radiograph->image) : null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function adminActivities(): array
    {
        return [
            'doctors' => User::query()
                ->where('role', 'dokter')
                ->latest()
                ->get(['id', 'name'])
                ->map(fn (User $doctor): array => [
                    'id' => $doctor->id,
                    'name' => $doctor->name,
                    'total' => Radiograph::where('id_dokter', $doctor->id)->count(),
                    'today' => Radiograph::where('id_dokter', $doctor->id)
                        ->whereDate('updated_at', today())
                        ->count(),
                    'active' => Radiograph::where('id_dokter', $doctor->id)
                        ->whereDate('updated_at', today())
                        ->exists(),
                ])
                ->values(),
            'radiographers' => User::query()
                ->where('role', 'radiografer')
                ->latest()
                ->get(['id', 'name'])
                ->map(fn (User $radiographer): array => [
                    'id' => $radiographer->id,
                    'name' => $radiographer->name,
                    'total' => Radiograph::where('id_radiografer', $radiographer->id)->count(),
                    'today' => Radiograph::where('id_radiografer', $radiographer->id)
                        ->whereDate('created_at', today())
                        ->count(),
                    'active' => Radiograph::where('id_radiografer', $radiographer->id)
                        ->whereDate('created_at', today())
                        ->exists(),
                ])
                ->values(),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function adminNotifications(): array
    {
        return Radiograph::query()
            ->with(['patient.user:id,name', 'radiografer:id,name'])
            ->where('status', 'menunggu')
            ->latest()
            ->limit(6)
            ->get()
            ->map(fn (Radiograph $radiograph): array => [
                'id_radiograph' => $radiograph->id_radiograph,
                'patient_name' => $radiograph->patient?->user?->name ?? $radiograph->patient_nik,
                'radiographer_name' => $radiograph->radiografer?->name,
                'image_url' => Storage::url($radiograph->image),
                'created_at' => optional($radiograph->created_at)->diffForHumans(),
                'date' => optional($radiograph->created_at)->format('d M'),
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function recentPatients(User $viewer): array
    {
        return $this->access->scopePatients(Patient::query(), $viewer)
            ->with('user:id,name')
            ->latest()
            ->limit(4)
            ->get(['id', 'nik', 'user_id', 'age', 'created_at'])
            ->map(fn (Patient $patient): array => [
                'nik' => $patient->nik,
                'name' => $patient->user?->name ?? $patient->nik,
                'age' => $patient->age,
                'date' => optional($patient->created_at)->format('d/m/Y'),
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function completedDetectionsForRadiographer(User $radiographer): array
    {
        return Radiograph::query()
            ->with(['patient.user:id,name'])
            ->withCount('detections')
            ->where('id_radiografer', $radiographer->id)
            ->where('status', 'terverifikasi')
            ->latest('updated_at')
            ->limit(4)
            ->get()
            ->map(fn (Radiograph $radiograph): array => [
                'id_radiograph' => $radiograph->id_radiograph,
                'patient_name' => $radiograph->patient?->user?->name ?? $radiograph->patient_nik,
                'detections_count' => $radiograph->detections_count,
                'date' => optional($radiograph->updated_at)->format('d/m/Y'),
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function verificationQueue(User $doctor): array
    {
        return $this->verificationQueueQuery($doctor)
            ->with(['patient.user:id,name'])
            ->latest()
            ->limit(6)
            ->get()
            ->map(fn (Radiograph $radiograph): array => [
                'id_radiograph' => $radiograph->id_radiograph,
                'patient_name' => $radiograph->patient?->user?->name ?? $radiograph->patient_nik,
                'created_at' => optional($radiograph->created_at)->diffForHumans(),
            ])
            ->values()
            ->all();
    }

    private function verificationQueueQuery(User $doctor): Builder
    {
        return $this->access
            ->scopeRadiographs(Radiograph::query(), $doctor)
            ->where('status', 'menunggu');
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function completedDetectionsForDoctor(User $doctor): array
    {
        return Radiograph::query()
            ->with(['patient.user:id,name'])
            ->where('id_dokter', $doctor->id)
            ->where('status', 'terverifikasi')
            ->latest('updated_at')
            ->limit(4)
            ->get()
            ->map(fn (Radiograph $radiograph): array => [
                'id_radiograph' => $radiograph->id_radiograph,
                'patient_name' => $radiograph->patient?->user?->name ?? $radiograph->patient_nik,
                'date' => optional($radiograph->updated_at)->format('d/m/Y'),
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{label: string, value: int}>
     */
    private function detectionSeries(string $range): array
    {
        if ($range === 'month') {
            $rows = Radiograph::query()
                ->where('status', 'terverifikasi')
                ->whereYear('updated_at', today()->year)
                ->selectRaw('MONTH(updated_at) as month, COUNT(*) as total')
                ->groupBy('month')
                ->pluck('total', 'month');

            return collect(range(1, 12))
                ->map(fn (int $month): array => [
                    'label' => now()->month($month)->format('M'),
                    'value' => (int) ($rows[$month] ?? 0),
                ])
                ->values()
                ->all();
        }

        $start = today()->subDays(6);
        $period = CarbonPeriod::create($start, today());

        $rows = Radiograph::query()
            ->where('status', 'terverifikasi')
            ->whereDate('updated_at', '>=', $start)
            ->selectRaw('DATE(updated_at) as day, COUNT(*) as total')
            ->groupBy('day')
            ->pluck('total', 'day');

        return collect($period)
            ->map(fn ($date): array => [
                'label' => $date->format('D'),
                'value' => (int) ($rows[$date->format('Y-m-d')] ?? 0),
            ])
            ->values()
            ->all();
    }
}
