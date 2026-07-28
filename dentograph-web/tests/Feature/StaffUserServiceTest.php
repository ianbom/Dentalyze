<?php

use App\Services\StaffUserService;

test('doctor names are stored with one normalized prefix', function (string $input) {
    $doctor = app(StaffUserService::class)->create([
        'name' => $input,
        'email' => str($input)->slug().'@example.com',
        'password' => 'password',
    ], 'dokter');

    expect($doctor->name)->toBe('drg. Budi Santoso');
})->with([
    'Budi Santoso',
    'drg. Budi Santoso',
    'Drg. Budi Santoso',
    'DRG.   Budi Santoso',
]);
