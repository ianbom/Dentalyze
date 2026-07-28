<?php

namespace App\Services;

use App\Models\Radiograph;
use BaconQrCode\Renderer\GDLibRenderer;
use BaconQrCode\Writer;
use Illuminate\Support\Facades\Storage;

class ReportService
{
    /**
     * @return array<string, mixed>
     */
    public function radiographPdfData(string $radiograph): array
    {
        $radiograph = Radiograph::query()
            ->with(['patient.user:id,name,email,phone', 'dokter:id,name', 'radiografer:id,name', 'detections'])
            ->findOrFail($radiograph);

        $verificationUrl = route('public.verify', $radiograph->id_radiograph);
        $qrCode = $this->qrCode($radiograph->id_radiograph, $verificationUrl);

        return [
            'radiograph' => [
                'id_radiograph' => $radiograph->id_radiograph,
                'doctor_name' => $radiograph->dokter?->name,
                'radiographer_name' => $radiograph->radiografer?->name,
                'image_url' => asset('storage/'.$radiograph->image),
                'result_image_url' => $radiograph->result_image ? asset('storage/'.$radiograph->result_image) : null,
                'image_path' => storage_path('app/public/'.$radiograph->image),
                'result_image_path' => $radiograph->result_image ? storage_path('app/public/'.$radiograph->result_image) : null,
                'status' => $radiograph->status,
                'created_at' => optional($radiograph->created_at)->translatedFormat('d F Y'),
                'verified_at' => optional($radiograph->updated_at)->translatedFormat('d F Y'),
                'verification_url' => $verificationUrl,
            ],
            'patient' => [
                'nik' => $radiograph->patient_nik,
                'name' => $radiograph->patient?->user?->name,
                'email' => $radiograph->patient?->user?->email,
                'phone' => $radiograph->patient?->user?->phone,
                'age' => $radiograph->patient?->age,
                'address' => $radiograph->patient?->address,
            ],
            'detections' => $radiograph->detections
                ->map(fn ($detection): array => [
                    'no_fdi' => $detection->no_fdi,
                    'abnormality' => $detection->abnormality,
                    'analysis' => $detection->analysis,
                    'crop_image_url' => $detection->crop_image ? Storage::url($detection->crop_image) : null,
                    'crop_image_path' => $detection->crop_image ? storage_path('app/public/'.$detection->crop_image) : null,
                    'is_active' => $detection->is_active,
                ])
                ->values(),
            'qr_code' => $qrCode['url'],
            'qr_code_path' => $qrCode['path'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function radiographDownloadData(string $radiograph): array
    {
        $data = $this->radiographPdfData($radiograph);

        $data['radiograph']['image_data_uri'] = $this->dataUri($data['radiograph']['image_path'] ?? null);
        $data['qr_code_data_uri'] = $this->dataUri($data['qr_code_path'] ?? null);
        $data['detections'] = $data['detections']
            ->map(function (array $detection): array {
                $detection['crop_image_data_uri'] = $this->dataUri($detection['crop_image_path'] ?? null);

                return $detection;
            });

        return $data;
    }

    /**
     * @return array{url: string, path: string}
     */
    private function qrCode(string $radiograph, string $verificationUrl): array
    {
        $directory = storage_path('app/public/reports/qr');
        $path = $directory.'/'.$radiograph.'.png';

        if (! is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        if (! is_file($path)) {
            $writer = new Writer(new GDLibRenderer(240, 2));
            file_put_contents($path, $writer->writeString($verificationUrl));
        }

        return [
            'url' => asset('storage/reports/qr/'.$radiograph.'.png'),
            'path' => $path,
        ];
    }

    private function dataUri(?string $path): ?string
    {
        if (! $path || ! is_file($path)) {
            return null;
        }

        $mime = mime_content_type($path) ?: 'image/jpeg';

        return 'data:'.$mime.';base64,'.base64_encode(file_get_contents($path));
    }
}
