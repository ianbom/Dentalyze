<?php

namespace App\Services;

use App\Models\Radiograph;
use App\Models\User;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Throwable;

class AiDetectionService
{
    public function __construct(private FaskesAccessService $access) {}

    /**
     * @return array<string, mixed>
     */
    public function analyze(string $radiograph, User $viewer): array
    {
        $radiographModel = Radiograph::query()->findOrFail($radiograph);
        abort_unless($this->access->canViewRadiograph($viewer, $radiographModel), 403);

        if ($radiographModel->status === 'terverifikasi') {
            throw new ConflictHttpException(__('Radiograf sudah difinalisasi dan tidak dapat dianalisis ulang.'));
        }

        abort_unless($this->access->canEditRadiograph($viewer, $radiographModel), 403);
        $timeout = $this->timeout();

        if (function_exists('set_time_limit')) {
            set_time_limit($timeout + 30);
        }

        try {
            $response = $this->sendRequestToFastApi($this->buildPayload(
                storage_path('app/public/'.$radiographModel->image),
                $radiographModel->id_radiograph,
            ));
            $normalized = $this->normalizeResponse($response);
        } catch (ConnectionException $exception) {
            report($exception);

            $normalized = [
                'results' => [],
                'result_image' => null,
                'error' => __('AI masih memproses lebih lama dari :seconds detik. Coba jalankan deteksi lagi setelah model FastAPI selesai, atau naikkan AI_SERVICE_TIMEOUT di .env.', [
                    'seconds' => $timeout,
                ]),
            ];
        } catch (Throwable $exception) {
            report($exception);

            $normalized = [
                'results' => [],
                'result_image' => null,
                'error' => $exception->getMessage(),
            ];
        }

        return [
            'radiograph' => $radiograph,
            'status' => 'menunggu',
            'results' => $normalized['results'],
            'result_image' => $normalized['result_image'],
            'result_image_url' => $normalized['result_image']
                ? Storage::url($normalized['result_image']).'?v='.now()->timestamp
                : null,
            'message' => filled($normalized['results'])
                ? __('AI berhasil mengembalikan :count hasil deteksi.', ['count' => count($normalized['results'])])
                : ($normalized['error'] ?? __('AI tidak mengembalikan hasil deteksi.')),
        ];
    }

    /**
     * @return array<string, string>
     */
    public function buildPayload(string $imagePath, string $radiographId): array
    {
        Storage::disk('public')->makeDirectory('radiographs/results');
        Storage::disk('public')->makeDirectory('radiographs/crops/'.$radiographId);

        return [
            'image_path' => $imagePath,
            'radiograph_id' => $radiographId,
            'result_dir' => storage_path('app/public/radiographs/results'),
            'crop_dir' => storage_path('app/public/radiographs/crops/'.$radiographId),
            'result_prefix' => 'radiographs/results',
            'crop_prefix' => 'radiographs/crops/'.$radiographId,
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function sendRequestToFastApi(array $payload): array
    {
        $baseUrl = config('services.ai.url', 'http://127.0.0.1:8001');

        return Http::timeout($this->timeout())
            ->connectTimeout($this->connectTimeout())
            ->post($baseUrl.'/predict', $payload)
            ->throw()
            ->json();
    }

    /**
     * @param  array<string, mixed>  $response
     * @return array<string, mixed>
     */
    public function normalizeResponse(array $response): array
    {
        $results = collect($response['results'] ?? $response['teeth_results'] ?? [])
            ->map(fn (array $item): array => [
                'no_fdi' => (string) ($item['no_fdi'] ?? $item['tooth_number'] ?? ''),
                'abnormality' => (string) ($item['abnormality'] ?? $item['condition'] ?? 'Normal'),
                'analysis' => $item['analysis'] ?? null,
                'bbox' => $item['bbox'] ?? null,
                'crop_image' => $item['crop_image'] ?? null,
                'crop_image_url' => isset($item['crop_image']) ? Storage::url($item['crop_image']) : null,
                'confidence' => $item['confidence'] ?? $item['cond_score'] ?? null,
                'is_active' => true,
                'source' => $item['source'] ?? 'ai',
            ])
            ->filter(fn (array $item): bool => $item['no_fdi'] !== '')
            ->sortByDesc(fn (array $item): float => (float) ($item['confidence'] ?? 0))
            ->unique('no_fdi')
            ->sortBy('no_fdi')
            ->values()
            ->all();

        return [
            'results' => $results,
            'result_image' => $response['result_image'] ?? null,
        ];
    }

    private function timeout(): int
    {
        return max(1, (int) config('services.ai.timeout', 300));
    }

    private function connectTimeout(): int
    {
        return max(1, (int) config('services.ai.connect_timeout', 10));
    }
}
