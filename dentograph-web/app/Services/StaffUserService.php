<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

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
            ->get(['id', 'name', 'email', 'phone', 'role', 'created_at'])
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
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(string $user, array $data, string $role): User
    {
        $user = $this->findByRole($user, $role);

        $payload = [
            'name' => $this->normalizeName($data['name'], $role),
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
        ];

        if (! empty($data['password'])) {
            $payload['password'] = Hash::make($data['password']);
        }

        $user->update($payload);

        return $user;
    }

    public function delete(string $user, string $role): void
    {
        $this->findByRole($user, $role)->delete();
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
            'created_at' => optional($user->created_at)->format('Y-m-d'),
        ];
    }
}
