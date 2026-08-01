<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

class AiLlmService
{
    public function __construct(
        private readonly AiContextService $contextService,
        private readonly AiQuestionClassifier $questionClassifier,
        private readonly AiTraceService $trace,
    ) {}

    /** @return array{answer: string, provider: string} */
    public function chat(User $user, string $message): array
    {
        $startedAt = microtime(true);
        $this->trace->trace('Laravel][START', [
            'user_id' => $user->id,
            'user_name' => $user->name,
            'role' => $user->role,
            'question' => $message,
        ]);

        $classification = $this->questionClassifier->classify($user, $message);
        $this->trace->trace('Laravel][CLASSIFICATION', $classification);

        $contextStartedAt = microtime(true);
        $this->trace->trace('CONTEXT][START', $classification);
        $context = match ($classification['intent']) {
            'radiograph' => $this->contextService->contextForRadiograph($user, $classification['radiograph_id']),
            'self_clinical' => $this->contextService->contextForOwnPatient($user),
            'patient_name' => $this->contextService->contextForPatientName($user, $classification['patient_name']),
            default => $this->contextService->knowledgeContext($user),
        };
        $this->trace->trace('CONTEXT][RESULT', [
            'duration_ms' => $this->durationMs($contextStartedAt),
            'context' => $context,
        ]);

        $url = rtrim((string) config('services.ai_llm.url'), '/').'/chat';
        $payload = [
            'role' => $user->role,
            'question' => $message,
            'context' => $context,
        ];
        $httpStartedAt = microtime(true);
        $this->trace->trace('LARAVEL->FASTAPI][REQUEST', [
            'url' => $url,
            'payload' => $payload,
        ]);

        try {
            $response = Http::timeout((int) config('services.ai_llm.timeout', 60))
                ->connectTimeout((int) config('services.ai_llm.connect_timeout', 8))
                ->post($url, $payload);

            $this->trace->trace('LARAVEL->FASTAPI][RESPONSE', [
                'duration_ms' => $this->durationMs($httpStartedAt),
                'status' => $response->status(),
                'body' => $response->json() ?? $response->body(),
            ]);

            if ($response->successful() && filled($response->json('answer'))) {
                $result = [
                    'answer' => (string) $response->json('answer'),
                    'provider' => (string) ($response->json('provider') ?? 'fastapi'),
                ];
                $this->trace->trace('Laravel][END', [
                    'duration_ms' => $this->durationMs($startedAt),
                    'result' => $result,
                ]);

                return $result;
            }
        } catch (Throwable $exception) {
            $this->trace->trace('LARAVEL->FASTAPI][ERROR', [
                'duration_ms' => $this->durationMs($httpStartedAt),
                'exception' => $exception,
            ]);
        }

        $result = [
            'answer' => $this->fallbackAnswer($user, $message, $context),
            'provider' => 'local-fallback',
        ];
        $this->trace->trace('Laravel][FALLBACK', ['result' => $result]);
        $this->trace->trace('Laravel][END', [
            'duration_ms' => $this->durationMs($startedAt),
            'result' => $result,
        ]);

        return $result;
    }

    /** @param array<string, mixed> $context */
    private function fallbackAnswer(User $user, string $message, array $context): string
    {
        $status = $context['lookup_status'] ?? null;
        if ($status === 'not_found') {
            return 'Data yang diminta tidak ditemukan dalam data yang dapat Anda akses.';
        }

        if ($status === 'ambiguous') {
            return 'Nama pasien cocok dengan lebih dari satu data. Mohon gunakan nama lengkap atau NIK pasien.';
        }

        if ($status === 'denied') {
            return 'Data tersebut tidak dapat diakses oleh akun Anda.';
        }

        if (($context['intent'] ?? null) === 'knowledge') {
            return 'Layanan AI sementara tidak dapat terhubung. Silakan coba kembali setelah beberapa saat.';
        }

        $radiographs = collect($context['radiographs'] ?? []);
        $latest = $radiographs->first();
        $totalFindings = $radiographs
            ->flatMap(fn (array $radiograph): array => $radiograph['detections'] ?? [])
            ->filter(fn (array $detection): bool => strcasecmp((string) ($detection['abnormality'] ?? ''), 'Normal') !== 0)
            ->count();

        $answer = 'Layanan AI sementara tidak dapat terhubung. Berikut ringkasan data yang tersedia sesuai akses akun Anda. ';
        if ($latest) {
            $answer .= 'Radiograf terbaru yang bisa Anda akses adalah '.($latest['id'] ?? '-').' dengan status '.($latest['status'] ?? '-').'. ';
        }

        $answer .= 'Total temuan non-normal dalam konteks yang boleh diakses: '.$totalFindings.'. ';
        $answer .= Str::contains(Str::lower($message), ['membaik', 'memburuk', 'penurunan', 'perbaikan'])
            ? 'Untuk tren kesehatan, bandingkan jumlah dan jenis kelainan antar radiograf terbaru dan sebelumnya.'
            : 'Silakan coba kembali setelah beberapa saat.';

        return $answer;
    }

    private function durationMs(float $startedAt): float
    {
        return round((microtime(true) - $startedAt) * 1000, 2);
    }
}
