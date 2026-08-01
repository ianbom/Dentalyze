<?php

namespace App\Services;

use App\Models\AiKnowledgeBase;
use App\Models\Patient;
use App\Models\Radiograph;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class AiContextService
{
    public function __construct(
        private FaskesAccessService $access,
        private AiTraceService $trace,
    ) {}

    /**
     * Legacy broad context. Chat pipeline must use targeted methods below.
     *
     * @return array<string, mixed>
     */
    public function forUser(User $user, ?string $question = null): array
    {
        $this->trace->trace('CONTEXT][LEGACY_START', ['user_id' => $user->id, 'question' => $question]);
        $radiographs = $this->radiographQueryFor($user)
            ->with($this->radiographRelations())
            ->latest('updated_at')
            ->limit(8)
            ->get();

        return $this->finishContext('CONTEXT][LEGACY_RESULT', array_replace($this->baseContext($user, 'legacy', 'found'), [
            'patients' => $this->patientsFor($user),
            'radiographs' => $radiographs->map(fn (Radiograph $radiograph): array => $this->radiographData($radiograph))->values()->all(),
            'knowledge' => $this->knowledgeSnippets($question),
        ]));
    }

    /** @return array<string, mixed> */
    public function knowledgeContext(User $user): array
    {
        $this->trace->trace('CONTEXT][KNOWLEDGE_START', ['user_id' => $user->id, 'role' => $user->role]);

        return $this->finishContext('CONTEXT][KNOWLEDGE_RESULT', $this->baseContext($user, 'knowledge', 'not_requested'));
    }

    /** @return array<string, mixed> */
    public function contextForPatientName(User $viewer, string $name): array
    {
        $this->trace->trace('CONTEXT][PATIENT_NAME_START', [
            'user_id' => $viewer->id,
            'role' => $viewer->role,
            'patient_name' => $name,
        ]);

        if ($viewer->role === 'pasien') {
            return $this->finishContext('CONTEXT][PATIENT_NAME_RESULT', $this->baseContext($viewer, 'patient_name', 'denied'));
        }

        $patients = $this->access->scopePatients(Patient::query(), $viewer)
            ->whereHas('user', fn (Builder $query): Builder => $query->whereRaw('LOWER(users.name) = ?', [mb_strtolower(trim($name))]))
            ->with('user:id,name,email,phone')
            ->limit(2)
            ->get();

        $this->trace->trace('CONTEXT][PATIENT_NAME_QUERY', [
            'patient_name' => $name,
            'matches' => $patients->count(),
        ]);

        if ($patients->isEmpty()) {
            return $this->finishContext('CONTEXT][PATIENT_NAME_RESULT', $this->baseContext($viewer, 'patient_name', 'not_found'));
        }

        if ($patients->count() > 1) {
            return $this->finishContext('CONTEXT][PATIENT_NAME_RESULT', $this->baseContext($viewer, 'patient_name', 'ambiguous'));
        }

        return $this->contextForPatient($viewer, $patients->first(), 'patient_name');
    }

    /** @return array<string, mixed> */
    public function contextForRadiograph(User $viewer, string $id): array
    {
        $this->trace->trace('CONTEXT][RADIOGRAPH_START', [
            'user_id' => $viewer->id,
            'role' => $viewer->role,
            'radiograph_id' => $id,
        ]);

        $radiograph = $this->access->scopeRadiographs(Radiograph::query(), $viewer)
            ->with($this->radiographRelations())
            ->whereKey($id)
            ->first();

        if (! $radiograph) {
            return $this->finishContext('CONTEXT][RADIOGRAPH_RESULT', $this->baseContext($viewer, 'radiograph', 'not_found'));
        }

        return $this->finishContext('CONTEXT][RADIOGRAPH_RESULT', array_replace($this->baseContext($viewer, 'radiograph', 'found'), [
            'patients' => [$this->patientData($radiograph->patient)],
            'radiographs' => [$this->radiographData($radiograph)],
        ]));
    }

    /** @return array<string, mixed> */
    public function contextForOwnPatient(User $viewer): array
    {
        $this->trace->trace('CONTEXT][OWN_PATIENT_START', ['user_id' => $viewer->id, 'role' => $viewer->role]);

        if ($viewer->role !== 'pasien') {
            return $this->finishContext('CONTEXT][OWN_PATIENT_RESULT', $this->baseContext($viewer, 'self_clinical', 'denied'));
        }

        $patient = $this->access->scopePatients(Patient::query(), $viewer)
            ->with('user:id,name,email,phone')
            ->first();

        if (! $patient) {
            return $this->finishContext('CONTEXT][OWN_PATIENT_RESULT', $this->baseContext($viewer, 'self_clinical', 'not_found'));
        }

        return $this->contextForPatient($viewer, $patient, 'self_clinical');
    }

    public function compactText(User $user): string
    {
        return implode("\n", [
            'Role pengguna: '.$user->role,
            'Nama pengguna: '.$user->name,
            'Aturan akses: '.$this->scopeRule($user),
        ]);
    }

    public function radiographQueryFor(User $user): Builder
    {
        return $this->access->scopeRadiographs(Radiograph::query(), $user);
    }

    /** @return array<string, mixed> */
    private function contextForPatient(User $viewer, Patient $patient, string $intent): array
    {
        $this->trace->trace('CONTEXT][PATIENT_RADIOGRAPHS_QUERY', [
            'user_id' => $viewer->id,
            'patient_nik' => $patient->nik,
            'intent' => $intent,
        ]);

        $radiographs = $this->access->scopeRadiographs(Radiograph::query(), $viewer)
            ->with($this->radiographRelations())
            ->where('patient_nik', $patient->nik)
            ->latest('updated_at')
            ->get();

        return $this->finishContext('CONTEXT]['.strtoupper($intent).'_RESULT', array_replace($this->baseContext($viewer, $intent, 'found'), [
            'patients' => [$this->patientData($patient)],
            'radiographs' => $radiographs->map(fn (Radiograph $radiograph): array => $this->radiographData($radiograph))->values()->all(),
        ]));
    }

    /** @return array<string, mixed> */
    private function baseContext(User $user, string $intent, string $lookupStatus): array
    {
        return [
            'intent' => $intent,
            'lookup_status' => $lookupStatus,
            'viewer' => ['id' => $user->id, 'name' => $user->name, 'role' => $user->role],
            'scope_rule' => $this->scopeRule($user),
            'patients' => [],
            'radiographs' => [],
            'knowledge' => [],
        ];
    }

    /** @return array<int, string> */
    private function radiographRelations(): array
    {
        return ['patient.user:id,name,email,phone', 'dokter:id,name', 'radiografer:id,name', 'detections'];
    }

    /** @return array<string, mixed> */
    private function patientData(?Patient $patient): array
    {
        return [
            'nik' => $patient?->nik,
            'name' => $patient?->user?->name,
            'age' => $patient?->age,
            'gender' => $patient?->gender,
        ];
    }

    /** @return array<string, mixed> */
    private function radiographData(Radiograph $radiograph): array
    {
        return [
            'id' => $radiograph->id_radiograph,
            'status' => $radiograph->status,
            'patient_nik' => $radiograph->patient_nik,
            'patient_name' => $radiograph->patient?->user?->name,
            'radiographer' => $radiograph->radiografer?->name,
            'doctor' => $radiograph->dokter?->name,
            'created_at' => optional($radiograph->created_at)->toDateTimeString(),
            'verified_at' => optional($radiograph->updated_at)->toDateTimeString(),
            'detections' => $radiograph->detections
                ->where('is_active', true)
                ->map(fn ($detection): array => [
                    'fdi' => $detection->no_fdi,
                    'abnormality' => $detection->abnormality,
                    'analysis' => $detection->analysis,
                    'confidence' => $detection->confidence,
                ])->values()->all(),
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function patientsFor(User $user): array
    {
        return $this->access->scopePatients(Patient::query(), $user)
            ->with('user:id,name,email,phone')
            ->latest()
            ->limit(6)
            ->get()
            ->map(fn (Patient $patient): array => $this->patientData($patient))
            ->values()->all();
    }

    /** @return array<int, array{content: string}> */
    private function knowledgeSnippets(?string $question): array
    {
        if (! $question) {
            return [];
        }

        $keywords = collect(preg_split('/\s+/', mb_strtolower($question)) ?: [])
            ->map(fn (string $word): string => trim($word, " \t\n\r\0\x0B.,?!:;()[]{}\"'"))
            ->filter(fn (string $word): bool => mb_strlen($word) >= 4)
            ->take(8)
            ->values();

        if ($keywords->isEmpty()) {
            return [];
        }

        return AiKnowledgeBase::query()
            ->where('status', 'active')
            ->where(function (Builder $query) use ($keywords): void {
                $keywords->each(fn (string $word) => $query
                    ->orWhere('title', 'like', '%'.$word.'%')
                    ->orWhere('condition_name', 'like', '%'.$word.'%')
                    ->orWhere('content', 'like', '%'.$word.'%'));
            })
            ->latest()->limit(4)->get(['title', 'content'])
            ->map(fn (AiKnowledgeBase $knowledge): array => [
                'content' => mb_substr(trim($knowledge->title."\n".$knowledge->content), 0, 600),
            ])->values()->all();
    }

    /** @param array<string, mixed> $context */
    private function finishContext(string $stage, array $context): array
    {
        $this->trace->trace($stage, ['context' => $context]);

        return $context;
    }

    private function scopeRule(User $user): string
    {
        return match ($user->role) {
            'admin' => 'Boleh membaca semua data klinis dalam sistem.',
            'dokter', 'radiografer' => 'Hanya gunakan data faskes sendiri dan faskes yang berkolaborasi.',
            'pasien' => 'Hanya gunakan data pasien milik akun ini sendiri.',
            default => 'Tidak ada akses data klinis.',
        };
    }
}
