<?php

namespace App\Services;

use App\Models\AiKnowledgeBase;
use App\Models\Patient;
use App\Models\Radiograph;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class AiContextService
{
    /**
     * @return array<string, mixed>
     */
    public function forUser(User $user, ?string $question = null): array
    {
        $radiographs = $this->radiographQueryFor($user)
            ->with(['patient.user:id,name,email,phone', 'dokter:id,name', 'radiografer:id,name', 'detections'])
            ->latest('updated_at')
            ->limit(8)
            ->get();

        return [
            'viewer' => [
                'id' => $user->id,
                'name' => $user->name,
                'role' => $user->role,
            ],
            'scope_rule' => $this->scopeRule($user),
            'patients' => $this->patientsFor($user),
            'radiographs' => $radiographs->map(fn (Radiograph $radiograph): array => [
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
                    ])
                    ->values()
                    ->all(),
            ])->values()->all(),
            'knowledge' => $this->knowledgeSnippets($question),
        ];
    }

    public function compactText(User $user, ?string $question = null): string
    {
        $context = $this->forUser($user, $question);
        $lines = [
            'Role pengguna: '.$context['viewer']['role'],
            'Nama pengguna: '.$context['viewer']['name'],
            'Aturan akses: '.$context['scope_rule'],
        ];

        foreach ($context['radiographs'] as $radiograph) {
            $lines[] = sprintf(
                'Radiograf %s pasien %s status %s, dokter %s, radiografer %s.',
                $radiograph['id'],
                $radiograph['patient_name'] ?? $radiograph['patient_nik'],
                $radiograph['status'],
                $radiograph['doctor'] ?? '-',
                $radiograph['radiographer'] ?? '-',
            );

            foreach ($radiograph['detections'] as $detection) {
                $lines[] = sprintf(
                    '- Gigi %s: %s. Catatan: %s',
                    $detection['fdi'],
                    $detection['abnormality'],
                    $detection['analysis'] ?: '-',
                );
            }
        }

        foreach ($context['knowledge'] as $snippet) {
            $lines[] = 'Jurnal: '.$snippet['content'];
        }

        return implode("\n", $lines);
    }

    public function radiographQueryFor(User $user): Builder
    {
        return match ($user->role) {
            'admin' => Radiograph::query(),
            'dokter' => Radiograph::query()
                ->where(function (Builder $query) use ($user): void {
                    $query->where('status', 'menunggu')
                        ->orWhere('id_dokter', $user->id);
                }),
            'radiografer' => Radiograph::query()->where('id_radiografer', $user->id),
            'pasien' => Radiograph::query()->where('patient_nik', $user->patient?->nik ?? '__none__'),
            default => Radiograph::query()->whereRaw('1 = 0'),
        };
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function patientsFor(User $user): array
    {
        $query = Patient::query()->with('user:id,name,email,phone');

        if ($user->role === 'pasien') {
            $query->where('user_id', $user->id);
        }

        if ($user->role === 'radiografer') {
            $query->whereIn(
                'nik',
                Radiograph::query()->where('id_radiografer', $user->id)->select('patient_nik'),
            );
        }

        if ($user->role === 'dokter') {
            $query->whereIn(
                'nik',
                Radiograph::query()
                    ->where(function (Builder $query) use ($user): void {
                        $query->where('status', 'menunggu')
                            ->orWhere('id_dokter', $user->id);
                    })
                    ->select('patient_nik'),
            );
        }

        return $query
            ->latest()
            ->limit(6)
            ->get()
            ->map(fn (Patient $patient): array => [
                'nik' => $patient->nik,
                'name' => $patient->user?->name,
                'age' => $patient->age,
                'gender' => $patient->gender,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{content: string}>
     */
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
            ->latest()
            ->limit(4)
            ->get(['title', 'condition_name', 'content'])
            ->map(fn (AiKnowledgeBase $knowledge): array => [
                'content' => mb_substr(trim($knowledge->title."\n".$knowledge->content), 0, 600),
            ])
            ->values()
            ->all();
    }

    private function scopeRule(User $user): string
    {
        return match ($user->role) {
            'admin' => 'Boleh membaca semua data klinis dalam sistem.',
            'dokter' => 'Hanya gunakan radiograf menunggu verifikasi dan radiograf yang dianalisis dokter ini.',
            'radiografer' => 'Hanya gunakan pasien dan radiograf yang diunggah radiografer ini.',
            'pasien' => 'Hanya gunakan data pasien milik akun ini sendiri.',
            default => 'Tidak ada akses data klinis.',
        };
    }
}
