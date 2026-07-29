<?php

use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

function radiographUploadFixture(string $format, array $rgb): UploadedFile
{
    $path = tempnam(sys_get_temp_dir(), 'radiograph-');
    $image = imagecreatetruecolor(40, 40);
    $color = imagecolorallocate($image, $rgb[0], $rgb[1], $rgb[2]);

    imagefill($image, 0, 0, $color);

    if ($format === 'jpeg') {
        imagejpeg($image, $path, 90);
    } else {
        imagepng($image, $path);
    }

    imagedestroy($image);

    return new UploadedFile(
        $path,
        "radiograph.{$format}",
        $format === 'jpeg' ? 'image/jpeg' : 'image/png',
        null,
        true,
    );
}

function radiographUploadContext(): array
{
    $radiographer = User::factory()->create(['role' => 'radiografer']);
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

    return [$radiographer, $patient];
}

test('grayscale png radiograph can be uploaded', function () {
    Storage::fake('public');
    [$radiographer, $patient] = radiographUploadContext();

    $this->actingAs($radiographer)
        ->post(route('radiographs.store'), [
            'patient_nik' => $patient->nik,
            'image' => radiographUploadFixture('png', [120, 120, 120]),
        ])
        ->assertSessionHasNoErrors('image');

    $this->assertDatabaseCount('radiographs', 1);
    expect(Storage::disk('public')->allFiles('radiographs'))->toHaveCount(1);
});

test('near grayscale jpeg radiograph can be uploaded', function () {
    Storage::fake('public');
    [$radiographer, $patient] = radiographUploadContext();

    $this->actingAs($radiographer)
        ->post(route('radiographs.store'), [
            'patient_nik' => $patient->nik,
            'image' => radiographUploadFixture('jpeg', [120, 123, 119]),
        ])
        ->assertSessionHasNoErrors('image');

    $this->assertDatabaseCount('radiographs', 1);
});

test('colored image is rejected before storage', function () {
    Storage::fake('public');
    [$radiographer, $patient] = radiographUploadContext();

    $this->actingAs($radiographer)
        ->from(route('radiographs.index'))
        ->post(route('radiographs.store'), [
            'patient_nik' => $patient->nik,
            'image' => radiographUploadFixture('png', [220, 40, 40]),
        ])
        ->assertRedirect(route('radiographs.index'))
        ->assertSessionHasErrors('image');

    $this->assertDatabaseCount('radiographs', 0);
    expect(Storage::disk('public')->allFiles('radiographs'))->toBeEmpty();
});

test('corrupt image is rejected before storage', function () {
    Storage::fake('public');
    [$radiographer, $patient] = radiographUploadContext();
    $image = UploadedFile::fake()->createWithContent(
        'radiograph.png',
        'not a decoded image',
    );

    $this->actingAs($radiographer)
        ->post(route('radiographs.store'), [
            'patient_nik' => $patient->nik,
            'image' => $image,
        ])
        ->assertSessionHasErrors('image');

    $this->assertDatabaseCount('radiographs', 0);
    expect(Storage::disk('public')->allFiles('radiographs'))->toBeEmpty();
});

test('unsupported and oversized image uploads are rejected', function () {
    [$radiographer, $patient] = radiographUploadContext();

    $this->actingAs($radiographer)
        ->post(route('radiographs.store'), [
            'patient_nik' => $patient->nik,
            'image' => UploadedFile::fake()->create('radiograph.gif', 100, 'image/gif'),
        ])
        ->assertSessionHasErrors('image');

    $this->actingAs($radiographer)
        ->post(route('radiographs.store'), [
            'patient_nik' => $patient->nik,
            'image' => UploadedFile::fake()->create('radiograph.png', 10241, 'image/png'),
        ])
        ->assertSessionHasErrors('image');

    $this->assertDatabaseCount('radiographs', 0);
});
