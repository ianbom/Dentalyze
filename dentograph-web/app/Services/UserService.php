<?php

namespace App\Services;

use App\Models\User;

class UserService
{
    /**
     * @return array<string, mixed>
     */
    public function indexData(User $viewer): array
    {
        return [
            'users' => [],
            'filters' => [],
            'permissions' => [],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function detailData(string $user): array
    {
        return [
            'user' => $user,
            'permissions' => [],
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): string
    {
        return (string) ($data['email'] ?? '');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(string $user, array $data): string
    {
        return $user;
    }

    public function delete(string $user): void
    {
        //
    }
}
