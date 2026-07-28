<?php

namespace App\Services;

use App\Models\Radiograph;
use Illuminate\Support\Str;

class PublicVerificationService
{
    /**
     * @return array<string, mixed>
     */
    public function verify(string $radiograph): array
    {
        $record = Radiograph::query()
            ->with(['patient.user:id,name', 'dokter:id,name'])
            ->whereKey($radiograph)
            ->where('status', 'terverifikasi')
            ->first();

        if (! $record) {
            return [
                'radiograph' => $radiograph,
                'valid' => false,
                'summary' => [
                    'patient_name' => null,
                    'verified_at' => null,
                    'doctor_name' => null,
                ],
            ];
        }

        $patientName = $record->patient?->user?->name ?? '-';

        return [
            'radiograph' => $radiograph,
            'valid' => true,
            'summary' => [
                'patient_name' => Str::mask($patientName, '*', 1, max(Str::length($patientName) - 2, 0)),
                'verified_at' => optional($record->updated_at)->translatedFormat('d F Y'),
                'doctor_name' => $record->dokter?->name,
            ],
        ];
    }
}
