<?php

use App\Models\Patient;
use App\Models\Radiograph;
use App\Models\User;
use App\Services\AiContextService;
use App\Services\AiQuestionClassifier;

it('classifies general knowledge questions', function () {
    $result = app(AiQuestionClassifier::class)->classify(User::factory()->make(['role' => 'pasien']), 'Apa itu impaksi?');

    expect($result)->toMatchArray(['intent' => 'knowledge', 'patient_name' => null, 'radiograph_id' => null]);
});

it('extracts a named patient from a clinical question', function () {
    $result = app(AiQuestionClassifier::class)->classify(User::factory()->make(['role' => 'dokter']), 'Bagaimana kondisi pasien Ian Ale?');

    expect($result)->toMatchArray(['intent' => 'patient_name', 'patient_name' => 'Ian Ale', 'radiograph_id' => null]);

    $withSuffix = app(AiQuestionClassifier::class)->classify(User::factory()->make(['role' => 'dokter']), 'Bagaimana kondisi pasien Ian Ale saat ini?');
    expect($withSuffix['patient_name'])->toBe('Ian Ale');
});

it('extracts a radiograph id before other intents', function () {
    $result = app(AiQuestionClassifier::class)->classify(User::factory()->make(['role' => 'dokter']), 'Tolong jelaskan RAD-2026-001');

    expect($result)->toMatchArray(['intent' => 'radiograph', 'radiograph_id' => 'RAD-2026-001', 'patient_name' => null]);
});

it('classifies patient self clinical questions separately', function () {
    $result = app(AiQuestionClassifier::class)->classify(User::factory()->make(['role' => 'pasien']), 'Bagaimana kondisi gigi saya?');

    expect($result)->toMatchArray(['intent' => 'self_clinical', 'patient_name' => null, 'radiograph_id' => null]);
});

it('does not classify self references for staff as own clinical data', function () {
    $result = app(AiQuestionClassifier::class)->classify(User::factory()->make(['role' => 'dokter']), 'Bagaimana kondisi gigi saya?');

    expect($result['intent'])->toBe('knowledge');
});

it('returns only the requested patient context', function () {
    $viewer = User::factory()->create(['role' => 'admin']);
    $patientUser = User::factory()->create(['name' => 'Ian Ale', 'role' => 'pasien']);
    Patient::create(['user_id' => $patientUser->id, 'nik' => '123', 'age' => 30, 'gender' => 'male']);
    User::factory()->create(['name' => 'Other Patient', 'role' => 'pasien']);

    $context = app(AiContextService::class)->contextForPatientName($viewer, 'Ian Ale');

    expect($context['lookup_status'])->toBe('found')
        ->and($context['patients'])->toHaveCount(1)
        ->and($context['patients'][0]['name'])->toBe('Ian Ale');
});

it('returns only the requested radiograph context', function () {
    $viewer = User::factory()->create(['role' => 'admin']);
    $patientUser = User::factory()->create(['name' => 'Ian Ale', 'role' => 'pasien']);
    $patient = Patient::create(['user_id' => $patientUser->id, 'nik' => '456', 'age' => 30, 'gender' => 'male']);
    Radiograph::create([
        'id_radiograph' => 'RAD-TARGET-1',
        'patient_nik' => $patient->nik,
        'image' => 'radiographs/original.png',
        'status' => 'menunggu',
    ]);

    $context = app(AiContextService::class)->contextForRadiograph($viewer, 'RAD-TARGET-1');

    expect($context['lookup_status'])->toBe('found')
        ->and($context['patients'])->toHaveCount(1)
        ->and($context['radiographs'])->toHaveCount(1)
        ->and($context['radiographs'][0]['id'])->toBe('RAD-TARGET-1');
});

it('returns only the signed-in patient clinical context', function () {
    $patientUser = User::factory()->create(['name' => 'Ian Ale', 'role' => 'pasien']);
    $patient = Patient::create(['user_id' => $patientUser->id, 'nik' => '789', 'age' => 30, 'gender' => 'male']);
    Radiograph::create([
        'id_radiograph' => 'RAD-OWN-1',
        'patient_nik' => $patient->nik,
        'image' => 'radiographs/original.png',
        'status' => 'menunggu',
    ]);

    $context = app(AiContextService::class)->contextForOwnPatient($patientUser);

    expect($context['lookup_status'])->toBe('found')
        ->and($context['patients'][0]['nik'])->toBe($patient->nik)
        ->and($context['radiographs'][0]['id'])->toBe('RAD-OWN-1');
});
