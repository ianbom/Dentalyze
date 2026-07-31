<?php

use App\Models\Faskes;
use App\Models\User;

function patientPayload(array $overrides = []): array
{
    return [
        'nik' => '1234567890123456',
        'name' => 'Pasien Baru',
        'email' => null,
        'phone' => '081234567890',
        'birth_place' => 'Surabaya',
        'birth_date' => '2000-01-01',
        'address' => 'Surabaya',
        'age' => 26,
        'gender' => 'male',
        ...$overrides,
    ];
}

test('radiographer receives patient creation permission on patient and detection pages', function () {
    $faskes = Faskes::query()->create(['name' => 'Klinik Surabaya', 'type' => 'Klinik']);
    $radiographer = User::factory()->create(['role' => 'radiografer', 'faskes_id' => $faskes->id]);

    $this->actingAs($radiographer)
        ->get(route('patients.index'))
        ->assertInertia(fn ($page) => $page->where('permissions.create', true));

    $this->actingAs($radiographer)
        ->get(route('radiographs.index'))
        ->assertInertia(fn ($page) => $page->where('permissions.create_patient', true));
});

test('doctor and patient cannot create patients from UI or direct requests', function (string $role) {
    $user = User::factory()->create(['role' => $role]);

    $this->actingAs($user)
        ->get(route('patients.index'))
        ->assertInertia(fn ($page) => $page->where('permissions.create', false));

    $this->actingAs($user)
        ->get(route('radiographs.index'))
        ->assertInertia(fn ($page) => $page->where('permissions.create_patient', false));

    $this->actingAs($user)
        ->post(route('patients.store'), patientPayload())
        ->assertForbidden();
})->with(['dokter', 'pasien']);

test('radiographer can create a patient for their own faskes', function () {
    $faskes = Faskes::query()->create(['name' => 'Klinik Surabaya', 'type' => 'Klinik']);
    $radiographer = User::factory()->create(['role' => 'radiografer', 'faskes_id' => $faskes->id]);

    $this->actingAs($radiographer)
        ->post(route('patients.store'), patientPayload())
        ->assertRedirect(route('patients.index'));

    $this->assertDatabaseHas('patients', [
        'nik' => '1234567890123456',
        'faskes_id' => $faskes->id,
    ]);
});
