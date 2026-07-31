<?php

use App\Models\Faskes;
use App\Models\FaskesCollaboration;
use App\Models\Patient;
use App\Models\Radiograph;
use App\Models\User;
use App\Services\DashboardService;
use App\Services\FaskesAccessService;
use App\Services\FaskesService;
use App\Services\RadiographService;
use App\Services\StaffUserService;
use App\Services\VerificationService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;

function createFaskes(string $name): Faskes
{
    return Faskes::query()->create(['name' => $name, 'type' => 'Klinik']);
}

function createStaff(string $role, Faskes $faskes): User
{
    return User::factory()->create(['role' => $role, 'faskes_id' => $faskes->id]);
}

function createPatientAt(Faskes $faskes, string $nik): Patient
{
    $user = User::factory()->create(['role' => 'pasien', 'faskes_id' => $faskes->id]);

    return Patient::query()->create([
        'nik' => $nik,
        'user_id' => $user->id,
        'faskes_id' => $faskes->id,
        'birth_place' => 'Denpasar',
        'birth_date' => '2000-01-01',
        'address' => 'Alamat',
        'age' => 26,
        'gender' => 'male',
    ]);
}

function createRadiographAt(Faskes $faskes, Patient $patient, User $radiographer, string $id, string $status = 'menunggu'): Radiograph
{
    return Radiograph::query()->create([
        'id_radiograph' => $id,
        'id_radiografer' => $radiographer->id,
        'patient_nik' => $patient->nik,
        'faskes_id' => $faskes->id,
        'image' => 'radiographs/test.jpg',
        'status' => $status,
    ]);
}

test('collaboration grants symmetric direct access without becoming transitive', function () {
    $faskesA = createFaskes('Faskes A');
    $faskesB = createFaskes('Faskes B');
    $faskesC = createFaskes('Faskes C');
    FaskesCollaboration::connect($faskesA, $faskesB);
    FaskesCollaboration::connect($faskesB, $faskesC);
    $doctorA = createStaff('dokter', $faskesA);

    $ids = app(FaskesAccessService::class)->accessibleFaskesIds($doctorA);

    expect($ids)->toContain($faskesA->id, $faskesB->id)
        ->not->toContain($faskesC->id);
});

test('staff can view collaborator patients but cannot mutate them', function () {
    $faskesA = createFaskes('Faskes A');
    $faskesB = createFaskes('Faskes B');
    FaskesCollaboration::connect($faskesA, $faskesB);
    $radiographerA = createStaff('radiografer', $faskesA);
    $patientB = createPatientAt($faskesB, '1234567890123456');
    $access = app(FaskesAccessService::class);

    expect($access->canViewPatient($radiographerA, $patientB))->toBeTrue()
        ->and($access->canManagePatient($radiographerA, $patientB))->toBeFalse();
});

test('only collaborating doctors can analyze and edit a pending radiograph', function () {
    $faskesA = createFaskes('Faskes A');
    $faskesB = createFaskes('Faskes B');
    FaskesCollaboration::connect($faskesA, $faskesB);
    $radiographerA = createStaff('radiografer', $faskesA);
    $doctorB = createStaff('dokter', $faskesB);
    $radiographerB = createStaff('radiografer', $faskesB);
    $admin = User::factory()->create(['role' => 'admin']);
    $patient = createPatientAt($faskesA, '1234567890123456');
    $radiograph = createRadiographAt($faskesA, $patient, $radiographerA, 'RAD-COLLAB-1');
    $access = app(FaskesAccessService::class);
    Http::fake(['*/predict' => Http::response(['results' => []])]);

    expect($access->canEditRadiograph($admin, $radiograph))->toBeTrue()
        ->and($access->canEditRadiograph($doctorB, $radiograph))->toBeTrue()
        ->and($access->canEditRadiograph($radiographerB, $radiograph))->toBeFalse();

    $this->actingAs($radiographerB)
        ->get(route('radiographs.show', $radiograph))
        ->assertInertia(fn ($page) => $page
            ->component('detection/show')
            ->where('permissions.analyze', false)
            ->where('permissions.finalize', false));

    $this->actingAs($radiographerB)
        ->post(route('radiographs.analyze', $radiograph))
        ->assertForbidden();

    $this->actingAs($doctorB)
        ->post(route('radiographs.analyze', $radiograph))
        ->assertRedirect();
});

test('non collaborating staff cannot access or analyze a radiograph', function () {
    $faskesA = createFaskes('Faskes A');
    $faskesB = createFaskes('Faskes B');
    $radiographerA = createStaff('radiografer', $faskesA);
    $doctorB = createStaff('dokter', $faskesB);
    $patient = createPatientAt($faskesA, '1234567890123456');
    $radiograph = createRadiographAt($faskesA, $patient, $radiographerA, 'RAD-COLLAB-2');

    $this->actingAs($radiographerA)
        ->get(route('radiographs.show', $radiograph))
        ->assertOk();

    $this->actingAs($doctorB)
        ->get(route('radiographs.show', $radiograph))
        ->assertForbidden();

    $this->actingAs($doctorB)
        ->post(route('radiographs.analyze', $radiograph))
        ->assertForbidden();
});

test('only admin can manage faskes', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $doctor = User::factory()->create(['role' => 'dokter']);

    $this->actingAs($doctor)
        ->post(route('faskes.store'), ['name' => 'Klinik Baru', 'type' => 'Klinik'])
        ->assertForbidden();

    $this->actingAs($admin)
        ->post(route('faskes.store'), ['name' => 'Klinik Baru', 'type' => 'Klinik'])
        ->assertRedirect(route('faskes.index'));

    $this->assertDatabaseHas('faskes', ['name' => 'Klinik Baru']);

    $faskes = Faskes::query()->where('name', 'Klinik Baru')->firstOrFail();
    $this->actingAs($admin)
        ->put(route('faskes.update', $faskes), ['name' => 'Klinik Utama', 'type' => 'Klinik'])
        ->assertRedirect(route('faskes.index'));

    expect($faskes->refresh()->name)->toBe('Klinik Utama');
});

test('collaborating staff dashboard only counts directly accessible data', function () {
    $faskesA = createFaskes('Faskes A');
    $faskesB = createFaskes('Faskes B');
    $faskesC = createFaskes('Faskes C');
    FaskesCollaboration::connect($faskesA, $faskesB);
    $radiographer = createStaff('radiografer', $faskesA);
    createPatientAt($faskesA, '1234567890123456');
    createPatientAt($faskesB, '2234567890123456');
    createPatientAt($faskesC, '3234567890123456');

    $data = app(DashboardService::class)->getDashboardData($radiographer);

    expect($data['stats']['total_patients'])->toBe(2)
        ->and($data['recent_patients'])->toHaveCount(2);
});

test('collaborating doctor can finalize while collaborating radiographer cannot', function () {
    $faskesA = createFaskes('Faskes A');
    $faskesB = createFaskes('Faskes B');
    FaskesCollaboration::connect($faskesA, $faskesB);
    $originRadiographer = createStaff('radiografer', $faskesA);
    $doctor = createStaff('dokter', $faskesB);
    $radiographer = createStaff('radiografer', $faskesB);
    $patient = createPatientAt($faskesA, '1234567890123456');
    $radiograph = createRadiographAt($faskesA, $patient, $originRadiographer, 'RAD-FINALIZE');
    $access = app(FaskesAccessService::class);

    expect($access->canFinalize($doctor, $radiograph))->toBeTrue()
        ->and($access->canFinalize($radiographer, $radiograph))->toBeFalse();

    app(VerificationService::class)->finalize($radiograph->id_radiograph, [
        'detections' => [[
            'no_fdi' => '11',
            'abnormality' => 'Karies',
            'analysis' => 'Perlu perawatan',
            'is_active' => true,
            'source' => 'manual',
        ]],
    ], $doctor);

    expect($radiograph->refresh()->status)->toBe('terverifikasi')
        ->and($radiograph->id_dokter)->toBe($doctor->id);
});

test('collaboration deletion immediately revokes shared radiograph access', function () {
    $faskesA = createFaskes('Faskes A');
    $faskesB = createFaskes('Faskes B');
    $collaboration = FaskesCollaboration::connect($faskesA, $faskesB);
    $radiographer = createStaff('radiografer', $faskesA);
    $doctor = createStaff('dokter', $faskesB);
    $patient = createPatientAt($faskesA, '1234567890123456');
    $radiograph = createRadiographAt($faskesA, $patient, $radiographer, 'RAD-PENDING-COLLAB');
    $access = app(FaskesAccessService::class);

    expect($access->canViewRadiograph($doctor, $radiograph))->toBeTrue();

    app(FaskesService::class)->deleteCollaboration($collaboration);

    expect($access->canViewRadiograph($doctor, $radiograph))->toBeFalse();
});

test('doctor can move faskes without radiograph assignment restrictions', function () {
    $faskesA = createFaskes('Faskes A');
    $faskesB = createFaskes('Faskes B');
    $doctor = createStaff('dokter', $faskesA);
    $service = app(StaffUserService::class);
    $payload = [
        'name' => $doctor->name,
        'email' => $doctor->email,
        'phone' => $doctor->phone,
        'faskes_id' => $faskesB->id,
    ];

    $service->update((string) $doctor->id, $payload, 'dokter');

    expect($doctor->fresh()->faskes_id)->toBe($faskesB->id);
});

test('collaborating staff can delete pending radiographs but finalized radiographs stay locked', function () {
    $faskesA = createFaskes('Faskes A');
    $faskesB = createFaskes('Faskes B');
    FaskesCollaboration::connect($faskesA, $faskesB);
    $originRadiographer = createStaff('radiografer', $faskesA);
    $collaboratingDoctor = createStaff('dokter', $faskesB);
    $patient = createPatientAt($faskesA, '1234567890123456');
    $pending = createRadiographAt($faskesA, $patient, $originRadiographer, 'RAD-DELETE-PENDING');
    $finalized = createRadiographAt($faskesA, $patient, $originRadiographer, 'RAD-DELETE-FINAL', 'terverifikasi');

    $this->actingAs($collaboratingDoctor)
        ->delete(route('radiographs.destroy', $pending))
        ->assertRedirect();

    $this->assertDatabaseMissing('radiographs', ['id_radiograph' => $pending->id_radiograph]);

    expect(fn () => app(RadiographService::class)->delete($finalized->id_radiograph, $collaboratingDoctor))
        ->toThrow(ConflictHttpException::class);
});

test('collaborating radiographer cannot persist detection edits', function () {
    $faskesA = createFaskes('Faskes A');
    $faskesB = createFaskes('Faskes B');
    FaskesCollaboration::connect($faskesA, $faskesB);
    $originRadiographer = createStaff('radiografer', $faskesA);
    $collaboratingRadiographer = createStaff('radiografer', $faskesB);
    $collaboratingDoctor = createStaff('dokter', $faskesB);
    $patient = createPatientAt($faskesA, '1234567890123456');
    $radiograph = createRadiographAt($faskesA, $patient, $originRadiographer, 'RAD-DRAFT-DETECTIONS');
    $radiograph->detections()->createMany([
        ['no_fdi' => '11', 'abnormality' => 'Karies', 'is_active' => true, 'source' => 'ai'],
        ['no_fdi' => '12', 'abnormality' => 'Normal', 'is_active' => true, 'source' => 'ai'],
    ]);

    $this->actingAs($collaboratingRadiographer)
        ->patch(route('radiographs.detections.update', $radiograph), [
            'detections' => [[
                'no_fdi' => '11',
                'abnormality' => 'Karies',
                'analysis' => 'Perlu perawatan',
                'is_active' => true,
                'source' => 'manual',
            ]],
        ])
        ->assertForbidden();

    expect($radiograph->refresh()->status)->toBe('menunggu')
        ->and($radiograph->detections()->orderBy('no_fdi')->pluck('no_fdi')->all())->toBe(['11', '12']);

    $this->actingAs($collaboratingDoctor)
        ->patch(route('radiographs.detections.update', $radiograph), [
            'detections' => [[
                'no_fdi' => '11',
                'abnormality' => 'Karies',
                'analysis' => 'Perlu perawatan',
                'is_active' => true,
                'source' => 'manual',
            ]],
        ])
        ->assertRedirect();

    expect($radiograph->refresh()->status)->toBe('menunggu')
        ->and($radiograph->detections()->pluck('no_fdi')->all())->toBe(['11']);
});

test('radiographer sees direct collaborator patients and uploads radiographs under the uploader faskes', function () {
    Storage::fake('public');
    $faskesA = createFaskes('Faskes A');
    $faskesB = createFaskes('Faskes B');
    $faskesC = createFaskes('Faskes C');
    FaskesCollaboration::connect($faskesA, $faskesB);
    $radiographerB = createStaff('radiografer', $faskesB);
    $patientA = createPatientAt($faskesA, '1234567890123456');
    $patientC = createPatientAt($faskesC, '3234567890123456');
    $service = app(RadiographService::class);
    $options = collect($service->indexData($radiographerB)['patients'])->pluck('nik');

    expect($options)->toContain($patientA->nik)
        ->not->toContain($patientC->nik);

    $radiographId = $service->create([
        'patient_nik' => $patientA->nik,
        'image' => UploadedFile::fake()->image('radiograph.png'),
    ], $radiographerB);

    $radiograph = Radiograph::query()->findOrFail($radiographId);

    expect($radiograph->faskes_id)->toBe($faskesB->id)
        ->and($radiograph->id_radiografer)->toBe($radiographerB->id);

    expect(fn () => $service->create([
        'patient_nik' => $patientC->nik,
        'image' => UploadedFile::fake()->image('forbidden.png'),
    ], $radiographerB))->toThrow(HttpException::class);
});

test('radiographers can upload radiographs regardless of faskes type', function (string $type) {
    Storage::fake('public');
    $faskes = Faskes::query()->create(['name' => 'Faskes '.$type, 'type' => $type]);
    $radiographer = createStaff('radiografer', $faskes);
    $patient = createPatientAt($faskes, '1234567890123456');

    $radiographId = app(RadiographService::class)->create([
        'patient_nik' => $patient->nik,
        'image' => UploadedFile::fake()->image('radiograph.png'),
    ], $radiographer);

    expect(Radiograph::query()->findOrFail($radiographId)->faskes_id)->toBe($faskes->id);
})->with(['legacy', 'Puskesmas']);
