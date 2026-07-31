<?php

namespace Database\Seeders;

use App\Models\Faskes;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $faskes = Faskes::query()
            ->whereIn('name', $this->faskesNames())
            ->pluck('id', 'name');

        User::query()->updateOrCreate(
            ['email' => 'admin@test.com'],
            $this->userData('Admin Dentalyze', '081110000001', 'admin'),
        );

        collect($this->staff())->each(function (array $staff) use ($faskes): void {
            User::query()->updateOrCreate(
                ['email' => $staff['email']],
                [
                    ...$this->userData($staff['name'], $staff['phone'], $staff['role']),
                    'faskes_id' => $faskes[$staff['faskes']],
                ],
            );
        });

        collect($this->patients())->each(function (array $patient) use ($faskes): void {
            $user = User::query()->updateOrCreate(
                ['email' => $patient['email']],
                [
                    ...$this->userData($patient['name'], $patient['phone'], 'pasien'),
                    'faskes_id' => $faskes[$patient['faskes']],
                ],
            );

            Patient::query()->updateOrCreate(
                ['nik' => $patient['nik']],
                [
                    'user_id' => $user->id,
                    'faskes_id' => $faskes[$patient['faskes']],
                    'birth_place' => 'Surabaya',
                    'birth_date' => $patient['birth_date'],
                    'address' => $patient['address'],
                    'age' => Carbon::parse($patient['birth_date'])->age,
                    'gender' => $patient['gender'],
                ],
            );
        });
    }

    /** @return array<string, mixed> */
    private function userData(string $name, string $phone, string $role): array
    {
        return [
            'name' => $name,
            'phone' => $phone,
            'role' => $role,
            'faskes_id' => null,
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
        ];
    }

    /** @return array<int, string> */
    private function faskesNames(): array
    {
        return [
            'RSUD dr. M. Soewandhie',
            'RSUD Bhakti Dharma Husada',
            'Puskesmas Jagir',
            'Puskesmas Dukuh Kupang',
        ];
    }

    /** @return array<int, array<string, string>> */
    private function staff(): array
    {
        return [
            ['name' => 'drg. Aditya Pratama', 'email' => 'dokter01@example.test', 'phone' => '081120000001', 'role' => 'dokter', 'faskes' => 'RSUD dr. M. Soewandhie'],
            ['name' => 'drg. Nabila Rahma', 'email' => 'dokter02@example.test', 'phone' => '081120000002', 'role' => 'dokter', 'faskes' => 'RSUD dr. M. Soewandhie'],
            ['name' => 'drg. Citra Lestari', 'email' => 'dokter03@example.test', 'phone' => '081120000003', 'role' => 'dokter', 'faskes' => 'RSUD Bhakti Dharma Husada'],
            ['name' => 'drg. Dimas Wijaya', 'email' => 'dokter04@example.test', 'phone' => '081120000004', 'role' => 'dokter', 'faskes' => 'RSUD Bhakti Dharma Husada'],
            ['name' => 'drg. Farah Azzahra', 'email' => 'dokter05@example.test', 'phone' => '081120000005', 'role' => 'dokter', 'faskes' => 'Puskesmas Jagir'],
            ['name' => 'drg. Gilang Mahendra', 'email' => 'dokter06@example.test', 'phone' => '081120000006', 'role' => 'dokter', 'faskes' => 'Puskesmas Dukuh Kupang'],
            ['name' => 'Raka Radiografer', 'email' => 'radiografer01@example.test', 'phone' => '081130000001', 'role' => 'radiografer', 'faskes' => 'RSUD dr. M. Soewandhie'],
            ['name' => 'Salsa Radiografer', 'email' => 'radiografer02@example.test', 'phone' => '081130000002', 'role' => 'radiografer', 'faskes' => 'RSUD Bhakti Dharma Husada'],
            ['name' => 'Tegar Radiografer', 'email' => 'radiografer03@example.test', 'phone' => '081130000003', 'role' => 'radiografer', 'faskes' => 'Puskesmas Jagir'],
            ['name' => 'Vina Radiografer', 'email' => 'radiografer04@example.test', 'phone' => '081130000004', 'role' => 'radiografer', 'faskes' => 'Puskesmas Dukuh Kupang'],
        ];
    }

    /** @return array<int, array<string, string>> */
    private function patients(): array
    {
        return [
            ['name' => 'Alya Putri', 'email' => 'pasien01@example.test', 'phone' => '081140000001', 'nik' => '3578010101900001', 'birth_date' => '1990-01-01', 'gender' => 'female', 'address' => 'Jl. Tambaksari, Surabaya', 'faskes' => 'RSUD dr. M. Soewandhie'],
            ['name' => 'Bagas Saputra', 'email' => 'pasien02@example.test', 'phone' => '081140000002', 'nik' => '3578010202920002', 'birth_date' => '1992-02-02', 'gender' => 'male', 'address' => 'Jl. Kapas Krampung, Surabaya', 'faskes' => 'RSUD dr. M. Soewandhie'],
            ['name' => 'Cindy Maharani', 'email' => 'pasien03@example.test', 'phone' => '081140000003', 'nik' => '3578010303940003', 'birth_date' => '1994-03-03', 'gender' => 'female', 'address' => 'Jl. Kedung Cowek, Surabaya', 'faskes' => 'RSUD dr. M. Soewandhie'],
            ['name' => 'Damar Nugraha', 'email' => 'pasien04@example.test', 'phone' => '081140000004', 'nik' => '3578020404880004', 'birth_date' => '1988-04-04', 'gender' => 'male', 'address' => 'Jl. Benowo, Surabaya', 'faskes' => 'RSUD Bhakti Dharma Husada'],
            ['name' => 'Elisa Permata', 'email' => 'pasien05@example.test', 'phone' => '081140000005', 'nik' => '3578020505900005', 'birth_date' => '1990-05-05', 'gender' => 'female', 'address' => 'Jl. Sememi, Surabaya', 'faskes' => 'RSUD Bhakti Dharma Husada'],
            ['name' => 'Fajar Ramadhan', 'email' => 'pasien06@example.test', 'phone' => '081140000006', 'nik' => '3578020606920006', 'birth_date' => '1992-06-06', 'gender' => 'male', 'address' => 'Jl. Kandangan, Surabaya', 'faskes' => 'RSUD Bhakti Dharma Husada'],
            ['name' => 'Gita Larasati', 'email' => 'pasien07@example.test', 'phone' => '081140000007', 'nik' => '3578030707950007', 'birth_date' => '1995-07-07', 'gender' => 'female', 'address' => 'Jl. Jagir Wonokromo, Surabaya', 'faskes' => 'Puskesmas Jagir'],
            ['name' => 'Hendra Kurniawan', 'email' => 'pasien08@example.test', 'phone' => '081140000008', 'nik' => '3578030808860008', 'birth_date' => '1986-08-08', 'gender' => 'male', 'address' => 'Jl. Bendul Merisi, Surabaya', 'faskes' => 'Puskesmas Jagir'],
            ['name' => 'Intan Safitri', 'email' => 'pasien09@example.test', 'phone' => '081140000009', 'nik' => '3578030909990009', 'birth_date' => '1999-09-09', 'gender' => 'female', 'address' => 'Jl. Ngagel, Surabaya', 'faskes' => 'Puskesmas Jagir'],
            ['name' => 'Joko Prasetyo', 'email' => 'pasien10@example.test', 'phone' => '081140000010', 'nik' => '3578041010850010', 'birth_date' => '1985-10-10', 'gender' => 'male', 'address' => 'Jl. Dukuh Kupang, Surabaya', 'faskes' => 'Puskesmas Dukuh Kupang'],
            ['name' => 'Kirana Ayu', 'email' => 'pasien11@example.test', 'phone' => '081140000011', 'nik' => '3578041111960011', 'birth_date' => '1996-11-11', 'gender' => 'female', 'address' => 'Jl. Putat Jaya, Surabaya', 'faskes' => 'Puskesmas Dukuh Kupang'],
            ['name' => 'Lukman Hakim', 'email' => 'pasien12@example.test', 'phone' => '081140000012', 'nik' => '3578041212980012', 'birth_date' => '1998-12-12', 'gender' => 'male', 'address' => 'Jl. Pakis, Surabaya', 'faskes' => 'Puskesmas Dukuh Kupang'],
        ];
    }
}
