<?php

use App\Mail\NewsletterWelcomeMail;
use App\Models\Patient;
use App\Models\Radiograph;
use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;

test('newsletter stores a unique subscriber and queues a thank you email', function () {
    Mail::fake();

    $this->post(route('newsletter.store'), ['email' => 'reader@example.com'])
        ->assertRedirect()
        ->assertSessionHas('newsletter_success');

    $this->assertDatabaseHas('newsletter_subscribers', ['email' => 'reader@example.com']);
    Mail::assertQueued(NewsletterWelcomeMail::class, fn ($mail) => $mail->hasTo('reader@example.com'));

    $this->post(route('newsletter.store'), ['email' => 'reader@example.com'])
        ->assertSessionHas('newsletter_success');

    expect(DB::table('newsletter_subscribers')->count())->toBe(1);
});

test('phone validation accepts only eleven or twelve digits', function (string $phone, bool $valid) {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->post(route('patients.store'), [
        'nik' => '1234567890123456',
        'name' => 'Pasien Test',
        'email' => 'patient@example.com',
        'phone' => $phone,
        'birth_place' => 'Denpasar',
        'birth_date' => '2000-01-01',
        'address' => 'Alamat',
        'age' => 26,
        'gender' => 'male',
    ]);

    $valid ? $response->assertSessionHasNoErrors('phone') : $response->assertSessionHasErrors('phone');
})->with([
    ['08123456789', true],
    ['081234567890', true],
    ['0812345678', false],
    ['0812345678901', false],
    ['08123abc789', false],
]);

test('creating a patient does not send a verification email', function () {
    Notification::fake();
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin)
        ->post(route('patients.store'), [
            'nik' => '9876543210987654',
            'name' => 'Pasien Tanpa Email Otomatis',
            'email' => 'no-auto-email@example.com',
            'phone' => '081234567890',
            'birth_place' => 'Denpasar',
            'birth_date' => '2000-01-01',
            'address' => 'Alamat',
            'age' => 26,
            'gender' => 'male',
        ])
        ->assertSessionHasNoErrors();

    $patientUser = User::query()
        ->where('email', 'no-auto-email@example.com')
        ->firstOrFail();

    $this->assertDatabaseHas('patients', [
        'nik' => '9876543210987654',
        'user_id' => $patientUser->id,
    ]);
    Notification::assertNotSentTo($patientUser, VerifyEmail::class);
});

test('admin doctor and radiographer pass analyze authorization while patient does not', function (string $role, int $status) {
    $user = User::factory()->create(['role' => $role]);

    $this->actingAs($user)
        ->post(route('radiographs.analyze', 'missing-radiograph'))
        ->assertStatus($status);
})->with([
    ['admin', 404],
    ['dokter', 404],
    ['radiografer', 404],
    ['pasien', 403],
]);

test('radiographer pending dashboard count includes all waiting radiographs', function () {
    $radiographer = User::factory()->create(['role' => 'radiografer']);
    $other = User::factory()->create(['role' => 'radiografer']);

    foreach ([$radiographer, $other] as $index => $owner) {
        $patientUser = User::factory()->create(['role' => 'pasien']);
        $nik = str_repeat((string) ($index + 1), 16);
        Patient::query()->create([
            'nik' => $nik,
            'user_id' => $patientUser->id,
            'birth_place' => 'Denpasar',
            'birth_date' => '2000-01-01',
            'address' => 'Alamat',
            'age' => 26,
            'gender' => 'male',
        ]);
        Radiograph::query()->create([
            'id_radiograph' => 'RAD-'.$index,
            'id_radiografer' => $owner->id,
            'patient_nik' => $nik,
            'image' => 'radiographs/test.png',
            'status' => 'menunggu',
        ]);
    }

    $this->actingAs($radiographer)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page->where('stats.pending_detections', 2));
});
