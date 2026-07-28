<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\Radiograph;
use App\Models\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user()->load('patient');

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'profileData' => $this->profileData($user),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill([
            'email' => $request->validated('email'),
        ]);

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile updated.')]);

        return to_route('profile.edit');
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    /**
     * @return array<string, mixed>
     */
    private function profileData(User $user): array
    {
        $account = [
            ['label' => 'User ID', 'value' => $user->id],
            ['label' => 'Nama', 'value' => $user->name],
            ['label' => 'Email', 'value' => $user->email],
            ['label' => 'Telepon', 'value' => $user->phone],
            ['label' => 'Role', 'value' => $user->role],
            ['label' => 'Email Verified At', 'value' => optional($user->email_verified_at)->format('Y-m-d H:i')],
        ];

        return [
            'account' => $account,
            'relatedTitle' => $this->relatedTitle($user),
            'related' => $this->relatedData($user),
        ];
    }

    /**
     * @return array<int, array{label: string, value: mixed}>
     */
    private function relatedData(User $user): array
    {
        if ($user->role === 'pasien') {
            $patient = $user->patient;

            if (! $patient) {
                return [
                    ['label' => 'Status Data Pasien', 'value' => 'Belum ada detail pasien'],
                ];
            }

            return [
                ['label' => 'NIK', 'value' => $patient->nik],
                ['label' => 'Tempat Lahir', 'value' => $patient->birth_place],
                ['label' => 'Tanggal Lahir', 'value' => optional($patient->birth_date)->format('Y-m-d')],
                ['label' => 'Usia', 'value' => $patient->age ? $patient->age.' tahun' : null],
                ['label' => 'Jenis Kelamin', 'value' => $patient->gender],
                ['label' => 'Alamat', 'value' => $patient->address],
                ['label' => 'Total Radiograph', 'value' => Radiograph::where('patient_nik', $patient->nik)->count()],
                ['label' => 'Pemeriksaan Terakhir', 'value' => optional(Radiograph::where('patient_nik', $patient->nik)->latest()->first()?->created_at)->format('Y-m-d H:i')],
            ];
        }

        if ($user->role === 'dokter') {
            return [
                ['label' => 'Total Radiograph Ditangani', 'value' => Radiograph::where('id_dokter', $user->id)->count()],
                ['label' => 'Radiograph Terakhir', 'value' => optional(Radiograph::where('id_dokter', $user->id)->latest()->first()?->created_at)->format('Y-m-d H:i')],
            ];
        }

        if ($user->role === 'radiografer') {
            return [
                ['label' => 'Total Upload Radiograph', 'value' => Radiograph::where('id_radiografer', $user->id)->count()],
                ['label' => 'Upload Terakhir', 'value' => optional(Radiograph::where('id_radiografer', $user->id)->latest()->first()?->created_at)->format('Y-m-d H:i')],
            ];
        }

        return [
            ['label' => 'Total User Sistem', 'value' => User::count()],
            ['label' => 'Total Radiograph Sistem', 'value' => Radiograph::count()],
        ];
    }

    private function relatedTitle(User $user): string
    {
        return match ($user->role) {
            'pasien' => 'Data Pasien Terkait',
            'dokter' => 'Aktivitas Dokter',
            'radiografer' => 'Aktivitas Radiografer',
            default => 'Ringkasan Sistem',
        };
    }
}
