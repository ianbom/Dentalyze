<?php

namespace Database\Seeders;

use App\Models\Faskes;
use App\Models\FaskesCollaboration;
use Illuminate\Database\Seeder;

class FaskesCollaborationSeeder extends Seeder
{
    public function run(): void
    {
        collect([
            ['RSUD dr. M. Soewandhie', 'Puskesmas Jagir'],
            ['RSUD dr. M. Soewandhie', 'RSUD Bhakti Dharma Husada'],
            ['RSUD Bhakti Dharma Husada', 'Puskesmas Dukuh Kupang'],
        ])->each(function (array $pair): void {
            FaskesCollaboration::connect(
                Faskes::query()->where('name', $pair[0])->firstOrFail(),
                Faskes::query()->where('name', $pair[1])->firstOrFail(),
            );
        });
    }
}
