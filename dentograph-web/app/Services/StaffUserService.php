<?php

namespace App\Services;

use App\Models\Faskes;
use App\Models\Radiograph;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class StaffUserService
{
    /**
     * @return array<string, mixed>
     */
    public function indexData(string $role): array
    {
        $users = User::query()
            ->where('role', $role)
            ->latest()
            ->with('faskes:id,name')
            ->get(['id', 'name', 'email', 'phone', 'role', 'faskes_id', 'created_at'])
            ->map(fn (User $user): array => $this->payload($user))
            ->values();

        return [
            'users' => $users,
            'filters' => [
                'total' => $users->count(),
                'with_phone' => $users->whereNotNull('phone')->count(),
                'without_phone' => $users->whereNull('phone')->count(),
            ],
            'permissions' => [
                'create' => true,
                'update' => true,
                'delete' => true,
            ],
            'faskesOptions' => Faskes::query()->orderBy('name')->get(['id', 'name']),
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data, string $role): User
    {
        return User::create([
            'name' => $this->normalizeName($data['name'], $role),
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => Hash::make($data['password']),
            'role' => $role,
            'faskes_id' => $data['faskes_id'] ?? Faskes::query()->where('type', 'legacy')->value('id'),
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(string $user, array $data, string $role): User
    {
        $user = $this->findByRole($user, $role);
        $nextFaskesId = $data['faskes_id'] ?? $user->faskes_id ?? Faskes::query()->where('type', 'legacy')->value('id');

        if ($role === 'dokter' && (int) $nextFaskesId !== (int) $user->faskes_id) {
            $this->ensureDoctorHasNoPendingAssignments($user);
        }

        $payload = [
            'name' => $this->normalizeName($data['name'], $role),
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'faskes_id' => $nextFaskesId,
        ];

        if (! empty($data['password'])) {
            $payload['password'] = Hash::make($data['password']);
        }

        $user->update($payload);

        return $user;
    }

    public function delete(string $user, string $role): void
    {
        $user = $this->findByRole($user, $role);

        if ($role === 'dokter') {
            $this->ensureDoctorHasNoPendingAssignments($user);
        }

        $user->delete();
    }

    private function findByRole(string $user, string $role): User
    {
        return User::query()
            ->where('role', $role)
            ->findOrFail($user);
    }

    private function normalizeName(string $name, string $role): string
    {
        $name = preg_replace('/\s+/', ' ', trim($name)) ?? '';

        if ($role !== 'dokter') {
            return $name;
        }

        $name = preg_replace('/^drg\.\s*/i', '', $name) ?? '';

        return 'drg. '.trim($name);
    }

    private function ensureDoctorHasNoPendingAssignments(User $doctor): void
    {
        if (Radiograph::query()
            ->where('assigned_doctor_id', $doctor->id)
            ->where('status', 'menunggu')
            ->exists()) {
            throw ValidationException::withMessages([
                'faskes_id' => 'Dokter masih memiliki tugas verifikasi yang belum selesai.',
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
            'faskes_id' => $user->faskes_id,
            'faskes_name' => $user->faskes?->name,
            'created_at' => optional($user->created_at)->format('Y-m-d'),
        ];
    }
}
