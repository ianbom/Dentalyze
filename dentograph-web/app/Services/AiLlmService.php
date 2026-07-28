<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class AiLlmService
{
    public function __construct(
        private readonly AiContextService $contextService,
    ) {}

    /**
     * @return array{answer: string, provider: string}
     */
    public function chat(User $user, string $message): array
    {
        $context = $this->contextService->forUser($user, $message);

        try {
            $response = Http::timeout((int) config('services.ai_llm.timeout', 60))
                ->connectTimeout((int) config('services.ai_llm.connect_timeout', 8))
                ->post(rtrim((string) config('services.ai_llm.url'), '/').'/chat', [
                    'role' => $user->role,
                    'question' => $message,
                    'context' => $context,
                ]);

            if ($response->successful() && filled($response->json('answer'))) {
                return [
                    'answer' => (string) $response->json('answer'),
                    'provider' => (string) ($response->json('provider') ?? 'fastapi'),
                ];
            }
        } catch (\Throwable) {
            // Fallback below keeps the UI useful while FastAPI/LLM provider is being configured.
        }

        return [
            'answer' => $this->fallbackAnswer($user, $message, $context),
            'provider' => 'local-fallback',
        ];
    }

    /**
     * @param  array<string, mixed>  $context
     */
    private function fallbackAnswer(User $user, string $message, array $context): string
    {
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

        if (Str::contains(Str::lower($message), ['membaik', 'memburuk', 'penurunan', 'perbaikan'])) {
            $answer .= 'Untuk tren kesehatan, bandingkan jumlah dan jenis kelainan antar radiograf terbaru dan sebelumnya. Sistem sudah menyiapkan data itu sebagai konteks LLM.';
        } else {
            $answer .= 'Silakan coba kembali setelah beberapa saat.';
        }

        return $answer;
    }
}
