<?php

use App\Models\Faskes;
use App\Models\FaskesCollaboration;
use App\Models\Patient;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;

test('database seeder creates an idempotent multi faskes demo dataset', function () {
    $this->seed(DatabaseSeeder::class);
    $this->seed(DatabaseSeeder::class);

    $faskesNames = [
        'RSUD dr. M. Soewandhie',
        'RSUD Bhakti Dharma Husada',
        'Puskesmas Jagir',
        'Puskesmas Dukuh Kupang',
    ];

    expect(Faskes::query()->whereIn('name', $faskesNames)->count())->toBe(4)
        ->and(User::query()->where('role', 'admin')->count())->toBe(1)
        ->and(User::query()->where('role', 'dokter')->count())->toBe(6)
        ->and(User::query()->where('role', 'radiografer')->count())->toBe(4)
        ->and(User::query()->where('role', 'pasien')->count())->toBe(12)
        ->and(User::query()->whereIn('role', ['dokter', 'radiografer'])->whereNull('faskes_id')->count())->toBe(0)
        ->and(User::query()->whereIn('role', ['admin', 'pasien'])->whereNotNull('faskes_id')->count())->toBe(0)
        ->and(Patient::query()->whereNull('faskes_id')->count())->toBe(0)
        ->and(Patient::query()->count())->toBe(12)
        ->and(FaskesCollaboration::query()->count())->toBe(3);

    Faskes::query()
        ->whereIn('name', $faskesNames)
        ->each(fn (Faskes $faskes) => expect($faskes->patients()->count())->toBe(3));
});
