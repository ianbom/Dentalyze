<?php

namespace Database\Seeders;

use App\Models\Faskes;
use Illuminate\Database\Seeder;

class FaskesSeeder extends Seeder
{
    public function run(): void
    {
        collect([
            ['name' => 'RSUD dr. M. Soewandhie', 'type' => 'Rumah Sakit'],
            ['name' => 'RSUD Bhakti Dharma Husada', 'type' => 'Rumah Sakit'],
            ['name' => 'Puskesmas Jagir', 'type' => 'Puskesmas'],
            ['name' => 'Puskesmas Dukuh Kupang', 'type' => 'Puskesmas'],
        ])->each(fn (array $faskes) => Faskes::query()->updateOrCreate(
            ['name' => $faskes['name']],
            ['type' => $faskes['type']],
        ));
    }
}
