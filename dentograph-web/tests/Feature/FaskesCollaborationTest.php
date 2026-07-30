<?php

use App\Models\Faskes;
use App\Models\FaskesCollaboration;
use App\Models\Patient;
use App\Models\Radiograph;
use App\Models\User;
use App\Services\DashboardService;
use App\Services\FaskesAccessService;
use App\Services\FaskesService;
use App\Services\StaffUserService;
use Illuminate\Validation\ValidationException;

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
    $user = User::factory()->create(['role' => 'pasien']);

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

test('origin staff can assign a pending radiograph to a collaborating doctor', function () {
    $faskesA = createFaskes('Faskes A');
    $faskesB = createFaskes('Faskes B');
    FaskesCollaboration::connect($faskesA, $faskesB);
    $radiographerA = createStaff('radiografer', $faskesA);
    $doctorB = createStaff('dokter', $faskesB);
    $patient = createPatientAt($faskesA, '1234567890123456');
    $radiograph = Radiograph::query()->create([
        'id_radiograph' => 'RAD-COLLAB-1',
        'id_radiografer' => $radiographerA->id,
        'patient_nik' => $patient->nik,
        'faskes_id' => $faskesA->id,
        'review_faskes_id' => $faskesA->id,
        'image' => 'radiographs/test.jpg',
        'status' => 'menunggu',
    ]);

    $this->actingAs($radiographerA)
        ->patch(route('radiographs.assignment.update', $radiograph), [
            'doctor_id' => $doctorB->id,
        ])
        ->assertRedirect();

    expect($radiograph->refresh())
        ->assigned_doctor_id->toBe($doctorB->id)
        ->review_faskes_id->toBe($faskesB->id);
});

test('assignment to a non collaborating doctor is rejected', function () {
    $faskesA = createFaskes('Faskes A');
    $faskesB = createFaskes('Faskes B');
    $radiographerA = createStaff('radiografer', $faskesA);
    $doctorB = createStaff('dokter', $faskesB);
    $patient = createPatientAt($faskesA, '1234567890123456');
    $radiograph = Radiograph::query()->create([
        'id_radiograph' => 'RAD-COLLAB-2',
        'id_radiografer' => $radiographerA->id,
        'patient_nik' => $patient->nik,
        'faskes_id' => $faskesA->id,
        'review_faskes_id' => $faskesA->id,
        'image' => 'radiographs/test.jpg',
        'status' => 'menunggu',
    ]);

    $this->actingAs($radiographerA)
        ->patch(route('radiographs.assignment.update', $radiograph), [
            'doctor_id' => $doctorB->id,
        ])
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

test('only origin staff and assigned doctor can edit shared radiograph', function () {
    $faskesA = createFaskes('Faskes A');
    $faskesB = createFaskes('Faskes B');
    FaskesCollaboration::connect($faskesA, $faskesB);
    $originRadiographer = createStaff('radiografer', $faskesA);
    $assignedDoctor = createStaff('dokter', $faskesB);
    $otherDoctor = createStaff('dokter', $faskesB);
    $patient = createPatientAt($faskesA, '1234567890123456');
    $radiograph = Radiograph::query()->create([
        'id_radiograph' => 'RAD-EDIT-SCOPE',
        'id_radiografer' => $originRadiographer->id,
        'assigned_doctor_id' => $assignedDoctor->id,
        'patient_nik' => $patient->nik,
        'faskes_id' => $faskesA->id,
        'review_faskes_id' => $faskesB->id,
        'image' => 'radiographs/test.jpg',
        'status' => 'menunggu',
    ]);
    $access = app(FaskesAccessService::class);

    expect($access->canEditRadiograph($originRadiographer, $radiograph))->toBeTrue()
        ->and($access->canEditRadiograph($assignedDoctor, $radiograph))->toBeTrue()
        ->and($access->canEditRadiograph($otherDoctor, $radiograph))->toBeFalse();
});

test('pending cross faskes assignment blocks collaboration deletion', function () {
    $faskesA = createFaskes('Faskes A');
    $faskesB = createFaskes('Faskes B');
    $collaboration = FaskesCollaboration::connect($faskesA, $faskesB);
    $radiographer = createStaff('radiografer', $faskesA);
    $doctor = createStaff('dokter', $faskesB);
    $patient = createPatientAt($faskesA, '1234567890123456');
    Radiograph::query()->create([
        'id_radiograph' => 'RAD-PENDING-COLLAB',
        'id_radiografer' => $radiographer->id,
        'assigned_doctor_id' => $doctor->id,
        'patient_nik' => $patient->nik,
        'faskes_id' => $faskesA->id,
        'review_faskes_id' => $faskesB->id,
        'image' => 'radiographs/test.jpg',
        'status' => 'menunggu',
    ]);

    expect(fn () => app(FaskesService::class)->deleteCollaboration($collaboration))
        ->toThrow(ValidationException::class);

    expect($collaboration->fresh())->not->toBeNull();
});

test('doctor with pending assignment cannot move faskes or be deleted', function () {
    $faskesA = createFaskes('Faskes A');
    $faskesB = createFaskes('Faskes B');
    $doctor = createStaff('dokter', $faskesA);
    $patient = createPatientAt($faskesA, '1234567890123456');
    Radiograph::query()->create([
        'id_radiograph' => 'RAD-PENDING-DOCTOR',
        'assigned_doctor_id' => $doctor->id,
        'patient_nik' => $patient->nik,
        'faskes_id' => $faskesA->id,
        'review_faskes_id' => $faskesA->id,
        'image' => 'radiographs/test.jpg',
        'status' => 'menunggu',
    ]);
    $service = app(StaffUserService::class);
    $payload = [
        'name' => $doctor->name,
        'email' => $doctor->email,
        'phone' => $doctor->phone,
        'faskes_id' => $faskesB->id,
    ];

    expect(fn () => $service->update((string) $doctor->id, $payload, 'dokter'))
        ->toThrow(ValidationException::class)
        ->and(fn () => $service->delete((string) $doctor->id, 'dokter'))
        ->toThrow(ValidationException::class);

    expect($doctor->fresh()->faskes_id)->toBe($faskesA->id);
});
