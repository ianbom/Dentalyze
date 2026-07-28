<?php

use App\Models\Patient;
use App\Models\Radiograph;
use App\Models\User;
use App\Services\VerificationService;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

test('finalization is idempotent and rejects changed results', function () {
    $doctor = User::factory()->create(['role' => 'dokter']);
    $patientUser = User::factory()->create(['role' => 'pasien']);
    $patient = Patient::query()->create([
        'nik' => '1234567890123456',
        'user_id' => $patientUser->id,
        'birth_place' => 'Denpasar',
        'birth_date' => '2000-01-01',
        'address' => 'Alamat',
        'age' => 26,
        'gender' => 'male',
    ]);
    $radiograph = Radiograph::query()->create([
        'id_radiograph' => 'RAD-FINAL-1',
        'patient_nik' => $patient->nik,
        'image' => 'radiographs/test.jpg',
        'status' => 'menunggu',
    ]);
    $payload = [
        'detections' => [[
            'no_fdi' => '11',
            'abnormality' => 'Karies',
            'analysis' => 'Perlu evaluasi klinis.',
            'is_active' => true,
            'source' => 'manual',
        ]],
    ];

    $service = app(VerificationService::class);
    $service->finalize($radiograph->id_radiograph, $payload, $doctor);
    $service->finalize($radiograph->id_radiograph, $payload, $doctor);

    expect($radiograph->fresh()->detections)->toHaveCount(1);

    expect(fn () => $service->finalize($radiograph->id_radiograph, [
        'detections' => [[...$payload['detections'][0], 'abnormality' => 'Normal']],
    ], $doctor))->toThrow(ConflictHttpException::class);
});
