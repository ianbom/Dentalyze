# Plan Frontend Pages & Web Routes — DeTech App Laravel 13

## 1. Tujuan

Dokumen ini berisi plan implementasi awal untuk membuat halaman frontend dan route `web.php` pada website **DeTech App / Dentograph** berbasis **Laravel 13 + Inertia React TypeScript**.

Target implementasi tahap ini:

- Membuat halaman React/Inertia placeholder.
- Membuat route di `routes/web.php`.
- Menggunakan layout bawaan Laravel starter kit.
- Halaman belum memiliki isi kompleks.
- Setiap halaman hanya menampilkan pesan singkat seperti `ini halaman dashboard`.
- Struktur frontend tidak dipisah berdasarkan role.
- Struktur route dibuat berdasarkan fitur/domain.

Scope yang belum dikerjakan pada tahap ini:

- Belum membuat controller khusus.
- Belum membuat service.
- Belum membuat CRUD logic.
- Belum membuat validasi form.
- Belum membuat middleware role lengkap.
- Belum membuat integrasi FastAPI AI.
- Belum membuat PDF report.
- Belum membuat database query.

---

## 2. Prinsip Struktur Halaman

Halaman frontend dibuat berdasarkan fitur/domain, bukan berdasarkan role.

Contoh yang dihindari:

```txt
resources/js/Pages/Admin/Patients/Index.tsx
resources/js/Pages/Dokter/Patients/Index.tsx
resources/js/Pages/Radiografer/Patients/Index.tsx
```

Struktur yang digunakan:

```txt
resources/js/Pages/Patients/Index.tsx
```

Role akan ditangani nanti melalui:

- Middleware.
- Policy.
- Permission.
- Conditional rendering di frontend.
- Query data berdasarkan user yang sedang login.

---

## 3. Struktur Folder Frontend

Buat struktur folder berikut:

```txt
resources/js/Pages/
├── Dashboard/
│   └── Index.tsx
│
├── Users/
│   ├── Index.tsx
│   ├── Create.tsx
│   ├── Edit.tsx
│   └── Show.tsx
│
├── Patients/
│   ├── Index.tsx
│   ├── Create.tsx
│   ├── Edit.tsx
│   ├── Show.tsx
│   └── History.tsx
│
├── Radiographs/
│   ├── Index.tsx
│   ├── Create.tsx
│   ├── Show.tsx
│   └── History.tsx
│
├── Verification/
│   └── Tasks.tsx
│
├── Reports/
│   └── RadiographPdf.tsx
│
└── Public/
    └── VerifyResult.tsx
```

Jika project Laravel starter kit sudah memiliki folder `Profile`, jangan dihapus. Biarkan tetap menggunakan bawaan Laravel.

---

## 4. Daftar Halaman Placeholder

### 4.1 Public Pages

| Route | Page | Isi Sementara |
|---|---|---|
| `/` | `Welcome.tsx` | `ini halaman welcome` |
| `/verify/{radiograph}` | `Public/VerifyResult.tsx` | `ini halaman verifikasi publik` |

---

### 4.2 Authenticated Pages

| Route | Page | Isi Sementara |
|---|---|---|
| `/dashboard` | `Dashboard/Index.tsx` | `ini halaman dashboard` |
| `/users` | `Users/Index.tsx` | `ini halaman daftar user` |
| `/users/create` | `Users/Create.tsx` | `ini halaman tambah user` |
| `/users/{user}` | `Users/Show.tsx` | `ini halaman detail user` |
| `/users/{user}/edit` | `Users/Edit.tsx` | `ini halaman edit user` |
| `/patients` | `Patients/Index.tsx` | `ini halaman daftar pasien` |
| `/patients/create` | `Patients/Create.tsx` | `ini halaman tambah pasien` |
| `/patients/{patient}` | `Patients/Show.tsx` | `ini halaman detail pasien` |
| `/patients/{patient}/edit` | `Patients/Edit.tsx` | `ini halaman edit pasien` |
| `/patients/{patient}/history` | `Patients/History.tsx` | `ini halaman riwayat pasien` |
| `/radiographs` | `Radiographs/Index.tsx` | `ini halaman daftar radiograph` |
| `/radiographs/create` | `Radiographs/Create.tsx` | `ini halaman tambah deteksi` |
| `/radiographs/{radiograph}` | `Radiographs/Show.tsx` | `ini halaman detail deteksi` |
| `/radiographs/{radiograph}/history` | `Radiographs/History.tsx` | `ini halaman riwayat radiograph` |
| `/verification/tasks` | `Verification/Tasks.tsx` | `ini halaman tugas verifikasi` |
| `/reports/radiographs/{radiograph}/pdf` | `Reports/RadiographPdf.tsx` | `ini halaman laporan PDF` |

---

## 5. Template Halaman Authenticated

Gunakan layout bawaan Laravel starter kit.

Jika starter kit menggunakan `AuthenticatedLayout`, gunakan template berikut:

```tsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function DashboardIndex() {
    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            ini halaman dashboard
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
```

Jika starter kit menggunakan `AppLayout`, ganti import dan wrapper menjadi:

```tsx
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

export default function DashboardIndex() {
    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            ini halaman dashboard
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
```

---

## 6. Template Halaman Public

Untuk halaman public, jangan gunakan authenticated layout.

Contoh `resources/js/Pages/Public/VerifyResult.tsx`:

```tsx
import { Head } from '@inertiajs/react';

export default function VerifyResult() {
    return (
        <>
            <Head title="Verifikasi Hasil" />

            <div className="min-h-screen bg-gray-100 py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            ini halaman verifikasi publik
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
```

---

## 7. Isi File Halaman

### 7.1 Dashboard

`resources/js/Pages/Dashboard/Index.tsx`

```tsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function DashboardIndex() {
    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            ini halaman dashboard
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
```

---

### 7.2 Users Index

`resources/js/Pages/Users/Index.tsx`

```tsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function UsersIndex() {
    return (
        <AuthenticatedLayout>
            <Head title="Users" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            ini halaman daftar user
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
```

---

### 7.3 Patients Index

`resources/js/Pages/Patients/Index.tsx`

```tsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function PatientsIndex() {
    return (
        <AuthenticatedLayout>
            <Head title="Pasien" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            ini halaman daftar pasien
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
```

---

### 7.4 Radiographs Index

`resources/js/Pages/Radiographs/Index.tsx`

```tsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function RadiographsIndex() {
    return (
        <AuthenticatedLayout>
            <Head title="Radiographs" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            ini halaman daftar radiograph
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
```

---

### 7.5 Public Verify Result

`resources/js/Pages/Public/VerifyResult.tsx`

```tsx
import { Head } from '@inertiajs/react';

export default function VerifyResult() {
    return (
        <>
            <Head title="Verifikasi Hasil" />

            <div className="min-h-screen bg-gray-100 py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            ini halaman verifikasi publik
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
```

---

## 8. Route `routes/web.php`

Untuk tahap placeholder, gunakan `Inertia::render()` langsung di `web.php`.

```php
<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('welcome');

Route::get('/verify/{radiograph}', function (string $radiograph) {
    return Inertia::render('Public/VerifyResult', [
        'radiograph' => $radiograph,
    ]);
})->name('public.verify');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard/Index');
    })->name('dashboard');

    Route::get('/users', function () {
        return Inertia::render('Users/Index');
    })->name('users.index');

    Route::get('/users/create', function () {
        return Inertia::render('Users/Create');
    })->name('users.create');

    Route::get('/users/{user}', function (string $user) {
        return Inertia::render('Users/Show', [
            'user' => $user,
        ]);
    })->name('users.show');

    Route::get('/users/{user}/edit', function (string $user) {
        return Inertia::render('Users/Edit', [
            'user' => $user,
        ]);
    })->name('users.edit');

    Route::get('/patients', function () {
        return Inertia::render('Patients/Index');
    })->name('patients.index');

    Route::get('/patients/create', function () {
        return Inertia::render('Patients/Create');
    })->name('patients.create');

    Route::get('/patients/{patient}', function (string $patient) {
        return Inertia::render('Patients/Show', [
            'patient' => $patient,
        ]);
    })->name('patients.show');

    Route::get('/patients/{patient}/edit', function (string $patient) {
        return Inertia::render('Patients/Edit', [
            'patient' => $patient,
        ]);
    })->name('patients.edit');

    Route::get('/patients/{patient}/history', function (string $patient) {
        return Inertia::render('Patients/History', [
            'patient' => $patient,
        ]);
    })->name('patients.history');

    Route::get('/radiographs', function () {
        return Inertia::render('Radiographs/Index');
    })->name('radiographs.index');

    Route::get('/radiographs/create', function () {
        return Inertia::render('Radiographs/Create');
    })->name('radiographs.create');

    Route::get('/radiographs/{radiograph}', function (string $radiograph) {
        return Inertia::render('Radiographs/Show', [
            'radiograph' => $radiograph,
        ]);
    })->name('radiographs.show');

    Route::get('/radiographs/{radiograph}/history', function (string $radiograph) {
        return Inertia::render('Radiographs/History', [
            'radiograph' => $radiograph,
        ]);
    })->name('radiographs.history');

    Route::get('/verification/tasks', function () {
        return Inertia::render('Verification/Tasks');
    })->name('verification.tasks');

    Route::get('/reports/radiographs/{radiograph}/pdf', function (string $radiograph) {
        return Inertia::render('Reports/RadiographPdf', [
            'radiograph' => $radiograph,
        ]);
    })->name('reports.radiographs.pdf');
});

require __DIR__.'/auth.php';
```

---

## 9. Route Action untuk Tahap Selanjutnya

Route berikut belum perlu dibuat pada tahap placeholder jika controller belum tersedia.

Nanti, saat fitur AI dan verifikasi sudah mulai dibuat, tambahkan route berikut:

```php
Route::post('/radiographs/{radiograph}/analyze', [RadiographController::class, 'analyze'])
    ->name('radiographs.analyze');

Route::post('/radiographs/{radiograph}/finalize', [RadiographController::class, 'finalize'])
    ->name('radiographs.finalize');
```

---

## 10. Urutan Implementasi

### Step 1 — Buat Folder Page

Linux/macOS/Git Bash:

```bash
mkdir -p resources/js/Pages/Dashboard
mkdir -p resources/js/Pages/Users
mkdir -p resources/js/Pages/Patients
mkdir -p resources/js/Pages/Radiographs
mkdir -p resources/js/Pages/Verification
mkdir -p resources/js/Pages/Reports
mkdir -p resources/js/Pages/Public
```

Windows PowerShell:

```powershell
mkdir resources\js\Pages\Dashboard
mkdir resources\js\Pages\Users
mkdir resources\js\Pages\Patients
mkdir resources\js\Pages\Radiographs
mkdir resources\js\Pages\Verification
mkdir resources\js\Pages\Reports
mkdir resources\js\Pages\Public
```

---

### Step 2 — Buat File Page Placeholder

Buat file berikut:

```txt
Dashboard/Index.tsx

Users/Index.tsx
Users/Create.tsx
Users/Edit.tsx
Users/Show.tsx

Patients/Index.tsx
Patients/Create.tsx
Patients/Edit.tsx
Patients/Show.tsx
Patients/History.tsx

Radiographs/Index.tsx
Radiographs/Create.tsx
Radiographs/Show.tsx
Radiographs/History.tsx

Verification/Tasks.tsx

Reports/RadiographPdf.tsx

Public/VerifyResult.tsx
```

---

### Step 3 — Isi Setiap Page dengan Placeholder

Gunakan template authenticated layout untuk halaman yang berada di dalam middleware `auth`.

Contoh isi teks:

```txt
ini halaman dashboard
ini halaman daftar user
ini halaman tambah user
ini halaman detail user
ini halaman edit user
ini halaman daftar pasien
ini halaman tambah pasien
ini halaman detail pasien
ini halaman riwayat pasien
ini halaman daftar radiograph
ini halaman tambah deteksi
ini halaman detail deteksi
ini halaman riwayat radiograph
ini halaman tugas verifikasi
ini halaman laporan PDF
```

---

### Step 4 — Update `routes/web.php`

Masukkan semua route Inertia placeholder sesuai bagian route di atas.

---

### Step 5 — Jalankan Development Server

```bash
php artisan serve
npm run dev
```

Atau jika project menggunakan script bawaan Laravel:

```bash
composer run dev
```

---

### Step 6 — Test Route

Cek route berikut di browser:

```txt
/dashboard
/users
/users/create
/patients
/patients/create
/radiographs
/radiographs/create
/verification/tasks
/verify/RAD-TEST-001
```

---

## 11. Prompt untuk AI Agent

Gunakan prompt berikut jika ingin meminta AI Agent membuat file dan route secara otomatis.

```txt
Create placeholder frontend pages and web routes for my Laravel 13 Inertia React TypeScript project.

Requirements:
1. Do not separate pages by role.
2. Organize frontend pages by feature/domain.
3. Use the default Laravel Inertia authenticated layout for authenticated pages.
4. Public pages should not use the authenticated layout.
5. Each page should only contain a short placeholder text, for example: "ini halaman dashboard".
6. Do not implement CRUD logic yet.
7. Do not create controllers yet.
8. Only update resources/js/Pages and routes/web.php.
9. Keep existing auth routes and profile routes from Laravel starter kit.
10. Do not modify database, models, services, middleware, or migrations.

Create these pages:

- Dashboard/Index.tsx
- Users/Index.tsx
- Users/Create.tsx
- Users/Edit.tsx
- Users/Show.tsx
- Patients/Index.tsx
- Patients/Create.tsx
- Patients/Edit.tsx
- Patients/Show.tsx
- Patients/History.tsx
- Radiographs/Index.tsx
- Radiographs/Create.tsx
- Radiographs/Show.tsx
- Radiographs/History.tsx
- Verification/Tasks.tsx
- Reports/RadiographPdf.tsx
- Public/VerifyResult.tsx

Update routes/web.php with Inertia routes:

Public:
- GET /
- GET /verify/{radiograph}

Authenticated:
- GET /dashboard
- GET /users
- GET /users/create
- GET /users/{user}
- GET /users/{user}/edit
- GET /patients
- GET /patients/create
- GET /patients/{patient}
- GET /patients/{patient}/edit
- GET /patients/{patient}/history
- GET /radiographs
- GET /radiographs/create
- GET /radiographs/{radiograph}
- GET /radiographs/{radiograph}/history
- GET /verification/tasks
- GET /reports/radiographs/{radiograph}/pdf

Use Inertia::render() directly in web.php for now.
```

---

## 12. Catatan Penting

Pada tahap ini, route cukup menggunakan closure:

```php
return Inertia::render('Patients/Index');
```

Nanti setelah fitur mulai dibuat, route bisa dipindah ke controller seperti:

```php
Route::resource('/patients', PatientController::class);
Route::resource('/radiographs', RadiographController::class);
```

Tahap ini hanya bertujuan membuat kerangka navigasi dan halaman kosong terlebih dahulu, agar struktur project siap dikembangkan ke tahap berikutnya.
