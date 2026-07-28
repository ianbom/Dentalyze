<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Patient;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash; 

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
   public function run(): void
    {
        // 1. Admin, Radiografer, Dokter (Tetap sama)
        User::create([
            'name'     => 'Admin DeTech',
            'email'    => 'admin@test.com',
            'password' => Hash::make('password'),
            'phone'    => '08111222333',
            'role'     => 'admin',
        ]);

        User::create([
            'name'     => 'Budi Radiografer',
            'email'    => 'radiografer@test.com',
            'password' => Hash::make('password'),
            'phone'    => '08222333444',
            'role'     => 'radiografer',
        ]);

        User::create([
            'name'     => 'drg. Siti Aminah',
            'email'    => 'dokter@test.com',
            'password' => Hash::make('password'),
            'phone'    => '08333444555',
            'role'     => 'dokter',
        ]);

        // 2. Buat User Pasien
        $userPasien = User::create([
            'name'     => 'Andi Pratama',
            'email'    => 'pasien@test.com',
            'password' => Hash::make('password'),
            'phone'    => '08444555666',
            'role'     => 'pasien',
        ]);

        $userPasien = User::create([
            'name'     => 'IanBom',
            'email'    => 'ianbom@gmail.com',
            'password' => Hash::make('ianbom123'),
            'phone'    => '01823213231',
            'role'     => 'pasien',
        ]);

        // 3. Buat Detail Pasien (TAMBAHKAN KOLOM BARU DI SINI)
        Patient::create([
            'nik'         => '3201234567890001',
            'user_id'     => $userPasien->id,
            'birth_place' => 'Jakarta',       // Tambahkan ini
            'birth_date'  => '2012-05-20',    // Tambahkan ini (Format YYYY-MM-DD)
            'address'     => 'Jl. Mawar No. 123, Jakarta Selatan', // Tambahkan ini
            'age'         => 12,
            'gender'      => 'male',
        ]);
    }
}
